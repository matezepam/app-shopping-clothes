package com.sprint.backend.auth

import com.sprint.backend.auth.dto.AuthResponse
import com.sprint.backend.auth.dto.AuthUserResponse
import com.sprint.backend.auth.dto.ChangePasswordRequest
import com.sprint.backend.auth.dto.LoginRequest
import com.sprint.backend.auth.dto.RegisterRequest
import com.sprint.backend.auth.dto.RegistrationResponse
import com.sprint.backend.auth.dto.UpdateProfileRequest
import com.sprint.backend.config.NotFoundException
import com.sprint.backend.config.ForbiddenException
import com.sprint.backend.users.User
import com.sprint.backend.users.UserRepository
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.time.Period
import java.util.Base64

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val cognito: CognitoAuthService
) {
    @Transactional
    fun register(request: RegisterRequest): RegistrationResponse {
        val age = Period.between(request.birthDate, LocalDate.now()).years
        require(age >= 13) { "Debes tener al menos 13 años" }
        val (registration, sub) = cognito.register(request)
        val email = request.email.trim().lowercase()
        val existing = userRepository.findByEmail(email)
        if (existing == null) {
            userRepository.save(
                User(
                    firstName = request.firstName.trim(), lastName = request.lastName.trim(),
                    email = email, cognitoSub = sub, phone = request.phone.trim(),
                    country = request.country.trim(), gender = request.gender.trim(), age = age,
                    birthDate = request.birthDate
                )
            )
        } else if (existing.cognitoSub == null) {
            existing.cognitoSub = sub
            userRepository.save(existing)
        }
        return registration
    }

    fun login(request: LoginRequest): AuthResponse = cognito.login(request)

    fun me(jwt: Jwt): AuthUserResponse = toUserResponse(currentUser(jwt), groups(jwt))

    @Transactional
    fun updateProfile(jwt: Jwt, request: UpdateProfileRequest): AuthUserResponse {
        val user = currentUser(jwt)
        request.firstName?.trim()?.takeIf { it.isNotBlank() }?.let { user.firstName = it }
        request.lastName?.trim()?.takeIf { it.isNotBlank() }?.let { user.lastName = it }
        request.email?.trim()?.lowercase()?.takeIf { it.isNotBlank() && it != user.email }?.let { email ->
            throw IllegalArgumentException("El correo de identidad se administra y verifica directamente en Amazon Cognito")
        }
        request.phone?.trim()?.let { user.phone = it.ifBlank { null } }
        request.country?.trim()?.let { user.country = it.ifBlank { null } }
        request.gender?.trim()?.let { user.gender = it.ifBlank { null } }
        request.age?.let { user.age = it }
        request.preferredLanguage?.trim()?.lowercase()?.let {
            user.preferredLanguage = if (it in setOf("es", "en", "fr", "de")) it else "es"
        }
        request.preferredCurrency?.trim()?.uppercase()?.let {
            user.preferredCurrency = if (it in setOf("USD", "EUR", "GBP")) it else "USD"
        }
        request.currentLocation?.trim()?.let { user.currentLocation = it.ifBlank { null } }
        return toUserResponse(userRepository.save(user), groups(jwt))
    }

    @Transactional
    fun updateAvatar(jwt: Jwt, file: MultipartFile): AuthUserResponse {
        require(!file.isEmpty) { "La imagen es requerida" }
        val contentType = file.contentType ?: ""
        require(contentType in setOf("image/jpeg", "image/png", "image/webp")) { "Formato de imagen no permitido" }
        require(file.size <= 2 * 1024 * 1024) { "La imagen no debe superar 2 MB" }
        val user = currentUser(jwt)
        user.avatarUrl = "data:$contentType;base64,${Base64.getEncoder().encodeToString(file.bytes)}"
        return toUserResponse(userRepository.save(user), groups(jwt))
    }

    @Transactional
    fun deleteAvatar(jwt: Jwt): AuthUserResponse {
        val user = currentUser(jwt)
        user.avatarUrl = null
        return toUserResponse(userRepository.save(user), groups(jwt))
    }

    fun changePassword(jwt: Jwt, request: ChangePasswordRequest) {
        cognito.changePassword(jwt.tokenValue, request.currentPassword, request.newPassword)
    }

    fun currentUser(jwt: Jwt): User {
        val user = userRepository.findByCognitoSub(jwt.subject)
            ?: throw NotFoundException("El perfil local asociado a Cognito no existe")
        if (!user.enabled) throw ForbiddenException("El perfil comercial está deshabilitado")
        return user
    }

    private fun groups(jwt: Jwt): List<String> =
        (jwt.getClaimAsStringList("cognito:groups") ?: listOf("USER")).map { it.uppercase() }

    private fun toUserResponse(user: User, roles: List<String>) = AuthUserResponse(
        id = user.id ?: 0, firstName = user.firstName, lastName = user.lastName, email = user.email,
        phone = user.phone, country = user.country, gender = user.gender, birthDate = user.birthDate?.toString(),
        age = user.age, preferredLanguage = user.preferredLanguage, preferredCurrency = user.preferredCurrency,
        createdAt = user.createdAt.toString(), roles = roles, avatarUrl = user.avatarUrl,
        currentLocation = user.currentLocation
    )
}
