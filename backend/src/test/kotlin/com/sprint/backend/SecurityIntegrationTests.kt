package com.sprint.backend

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTests(@Autowired private val mockMvc: MockMvc) {
    @Test
    fun `admin endpoint returns 401 without token`() {
        mockMvc.get("/api/admin/stats").andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `api returns 401 for malformed token`() {
        mockMvc.get("/api/admin/stats") { header("Authorization", "Bearer not-a-jwt") }
            .andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `admin endpoint returns 403 for customer group`() {
        mockMvc.get("/api/admin/stats") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_USER")).jwt { it.subject("customer-sub") })
        }.andExpect { status { isForbidden() } }
    }

    @Test
    fun `admin endpoint accepts admin group`() {
        mockMvc.get("/api/admin/stats") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_ADMIN")).jwt { it.subject("admin-sub") })
        }.andExpect { status { isOk() } }
    }
}
