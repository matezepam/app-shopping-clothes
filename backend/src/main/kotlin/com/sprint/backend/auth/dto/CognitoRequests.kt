package com.sprint.backend.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ConfirmCodeRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val code: String
)

data class EmailRequest(@field:Email @field:NotBlank val email: String)

data class RefreshRequest(@field:NotBlank val refreshToken: String, @field:Email @field:NotBlank val username: String)

data class ResetPasswordRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val code: String,
    @field:NotBlank @field:Size(min = 8) val newPassword: String
)
