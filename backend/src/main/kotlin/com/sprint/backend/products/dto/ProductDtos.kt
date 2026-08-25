package com.sprint.backend.products.dto

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Digits
import jakarta.validation.constraints.Pattern
import java.math.BigDecimal

data class ProductResponse(
    val id: String,
    val sku: String,
    val name: String,
    val collection: String,
    val category: String,
    val subcategory: String,
    val concept: String,
    val priceUsd: BigDecimal,
    val compareAtPriceUsd: BigDecimal?,
    val image: String,
    val images: List<String>,
    val description: String?,
    val story: String?,
    val gender: String,
    val color: String,
    val sizes: List<String>,
    val stock: Int,
    val status: String,
    val moderationStatus: String,
    val moderationNote: String?,
    val createdAt: String
)

data class ProductRequest(
    @field:Size(max = 120)
    val id: String? = null,

    @field:NotBlank
    @field:Size(max = 80)
    @field:Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$")
    val sku: String,

    @field:NotBlank
    @field:Size(max = 160)
    val name: String,

    @field:NotBlank
    @field:Size(max = 30)
    val collection: String,

    @field:NotBlank
    @field:Size(max = 40)
    val category: String,

    @field:NotBlank
    @field:Size(max = 40)
    val subcategory: String,

    @field:NotBlank
    @field:Size(max = 40)
    val concept: String,

    @field:DecimalMin("0.01")
    @field:Digits(integer = 8, fraction = 2)
    val priceUsd: BigDecimal,

    @field:DecimalMin("0.01")
    @field:Digits(integer = 8, fraction = 2)
    val compareAtPriceUsd: BigDecimal? = null,

    @field:NotBlank
    @field:Size(max = 500)
    val image: String,

    @field:Size(max = 4)
    val images: List<String> = emptyList(),
    @field:Size(max = 1200)
    val description: String? = null,
    @field:Size(max = 1200)
    val story: String? = null,

    @field:NotBlank
    @field:Size(max = 20)
    val gender: String,

    @field:NotBlank
    @field:Size(max = 30)
    val color: String,

    @field:Size(max = 12)
    val sizes: List<String> = emptyList(),

    @field:Min(0)
    val stock: Int,

    @field:Size(max = 20)
    val status: String = "active"
)
