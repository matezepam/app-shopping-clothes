package com.sprint.backend.products

import com.sprint.backend.products.dto.ProductRequest
import com.sprint.backend.products.dto.ProductResponse
import com.sprint.backend.config.ConflictException
import com.sprint.backend.config.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.text.Normalizer
import java.util.UUID

@Service
class ProductService(
    private val productRepository: ProductRepository
) {
    fun listPublic(): List<ProductResponse> {
        return productRepository
            .findAllByStatusAndModerationStatusAndStockGreaterThanOrderByCreatedAtDesc("active", "APPROVED", 0)
            .map { it.toResponse() }
    }

    fun listAdmin(): List<ProductResponse> {
        return productRepository.findAll().sortedByDescending { it.updatedAt }.map { it.toResponse() }
    }

    fun getPublic(id: String): ProductResponse {
        val product = productRepository.findById(id).orElseThrow { NotFoundException("Producto no encontrado") }

        if (product.status != "active" || product.moderationStatus != "APPROVED" || product.stock <= 0) {
            throw NotFoundException("Producto no disponible")
        }

        return product.toResponse()
    }

    @Transactional
    fun create(request: ProductRequest): ProductResponse {
        validateRequest(request)

        val id = request.id?.trim()?.takeIf { it.isNotBlank() } ?: slugify(request.name)
        require(id.matches(Regex("^[a-z0-9][a-z0-9-]{1,119}$"))) { "El identificador del producto no es válido" }
        if (productRepository.existsById(id)) {
            throw ConflictException("Ya existe un producto con ese identificador")
        }

        val sku = request.sku.trim().takeIf { it.isNotBlank() }?.let(::normalizeSku)
            ?: generateUniqueSku(request.category, request.name)
        if (productRepository.existsBySku(sku)) {
            throw ConflictException("Ya existe un producto con ese SKU")
        }

        return productRepository.save(request.toProduct(id, sku)).toResponse()
    }

    @Transactional
    fun update(id: String, request: ProductRequest): ProductResponse {
        validateRequest(request)
        val product = productRepository.findById(id).orElseThrow {
            IllegalArgumentException("Producto no encontrado")
        }

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
        product.status = normalizeStatus(request.status)
        product.moderationStatus = "PENDING"
        product.moderationNote = null

        return productRepository.save(product).toResponse()
    }

    @Transactional
    fun updateStatus(id: String, requestedStatus: String): ProductResponse {
        val product = productRepository.findById(id).orElseThrow { NotFoundException("Producto no encontrado") }
        require(product.moderationStatus == "APPROVED") {
            "El producto debe estar aprobado antes de cambiar su disponibilidad"
        }
        val status = requestedStatus.trim().lowercase()
        require(status in setOf("active", "hidden", "disabled")) {
            "El estado debe ser active, hidden o disabled"
        }
        product.status = status
        return productRepository.save(product).toResponse()
    }

    private fun ProductRequest.toProduct(id: String, generatedSku: String): Product {
        return Product(
            id = id,
            sku = generatedSku,
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
            stock = 0,
            status = normalizeStatus(status),
            moderationStatus = "PENDING"
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
            moderationStatus = moderationStatus,
            moderationNote = moderationNote,
            createdAt = createdAt.toString(),
            updatedAt = updatedAt.toString()
        )
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
        return if (value.trim().lowercase() in setOf("active", "draft", "hidden", "disabled")) {
            value.trim().lowercase()
        } else {
            "active"
        }
    }

    private fun validateRequest(request: ProductRequest) {
        val collection = request.collection.trim().lowercase()
        val category = request.category.trim().lowercase()
        val subcategory = request.subcategory.trim().lowercase()
        val status = request.status.trim().lowercase()
        val gender = request.gender.trim().lowercase()
        val color = request.color.trim().lowercase()

        require(collection in setOf("men", "women", "souvenirs")) {
            "La colección debe ser men, women o souvenirs"
        }
        val allowedCategories = if (collection == "souvenirs") {
            setOf("art", "mugs", "embroidery", "souvenirs")
        } else {
            setOf("shirts", "hoodies", "caps", "pants", "bags")
        }
        require(category in allowedCategories) {
            "La categoría no corresponde a la colección seleccionada"
        }
        val allowedSubcategories = if (collection == "souvenirs") {
            setOf("recuadros", "tazas", "bordados")
        } else {
            setOf("camisetas", "sudaderas", "gorras", "pantalones", "bolsos", "bisuteria", "joyas")
        }
        require(subcategory in allowedSubcategories) {
            "La subcategoría no corresponde a la colección seleccionada"
        }
        require(status in setOf("active", "draft", "hidden", "disabled")) {
            "El estado del producto no es válido"
        }
        require(gender in setOf("male", "female")) {
            "El género del producto no es válido"
        }
        require(color in setOf("negro", "blanco", "rojo", "azul", "verde", "beige", "gris", "dorado", "plateado", "rosa")) {
            "El color del producto no es válido"
        }
        require(request.compareAtPriceUsd == null || request.compareAtPriceUsd > request.priceUsd) {
            "El precio anterior debe ser mayor que el precio actual"
        }
        val normalizedImages = request.images.map { it.trim() }
        val imagePaths = (listOf(request.image.trim()) + normalizedImages).distinct()
        require(normalizedImages.size <= 4 && normalizedImages.distinct().size == normalizedImages.size && imagePaths.size <= 4) {
            "Las imágenes contienen valores repetidos o exceden el límite"
        }
        require(imagePaths.all(::isAllowedImagePath)) { "Las imágenes deben provenir del almacenamiento autorizado de Sprint" }
        require(request.description?.length ?: 0 <= 1200 && request.story?.length ?: 0 <= 1200) { "La descripción o historia es demasiado extensa" }
        require(request.sizes.clean().size <= 12 && request.sizes.clean().all { it.length <= 20 && it.matches(Regex("^[\\p{L}0-9+/-]+$")) }) {
            "Las tallas contienen valores no permitidos"
        }
        if (collection != "souvenirs") {
            require(request.sizes.clean().isNotEmpty()) {
                "Una prenda debe incluir al menos una talla"
            }
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

    private fun normalizeSku(value: String) = value.trim().uppercase()

    private fun generateUniqueSku(category: String, name: String): String {
        val categoryCode = when (category.trim().lowercase()) {
            "shirts" -> "CAM"
            "hoodies" -> "SUD"
            "caps" -> "GOR"
            "pants" -> "PAN"
            "bags" -> "BOL"
            "mugs" -> "TAZ"
            "embroidery" -> "BOR"
            "art" -> "ART"
            else -> "PRO"
        }
        val words = slugify(name).split("-").filter { it.isNotBlank() }
        val titleCode = words
            .filterNot { it in setOf("camiseta", "hoodie", "gorra", "pantalon", "bolso", "taza", "bordado") }
            .take(2)
            .joinToString("-") { it.take(3).uppercase() }
            .ifBlank { words.take(2).joinToString("-") { it.take(3).uppercase() } }

        repeat(20) {
            val suffix = UUID.randomUUID().toString().replace("-", "").take(4).uppercase()
            val candidate = "$categoryCode-$titleCode-$suffix"
            if (!productRepository.existsBySku(candidate)) return candidate
        }
        throw IllegalStateException("No se pudo generar un SKU único")
    }

    private fun isAllowedImagePath(value: String): Boolean {
        val normalized = value.lowercase()
        return normalized.matches(Regex("^/api/products/media/[a-f0-9-]{36}\\.(jpg|png|webp)$")) ||
            normalized.matches(
                Regex("^/images/(catalog|products)/(?:[a-z0-9][a-z0-9._-]*/)*[a-z0-9][a-z0-9._-]*\\.(jpg|jpeg|png|webp|svg)$")
            )
    }
}
