package com.sprint.backend.auth

import com.sprint.backend.auth.dto.AuthResponse
import com.sprint.backend.auth.dto.AuthUserResponse
import com.sprint.backend.auth.dto.ChangePasswordRequest
import com.sprint.backend.auth.dto.LoginRequest
import com.sprint.backend.auth.dto.RegisterRequest
import com.sprint.backend.auth.dto.UpdateProfileRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(@Valid @RequestBody request: RegisterRequest): AuthResponse {
        return authService.register(request)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): AuthResponse {
        return authService.login(request)
    }

    @GetMapping("/me")
    fun me(@RequestHeader("Authorization", required = false) authorization: String?): Map<String, AuthUserResponse> {
        return mapOf("user" to authService.me(authorization))
    }

    @PatchMapping("/profile")
    fun updateProfile(
        @RequestHeader("Authorization", required = false) authorization: String?,
        @Valid @RequestBody request: UpdateProfileRequest
    ): AuthResponse {
        return authService.updateProfile(authorization, request)
    }

    @PatchMapping("/avatar", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun updateAvatar(
        @RequestHeader("Authorization", required = false) authorization: String?,
        @RequestParam("avatar") avatar: MultipartFile
    ): Map<String, AuthUserResponse> {
        return mapOf("user" to authService.updateAvatar(authorization, avatar))
    }

    @DeleteMapping("/avatar")
    fun deleteAvatar(
        @RequestHeader("Authorization", required = false) authorization: String?
    ): Map<String, AuthUserResponse> {
        return mapOf("user" to authService.deleteAvatar(authorization))
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun changePassword(
        @RequestHeader("Authorization", required = false) authorization: String?,
        @Valid @RequestBody request: ChangePasswordRequest
    ) {
        authService.changePassword(authorization, request)
    }
}
