package com.sprint.backend.auth

import com.sprint.backend.auth.dto.AuthResponse
import com.sprint.backend.auth.dto.AuthUserResponse
import com.sprint.backend.auth.dto.ChangePasswordRequest
import com.sprint.backend.auth.dto.ConfirmCodeRequest
import com.sprint.backend.auth.dto.EmailRequest
import com.sprint.backend.auth.dto.LoginRequest
import com.sprint.backend.auth.dto.RegisterRequest
import com.sprint.backend.auth.dto.RefreshRequest
import com.sprint.backend.auth.dto.RegistrationResponse
import com.sprint.backend.auth.dto.ResetPasswordRequest
import com.sprint.backend.auth.dto.UpdateProfileRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService, private val cognito: CognitoAuthService) {
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    fun register(@Valid @RequestBody request: RegisterRequest): RegistrationResponse = authService.register(request)

    @PostMapping("/confirm") @ResponseStatus(HttpStatus.NO_CONTENT)
    fun confirm(@Valid @RequestBody request: ConfirmCodeRequest) = cognito.confirm(request)

    @PostMapping("/resend-code")
    fun resend(@Valid @RequestBody request: EmailRequest) = mapOf("delivery" to cognito.resend(request.email))

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): AuthResponse = authService.login(request)

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshRequest): AuthResponse = cognito.refresh(request.refreshToken, request.username)

    @PostMapping("/forgot-password")
    fun forgot(@Valid @RequestBody request: EmailRequest) = mapOf("delivery" to cognito.forgotPassword(request.email))

    @PostMapping("/reset-password") @ResponseStatus(HttpStatus.NO_CONTENT)
    fun reset(@Valid @RequestBody request: ResetPasswordRequest) = cognito.resetPassword(request)

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal jwt: Jwt) = mapOf("user" to authService.me(jwt))

    @PatchMapping("/profile")
    fun updateProfile(@AuthenticationPrincipal jwt: Jwt, @Valid @RequestBody request: UpdateProfileRequest) =
        mapOf("user" to authService.updateProfile(jwt, request))

    @PatchMapping("/avatar", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun updateAvatar(@AuthenticationPrincipal jwt: Jwt, @RequestParam("avatar") avatar: MultipartFile) =
        mapOf("user" to authService.updateAvatar(jwt, avatar))

    @DeleteMapping("/avatar")
    fun deleteAvatar(@AuthenticationPrincipal jwt: Jwt) = mapOf("user" to authService.deleteAvatar(jwt))

    @PatchMapping("/password") @ResponseStatus(HttpStatus.NO_CONTENT)
    fun changePassword(@AuthenticationPrincipal jwt: Jwt, @Valid @RequestBody request: ChangePasswordRequest) =
        authService.changePassword(jwt, request)
}
