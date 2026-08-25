package com.sprint.backend.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Pattern
import java.time.LocalDate

data class RegisterRequest(
    @field:NotBlank
    @field:Size(max = 100)
    val firstName: String,

    @field:NotBlank
    @field:Size(max = 100)
    val lastName: String,

    @field:Email
    @field:NotBlank
    @field:Size(max = 254)
    val email: String,

    @field:NotBlank
    @field:Size(min = 12, max = 128)
    @field:Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$", message = "debe incluir mayúscula, minúscula, número y símbolo")
    val password: String,

    @field:NotBlank
    @field:Size(max = 30)
    val phone: String,

    @field:NotBlank
    @field:Size(max = 100)
    val country: String,

    @field:NotBlank
    @field:Size(max = 30)
    val gender: String,

    @field:NotNull
    val birthDate: LocalDate,

    @field:NotNull
    @field:Min(13)
    val age: Int
)
