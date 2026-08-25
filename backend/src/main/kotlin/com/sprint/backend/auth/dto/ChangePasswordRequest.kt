package com.sprint.backend.auth.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Pattern

data class ChangePasswordRequest(
    @field:NotBlank
    @field:Size(max = 128)
    val currentPassword: String,

    @field:NotBlank
    @field:Size(min = 12, max = 128)
    @field:Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$", message = "debe incluir mayúscula, minúscula, número y símbolo")
    val newPassword: String
)
