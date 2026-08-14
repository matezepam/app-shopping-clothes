package com.sprint.backend.admin

import com.sprint.backend.orders.OrderRepository
import com.sprint.backend.products.Product
import com.sprint.backend.products.ProductRepository
import com.sprint.backend.returns.ReturnRequestRepository
import com.sprint.backend.users.UserRepository
import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

data class AdminSummary(val ordersCount: Int, val revenueUsd: BigDecimal, val unitsSold: Int, val returnsPending: Long, val lowStockProducts: Long)
data class TopProduct(val productId: String, val name: String, val unitsSold: Int, val revenueUsd: BigDecimal)
data class RevenueDay(val day: String, val revenueUsd: BigDecimal)
data class AdminStatsResponse(val summary: AdminSummary, val topProducts: List<TopProduct>, val revenueByDay: List<RevenueDay>)
data class ModerationRequest(@field:NotBlank val decision: String, @field:Size(max = 500) val note: String? = null)
data class ModerationRow(val productId: String, val name: String, val sku: String, val status: String, val note: String?, val moderatedBy: String?, val moderatedAt: String?)

@Entity
@Table(name = "moderation_history", schema = "audit")
class ModerationHistory(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) val product: Product,
    @Column(name = "moderator_identity_user_id") val moderatorIdentityUserId: Long? = null,
    @Column(name = "moderator_sub", nullable = false, length = 80) val moderatorSub: String,
    @Column(nullable = false, length = 20) val decision: String,
    @Column(length = 500) val note: String? = null,
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now()
)

interface ModerationHistoryRepository : JpaRepository<ModerationHistory, UUID> {
    fun findAllByOrderByCreatedAtDesc(): List<ModerationHistory>
}

@Service
class AdminService(
    private val orders: OrderRepository,
    private val returns: ReturnRequestRepository,
    private val products: ProductRepository,
    private val users: UserRepository,
    private val moderationEvents: ModerationHistoryRepository
) {
    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    fun moderationQueue() = products.findAll().filter { it.moderationStatus != "APPROVED" }.sortedByDescending { it.createdAt }.map { it.moderationRow() }

    @Transactional(readOnly = true)
    fun moderationHistory() = moderationEvents.findAllByOrderByCreatedAtDesc().map { event ->
        ModerationRow(
            event.product.id,
            event.product.name,
            event.product.sku,
            event.decision,
            event.note,
            event.moderatorSub,
            event.createdAt.toString()
        )
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
        moderationEvents.save(
            ModerationHistory(
                product = product,
                moderatorIdentityUserId = users.findByCognitoSub(jwt.subject)?.id,
                moderatorSub = jwt.subject,
                decision = decision,
                note = product.moderationNote,
                createdAt = product.moderatedAt!!
            )
        )
        return ModerationRow(product.id, product.name, product.sku, product.moderationStatus, product.moderationNote, product.moderatedBy, product.moderatedAt?.toString())
    }

    private fun com.sprint.backend.products.Product.moderationRow() =
        ModerationRow(id, name, sku, moderationStatus, moderationNote, moderatedBy, moderatedAt?.toString())
}

@RestController @RequestMapping("/api/admin")
class AdminController(private val service: AdminService) {
    @GetMapping("/stats") @PreAuthorize("hasRole('ADMIN')") fun stats() = service.stats()
    @GetMapping("/moderation") @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')") fun moderation() = mapOf("products" to service.moderationQueue())
    @GetMapping("/moderation/history") @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')") fun moderationHistory() = mapOf("products" to service.moderationHistory())
    @PatchMapping("/moderation/{productId}") @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    fun moderate(@AuthenticationPrincipal jwt: Jwt, @PathVariable productId: String, @jakarta.validation.Valid @RequestBody request: ModerationRequest) = mapOf("product" to service.moderate(jwt, productId, request))
}
