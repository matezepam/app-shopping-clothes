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
import org.springframework.security.access.prepost.PreAuthorize
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
    @PreAuthorize("hasAnyRole('ADMIN','VENDOR','MODERATOR')")
    fun listAdmin(): Map<String, List<ProductResponse>> {
        return mapOf("products" to productService.listAdmin())
    }

    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
    fun create(
        @Valid @RequestBody request: ProductRequest
    ): Map<String, ProductResponse> {
        return mapOf("product" to productService.create(request))
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody request: ProductRequest
    ): Map<String, ProductResponse> {
        return mapOf("product" to productService.update(id, request))
    }

    @DeleteMapping("/admin/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(
        @PathVariable id: String
    ) {
        productService.delete(id)
    }
}
