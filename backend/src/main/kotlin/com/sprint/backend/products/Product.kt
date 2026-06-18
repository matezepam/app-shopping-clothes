package com.sprint.backend.products

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "products")
class Product(
    @Id
    @Column(length = 120)
    var id: String,

    @Column(nullable = false, unique = true, length = 80)
    var sku: String,

    @Column(nullable = false, length = 160)
    var name: String,

    @Column(nullable = false, length = 30)
    var collection: String,

    @Column(nullable = false, length = 40)
    var category: String,

    @Column(nullable = false, length = 40)
    var subcategory: String,

    @Column(nullable = false, length = 40)
    var concept: String,

    @Column(name = "price_usd", nullable = false, precision = 10, scale = 2)
    var priceUsd: BigDecimal,

    @Column(name = "compare_at_price_usd", precision = 10, scale = 2)
    var compareAtPriceUsd: BigDecimal? = null,

    @Column(nullable = false, columnDefinition = "TEXT")
    var image: String,

    @Column(columnDefinition = "TEXT")
    var images: String? = null,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(columnDefinition = "TEXT")
    var story: String? = null,

    @Column(nullable = false, length = 20)
    var gender: String,

    @Column(nullable = false, length = 30)
    var color: String,

    @Column(columnDefinition = "TEXT")
    var sizes: String? = null,

    @Column(nullable = false)
    var stock: Int = 0,

    @Column(nullable = false, length = 20)
    var status: String = "active",

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
