package com.sprint.backend.users

import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

data class CustomerResponse(val id: Long, val cognitoSub: String?, val firstName: String, val lastName: String, val email: String, val phone: String?, val country: String?, val preferredLanguage: String, val enabled: Boolean, val createdAt: String)
data class CustomerStatusRequest(val enabled: Boolean)

@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasRole('ADMIN')")
class CustomerAdminController(private val users: UserRepository) {
    @GetMapping
    fun list() = mapOf("customers" to users.findAll().sortedByDescending { it.createdAt }.map { it.dto() })

    @PatchMapping("/{id}")
    @Transactional("identityTransactionManager")
    fun status(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: Long, @RequestBody request: CustomerStatusRequest): Map<String, CustomerResponse> {
        val user = users.findById(id).orElseThrow { IllegalArgumentException("Cliente no encontrado") }
        require(request.enabled || user.cognitoSub != jwt.subject) { "No puedes deshabilitar tu propia cuenta administrativa" }
        user.enabled = request.enabled
        return mapOf("customer" to users.save(user).dto())
    }

    private fun User.dto() = CustomerResponse(id!!, cognitoSub, firstName, lastName, email, phone, country, preferredLanguage, enabled, createdAt.toString())
}
