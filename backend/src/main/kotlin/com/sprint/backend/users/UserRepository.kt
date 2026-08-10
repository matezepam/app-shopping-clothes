package com.sprint.backend.users

import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): User?
    fun findByCognitoSub(cognitoSub: String): User?
    fun existsByEmail(email: String): Boolean
}
