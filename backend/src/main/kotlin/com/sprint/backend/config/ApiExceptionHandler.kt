package com.sprint.backend.config

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import software.amazon.awssdk.services.cognitoidentityprovider.model.CognitoIdentityProviderException

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(UnauthorizedException::class)
    fun unauthorized(error: UnauthorizedException) = response(HttpStatus.UNAUTHORIZED, error.message)

    @ExceptionHandler(ForbiddenException::class)
    fun forbidden(error: ForbiddenException) = response(HttpStatus.FORBIDDEN, error.message)

    @ExceptionHandler(ConflictException::class)
    fun conflict(error: ConflictException) = response(HttpStatus.CONFLICT, error.message)

    @ExceptionHandler(NotFoundException::class)
    fun notFound(error: NotFoundException) = response(HttpStatus.NOT_FOUND, error.message)

    @ExceptionHandler(IllegalArgumentException::class)
    fun badRequest(error: IllegalArgumentException) = response(HttpStatus.BAD_REQUEST, error.message)

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun validation(error: MethodArgumentNotValidException) = response(
        HttpStatus.BAD_REQUEST,
        error.bindingResult.fieldErrors.firstOrNull()?.defaultMessage ?: "Revisa los datos enviados"
    )

    @ExceptionHandler(CognitoIdentityProviderException::class)
    fun cognito(error: CognitoIdentityProviderException): ResponseEntity<Map<String, String>> {
        val status = when (error.awsErrorDetails()?.errorCode()) {
            "NotAuthorizedException" -> HttpStatus.UNAUTHORIZED
            "UsernameExistsException" -> HttpStatus.CONFLICT
            else -> HttpStatus.BAD_REQUEST
        }
        return response(status, error.awsErrorDetails()?.errorMessage() ?: "Cognito rechazó la operación")
    }

    private fun response(status: HttpStatus, message: String?) =
        ResponseEntity.status(status).body(mapOf("message" to (message ?: status.reasonPhrase)))
}
