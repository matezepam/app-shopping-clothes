package com.sprint.backend

import com.sprint.backend.audit.ActivityLogRepository
import com.sprint.backend.users.User
import com.sprint.backend.users.UserRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.options
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.multipart
import org.springframework.mock.web.MockMultipartFile

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTests(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val activityLogs: ActivityLogRepository,
    @Autowired private val users: UserRepository
) {
    @Test
    fun `configured frontend origin passes CORS preflight`() {
        mockMvc.options("/api/auth/login") {
            header("Origin", "https://store.test")
            header("Access-Control-Request-Method", "POST")
            header("Access-Control-Request-Headers", "content-type")
        }.andExpect {
            status { isOk() }
            header { string("Access-Control-Allow-Origin", "https://store.test") }
            header { string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("POST")) }
        }
    }

    @Test
    fun `admin endpoint returns 401 without token`() {
        mockMvc.get("/api/admin/stats").andExpect {
            status { isUnauthorized() }
            content { contentTypeCompatibleWith(org.springframework.http.MediaType.APPLICATION_JSON) }
            content { encoding(Charsets.UTF_8.name()) }
            header { exists("X-Request-ID") }
            jsonPath("$.code") { value("UNAUTHORIZED") }
            jsonPath("$.requestId") { isNotEmpty() }
        }
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
        }.andExpect { status { isForbidden() }; jsonPath("$.code") { value("FORBIDDEN") } }
    }

    @Test
    fun `admin endpoint accepts admin group`() {
        mockMvc.get("/api/admin/stats") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_ADMIN")).jwt { it.subject("admin-sub") })
        }.andExpect { status { isOk() } }
    }

    @Test
    fun `customer cannot read operational metrics`() {
        mockMvc.get("/actuator/metrics") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_USER")).jwt { it.subject("customer-sub") })
        }.andExpect { status { isForbidden() } }
    }

    @Test
    fun `health endpoint is public and does not expose internal details`() {
        mockMvc.get("/actuator/health").andExpect {
            status { isOk() }
            jsonPath("$.status") { value("UP") }
            jsonPath("$.components") { doesNotExist() }
        }
    }

    @Test
    fun `validation errors use stable enterprise contract`() {
        mockMvc.post("/api/orders") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_USER")).jwt { it.subject("customer-sub") })
            contentType = org.springframework.http.MediaType.APPLICATION_JSON
            content = """{"items":[],"shippingAddress":"","contactPhone":""}"""
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.code") { value("VALIDATION_ERROR") }
            jsonPath("$.validationErrors.items") { exists() }
            jsonPath("$.requestId") { isNotEmpty() }
        }
        check(activityLogs.findAllByOrderByOccurredAtDesc().any {
            it.requestPath == "/api/admin/stats" && it.statusCode == 401 && it.outcome == "REJECTED"
        })
    }

    @Test
    fun `malformed json is rejected as 400 and never 500`() {
        mockMvc.post("/api/auth/login") {
            contentType = org.springframework.http.MediaType.APPLICATION_JSON
            content = "{not-json}"
        }.andExpect {
            status { isBadRequest() }
            header { string("Cache-Control", org.hamcrest.Matchers.containsString("no-store")) }
            jsonPath("$.code") { value("MALFORMED_REQUEST") }
            jsonPath("$.requestId") { isNotEmpty() }
        }
    }

    @Test
    fun `disabled account is rejected even while token remains valid`() {
        users.save(User(firstName = "Cuenta", lastName = "Bloqueada", email = "disabled@test.local", cognitoSub = "disabled-sub", enabled = false))
        mockMvc.get("/api/admin/stats") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_ADMIN")).jwt { it.subject("disabled-sub") })
        }.andExpect {
            status { isForbidden() }
            jsonPath("$.code") { value("ACCOUNT_DISABLED") }
        }
    }

    @Test
    fun `image upload rejects a file that only claims to be an image`() {
        val fake = MockMultipartFile("images", "fake.jpg", "image/jpeg", "not an image".toByteArray())
        mockMvc.multipart("/api/products/admin/images") {
            file(fake)
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_VENDOR")).jwt { it.subject("vendor-sub") })
        }.andExpect {
            status { isBadRequest() }
            jsonPath("$.code") { value("BAD_REQUEST") }
        }
    }

    @Test
    fun `unknown route returns structured 404`() {
        mockMvc.get("/api/route-that-does-not-exist") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_ADMIN")).jwt { it.subject("admin-sub") })
        }.andExpect {
            status { isNotFound() }
            jsonPath("$.code") { value("ROUTE_NOT_FOUND") }
        }
    }
}
