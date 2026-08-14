package com.sprint.backend.inventory

import com.sprint.backend.products.Product
import com.sprint.backend.products.ProductRepository
import com.sprint.backend.suppliers.Supplier
import com.sprint.backend.suppliers.SupplierRepository
import jakarta.persistence.*
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.util.UUID

@Entity @Table(name = "inventory_movements", schema = "commerce")
class InventoryMovement(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) val product: Product,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "supplier_id") val supplier: Supplier? = null,
    @Column(nullable = false, length = 20) val type: String,
    @Column(nullable = false) val quantity: Int,
    @Column(name = "resulting_stock", nullable = false) val resultingStock: Int,
    @Column(length = 160) val reference: String? = null,
    @Column(name = "created_by", nullable = false, length = 80) val createdBy: String,
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now()
)

interface InventoryMovementRepository : JpaRepository<InventoryMovement, UUID> {
    fun findAllByOrderByCreatedAtDesc(): List<InventoryMovement>
}

data class InventoryRequest(
    @field:NotBlank val productId: String,
    @field:NotBlank val type: String,
    @field:Min(1) val quantity: Int,
    val supplierId: UUID? = null,
    val reference: String? = null
)
data class InventoryResponse(val id: UUID, val productId: String, val productName: String, val supplierId: UUID?, val type: String, val quantity: Int, val resultingStock: Int, val reference: String?, val createdBy: String, val createdAt: String)

@Service
class InventoryService(private val products: ProductRepository, private val suppliers: SupplierRepository, private val movements: InventoryMovementRepository) {
    @Transactional(readOnly = true)
    fun list() = movements.findAllByOrderByCreatedAtDesc().map { it.dto() }

    @Transactional
    fun register(jwt: Jwt, r: InventoryRequest): InventoryResponse {
        val product = products.findByIdForUpdate(r.productId).orElseThrow { IllegalArgumentException("Producto no encontrado") }
        val type = r.type.uppercase()
        require(type in setOf("ENTRY", "EXIT", "ADJUSTMENT")) { "Tipo de movimiento no permitido" }
        val delta = if (type == "ENTRY") r.quantity else -r.quantity
        require(product.stock + delta >= 0) { "Stock insuficiente" }
        product.stock += delta
        products.save(product)
        val supplier = r.supplierId?.let { suppliers.findById(it).orElseThrow { IllegalArgumentException("Proveedor no encontrado") } }
        return movements.save(InventoryMovement(product = product, supplier = supplier, type = type, quantity = r.quantity, resultingStock = product.stock, reference = r.reference?.trim(), createdBy = jwt.subject)).dto()
    }

    fun record(product: Product, type: String, quantity: Int, reference: String, actor: String) {
        movements.save(InventoryMovement(product = product, type = type, quantity = quantity, resultingStock = product.stock, reference = reference, createdBy = actor))
    }

    private fun InventoryMovement.dto() = InventoryResponse(id, product.id, product.name, supplier?.id, type, quantity, resultingStock, reference, createdBy, createdAt.toString())
}

@RestController @RequestMapping("/api/admin/inventory") @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
class InventoryController(private val service: InventoryService) {
    @GetMapping fun list() = mapOf("movements" to service.list())
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    fun create(@AuthenticationPrincipal jwt: Jwt, @Valid @RequestBody request: InventoryRequest) = mapOf("movement" to service.register(jwt, request))
}
