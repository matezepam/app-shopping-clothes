package com.sprint.backend.config

import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.security.access.AccessDeniedException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingRequestHeaderException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.servlet.resource.NoResourceFoundException
import software.amazon.awssdk.services.cognitoidentityprovider.model.CognitoIdentityProviderException

@RestControllerAdvice
class ApiExceptionHandler {
    private val logger = LoggerFactory.getLogger(ApiExceptionHandler::class.java)

    @ExceptionHandler(UnauthorizedException::class)
    fun unauthorized(error: UnauthorizedException, request: HttpServletRequest) = response(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", error.message, request)

    @ExceptionHandler(ForbiddenException::class)
    fun forbidden(error: ForbiddenException, request: HttpServletRequest) = response(HttpStatus.FORBIDDEN, "FORBIDDEN", error.message, request)

    @ExceptionHandler(AuthorizationDeniedException::class, AccessDeniedException::class)
    fun accessDenied(error: RuntimeException, request: HttpServletRequest) = response(HttpStatus.FORBIDDEN, "FORBIDDEN", "El rol no tiene permiso para esta operación", request)

    @ExceptionHandler(ConflictException::class)
    fun conflict(error: ConflictException, request: HttpServletRequest) = response(HttpStatus.CONFLICT, "CONFLICT", error.message, request)

    @ExceptionHandler(NotFoundException::class)
    fun notFound(error: NotFoundException, request: HttpServletRequest) = response(HttpStatus.NOT_FOUND, "NOT_FOUND", error.message, request)

    @ExceptionHandler(IllegalArgumentException::class)
    fun badRequest(error: IllegalArgumentException, request: HttpServletRequest) = response(HttpStatus.BAD_REQUEST, "BAD_REQUEST", error.message, request)

    @ExceptionHandler(HttpMessageNotReadableException::class, MissingRequestHeaderException::class, MethodArgumentTypeMismatchException::class)
    fun malformedRequest(error: Exception, request: HttpServletRequest) = response(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "La solicitud no tiene el formato esperado", request)

    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    fun methodNotAllowed(error: HttpRequestMethodNotSupportedException, request: HttpServletRequest) = response(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "Método HTTP no permitido", request)

    @ExceptionHandler(NoResourceFoundException::class)
    fun routeNotFound(error: NoResourceFoundException, request: HttpServletRequest) = response(HttpStatus.NOT_FOUND, "ROUTE_NOT_FOUND", "Ruta no encontrada", request)

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun integrity(error: DataIntegrityViolationException, request: HttpServletRequest): ResponseEntity<ApiErrorResponse> {
        logger.warn("Data integrity conflict requestId={} path={}", request.requestId(), request.requestURI)
        return response(HttpStatus.CONFLICT, "DATA_CONFLICT", "La operación entra en conflicto con datos existentes", request)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun validation(error: MethodArgumentNotValidException, request: HttpServletRequest): ResponseEntity<ApiErrorResponse> {
        val fields = error.bindingResult.fieldErrors.associate { it.field to (it.defaultMessage ?: "Valor inválido") }
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Revisa los datos enviados", request, fields)
    }

    @ExceptionHandler(CognitoIdentityProviderException::class)
    fun cognito(error: CognitoIdentityProviderException, request: HttpServletRequest): ResponseEntity<ApiErrorResponse> {
        val status = when (error.awsErrorDetails()?.errorCode()) {
            "NotAuthorizedException" -> HttpStatus.UNAUTHORIZED
            "UsernameExistsException" -> HttpStatus.CONFLICT
            else -> HttpStatus.BAD_REQUEST
        }
        return response(status, "COGNITO_${error.awsErrorDetails()?.errorCode() ?: "ERROR"}", error.awsErrorDetails()?.errorMessage() ?: "Cognito rechazó la operación", request)
    }

    @ExceptionHandler(Exception::class)
    fun unexpected(error: Exception, request: HttpServletRequest): ResponseEntity<ApiErrorResponse> {
        logger.error("Unhandled API error requestId={} path={}", request.requestId(), request.requestURI, error)
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Ocurrió un error interno. Usa el código de solicitud para soporte.", request)
    }

    private fun response(status: HttpStatus, code: String, message: String?, request: HttpServletRequest, fields: Map<String, String>? = null) =
        ResponseEntity.status(status).body(ApiErrorResponse(status = status.value(), code = code, message = message ?: status.reasonPhrase, path = request.requestURI, requestId = request.requestId(), validationErrors = fields))
}
