package com.sprint.backend.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Pattern

data class ConfirmCodeRequest(
    @field:Email @field:NotBlank @field:Size(max = 254) val email: String,
    @field:NotBlank @field:Pattern(regexp = "^\\d{6}$", message = "debe contener 6 dígitos") val code: String
)

data class EmailRequest(@field:Email @field:NotBlank @field:Size(max = 254) val email: String)

data class RefreshRequest(
    @field:NotBlank @field:Size(max = 4096) val refreshToken: String,
    @field:Email @field:NotBlank @field:Size(max = 254) val username: String
)

data class ResetPasswordRequest(
    @field:Email @field:NotBlank @field:Size(max = 254) val email: String,
    @field:NotBlank @field:Pattern(regexp = "^\\d{6}$", message = "debe contener 6 dígitos") val code: String,
    @field:NotBlank @field:Size(min = 12, max = 128)
    @field:Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$", message = "debe incluir mayúscula, minúscula, número y símbolo")
    val newPassword: String
)
