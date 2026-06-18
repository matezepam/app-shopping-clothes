package com.sprint.backend.config

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(error: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(mapOf("message" to (error.message ?: "Solicitud inválida")))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(error: MethodArgumentNotValidException): ResponseEntity<Map<String, String>> {
        val message = error.bindingResult.fieldErrors.firstOrNull()?.defaultMessage
            ?: "Revisa los datos enviados"

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(mapOf("message" to message))
    }
}
