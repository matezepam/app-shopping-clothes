package com.sprint.backend.returns

import com.sprint.backend.auth.AuthService
import com.sprint.backend.inventory.InventoryService
import com.sprint.backend.orders.Order
import com.sprint.backend.orders.OrderRepository
import com.sprint.backend.products.Product
import com.sprint.backend.products.ProductRepository
import jakarta.persistence.*
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.util.UUID

@Entity @Table(name = "return_requests", schema = "commerce")
class ReturnRequestEntity(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false) val order: Order,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) val product: Product,
    @Column(nullable = false) val quantity: Int,
    @Column(nullable = false, length = 500) val reason: String,
    @Column(nullable = false, length = 20) var status: String = "REQUESTED",
    @Column(name = "admin_note", length = 500) var adminNote: String? = null,
    @Column(name = "stock_restored", nullable = false) var stockRestored: Boolean = false,
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now(),
    @Column(name = "updated_at", nullable = false) var updatedAt: LocalDateTime = LocalDateTime.now()
)

interface ReturnRequestRepository : JpaRepository<ReturnRequestEntity, UUID> {
    fun findAllByOrderUserSubOrderByCreatedAtDesc(userSub: String): List<ReturnRequestEntity>
    fun findAllByOrderByCreatedAtDesc(): List<ReturnRequestEntity>
    fun findAllByOrderIdAndProductId(orderId: UUID, productId: String): List<ReturnRequestEntity>
    fun countByStatus(status: String): Long
}

data class CreateReturnRequest(@field:NotBlank val orderId: String, @field:NotBlank val productId: String, @field:Min(1) val quantity: Int, @field:NotBlank @field:Size(max = 500) val reason: String)
data class PatchReturnRequest(@field:NotBlank val status: String, @field:Size(max = 500) val adminNote: String? = null)
data class ReturnResponse(val id: UUID, val orderId: UUID, val productId: String, val quantity: Int, val reason: String, val status: String, val createdAt: String, val adminNote: String?, val userEmail: String)

@Service
class ReturnService(
    private val auth: AuthService, private val returns: ReturnRequestRepository, private val orders: OrderRepository,
    private val products: ProductRepository, private val inventory: InventoryService
) {
    @Transactional(readOnly = true)
    fun listMine(jwt: Jwt): List<ReturnResponse> {
        auth.currentUser(jwt)
        return returns.findAllByOrderUserSubOrderByCreatedAtDesc(jwt.subject).map { it.dto() }
    }

    @Transactional(readOnly = true)
    fun listAll() = returns.findAllByOrderByCreatedAtDesc().map { it.dto() }

    @Transactional
    fun create(jwt: Jwt, r: CreateReturnRequest): ReturnResponse {
        auth.currentUser(jwt)
        val orderId = runCatching { UUID.fromString(r.orderId) }.getOrElse { throw IllegalArgumentException("Pedido inválido") }
        val order = orders.findById(orderId).orElseThrow { IllegalArgumentException("Pedido no encontrado") }
        require(order.userSub == jwt.subject) { "El pedido no pertenece al usuario" }
        require(order.status == "DELIVERED") { "Solo se aceptan devoluciones de pedidos entregados" }
        val line = order.items.find { it.product.id == r.productId } ?: throw IllegalArgumentException("El producto no pertenece al pedido")
        val requested = returns.findAllByOrderIdAndProductId(orderId, r.productId).filter { it.status != "REJECTED" }.sumOf { it.quantity }
        require(requested + r.quantity <= line.quantity) { "La cantidad supera las unidades compradas" }
        return returns.save(ReturnRequestEntity(order = order, product = line.product, quantity = r.quantity, reason = r.reason.trim())).dto()
    }

    @Transactional
    fun patch(jwt: Jwt, id: UUID, r: PatchReturnRequest): ReturnResponse {
        val entity = returns.findById(id).orElseThrow { IllegalArgumentException("Devolución no encontrada") }
        val next = r.status.uppercase()
        require(next in setOf("APPROVED", "REJECTED", "RECEIVED")) { "Estado de devolución no permitido" }
        val transitions = mapOf("REQUESTED" to setOf("APPROVED", "REJECTED"), "APPROVED" to setOf("RECEIVED"), "REJECTED" to emptySet(), "RECEIVED" to emptySet())
        require(next in (transitions[entity.status] ?: emptySet())) { "Transición de devolución no permitida" }
        if (next == "RECEIVED" && !entity.stockRestored) {
            val product = products.findByIdForUpdate(entity.product.id).orElseThrow()
            product.stock += entity.quantity; products.save(product)
            inventory.record(product, "RETURN", entity.quantity, entity.id.toString(), jwt.subject)
            entity.stockRestored = true
        }
        entity.status = next; entity.adminNote = r.adminNote?.trim()?.ifBlank { null }; entity.updatedAt = LocalDateTime.now()
        return returns.save(entity).dto()
    }

    private fun ReturnRequestEntity.dto() = ReturnResponse(id, order.id, product.id, quantity, reason, status, createdAt.toString(), adminNote, order.userEmail)
}

@RestController @RequestMapping("/api/returns")
class ReturnController(private val service: ReturnService) {
    @GetMapping fun list(@AuthenticationPrincipal jwt: Jwt) = mapOf("returns" to service.listMine(jwt))
    @PostMapping @ResponseStatus(HttpStatus.CREATED) fun create(@AuthenticationPrincipal jwt: Jwt, @Valid @RequestBody r: CreateReturnRequest) = mapOf("return" to service.create(jwt, r))
}

@RestController @RequestMapping("/api/admin/returns") @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
class AdminReturnController(private val service: ReturnService) {
    @GetMapping fun list() = mapOf("returns" to service.listAll())
    @PatchMapping("/{id}") fun patch(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID, @Valid @RequestBody r: PatchReturnRequest) = mapOf("return" to service.patch(jwt, id, r))
}
