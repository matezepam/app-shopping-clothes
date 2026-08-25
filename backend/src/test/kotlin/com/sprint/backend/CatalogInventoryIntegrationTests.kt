package com.sprint.backend

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class CatalogInventoryIntegrationTests(@Autowired private val mockMvc: MockMvc, @Autowired private val json: ObjectMapper) {
    private fun admin() = jwt().authorities(SimpleGrantedAuthority("ROLE_ADMIN")).jwt { it.subject("admin-sub") }
    private fun moderator() = jwt().authorities(SimpleGrantedAuthority("ROLE_MODERATOR")).jwt { it.subject("moderator-sub") }

    @Test
    fun `product is created pending then stocked moderated and published`() {
        val product = mapOf("id" to "integration-product", "sku" to "INT-001", "name" to "Producto integrado", "collection" to "men", "category" to "shirts", "subcategory" to "camisetas", "concept" to "andes", "priceUsd" to 19.99, "image" to "/images/products/tee.svg", "images" to listOf("/images/products/tee.svg"), "gender" to "male", "color" to "negro", "sizes" to listOf("M"), "stock" to 99, "status" to "active")
        mockMvc.post("/api/products/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(product) }
            .andExpect { status { isCreated() }; jsonPath("$.product.moderationStatus") { value("PENDING") }; jsonPath("$.product.stock") { value(0) } }
        mockMvc.post("/api/products/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(product + ("id" to "integration-product-duplicate")) }
            .andExpect { status { isConflict() }; jsonPath("$.message") { value("Ya existe un producto con ese SKU") } }
        mockMvc.post("/api/admin/inventory") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("productId" to "integration-product", "type" to "ENTRY", "quantity" to 4, "reference" to "TEST")) }
            .andExpect { status { isCreated() }; jsonPath("$.movement.resultingStock") { value(4) } }
        mockMvc.patch("/api/admin/moderation/integration-product") { with(moderator()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("decision" to "APPROVED")) }
            .andExpect { status { isOk() } }
        mockMvc.get("/api/admin/moderation/history") { with(moderator()) }
            .andExpect { status { isOk() }; jsonPath("$.products[?(@.productId == 'integration-product')].moderatedBy") { exists() } }
        mockMvc.get("/api/products/integration-product").andExpect { status { isOk() }; jsonPath("$.product.stock") { value(4) } }
    }

    @Test
    fun `supplier and category are persisted`() {
        mockMvc.post("/api/categories/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Edición limitada")) }
            .andExpect { status { isCreated() } }
        mockMvc.post("/api/admin/suppliers") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Proveedor prueba", "taxId" to "TEST-RUC-001", "email" to "supplier@example.com", "status" to "ACTIVE", "productIds" to emptyList<String>())) }
            .andExpect { status { isCreated() } }
    }
}
