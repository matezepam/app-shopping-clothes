package com.sprint.backend.auth

import com.sprint.backend.auth.dto.AuthResponse
import com.sprint.backend.auth.dto.AuthUserResponse
import com.sprint.backend.auth.dto.ChangePasswordRequest
import com.sprint.backend.auth.dto.LoginRequest
import com.sprint.backend.auth.dto.RegisterRequest
import com.sprint.backend.auth.dto.UpdateProfileRequest
import com.sprint.backend.users.RoleRepository
import com.sprint.backend.users.User
import com.sprint.backend.users.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.util.Base64
import java.time.LocalDate
import java.time.Period

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {
    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        val email = request.email.trim().lowercase()

        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("El correo ya está registrado")
        }

        val userRole = roleRepository.findByName("USER")
            ?: throw IllegalStateException("El rol USER no existe")

        val age = Period.between(request.birthDate, LocalDate.now()).years

        if (age < 13) {
            throw IllegalArgumentException("Debes tener al menos 13 años")
        }

        val user = User(
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim(),
            email = email,
            password = passwordEncoder.encode(request.password),
            phone = request.phone.trim(),
            country = request.country.trim(),
            gender = request.gender.trim(),
            age = age,
            birthDate = request.birthDate,
            roles = mutableSetOf(userRole)
        )

        val savedUser = userRepository.save(user)

        return buildResponse(savedUser)
    }

    fun login(request: LoginRequest): AuthResponse {
        val email = request.email.trim().lowercase()

        val user = userRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Credenciales inválidas")

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw IllegalArgumentException("Credenciales inválidas")
        }

        return buildResponse(user)
    }

    fun me(authorization: String?): AuthUserResponse {
        return toUserResponse(findUserFromAuthorization(authorization))
    }

    @Transactional
    fun updateProfile(authorization: String?, request: UpdateProfileRequest): AuthResponse {
        val user = findUserFromAuthorization(authorization)

        request.firstName?.trim()?.takeIf { it.isNotBlank() }?.let {
            user.firstName = it
        }

        request.lastName?.trim()?.takeIf { it.isNotBlank() }?.let {
            user.lastName = it
        }

        request.email?.trim()?.lowercase()?.takeIf { it.isNotBlank() }?.let { email ->
            if (email != user.email && userRepository.existsByEmail(email)) {
                throw IllegalArgumentException("El correo ya está registrado")
            }

            user.email = email
        }

        request.phone?.trim()?.let {
            user.phone = it.ifBlank { null }
        }

        request.country?.trim()?.let {
            user.country = it.ifBlank { null }
        }

        request.gender?.trim()?.let {
            user.gender = it.ifBlank { null }
        }

        request.age?.let {
            user.age = it
        }

        request.preferredLanguage?.trim()?.lowercase()?.let {
            user.preferredLanguage = normalizeLanguage(it)
        }

        request.preferredCurrency?.trim()?.uppercase()?.let {
            user.preferredCurrency = normalizeCurrency(it)
        }

        request.currentLocation?.trim()?.let {
            user.currentLocation = it.ifBlank { null }
        }

        return buildResponse(userRepository.save(user))
    }

    @Transactional
    fun updateAvatar(authorization: String?, file: MultipartFile): AuthUserResponse {
        val user = findUserFromAuthorization(authorization)

        if (file.isEmpty) {
            throw IllegalArgumentException("La imagen es requerida")
        }

        val contentType = file.contentType ?: ""

        if (contentType !in setOf("image/jpeg", "image/png", "image/webp", "image/gif")) {
            throw IllegalArgumentException("Formato de imagen no permitido")
        }

        if (file.size > 2 * 1024 * 1024) {
            throw IllegalArgumentException("La imagen no debe superar 2 MB")
        }

        val encoded = Base64.getEncoder().encodeToString(file.bytes)
        user.avatarUrl = "data:$contentType;base64,$encoded"

        return toUserResponse(userRepository.save(user))
    }

    @Transactional
    fun deleteAvatar(authorization: String?): AuthUserResponse {
        val user = findUserFromAuthorization(authorization)

        user.avatarUrl = null

        return toUserResponse(userRepository.save(user))
    }

    @Transactional
    fun changePassword(authorization: String?, request: ChangePasswordRequest) {
        val user = findUserFromAuthorization(authorization)

        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            throw IllegalArgumentException("La contraseña actual no es correcta")
        }

        if (!isStrongPassword(request.newPassword)) {
            throw IllegalArgumentException("La nueva contraseña debe incluir mayúsculas, minúsculas, números y símbolos")
        }

        user.password = passwordEncoder.encode(request.newPassword)
        userRepository.save(user)
    }

    private fun buildResponse(user: User): AuthResponse {
        return AuthResponse(
            token = jwtService.generateToken(user),
            user = toUserResponse(user)
        )
    }

    private fun toUserResponse(user: User): AuthUserResponse {
        return AuthUserResponse(
            id = user.id ?: 0,
            firstName = user.firstName,
            lastName = user.lastName,
            email = user.email,
            phone = user.phone,
            country = user.country,
            gender = user.gender,
            birthDate = user.birthDate?.toString(),
            age = user.age,
            preferredLanguage = user.preferredLanguage,
            preferredCurrency = user.preferredCurrency,
            createdAt = user.createdAt.toString(),
            roles = user.roles.map { it.name },
            avatarUrl = user.avatarUrl,
            currentLocation = user.currentLocation
        )
    }

    private fun findUserFromAuthorization(authorization: String?): User {
        val token = authorization
            ?.removePrefix("Bearer ")
            ?.removePrefix("bearer ")
            ?.trim()
            ?.takeIf { it.isNotBlank() }
            ?: throw IllegalArgumentException("Token requerido")

        val email = jwtService.extractSubject(token)

        return userRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Usuario no encontrado")
    }

    private fun normalizeLanguage(value: String): String {
        return if (value in setOf("es", "en", "fr", "de")) value else "es"
    }

    private fun normalizeCurrency(value: String): String {
        return if (value in setOf("USD", "EUR", "GBP")) value else "USD"
    }

    private fun isStrongPassword(value: String): Boolean {
        return value.length >= 8 &&
            value.any { it.isUpperCase() } &&
            value.any { it.isLowerCase() } &&
            value.any { it.isDigit() } &&
            value.any { !it.isLetterOrDigit() }
    }
}
