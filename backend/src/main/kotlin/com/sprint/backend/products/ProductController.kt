package com.sprint.backend.products

import com.sprint.backend.products.dto.ProductRequest
import com.sprint.backend.products.dto.ProductResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/products")
class ProductController(
    private val productService: ProductService
) {
    @GetMapping
    fun listPublic(): Map<String, List<ProductResponse>> {
        return mapOf("products" to productService.listPublic())
    }

    @GetMapping("/{id}")
    fun getPublic(@PathVariable id: String): Map<String, ProductResponse> {
        return mapOf("product" to productService.getPublic(id))
    }

    @GetMapping("/admin")
    fun listAdmin(
        @RequestHeader("Authorization", required = false) authorization: String?
    ): Map<String, List<ProductResponse>> {
        return mapOf("products" to productService.listAdmin(authorization))
    }

    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @RequestHeader("Authorization", required = false) authorization: String?,
        @Valid @RequestBody request: ProductRequest
    ): Map<String, ProductResponse> {
        return mapOf("product" to productService.create(authorization, request))
    }

    @PutMapping("/admin/{id}")
    fun update(
        @RequestHeader("Authorization", required = false) authorization: String?,
        @PathVariable id: String,
        @Valid @RequestBody request: ProductRequest
    ): Map<String, ProductResponse> {
        return mapOf("product" to productService.update(authorization, id, request))
    }

    @DeleteMapping("/admin/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @RequestHeader("Authorization", required = false) authorization: String?,
        @PathVariable id: String
    ) {
        productService.delete(authorization, id)
    }
}
