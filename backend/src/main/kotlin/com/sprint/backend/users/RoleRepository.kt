package com.sprint.backend.users

import org.springframework.data.jpa.repository.JpaRepository

interface RoleRepository : JpaRepository<Role, Long> {
    fun findByName(name: String): Role?
}