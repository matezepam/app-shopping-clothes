package com.sprint.backend.config

data class ValidatedImage(val bytes: ByteArray, val extension: String, val mediaType: String)

object ImageFileValidator {
    fun validate(bytes: ByteArray, maxBytes: Int = 2 * 1024 * 1024): ValidatedImage {
        require(bytes.isNotEmpty()) { "La imagen está vacía" }
        require(bytes.size <= maxBytes) { "La imagen no debe superar 2 MB" }
        return when {
            isPng(bytes) -> ValidatedImage(bytes, "png", "image/png")
            isJpeg(bytes) -> ValidatedImage(bytes, "jpg", "image/jpeg")
            isWebP(bytes) -> ValidatedImage(bytes, "webp", "image/webp")
            else -> throw IllegalArgumentException("El archivo no contiene una imagen JPG, PNG o WebP válida")
        }
    }

    private fun isPng(bytes: ByteArray): Boolean = bytes.size >= 24 &&
        bytes.copyOfRange(0, 8).contentEquals(byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) &&
        String(bytes, 12, 4, Charsets.US_ASCII) == "IHDR" &&
        positivePngDimension(bytes, 16) && positivePngDimension(bytes, 20)

    private fun positivePngDimension(bytes: ByteArray, offset: Int): Boolean {
        val value = ((bytes[offset].toLong() and 0xff) shl 24) or
            ((bytes[offset + 1].toLong() and 0xff) shl 16) or
            ((bytes[offset + 2].toLong() and 0xff) shl 8) or
            (bytes[offset + 3].toLong() and 0xff)
        return value in 1..8_000
    }

    private fun isJpeg(bytes: ByteArray): Boolean = bytes.size >= 4 &&
        bytes[0] == 0xFF.toByte() && bytes[1] == 0xD8.toByte() &&
        bytes[bytes.lastIndex - 1] == 0xFF.toByte() && bytes.last() == 0xD9.toByte()

    private fun isWebP(bytes: ByteArray): Boolean = bytes.size >= 16 &&
        String(bytes, 0, 4, Charsets.US_ASCII) == "RIFF" &&
        String(bytes, 8, 4, Charsets.US_ASCII) == "WEBP" &&
        String(bytes, 12, 4, Charsets.US_ASCII) in setOf("VP8 ", "VP8L", "VP8X")
}
