package com.sprint.backend.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.sprint.backend.audit.AuditLogService
import com.sprint.backend.users.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

/** Limita intentos repetidos en los endpoints públicos de autenticación. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
class AuthenticationRateLimitFilter(private val objectMapper: ObjectMapper) : OncePerRequestFilter() {
    private data class Window(var startedAt: Long, var count: Int)
    private val windows = ConcurrentHashMap<String, Window>()

    override fun shouldNotFilter(request: HttpServletRequest): Boolean =
        request.method != "POST" || limitFor(request.requestURI) == null

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        val limit = limitFor(request.requestURI) ?: return chain.doFilter(request, response)
        val now = Instant.now().epochSecond
        val key = "${request.remoteAddr}:${request.requestURI}"
        val allowed = windows.compute(key) { _, current ->
            when {
                current == null || now - current.startedAt >= WINDOW_SECONDS -> Window(now, 1)
                else -> current.apply { count += 1 }
            }
        }!!.count <= limit

        if (!allowed) {
            response.status = 429
            response.contentType = "application/json"
            response.characterEncoding = Charsets.UTF_8.name()
            response.setHeader("Retry-After", WINDOW_SECONDS.toString())
            response.setHeader("Cache-Control", "no-store")
            objectMapper.writeValue(
                response.writer,
                ApiErrorResponse(status = 429, code = "TOO_MANY_REQUESTS", message = "Demasiados intentos. Espera un minuto antes de continuar.", path = request.requestURI, requestId = request.requestId())
            )
            return
        }
        if (windows.size > 10_000) windows.entries.removeIf { now - it.value.startedAt >= WINDOW_SECONDS }
        chain.doFilter(request, response)
    }

    private fun limitFor(path: String): Int? = when (path) {
        "/api/auth/login" -> 10
        "/api/auth/register", "/api/auth/confirm", "/api/auth/resend-code",
        "/api/auth/forgot-password", "/api/auth/reset-password" -> 6
        "/api/auth/refresh" -> 30
        else -> null
    }

    companion object { private const val WINDOW_SECONDS = 60L }
}

/** Rechaza tokens válidos cuando la cuenta local está deshabilitada. */
class DisabledAccountFilter(
    private val users: UserRepository,
    private val objectMapper: ObjectMapper,
    private val audit: AuditLogService
) : OncePerRequestFilter() {
    override fun shouldNotFilter(request: HttpServletRequest): Boolean =
        !request.requestURI.startsWith("/api/") || request.method == "OPTIONS"

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        val jwt = SecurityContextHolder.getContext().authentication?.principal as? Jwt
        val disabled = jwt?.subject?.let(users::findByCognitoSub)?.enabled == false
        if (!disabled) return chain.doFilter(request, response)

        response.status = 403
        response.contentType = "application/json"
        response.characterEncoding = Charsets.UTF_8.name()
        response.setHeader("Cache-Control", "no-store")
        objectMapper.writeValue(
            response.writer,
            ApiErrorResponse(status = 403, code = "ACCOUNT_DISABLED", message = "La cuenta está deshabilitada", path = request.requestURI, requestId = request.requestId())
        )
        runCatching { audit.record(request, 403, 0) }
    }
}

/** Evita que el navegador o un proxy almacenen respuestas de autenticación. */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
class SensitiveResponseHeadersFilter : OncePerRequestFilter() {
    override fun shouldNotFilter(request: HttpServletRequest): Boolean =
        !request.requestURI.startsWith("/api/auth/")

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        response.setHeader("Cache-Control", "no-store, max-age=0")
        response.setHeader("Pragma", "no-cache")
        response.setHeader("Expires", "0")
        chain.doFilter(request, response)
    }
}
