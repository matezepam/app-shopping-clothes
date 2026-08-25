package com.sprint.backend.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.sprint.backend.audit.AuditActivityFilter
import com.sprint.backend.audit.AuditLogService
import com.sprint.backend.users.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtIssuerValidator
import org.springframework.security.oauth2.jwt.JwtTimestampValidator
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.access.intercept.AuthorizationFilter
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableMethodSecurity
class SecurityConfig {
    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        jwtDecoder: JwtDecoder,
        jwtAuthenticationConverter: JwtAuthenticationConverter,
        corsConfigurationSource: CorsConfigurationSource,
        objectMapper: ObjectMapper,
        auditLogService: AuditLogService,
        userRepository: UserRepository
    ): SecurityFilterChain {
        return http
            .csrf { it.disable() }
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
            .logout { it.disable() }
            .requestCache { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .headers { headers ->
                headers.contentTypeOptions { }
                headers.frameOptions { it.deny() }
                headers.referrerPolicy { it.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER) }
                headers.contentSecurityPolicy { it.policyDirectives("default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'") }
                headers.httpStrictTransportSecurity { it.includeSubDomains(true).maxAgeInSeconds(31_536_000) }
            }
            .authorizeHttpRequests {
                it.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/confirm",
                        "/api/auth/resend-code",
                        "/api/auth/login",
                        "/api/auth/refresh",
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password",
                        "/actuator/health"
                    ).permitAll()
                    .requestMatchers("/actuator/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2ResourceServer {
                it.jwt { jwt ->
                    jwt.decoder(jwtDecoder)
                    jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                }
                it.authenticationEntryPoint { request, response, _ ->
                    response.status = 401
                    response.contentType = "application/json"
                    response.characterEncoding = Charsets.UTF_8.name()
                    objectMapper.writeValue(response.writer, ApiErrorResponse(status = 401, code = "UNAUTHORIZED", message = "Token ausente, inválido o vencido", path = request.requestURI, requestId = request.requestId()))
                    runCatching { auditLogService.record(request, 401, 0) }
                }
                it.accessDeniedHandler { request, response, _ ->
                    response.status = 403
                    response.contentType = "application/json"
                    response.characterEncoding = Charsets.UTF_8.name()
                    objectMapper.writeValue(response.writer, ApiErrorResponse(status = 403, code = "FORBIDDEN", message = "El rol no tiene permiso para esta operación", path = request.requestURI, requestId = request.requestId()))
                    runCatching { auditLogService.record(request, 403, 0) }
                }
            }
            .addFilterAfter(DisabledAccountFilter(userRepository, objectMapper, auditLogService), BearerTokenAuthenticationFilter::class.java)
            .addFilterAfter(AuditActivityFilter(auditLogService), AuthorizationFilter::class.java)
            .build()
    }

    @Bean
    fun jwtDecoder(
        @Value("\${app.cognito.region}") region: String,
        @Value("\${app.cognito.user-pool-id}") userPoolId: String,
        @Value("\${app.cognito.client-id}") clientId: String
    ): JwtDecoder {
        val issuer = "https://cognito-idp.$region.amazonaws.com/$userPoolId"
        val decoder = NimbusJwtDecoder.withJwkSetUri("$issuer/.well-known/jwks.json").build()
        val issuerValidator = JwtIssuerValidator(issuer)
        val cognitoValidator = OAuth2TokenValidator<Jwt> { jwt ->
            val tokenUse = jwt.getClaimAsString("token_use")
            val tokenClient = jwt.getClaimAsString("client_id")
            if (tokenUse == "access" && tokenClient == clientId) {
                OAuth2TokenValidatorResult.success()
            } else {
                OAuth2TokenValidatorResult.failure(
                    OAuth2Error("invalid_token", "El token no pertenece al App Client configurado", null)
                )
            }
        }
        decoder.setJwtValidator(DelegatingOAuth2TokenValidator(JwtTimestampValidator(), issuerValidator, cognitoValidator))
        return decoder
    }

    @Bean
    fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val converter = JwtAuthenticationConverter()
        converter.setPrincipalClaimName("sub")
        converter.setJwtGrantedAuthoritiesConverter(
            Converter<Jwt, Collection<GrantedAuthority>> { jwt ->
                val groups = jwt.getClaimAsStringList("cognito:groups") ?: emptyList()
                val effective = if (groups.isEmpty()) listOf("USER") else groups
                effective.map { SimpleGrantedAuthority("ROLE_${it.uppercase()}") }
            }
        )
        return converter
    }

    @Bean
    fun corsConfigurationSource(
        @Value("\${app.cors.allowed-origins}") allowedOrigins: String = ""
    ): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        val origins = allowedOrigins.split(',').map { it.trim().removeSuffix("/") }.filter { it.isNotBlank() }
        require(origins.isNotEmpty()) { "APP_CORS_ALLOWED_ORIGINS debe incluir al menos un origen" }
        require(origins.none { it == "*" }) { "CORS no admite el origen comodín" }
        require(origins.all { it.startsWith("https://") || it.matches(Regex("^http://(localhost|127\\.0\\.0\\.1)(:\\d+)?$")) }) {
            "CORS solo admite HTTPS o direcciones locales de desarrollo"
        }
        configuration.allowedOrigins = origins
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("Authorization", "Content-Type", "Idempotency-Key")
        configuration.exposedHeaders = listOf("Location", REQUEST_ID_HEADER)
        configuration.allowCredentials = false
        configuration.maxAge = 3600
        return UrlBasedCorsConfigurationSource().also {
            it.registerCorsConfiguration("/**", configuration)
        }
    }
}
