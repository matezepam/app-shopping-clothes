package com.sprint.backend.products

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import jakarta.persistence.LockModeType
import java.util.Optional

interface ProductRepository : JpaRepository<Product, String> {
    fun findAllByStatusAndModerationStatusOrderByCreatedAtDesc(status: String, moderationStatus: String): List<Product>
    fun existsBySku(sku: String): Boolean
    fun findBySku(sku: String): Product?
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    fun findByIdForUpdate(id: String): Optional<Product>
}
