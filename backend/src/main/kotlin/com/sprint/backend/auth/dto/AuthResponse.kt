package com.sprint.backend.auth.dto

data class AuthResponse(
    val token: String,
    val tokenType: String = "Bearer",
    val user: AuthUserResponse
)

data class AuthUserResponse(
    val id: Long,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String?,
    val country: String?,
    val gender: String?,
    val birthDate: String?,
    val age: Int?,
    val preferredLanguage: String,
    val preferredCurrency: String,
    val createdAt: String,
    val roles: List<String>,
    val avatarUrl: String? = null,
    val currentLocation: String? = null
)
