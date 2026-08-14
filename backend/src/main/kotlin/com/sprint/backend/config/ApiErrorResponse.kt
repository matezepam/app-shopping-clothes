package com.sprint.backend.config

import java.time.Instant

data class ApiErrorResponse(
    val timestamp: String = Instant.now().toString(),
    val status: Int,
    val code: String,
    val message: String,
    val path: String,
    val requestId: String,
    val validationErrors: Map<String, String>? = null
)
