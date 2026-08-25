package com.sprint.backend.products

import com.sprint.backend.config.ImageFileValidator
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.http.CacheControl
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption
import java.util.UUID
import java.util.concurrent.TimeUnit

@RestController
class ProductImageController(
    @Value("\${app.uploads.products-directory:/tmp/sprint-product-images}") uploadDirectory: String
) {
    private val root: Path = Path.of(uploadDirectory).toAbsolutePath().normalize()
    @PostMapping("/api/products/admin/images", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyRole('ADMIN','VENDOR')")
    fun upload(@RequestParam("images") images: List<MultipartFile>): Map<String, Any> {
        require(images.isNotEmpty()) { "Selecciona al menos una imagen" }
        require(images.size <= 4) { "Puedes subir hasta 4 imágenes por producto" }

        Files.createDirectories(root)
        val validated = images.map { file ->
            require(!file.isEmpty) { "La imagen está vacía" }
            require(file.size <= MAX_FILE_SIZE) { "Cada imagen debe pesar como máximo 2 MB" }
            file to ImageFileValidator.validate(file.bytes, MAX_FILE_SIZE.toInt())
        }
        val written = mutableListOf<Path>()
        val uploaded = try {
            validated.map { (file, image) ->
                val filename = "${UUID.randomUUID()}.${image.extension}"
                val target = root.resolve(filename).normalize()
                require(target.parent == root) { "Nombre de archivo no válido" }
                Files.write(target, image.bytes, StandardOpenOption.CREATE_NEW)
                written.add(target)
                mapOf(
                    "url" to "/api/products/media/$filename",
                    "name" to safeOriginalName(file.originalFilename, filename),
                    "size" to image.bytes.size
                )
            }
        } catch (error: Exception) {
            written.forEach { runCatching { Files.deleteIfExists(it) } }
            throw error
        }
        return mapOf("images" to uploaded)
    }

    @GetMapping("/api/products/media/{filename:.+}")
    fun read(@PathVariable filename: String): ResponseEntity<Resource> {
        require(filename.matches(Regex("^[a-f0-9-]+\\.(jpg|png|webp)$"))) {
            "Nombre de imagen no válido"
        }
        val target = root.resolve(filename).normalize()
        require(target.parent == root && Files.isRegularFile(target)) { "Imagen no encontrada" }
        val resource = UrlResource(target.toUri())
        val contentType = when (target.fileName.toString().substringAfterLast('.')) {
            "jpg" -> MediaType.IMAGE_JPEG
            "png" -> MediaType.IMAGE_PNG
            "webp" -> MediaType.parseMediaType("image/webp")
            else -> MediaType.APPLICATION_OCTET_STREAM
        }
        return ResponseEntity.ok()
            .contentType(contentType)
            .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${target.fileName}\"")
            .body(resource)
    }

    companion object {
        private const val MAX_FILE_SIZE = 2L * 1024L * 1024L
    }

    private fun safeOriginalName(original: String?, fallback: String): String = original
        ?.substringAfterLast('/')
        ?.substringAfterLast('\\')
        ?.filterNot(Char::isISOControl)
        ?.take(160)
        ?.ifBlank { fallback }
        ?: fallback
}
