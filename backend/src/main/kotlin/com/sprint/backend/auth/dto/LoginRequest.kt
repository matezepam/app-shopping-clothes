package com.sprint.backend.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    @field:Email
    @field:NotBlank
    @field:Size(max = 254)
    val email: String,

    @field:NotBlank
    @field:Size(max = 128)
    val password: String
)
