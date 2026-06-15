package com.sprint.backend.auth

import com.sprint.backend.auth.dto.AuthResponse
import com.sprint.backend.auth.dto.AuthUserResponse
import com.sprint.backend.auth.dto.LoginRequest
import com.sprint.backend.auth.dto.RegisterRequest
import com.sprint.backend.users.RoleRepository
import com.sprint.backend.users.User
import com.sprint.backend.users.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

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

        val user = User(
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim(),
            email = email,
            password = passwordEncoder.encode(request.password),
            phone = request.phone.trim(),
            country = request.country.trim(),
            gender = request.gender.trim(),
            age = request.age,
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

    private fun buildResponse(user: User): AuthResponse {
        return AuthResponse(
            token = jwtService.generateToken(user),
            user = AuthUserResponse(
                id = user.id ?: 0,
                firstName = user.firstName,
                lastName = user.lastName,
                email = user.email,
                roles = user.roles.map { it.name }
            )
        )
    }
}