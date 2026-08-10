package com.sprint.backend.suppliers

import com.sprint.backend.products.Product
import com.sprint.backend.products.ProductRepository
import jakarta.persistence.*
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.util.UUID

@Entity @Table(name = "suppliers")
class Supplier(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(nullable = false, length = 160) var name: String,
    @Column(name = "tax_id", nullable = false, unique = true, length = 30) var taxId: String,
    @Column(length = 150) var email: String? = null,
    @Column(length = 30) var phone: String? = null,
    @Column(nullable = false, length = 20) var status: String = "ACTIVE",
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now(),
    @ManyToMany @JoinTable(name = "supplier_products", joinColumns = [JoinColumn(name = "supplier_id")], inverseJoinColumns = [JoinColumn(name = "product_id")])
    val products: MutableSet<Product> = mutableSetOf()
)

interface SupplierRepository : JpaRepository<Supplier, UUID> { fun existsByTaxId(taxId: String): Boolean }
data class SupplierRequest(@field:NotBlank val name: String, @field:NotBlank val taxId: String, val email: String? = null, val phone: String? = null, val status: String = "ACTIVE", val productIds: Set<String> = emptySet())
data class SupplierResponse(val id: UUID, val name: String, val taxId: String, val email: String?, val phone: String?, val status: String, val productIds: Set<String>)

@Service
class SupplierService(private val repo: SupplierRepository, private val productRepo: ProductRepository) {
    fun list() = repo.findAll().sortedBy { it.name }.map { it.dto() }
    @Transactional fun create(r: SupplierRequest): SupplierResponse {
        require(!repo.existsByTaxId(r.taxId.trim())) { "Ya existe un proveedor con esa identificación" }
        return save(Supplier(name = r.name.trim(), taxId = r.taxId.trim()), r)
    }
    @Transactional fun update(id: UUID, r: SupplierRequest) = save(repo.findById(id).orElseThrow { IllegalArgumentException("Proveedor no encontrado") }, r)
    private fun save(s: Supplier, r: SupplierRequest): SupplierResponse {
        s.name = r.name.trim(); s.taxId = r.taxId.trim(); s.email = r.email?.trim()?.ifBlank { null }; s.phone = r.phone?.trim()?.ifBlank { null }
        s.status = r.status.uppercase().takeIf { it in setOf("ACTIVE", "INACTIVE") } ?: "ACTIVE"
        s.products.clear(); r.productIds.forEach { id -> s.products.add(productRepo.findById(id).orElseThrow { IllegalArgumentException("Producto $id no encontrado") }) }
        return repo.save(s).dto()
    }
    private fun Supplier.dto() = SupplierResponse(id, name, taxId, email, phone, status, products.map { it.id }.toSet())
}

@RestController @RequestMapping("/api/admin/suppliers") @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
class SupplierController(private val service: SupplierService) {
    @GetMapping fun list() = mapOf("suppliers" to service.list())
    @PostMapping @ResponseStatus(HttpStatus.CREATED) fun create(@Valid @RequestBody r: SupplierRequest) = mapOf("supplier" to service.create(r))
    @PutMapping("/{id}") fun update(@PathVariable id: UUID, @Valid @RequestBody r: SupplierRequest) = mapOf("supplier" to service.update(id, r))
}
