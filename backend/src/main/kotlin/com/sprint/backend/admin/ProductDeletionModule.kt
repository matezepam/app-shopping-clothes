package com.sprint.backend.admin

import com.sprint.backend.inventory.InventoryMovementRepository
import com.sprint.backend.orders.OrderItemRepository
import com.sprint.backend.products.ProductRepository
import com.sprint.backend.returns.ReturnRequestRepository
import com.sprint.backend.users.UserRepository
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "product_deletion_requests", schema = "audit")
class ProductDeletionRequest(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(name = "product_id", nullable = false, length = 120) val productId: String,
    @Column(name = "product_name", nullable = false, length = 160) val productName: String,
    @Column(name = "product_sku", nullable = false, length = 80) val productSku: String,
    @Column(name = "previous_status", nullable = false, length = 20) val previousStatus: String,
    @Column(name = "requested_by_sub", nullable = false, length = 80) val requestedBySub: String,
    @Column(name = "requested_by_label", nullable = false, length = 150) val requestedByLabel: String,
    @Column(nullable = false, length = 500) val reason: String,
    @Column(nullable = false, length = 20) var status: String = "PENDING",
    @Column(name = "moderator_sub", length = 80) var moderatorSub: String? = null,
    @Column(name = "moderator_note", length = 500) var moderatorNote: String? = null,
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now(),
    @Column(name = "resolved_at") var resolvedAt: LocalDateTime? = null
)

interface ProductDeletionRequestRepository : JpaRepository<ProductDeletionRequest, UUID> {
    fun findAllByOrderByCreatedAtDesc(): List<ProductDeletionRequest>
    fun existsByProductIdAndStatus(productId: String, status: String): Boolean
}

data class CreateProductDeletionRequest(
    @field:NotBlank
    @field:Size(min = 20, max = 500)
    val reason: String
)

data class ResolveProductDeletionRequest(
    @field:NotBlank val decision: String,
    @field:Size(max = 500) val note: String? = null
)

data class ProductDeletionRow(
    val id: UUID,
    val productId: String,
    val productName: String,
    val productSku: String,
    val previousStatus: String,
    val requestedBy: String,
    val reason: String,
    val status: String,
    val moderatorNote: String?,
    val createdAt: String,
    val resolvedAt: String?,
    val canDeletePermanently: Boolean,
    val blockers: List<String>
)

@Service
class ProductDeletionService(
    private val requests: ProductDeletionRequestRepository,
    private val products: ProductRepository,
    private val orderItems: OrderItemRepository,
    private val movements: InventoryMovementRepository,
    private val returns: ReturnRequestRepository,
    private val users: UserRepository
) {
    @Transactional(readOnly = true)
    fun list(): List<ProductDeletionRow> = requests.findAllByOrderByCreatedAtDesc().map(::toRow)

    @Transactional
    fun request(jwt: Jwt, productId: String, input: CreateProductDeletionRequest): ProductDeletionRow {
        val product = products.findById(productId).orElseThrow { IllegalArgumentException("Producto no encontrado") }
        require(!requests.existsByProductIdAndStatus(productId, "PENDING")) {
            "Ya existe una solicitud de eliminación pendiente para este producto"
        }
        val profile = users.findByCognitoSub(jwt.subject)
        val label = profile?.email ?: jwt.subject
        val request = requests.save(
            ProductDeletionRequest(
                productId = product.id,
                productName = product.name,
                productSku = product.sku,
                previousStatus = product.status,
                requestedBySub = jwt.subject,
                requestedByLabel = label,
                reason = input.reason.trim()
            )
        )
        product.status = "hidden"
        products.save(product)
        return toRow(request)
    }

    @Transactional
    fun resolve(jwt: Jwt, id: UUID, input: ResolveProductDeletionRequest): ProductDeletionRow {
        val request = requests.findById(id).orElseThrow { IllegalArgumentException("Solicitud no encontrada") }
        require(request.status == "PENDING") { "La solicitud ya fue resuelta" }
        val decision = input.decision.trim().uppercase()
        require(decision in setOf("APPROVED", "REJECTED")) { "Decisión no permitida" }
        require(decision == "APPROVED" || !input.note.isNullOrBlank()) {
            "El rechazo requiere una explicación"
        }

        if (decision == "APPROVED") {
            val blockers = deletionBlockers(request.productId)
            require(blockers.isEmpty()) {
                "No se puede eliminar definitivamente: ${blockers.joinToString(", ")}"
            }
            val product = products.findById(request.productId).orElseThrow { IllegalArgumentException("El producto ya no existe") }
            request.status = "APPROVED"
            request.moderatorSub = jwt.subject
            request.moderatorNote = input.note?.trim()?.ifBlank { null }
            request.resolvedAt = LocalDateTime.now()
            requests.saveAndFlush(request)
            products.delete(product)
            products.flush()
            return toRow(request)
        }

        products.findById(request.productId).ifPresent { product ->
            if (product.status == "hidden") {
                product.status = request.previousStatus
                products.save(product)
            }
        }
        request.status = "REJECTED"
        request.moderatorSub = jwt.subject
        request.moderatorNote = input.note!!.trim()
        request.resolvedAt = LocalDateTime.now()
        return toRow(requests.save(request))
    }

    private fun toRow(request: ProductDeletionRequest): ProductDeletionRow {
        val blockers = if (request.status == "PENDING") deletionBlockers(request.productId) else emptyList()
        return ProductDeletionRow(
            request.id,
            request.productId,
            request.productName,
            request.productSku,
            request.previousStatus,
            request.requestedByLabel,
            request.reason,
            request.status,
            request.moderatorNote,
            request.createdAt.toString(),
            request.resolvedAt?.toString(),
            blockers.isEmpty(),
            blockers
        )
    }

    private fun deletionBlockers(productId: String): List<String> = buildList {
        if (orderItems.existsByProductId(productId)) add("tiene pedidos asociados")
        if (movements.existsByProductId(productId)) add("tiene movimientos de inventario")
        if (returns.existsByProductId(productId)) add("tiene devoluciones asociadas")
    }
}

@RestController
@RequestMapping("/api/admin/product-deletions")
class ProductDeletionController(private val service: ProductDeletionService) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','VENDOR','MODERATOR')")
    fun list() = mapOf("requests" to service.list())

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
    fun request(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable productId: String,
        @Valid @RequestBody input: CreateProductDeletionRequest
    ) = mapOf("request" to service.request(jwt, productId, input))

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    fun resolve(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: UUID,
        @Valid @RequestBody input: ResolveProductDeletionRequest
    ) = mapOf("request" to service.resolve(jwt, id, input))
}
