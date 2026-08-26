package com.sprint.backend.orders

import com.sprint.backend.auth.AuthService
import com.sprint.backend.inventory.InventoryService
import com.sprint.backend.products.Product
import com.sprint.backend.products.ProductRepository
import com.sprint.backend.users.UserRepository
import jakarta.persistence.*
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotEmpty
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.util.UUID

@Entity @Table(name = "orders", schema = "commerce")
class Order(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(name = "identity_user_id", nullable = false) val identityUserId: Long,
    @Column(name = "user_sub", nullable = false, length = 80) val userSub: String,
    @Column(name = "user_email", nullable = false, length = 150) val userEmail: String,
    @Column(nullable = false, length = 30) var status: String = "PENDING_WHATSAPP",
    @Column(name = "total_usd", nullable = false, precision = 12, scale = 2) var totalUsd: BigDecimal = BigDecimal.ZERO,
    @Column(name = "idempotency_key", length = 120) val idempotencyKey: String? = null,
    @Column(name = "shipping_address", nullable = false, length = 300) val shippingAddress: String,
    @Column(name = "contact_phone", nullable = false, length = 30) val contactPhone: String,
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now(),
    @Column(name = "updated_at", nullable = false) var updatedAt: LocalDateTime = LocalDateTime.now(),
    @OneToMany(mappedBy = "order", cascade = [CascadeType.ALL], orphanRemoval = true) val items: MutableList<OrderItem> = mutableListOf()
)

@Entity @Table(name = "order_items", schema = "commerce")
class OrderItem(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false) val order: Order,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) val product: Product,
    @Column(name = "product_name", nullable = false, length = 160) val productName: String,
    @Column(name = "unit_price_usd", nullable = false, precision = 10, scale = 2) val unitPriceUsd: BigDecimal,
    @Column(nullable = false) val quantity: Int,
    @Column(name = "subtotal_usd", nullable = false, precision = 12, scale = 2) val subtotalUsd: BigDecimal
)

@Entity @Table(name = "order_status_history", schema = "audit")
class OrderStatusHistory(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false) val order: Order,
    @Column(name = "changed_by_identity_user_id") val changedByIdentityUserId: Long? = null,
    @Column(name = "changed_by_sub", nullable = false, length = 80) val changedBySub: String,
    @Column(nullable = false, length = 30) val status: String,
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now()
)

interface OrderRepository : JpaRepository<Order, UUID> {
    fun findAllByUserSubOrderByCreatedAtDesc(userSub: String): List<Order>
    fun findByUserSubAndIdempotencyKey(userSub: String, idempotencyKey: String): Order?
    fun findAllByOrderByCreatedAtDesc(): List<Order>
}

interface OrderItemRepository : JpaRepository<OrderItem, Long> {
    fun existsByProductId(productId: String): Boolean
}

interface OrderStatusHistoryRepository : JpaRepository<OrderStatusHistory, UUID> {
    fun findAllByOrderIdOrderByCreatedAtAsc(orderId: UUID): List<OrderStatusHistory>
}

data class CheckoutLine(@field:jakarta.validation.constraints.NotBlank val productId: String, @field:Min(1) val quantity: Int)
data class CheckoutRequest(
    @field:NotEmpty @field:Valid val items: List<CheckoutLine>,
    @field:jakarta.validation.constraints.NotBlank @field:jakarta.validation.constraints.Size(max = 300) val shippingAddress: String,
    @field:jakarta.validation.constraints.NotBlank @field:jakarta.validation.constraints.Size(max = 30) val contactPhone: String
)
data class OrderStatusRequest(@field:jakarta.validation.constraints.NotBlank val status: String)
data class OrderLineResponse(val productId: String, val name: String, val quantity: Int, val unitPriceUsd: BigDecimal, val subtotalUsd: BigDecimal)
data class OrderResponse(val id: UUID, val createdAt: String, val updatedAt: String, val totalUsd: BigDecimal, val status: String, val shippingAddress: String, val contactPhone: String, val items: List<OrderLineResponse>, val whatsappUrl: String)

