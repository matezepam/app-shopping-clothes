package com.sprint.backend.auth

import com.sprint.backend.users.User
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${security.jwt.secret}")
    private val secret: String,

    @Value("\${security.jwt.expiration-ms}")
    private val expirationMs: Long
) {
    private fun signingKey(): SecretKey {
        return Keys.hmacShaKeyFor(secret.toByteArray())
    }

    fun generateToken(user: User): String {
        val now = Date()
        val expiration = Date(now.time + expirationMs)

        return Jwts.builder()
            .subject(user.email)
            .claim("userId", user.id)
            .claim("roles", user.roles.map { it.name })
            .issuedAt(now)
            .expiration(expiration)
            .signWith(signingKey())
            .compact()
    }

    fun extractSubject(token: String): String {
        return Jwts.parser()
            .verifyWith(signingKey())
            .build()
            .parseSignedClaims(token)
            .payload
            .subject
    }
}
