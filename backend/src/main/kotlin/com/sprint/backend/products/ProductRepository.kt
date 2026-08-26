package com.sprint.backend.products

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import jakarta.persistence.LockModeType
import java.util.Optional

interface ProductRepository : JpaRepository<Product, String> {
    fun findAllByStatusAndModerationStatusAndStockGreaterThanOrderByCreatedAtDesc(
        status: String,
        moderationStatus: String,
        stock: Int
    ): List<Product>
    fun existsBySku(sku: String): Boolean
    fun findBySku(sku: String): Product?
    @Query("""select count(p) from Product p where lower(p.collection) = lower(:value) or lower(p.category) = lower(:value) or lower(p.subcategory) = lower(:value)""")
    fun countByTaxonomyValue(value: String): Long
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    fun findByIdForUpdate(id: String): Optional<Product>
}
