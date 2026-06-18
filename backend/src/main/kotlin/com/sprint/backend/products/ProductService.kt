package com.sprint.backend.products

import com.sprint.backend.auth.JwtService
import com.sprint.backend.products.dto.ProductRequest
import com.sprint.backend.products.dto.ProductResponse
import com.sprint.backend.users.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.text.Normalizer

@Service
class ProductService(
    private val productRepository: ProductRepository,
    private val userRepository: UserRepository,
    private val jwtService: JwtService
) {
    fun listPublic(): List<ProductResponse> {
        return productRepository.findAllByStatusOrderByCreatedAtDesc("active").map { it.toResponse() }
    }

    fun listAdmin(authorization: String?): List<ProductResponse> {
        requireAdmin(authorization)
        return productRepository.findAll().sortedByDescending { it.createdAt }.map { it.toResponse() }
    }

    fun getPublic(id: String): ProductResponse {
        val product = productRepository.findById(id).orElseThrow {
            IllegalArgumentException("Producto no encontrado")
        }

        if (product.status != "active") {
            throw IllegalArgumentException("Producto no disponible")
        }

        return product.toResponse()
    }

    @Transactional
    fun create(authorization: String?, request: ProductRequest): ProductResponse {
        requireAdmin(authorization)

        val id = request.id?.trim()?.takeIf { it.isNotBlank() } ?: slugify(request.name)
        if (productRepository.existsById(id)) {
            throw IllegalArgumentException("Ya existe un producto con ese identificador")
        }

        if (productRepository.existsBySku(request.sku.trim())) {
            throw IllegalArgumentException("Ya existe un producto con ese SKU")
        }

        return productRepository.save(request.toProduct(id)).toResponse()
    }

    @Transactional
    fun update(authorization: String?, id: String, request: ProductRequest): ProductResponse {
        requireAdmin(authorization)
        val product = productRepository.findById(id).orElseThrow {
            IllegalArgumentException("Producto no encontrado")
        }

        product.sku = request.sku.trim()
        product.name = request.name.trim()
        product.collection = normalizeCollection(request.collection)
        product.category = request.category.trim()
        product.subcategory = request.subcategory.trim()
        product.concept = request.concept.trim()
        product.priceUsd = request.priceUsd
        product.compareAtPriceUsd = request.compareAtPriceUsd
        product.image = request.image.trim()
        product.images = request.images.clean().joinToString("|")
        product.description = request.description?.trim()?.ifBlank { null }
        product.story = request.story?.trim()?.ifBlank { null }
        product.gender = request.gender.trim()
        product.color = request.color.trim()
        product.sizes = request.sizes.clean().joinToString("|")
        product.stock = request.stock
        product.status = normalizeStatus(request.status)

        return productRepository.save(product).toResponse()
    }

    @Transactional
    fun delete(authorization: String?, id: String) {
        requireAdmin(authorization)
        if (!productRepository.existsById(id)) {
            throw IllegalArgumentException("Producto no encontrado")
        }
        productRepository.deleteById(id)
    }

    private fun ProductRequest.toProduct(id: String): Product {
        return Product(
            id = id,
            sku = sku.trim(),
            name = name.trim(),
            collection = normalizeCollection(collection),
            category = category.trim(),
            subcategory = subcategory.trim(),
            concept = concept.trim(),
            priceUsd = priceUsd,
            compareAtPriceUsd = compareAtPriceUsd,
            image = image.trim(),
            images = images.clean().joinToString("|"),
            description = description?.trim()?.ifBlank { null },
            story = story?.trim()?.ifBlank { null },
            gender = gender.trim(),
            color = color.trim(),
            sizes = sizes.clean().joinToString("|"),
            stock = stock,
            status = normalizeStatus(status)
        )
    }

    private fun Product.toResponse(): ProductResponse {
        return ProductResponse(
            id = id,
            sku = sku,
            name = name,
            collection = collection,
            category = category,
            subcategory = subcategory,
            concept = concept,
            priceUsd = priceUsd,
            compareAtPriceUsd = compareAtPriceUsd,
            image = image,
            images = images.splitPipe().ifEmpty { listOf(image) },
            description = description,
            story = story,
            gender = gender,
            color = color,
            sizes = sizes.splitPipe(),
            stock = stock,
            status = status,
            createdAt = createdAt.toString()
        )
    }

    private fun requireAdmin(authorization: String?) {
        val token = authorization
            ?.removePrefix("Bearer ")
            ?.removePrefix("bearer ")
            ?.trim()
            ?.takeIf { it.isNotBlank() }
            ?: throw IllegalArgumentException("Token requerido")

        val email = jwtService.extractSubject(token)
        val user = userRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        if (user.roles.none { it.name == "ADMIN" }) {
            throw IllegalArgumentException("Necesitas permisos de administrador")
        }
    }

    private fun normalizeCollection(value: String): String {
        return when (value.trim().lowercase()) {
            "men", "hombre" -> "men"
            "women", "mujer" -> "women"
            "souvenirs", "recuerdos" -> "souvenirs"
            else -> "men"
        }
    }

    private fun normalizeStatus(value: String): String {
        return if (value.trim().lowercase() in setOf("active", "draft", "disabled")) {
            value.trim().lowercase()
        } else {
            "active"
        }
    }

    private fun List<String>.clean(): List<String> {
        return map { it.trim() }.filter { it.isNotBlank() }.distinct()
    }

    private fun String?.splitPipe(): List<String> {
        return this
            ?.split("|")
            ?.map { it.trim() }
            ?.filter { it.isNotBlank() }
            ?: emptyList()
    }

    private fun slugify(value: String): String {
        val normalized = Normalizer.normalize(value.lowercase().trim(), Normalizer.Form.NFD)
            .replace("\\p{Mn}+".toRegex(), "")
        return normalized
            .replace("[^a-z0-9\\s-]".toRegex(), "")
            .replace("\\s+".toRegex(), "-")
            .replace("-+".toRegex(), "-")
            .trim('-')
    }
}
