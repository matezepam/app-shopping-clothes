package com.sprint.backend.audit

import com.sprint.backend.config.requestId
import com.sprint.backend.users.UserRepository
import jakarta.persistence.*
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.filter.OncePerRequestFilter
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "activity_log", schema = "audit")
class ActivityLog(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(name = "actor_identity_user_id") val actorIdentityUserId: Long? = null,
    @Column(name = "actor_sub", length = 80) val actorSub: String? = null,
    @Column(length = 200) val roles: String? = null,
    @Column(name = "http_method", nullable = false, length = 10) val httpMethod: String,
    @Column(name = "request_path", nullable = false, length = 300) val requestPath: String,
    @Column(name = "status_code", nullable = false) val statusCode: Int,
    @Column(nullable = false, length = 20) val outcome: String,
    @Column(name = "request_id", nullable = false, length = 80) val requestId: String,
    @Column(name = "duration_ms", nullable = false) val durationMs: Long,
    @Column(name = "occurred_at", nullable = false) val occurredAt: LocalDateTime = LocalDateTime.now()
)

interface ActivityLogRepository : JpaRepository<ActivityLog, UUID> {
    fun findAllByOrderByOccurredAtDesc(): List<ActivityLog>
}

@Service
class AuditLogService(
    private val logs: ActivityLogRepository,
    private val users: UserRepository
) {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun record(request: HttpServletRequest, statusCode: Int, durationMs: Long) {
        val authentication = SecurityContextHolder.getContext().authentication
        val jwt = authentication?.principal as? Jwt
        val actorSub = jwt?.subject
        val actorIdentityUserId = actorSub?.let(users::findByCognitoSub)?.id
        val roles = authentication?.authorities
            ?.map { it.authority.removePrefix("ROLE_") }
            ?.filter { it.isNotBlank() }
            ?.sorted()
            ?.joinToString(",")
            ?.ifBlank { null }
        val outcome = when (statusCode) {
            in 200..399 -> "SUCCESS"
            in 400..499 -> "REJECTED"
            else -> "ERROR"
        }
        logs.save(
            ActivityLog(
                actorIdentityUserId = actorIdentityUserId,
                actorSub = actorSub,
                roles = roles,
                httpMethod = request.method.take(10),
                requestPath = request.requestURI.take(300),
                statusCode = statusCode,
                outcome = outcome,
                requestId = request.requestId().take(80),
                durationMs = durationMs.coerceAtLeast(0)
            )
        )
    }
}

class AuditActivityFilter(private val audit: AuditLogService) : OncePerRequestFilter() {
    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.requestURI
        if (!path.startsWith("/api/") || path == "/api/health" || request.method == "OPTIONS") return true
        return request.method == "GET" &&
            (path.startsWith("/api/products") || path.startsWith("/api/categories"))
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val startedAt = System.nanoTime()
        var failure: Throwable? = null
        try {
            filterChain.doFilter(request, response)
        } catch (error: Throwable) {
            failure = error
            throw error
        } finally {
            val durationMs = (System.nanoTime() - startedAt) / 1_000_000
            val statusCode = if (failure != null && response.status < 400) 500 else response.status
            runCatching { audit.record(request, statusCode, durationMs) }
        }
    }
}
