package com.sprint.backend.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size

data class UpdateProfileRequest(
    @field:Size(max = 100)
    val firstName: String? = null,

    @field:Size(max = 100)
    val lastName: String? = null,

    @field:Email
    @field:Size(max = 150)
    val email: String? = null,

    @field:Size(max = 30)
    val phone: String? = null,

    @field:Size(max = 100)
    val country: String? = null,

    @field:Size(max = 30)
    val gender: String? = null,

    @field:Min(13)
    val age: Int? = null,

    @field:Size(min = 2, max = 5)
    val preferredLanguage: String? = null,

    @field:Size(min = 3, max = 3)
    val preferredCurrency: String? = null,

    @field:Size(max = 255)
    val currentLocation: String? = null
)
