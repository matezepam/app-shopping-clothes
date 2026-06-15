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
    val roles: List<String>
)