@Service
class OrderService(
    private val auth: AuthService,
    private val orders: OrderRepository,
    private val orderStatusHistory: OrderStatusHistoryRepository,
    private val users: UserRepository,
    private val products: ProductRepository,
    private val inventory: InventoryService,
    @Value("\${app.whatsapp.business-number}") private val whatsappNumber: String
) {
    private val normalizedWhatsappNumber = whatsappNumber.filter { it.isDigit() }.also {
        require(it.length in 10..15) { "APP_WHATSAPP_BUSINESS_NUMBER debe estar en formato internacional, sin + ni espacios" }
    }

    @Transactional(readOnly = true)
    fun listMine(jwt: Jwt): List<OrderResponse> {
        auth.currentUser(jwt)
        return orders.findAllByUserSubOrderByCreatedAtDesc(jwt.subject).map { it.dto() }
    }

    @Transactional(readOnly = true)
    fun listAll() = orders.findAllByOrderByCreatedAtDesc().map { it.dto() }

    @Transactional
    fun create(jwt: Jwt, request: CheckoutRequest, idempotencyKey: String?): OrderResponse {
        val user = auth.currentUser(jwt)
        require(idempotencyKey == null || idempotencyKey.length <= 120) { "La clave de idempotencia es demasiado extensa" }
        require(idempotencyKey == null || idempotencyKey.matches(Regex("^[A-Za-z0-9._:-]{8,120}$"))) { "La clave de idempotencia no es válida" }
        idempotencyKey?.trim()?.takeIf { it.isNotBlank() }?.let { key ->
            orders.findByUserSubAndIdempotencyKey(jwt.subject, key)?.let { return it.dto() }
        }
        val grouped = request.items.groupBy { it.productId }.mapValues { (_, lines) -> lines.sumOf { it.quantity } }
        val order = Order(
            identityUserId = user.id!!,
            userSub = jwt.subject,
            userEmail = user.email,
            shippingAddress = request.shippingAddress.trim(),
            contactPhone = request.contactPhone.trim(),
            idempotencyKey = idempotencyKey?.trim()?.takeIf { it.isNotBlank() }
        )
        var total = BigDecimal.ZERO
        grouped.forEach { (productId, quantity) ->
            val product = products.findByIdForUpdate(productId).orElseThrow { IllegalArgumentException("Producto $productId no encontrado") }
            require(product.status == "active" && product.moderationStatus == "APPROVED") { "Producto ${product.name} no disponible" }
            require(product.stock >= quantity) { "Stock insuficiente para ${product.name}" }
            product.stock -= quantity
            products.save(product)
            inventory.record(product, "RESERVE", quantity, order.id.toString(), jwt.subject)
            val subtotal = product.priceUsd.multiply(BigDecimal(quantity))
            total = total.add(subtotal)
            order.items.add(OrderItem(order = order, product = product, productName = product.name, unitPriceUsd = product.priceUsd, quantity = quantity, subtotalUsd = subtotal))
        }
        order.totalUsd = total
        val saved = orders.save(order)
        orderStatusHistory.save(OrderStatusHistory(order = saved, changedByIdentityUserId = user.id, changedBySub = jwt.subject, status = saved.status))
        return saved.dto()
    }

    @Transactional
    fun updateStatus(jwt: Jwt, id: UUID, request: OrderStatusRequest): OrderResponse {
        val order = orders.findById(id).orElseThrow { IllegalArgumentException("Pedido no encontrado") }
        val next = request.status.uppercase()
        val transitions = mapOf(
            "PENDING_WHATSAPP" to setOf("CONFIRMED", "CANCELLED"), "CONFIRMED" to setOf("PREPARING", "CANCELLED"),
            "PREPARING" to setOf("SHIPPED", "CANCELLED"), "SHIPPED" to setOf("DELIVERED"), "DELIVERED" to emptySet(), "CANCELLED" to emptySet()
        )
        require(next in (transitions[order.status] ?: emptySet())) { "Transición de estado no permitida" }
        if (next == "CANCELLED") {
            order.items.forEach { item ->
                val product = products.findByIdForUpdate(item.product.id).orElseThrow()
                product.stock += item.quantity; products.save(product)
                inventory.record(product, "RELEASE", item.quantity, order.id.toString(), jwt.subject)
            }
        }
        order.status = next; order.updatedAt = LocalDateTime.now()
        val saved = orders.save(order)
        orderStatusHistory.save(
            OrderStatusHistory(
                order = saved,
                changedByIdentityUserId = users.findByCognitoSub(jwt.subject)?.id,
                changedBySub = jwt.subject,
                status = next
            )
        )
        return saved.dto()
    }

    private fun Order.dto(): OrderResponse {
        val lines = items.map { OrderLineResponse(it.product.id, it.productName, it.quantity, it.unitPriceUsd, it.subtotalUsd) }
        val message = buildString {
            append("Hola Sprint, deseo confirmar la solicitud ${id}.\n")
            lines.forEach { append("- ${it.quantity} x ${it.name}: USD ${it.subtotalUsd}\n") }
            append("Total: USD $totalUsd")
            append("\nEntrega: $shippingAddress\nContacto: $contactPhone")
        }
        val url = "https://wa.me/$normalizedWhatsappNumber?text=${URLEncoder.encode(message, StandardCharsets.UTF_8)}"
        return OrderResponse(id, createdAt.toString(), updatedAt.toString(), totalUsd, status, shippingAddress, contactPhone, lines, url)
    }
}

@RestController @RequestMapping("/api/orders")
class OrderController(private val service: OrderService) {
    @GetMapping fun list(@AuthenticationPrincipal jwt: Jwt) = mapOf("orders" to service.listMine(jwt))
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    fun create(@AuthenticationPrincipal jwt: Jwt, @RequestHeader("Idempotency-Key", required = false) key: String?, @Valid @RequestBody request: CheckoutRequest) = mapOf("order" to service.create(jwt, request, key))
}

@RestController @RequestMapping("/api/admin/orders") @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
class AdminOrderController(private val service: OrderService) {
    @GetMapping fun list() = mapOf("orders" to service.listAll())
    @PatchMapping("/{id}") fun update(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID, @Valid @RequestBody request: OrderStatusRequest) = mapOf("order" to service.updateStatus(jwt, id, request))
}
