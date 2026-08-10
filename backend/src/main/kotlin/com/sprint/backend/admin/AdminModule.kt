package com.sprint.backend.admin

import com.sprint.backend.orders.OrderRepository
import com.sprint.backend.products.ProductRepository
import com.sprint.backend.returns.ReturnRequestRepository
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDateTime

data class AdminSummary(val ordersCount: Int, val revenueUsd: BigDecimal, val unitsSold: Int, val returnsPending: Long, val lowStockProducts: Long)
data class TopProduct(val productId: String, val name: String, val unitsSold: Int, val revenueUsd: BigDecimal)
data class RevenueDay(val day: String, val revenueUsd: BigDecimal)
data class AdminStatsResponse(val summary: AdminSummary, val topProducts: List<TopProduct>, val revenueByDay: List<RevenueDay>)
data class ModerationRequest(@field:NotBlank val decision: String, @field:Size(max = 500) val note: String? = null)
data class ModerationRow(val productId: String, val name: String, val sku: String, val status: String, val note: String?, val moderatedBy: String?, val moderatedAt: String?)

@Service
class AdminService(private val orders: OrderRepository, private val returns: ReturnRequestRepository, private val products: ProductRepository) {
    fun stats(): AdminStatsResponse {
        val commercialOrders = orders.findAll().filter { it.status !in setOf("CANCELLED", "PENDING_WHATSAPP") }
        val items = commercialOrders.flatMap { it.items }
        val top = items.groupBy { it.product.id }.map { (id, lines) ->
            TopProduct(id, lines.first().productName, lines.sumOf { it.quantity }, lines.fold(BigDecimal.ZERO) { acc, line -> acc + line.subtotalUsd })
        }.sortedByDescending { it.unitsSold }.take(5)
        val byDay = commercialOrders.groupBy { it.createdAt.toLocalDate().toString() }.map { (day, list) ->
            RevenueDay(day, list.fold(BigDecimal.ZERO) { acc, order -> acc + order.totalUsd })
        }.sortedBy { it.day }
        return AdminStatsResponse(
            AdminSummary(commercialOrders.size, commercialOrders.fold(BigDecimal.ZERO) { acc, o -> acc + o.totalUsd }, items.sumOf { it.quantity }, returns.countByStatus("REQUESTED"), products.findAll().count { it.stock <= 5 }.toLong()),
            top, byDay
        )
    }

    fun moderationQueue() = products.findAll().filter { it.moderationStatus != "APPROVED" }.sortedByDescending { it.createdAt }.map {
        ModerationRow(it.id, it.name, it.sku, it.moderationStatus, it.moderationNote, it.moderatedBy, it.moderatedAt?.toString())
    }

    @Transactional
    fun moderate(jwt: Jwt, productId: String, request: ModerationRequest): ModerationRow {
        val product = products.findById(productId).orElseThrow { IllegalArgumentException("Producto no encontrado") }
        val decision = request.decision.uppercase()
        require(decision in setOf("APPROVED", "REJECTED", "OBSERVED")) { "Decisión no permitida" }
        require(decision == "APPROVED" || !request.note.isNullOrBlank()) { "El rechazo u observación requiere motivo" }
        product.moderationStatus = decision; product.moderationNote = request.note?.trim()?.ifBlank { null }
        product.moderatedBy = jwt.subject; product.moderatedAt = LocalDateTime.now()
        products.save(product)
        return ModerationRow(product.id, product.name, product.sku, product.moderationStatus, product.moderationNote, product.moderatedBy, product.moderatedAt?.toString())
    }
}

@RestController @RequestMapping("/api/admin")
class AdminController(private val service: AdminService) {
    @GetMapping("/stats") @PreAuthorize("hasRole('ADMIN')") fun stats() = service.stats()
    @GetMapping("/moderation") @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')") fun moderation() = mapOf("products" to service.moderationQueue())
    @PatchMapping("/moderation/{productId}") @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    fun moderate(@AuthenticationPrincipal jwt: Jwt, @PathVariable productId: String, @RequestBody request: ModerationRequest) = mapOf("product" to service.moderate(jwt, productId, request))
}
