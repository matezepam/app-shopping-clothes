package com.sprint.backend.users

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "first_name", nullable = false, length = 100)
    var firstName: String,

    @Column(name = "last_name", nullable = false, length = 100)
    var lastName: String,

    @Column(nullable = false, unique = true, length = 150)
    var email: String,

    @Column(name = "cognito_sub", unique = true, length = 80)
    var cognitoSub: String? = null,

    @Column(length = 30)
    var phone: String? = null,

    @Column(length = 100)
    var country: String? = null,

    @Column(length = 30)
    var gender: String? = null,

    @Column
    var age: Int? = null,

    @Column(name = "birth_date")
    var birthDate: LocalDate? = null,

    @Column(name = "preferred_language", nullable = false, length = 5)
    var preferredLanguage: String = "es",

    @Column(name = "preferred_currency", nullable = false, length = 3)
    var preferredCurrency: String = "USD",

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    var avatarUrl: String? = null,

    @Column(name = "current_location", length = 255)
    var currentLocation: String? = null,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

)
