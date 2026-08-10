package com.sprint.backend.categories

import jakarta.persistence.*
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.text.Normalizer
import java.time.LocalDateTime

@Entity @Table(name = "categories")
class Category(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long? = null,
    @Column(nullable = false, length = 100) var name: String,
    @Column(nullable = false, unique = true, length = 100) var slug: String,
    @Column(name = "parent_id") var parentId: Long? = null,
    @Column(nullable = false) var active: Boolean = true,
    @Column(name = "created_at", nullable = false) val createdAt: LocalDateTime = LocalDateTime.now()
)

interface CategoryRepository : JpaRepository<Category, Long> {
    fun findAllByActiveTrueOrderByName(): List<Category>
    fun existsBySlug(slug: String): Boolean
}

data class CategoryRequest(@field:NotBlank @field:Size(max = 100) val name: String, val parentId: Long? = null, val active: Boolean = true)
data class CategoryResponse(val id: Long, val name: String, val slug: String, val parentId: Long?, val active: Boolean)

@Service
class CategoryService(private val repository: CategoryRepository) {
    fun publicList() = repository.findAllByActiveTrueOrderByName().map { it.dto() }
    fun adminList() = repository.findAll().sortedBy { it.name }.map { it.dto() }

    @Transactional
    fun create(r: CategoryRequest): CategoryResponse {
        r.parentId?.let { require(repository.existsById(it)) { "La categoría padre no existe" } }
        val slug = slug(r.name)
        require(!repository.existsBySlug(slug)) { "Ya existe una categoría con ese nombre" }
        return repository.save(Category(name = r.name.trim(), slug = slug, parentId = r.parentId, active = r.active)).dto()
    }

    @Transactional
    fun update(id: Long, r: CategoryRequest): CategoryResponse {
        val c = repository.findById(id).orElseThrow { IllegalArgumentException("Categoría no encontrada") }
        c.name = r.name.trim(); c.parentId = r.parentId; c.active = r.active
        return repository.save(c).dto()
    }

    private fun Category.dto() = CategoryResponse(id!!, name, slug, parentId, active)
    private fun slug(v: String) = Normalizer.normalize(v.trim().lowercase(), Normalizer.Form.NFD)
        .replace("\\p{Mn}+".toRegex(), "").replace("[^a-z0-9]+".toRegex(), "-").trim('-')
}

@RestController @RequestMapping("/api/categories")
class CategoryController(private val service: CategoryService) {
    @GetMapping fun list() = mapOf("categories" to service.publicList())
    @GetMapping("/admin") @PreAuthorize("hasAnyRole('ADMIN','VENDOR')") fun admin() = mapOf("categories" to service.adminList())
    @PostMapping("/admin") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
    fun create(@Valid @RequestBody r: CategoryRequest) = mapOf("category" to service.create(r))
    @PutMapping("/admin/{id}") @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
    fun update(@PathVariable id: Long, @Valid @RequestBody r: CategoryRequest) = mapOf("category" to service.update(id, r))
}
