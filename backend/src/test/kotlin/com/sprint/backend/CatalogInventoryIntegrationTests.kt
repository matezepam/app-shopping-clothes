package com.sprint.backend

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@SpringBootTest
@AutoConfigureMockMvc
class CatalogInventoryIntegrationTests(@Autowired private val mockMvc: MockMvc, @Autowired private val json: ObjectMapper) {
    private fun admin() = jwt().authorities(SimpleGrantedAuthority("ROLE_ADMIN")).jwt { it.subject("admin-sub") }
    private fun moderator() = jwt().authorities(SimpleGrantedAuthority("ROLE_MODERATOR")).jwt { it.subject("moderator-sub") }

    @Test
    fun `product is created pending then approved stocked and published`() {
        val product = mapOf("id" to "integration-product", "sku" to "INT-001", "name" to "Producto integrado", "collection" to "men", "category" to "shirts", "subcategory" to "camisetas", "concept" to "andes", "priceUsd" to 19.99, "image" to "/images/products/tee.svg", "images" to listOf("/images/products/tee.svg"), "gender" to "male", "color" to "negro", "sizes" to listOf("M"), "stock" to 99, "status" to "active")
        mockMvc.post("/api/products/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(product) }
            .andExpect { status { isCreated() }; jsonPath("$.product.moderationStatus") { value("PENDING") }; jsonPath("$.product.stock") { value(0) } }
        mockMvc.post("/api/products/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(product + ("id" to "integration-product-duplicate")) }
            .andExpect { status { isConflict() }; jsonPath("$.message") { value("Ya existe un producto con ese SKU") } }
        mockMvc.patch("/api/products/admin/integration-product/status") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("status" to "hidden")) }
            .andExpect { status { isBadRequest() }; jsonPath("$.message") { value("El producto debe estar aprobado antes de cambiar su disponibilidad") } }
        mockMvc.post("/api/admin/inventory") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("productId" to "integration-product", "type" to "ENTRY", "quantity" to 4, "reference" to "TEST")) }
            .andExpect { status { isBadRequest() }; jsonPath("$.message") { value("El producto debe estar aprobado y habilitado antes de registrar inventario") } }
        mockMvc.patch("/api/admin/moderation/integration-product") { with(moderator()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("decision" to "APPROVED")) }
            .andExpect { status { isOk() } }
        mockMvc.get("/api/products/integration-product").andExpect { status { isNotFound() } }
        mockMvc.post("/api/admin/inventory") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("productId" to "integration-product", "type" to "ENTRY", "quantity" to 4, "reference" to "TEST")) }
            .andExpect { status { isCreated() }; jsonPath("$.movement.resultingStock") { value(4) } }
        mockMvc.get("/api/admin/moderation/history") { with(moderator()) }
            .andExpect { status { isOk() }; jsonPath("$.products[?(@.productId == 'integration-product')].moderatedBy") { exists() } }
        mockMvc.get("/api/products/integration-product").andExpect { status { isOk() }; jsonPath("$.product.stock") { value(4) } }
        mockMvc.patch("/api/products/admin/integration-product/status") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("status" to "hidden")) }
            .andExpect { status { isOk() }; jsonPath("$.product.status") { value("hidden") }; jsonPath("$.product.moderationStatus") { value("APPROVED") } }
        mockMvc.get("/api/products/integration-product").andExpect { status { isNotFound() } }
        mockMvc.patch("/api/products/admin/integration-product/status") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("status" to "active")) }
            .andExpect { status { isOk() }; jsonPath("$.product.status") { value("active") }; jsonPath("$.product.moderationStatus") { value("APPROVED") } }
        mockMvc.get("/api/products/integration-product").andExpect { status { isOk() } }
        val deletionRequest = mockMvc.post("/api/admin/product-deletions/integration-product") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("reason" to "Producto de integración con historial comercial")) }
            .andExpect { status { isCreated() }; jsonPath("$.request.canDeletePermanently") { value(false) } }
            .andReturn().response.contentAsString
        val deletionId = json.readTree(deletionRequest).path("request").path("id").asText()
        mockMvc.patch("/api/admin/product-deletions/$deletionId") { with(moderator()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("decision" to "APPROVED")) }
            .andExpect { status { isBadRequest() }; jsonPath("$.message") { value(org.hamcrest.Matchers.containsString("movimientos de inventario")) } }
    }

    @Test
    fun `sku is generated and unreferenced product requires moderated deletion`() {
        val product = mapOf("id" to "auto-sku-product", "sku" to "", "name" to "Camiseta Producto Automático", "collection" to "men", "category" to "shirts", "subcategory" to "camisetas", "concept" to "andes", "priceUsd" to 22.50, "image" to "/images/products/tee.svg", "images" to listOf("/images/products/tee.svg"), "gender" to "male", "color" to "negro", "sizes" to listOf("M"), "stock" to 0, "status" to "active")
        mockMvc.post("/api/products/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(product) }
            .andExpect { status { isCreated() }; jsonPath("$.product.sku") { value(org.hamcrest.Matchers.matchesPattern("CAM-PRO-AUT-[A-F0-9]{4}")) } }
        mockMvc.patch("/api/admin/moderation/auto-sku-product") { with(moderator()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("decision" to "APPROVED")) }
            .andExpect { status { isOk() } }
        val response = mockMvc.post("/api/admin/product-deletions/auto-sku-product") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("reason" to "Registro creado para comprobar el flujo de eliminación")) }
            .andExpect { status { isCreated() }; jsonPath("$.request.status") { value("PENDING") }; jsonPath("$.request.canDeletePermanently") { value(true) } }
            .andReturn().response.contentAsString
        val requestId = json.readTree(response).path("request").path("id").asText()
        mockMvc.patch("/api/admin/product-deletions/$requestId") { with(moderator()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("decision" to "APPROVED", "note" to "Registro sin historial comercial")) }
            .andExpect { status { isOk() }; jsonPath("$.request.status") { value("APPROVED") } }
        mockMvc.get("/api/products").andExpect { status { isOk() }; jsonPath("$.products[?(@.id == 'auto-sku-product')]") { isEmpty() } }
        mockMvc.get("/api/products/admin") { with(admin()) }.andExpect { status { isOk() }; jsonPath("$.products[?(@.id == 'auto-sku-product')]") { isEmpty() } }
        mockMvc.get("/api/admin/moderation/history") { with(moderator()) }.andExpect { status { isOk() }; jsonPath("$.products[?(@.productId == 'auto-sku-product')]") { exists() } }
        mockMvc.get("/api/admin/product-deletions") { with(moderator()) }.andExpect { status { isOk() }; jsonPath("$.requests[?(@.productId == 'auto-sku-product' && @.status == 'APPROVED')]") { exists() } }
    }

    @Test
    fun `supplier and category are persisted`() {
        mockMvc.post("/api/categories/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Edición limitada")) }
            .andExpect { status { isCreated() } }
        mockMvc.post("/api/admin/suppliers") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Proveedor prueba", "taxId" to "TEST-RUC-001", "email" to "supplier@example.com", "status" to "ACTIVE", "productIds" to emptyList<String>())) }
            .andExpect { status { isCreated() } }
    }

    @Test
    fun `categories and suppliers can be edited and only safely deleted`() {
        val suffix = System.nanoTime().toString()
        val categoryResponse = mockMvc.post("/api/categories/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Temporal $suffix")) }
            .andExpect { status { isCreated() } }
            .andReturn().response.contentAsString
        val categoryId = json.readTree(categoryResponse).path("category").path("id").asLong()
        mockMvc.put("/api/categories/admin/$categoryId") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Temporal corregida $suffix", "active" to false)) }
            .andExpect { status { isOk() }; jsonPath("$.category.name") { value("Temporal corregida $suffix") }; jsonPath("$.category.active") { value(false) } }
        mockMvc.delete("/api/categories/admin/$categoryId") { with(admin()) }.andExpect { status { isNoContent() } }

        val parentResponse = mockMvc.post("/api/categories/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Padre $suffix")) }
            .andExpect { status { isCreated() } }.andReturn().response.contentAsString
        val parentId = json.readTree(parentResponse).path("category").path("id").asLong()
        val childResponse = mockMvc.post("/api/categories/admin") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Hija $suffix", "parentId" to parentId)) }
            .andExpect { status { isCreated() } }.andReturn().response.contentAsString
        val childId = json.readTree(childResponse).path("category").path("id").asLong()
        mockMvc.delete("/api/categories/admin/$parentId") { with(admin()) }
            .andExpect { status { isBadRequest() }; jsonPath("$.message") { value(org.hamcrest.Matchers.containsString("subcategorías relacionadas")) } }
        mockMvc.delete("/api/categories/admin/$childId") { with(admin()) }.andExpect { status { isNoContent() } }
        mockMvc.delete("/api/categories/admin/$parentId") { with(admin()) }.andExpect { status { isNoContent() } }

        val supplierResponse = mockMvc.post("/api/admin/suppliers") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Proveedor temporal $suffix", "taxId" to "TMP-$suffix", "status" to "ACTIVE", "productIds" to emptyList<String>())) }
            .andExpect { status { isCreated() } }
            .andReturn().response.contentAsString
        val supplierId = json.readTree(supplierResponse).path("supplier").path("id").asText()
        mockMvc.put("/api/admin/suppliers/$supplierId") { with(admin()); contentType = org.springframework.http.MediaType.APPLICATION_JSON; content = json.writeValueAsString(mapOf("name" to "Proveedor corregido $suffix", "taxId" to "TMP-$suffix", "status" to "INACTIVE", "productIds" to emptyList<String>())) }
            .andExpect { status { isOk() }; jsonPath("$.supplier.name") { value("Proveedor corregido $suffix") }; jsonPath("$.supplier.status") { value("INACTIVE") } }
        mockMvc.delete("/api/admin/suppliers/$supplierId") { with(admin()) }.andExpect { status { isNoContent() } }
    }
}
