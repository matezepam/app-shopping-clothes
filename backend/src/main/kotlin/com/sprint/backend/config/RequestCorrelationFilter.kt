package com.sprint.backend.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

const val REQUEST_ID_ATTRIBUTE = "sprint.requestId"
const val REQUEST_ID_HEADER = "X-Request-ID"

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class RequestCorrelationFilter : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val requestId = request.getHeader(REQUEST_ID_HEADER)
            ?.trim()
            ?.takeIf { it.matches(Regex("[A-Za-z0-9._-]{8,80}")) }
            ?: UUID.randomUUID().toString()
        request.setAttribute(REQUEST_ID_ATTRIBUTE, requestId)
        response.setHeader(REQUEST_ID_HEADER, requestId)
        MDC.put("requestId", requestId)
        try {
            filterChain.doFilter(request, response)
        } finally {
            MDC.remove("requestId")
        }
    }
}

fun HttpServletRequest.requestId(): String =
    getAttribute(REQUEST_ID_ATTRIBUTE)?.toString() ?: "unavailable"
