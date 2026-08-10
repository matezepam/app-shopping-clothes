package com.sprint.backend.auth

import com.sprint.backend.auth.dto.AuthResponse
import com.sprint.backend.auth.dto.ConfirmCodeRequest
import com.sprint.backend.auth.dto.LoginRequest
import com.sprint.backend.auth.dto.RegisterRequest
import com.sprint.backend.auth.dto.RegistrationResponse
import com.sprint.backend.auth.dto.ResetPasswordRequest
import com.sprint.backend.config.ConflictException
import com.sprint.backend.config.UnauthorizedException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType
import software.amazon.awssdk.services.cognitoidentityprovider.model.AuthFlowType
import software.amazon.awssdk.services.cognitoidentityprovider.model.ChangePasswordRequest
import software.amazon.awssdk.services.cognitoidentityprovider.model.CodeDeliveryDetailsType
import software.amazon.awssdk.services.cognitoidentityprovider.model.CodeMismatchException
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmForgotPasswordRequest
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmSignUpRequest
import software.amazon.awssdk.services.cognitoidentityprovider.model.ForgotPasswordRequest
import software.amazon.awssdk.services.cognitoidentityprovider.model.InitiateAuthRequest
import software.amazon.awssdk.services.cognitoidentityprovider.model.NotAuthorizedException
import software.amazon.awssdk.services.cognitoidentityprovider.model.ResendConfirmationCodeRequest
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpRequest
import software.amazon.awssdk.services.cognitoidentityprovider.model.UsernameExistsException
import java.nio.charset.StandardCharsets
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Service
class CognitoAuthService(
    @Value("\${app.cognito.region}") region: String,
    @Value("\${app.cognito.client-id}") private val clientId: String,
    @Value("\${app.cognito.client-secret:}") private val clientSecret: String
) {
    private val cognito = CognitoIdentityProviderClient.builder()
        .region(Region.of(region))
        .credentialsProvider(AnonymousCredentialsProvider.create())
        .build()

    fun register(request: RegisterRequest): Pair<RegistrationResponse, String> {
        val email = request.email.trim().lowercase()
        try {
            val response = cognito.signUp(
                SignUpRequest.builder()
                    .clientId(clientId)
                    .username(email)
                    .password(request.password)
                    .secretHash(secretHash(email))
                    .userAttributes(
                        AttributeType.builder().name("email").value(email).build(),
                        AttributeType.builder().name("given_name").value(request.firstName.trim()).build(),
                        AttributeType.builder().name("family_name").value(request.lastName.trim()).build(),
                        AttributeType.builder().name("phone_number").value(normalizePhone(request.phone)).build()
                    )
                    .build()
            )
            return RegistrationResponse(
                email = email,
                confirmed = response.userConfirmed(),
                delivery = response.codeDeliveryDetails().description()
            ) to response.userSub()
        } catch (_: UsernameExistsException) {
            throw ConflictException("El correo ya está registrado")
        }
    }

    fun confirm(request: ConfirmCodeRequest) {
        val email = request.email.trim().lowercase()
        try {
            cognito.confirmSignUp(
                ConfirmSignUpRequest.builder().clientId(clientId).username(email)
                    .confirmationCode(request.code.trim()).secretHash(secretHash(email)).build()
            )
        } catch (_: CodeMismatchException) {
            throw IllegalArgumentException("El código de confirmación no es válido")
        }
    }

    fun resend(emailValue: String): String? {
        val email = emailValue.trim().lowercase()
        val response = cognito.resendConfirmationCode(
            ResendConfirmationCodeRequest.builder().clientId(clientId).username(email)
                .secretHash(secretHash(email)).build()
        )
        return response.codeDeliveryDetails().description()
    }

    fun login(request: LoginRequest): AuthResponse {
        val email = request.email.trim().lowercase()
        try {
            val parameters = mutableMapOf("USERNAME" to email, "PASSWORD" to request.password)
            secretHash(email)?.let { parameters["SECRET_HASH"] = it }
            val result = cognito.initiateAuth(
                InitiateAuthRequest.builder().clientId(clientId).authFlow(AuthFlowType.USER_PASSWORD_AUTH)
                    .authParameters(parameters).build()
            ).authenticationResult() ?: throw UnauthorizedException("Cognito requiere completar un desafío adicional")
            return AuthResponse(
                token = result.accessToken(),
                refreshToken = result.refreshToken(),
                expiresIn = result.expiresIn(),
                idToken = result.idToken()
            )
        } catch (_: NotAuthorizedException) {
            throw UnauthorizedException("Credenciales inválidas o cuenta sin confirmar")
        }
    }

    fun refresh(refreshToken: String, username: String): AuthResponse {
        val parameters = mutableMapOf("REFRESH_TOKEN" to refreshToken)
        secretHash(username.trim().lowercase())?.let { parameters["SECRET_HASH"] = it }
        val result = cognito.initiateAuth(
            InitiateAuthRequest.builder().clientId(clientId).authFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
                .authParameters(parameters).build()
        ).authenticationResult() ?: throw UnauthorizedException("No se pudo renovar la sesión")
        return AuthResponse(token = result.accessToken(), refreshToken = refreshToken, idToken = result.idToken(), expiresIn = result.expiresIn())
    }

    fun forgotPassword(emailValue: String): String? {
        val email = emailValue.trim().lowercase()
        val response = cognito.forgotPassword(
            ForgotPasswordRequest.builder().clientId(clientId).username(email)
                .secretHash(secretHash(email)).build()
        )
        return response.codeDeliveryDetails().description()
    }

    fun resetPassword(request: ResetPasswordRequest) {
        val email = request.email.trim().lowercase()
        cognito.confirmForgotPassword(
            ConfirmForgotPasswordRequest.builder().clientId(clientId).username(email)
                .confirmationCode(request.code.trim()).password(request.newPassword)
                .secretHash(secretHash(email)).build()
        )
    }

    fun changePassword(accessToken: String, previousPassword: String, proposedPassword: String) {
        cognito.changePassword(
            ChangePasswordRequest.builder().accessToken(accessToken)
                .previousPassword(previousPassword).proposedPassword(proposedPassword).build()
        )
    }

    private fun secretHash(username: String): String? {
        if (clientSecret.isBlank()) return null
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(clientSecret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256"))
        return Base64.getEncoder().encodeToString(mac.doFinal((username + clientId).toByteArray(StandardCharsets.UTF_8)))
    }

    private fun normalizePhone(value: String): String {
        val normalized = value.trim().filter { it.isDigit() || it == '+' }
        require(normalized.startsWith("+") && normalized.drop(1).all { it.isDigit() }) { "El teléfono debe usar formato internacional, por ejemplo +593999999999" }
        return normalized
    }

    private fun CodeDeliveryDetailsType?.description(): String? = this?.let {
        listOfNotNull(it.deliveryMediumAsString(), it.destination()).joinToString(": ")
    }
}
