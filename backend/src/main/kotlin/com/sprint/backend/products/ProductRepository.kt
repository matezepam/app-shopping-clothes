package com.sprint.backend.products

import org.springframework.data.jpa.repository.JpaRepository

interface ProductRepository : JpaRepository<Product, String> {
    fun findAllByStatusOrderByCreatedAtDesc(status: String): List<Product>
    fun existsBySku(sku: String): Boolean
}
