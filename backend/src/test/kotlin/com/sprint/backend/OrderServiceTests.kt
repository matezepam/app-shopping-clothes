package com.sprint.backend

import com.sprint.backend.orders.CheckoutLine
import com.sprint.backend.orders.CheckoutRequest
import com.sprint.backend.orders.OrderService
import com.sprint.backend.orders.OrderStatusRequest
import com.sprint.backend.products.Product
import com.sprint.backend.products.ProductRepository
import com.sprint.backend.users.User
import com.sprint.backend.users.UserRepository
import com.sprint.backend.returns.CreateReturnRequest
import com.sprint.backend.returns.PatchReturnRequest
import com.sprint.backend.returns.ReturnService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

@SpringBootTest
@Transactional
class OrderServiceTests(
    @Autowired private val service: OrderService,
    @Autowired private val users: UserRepository,
    @Autowired private val products: ProductRepository,
    @Autowired private val returnService: ReturnService
) {
    private lateinit var jwt: Jwt

    @BeforeEach
    fun prepare() {
        users.deleteAll()
        users.save(User(firstName = "Cliente", lastName = "Prueba", email = "cliente@example.com", cognitoSub = "customer-sub"))
        products.save(Product(id = "test-product", sku = "TEST-001", name = "Producto", collection = "men", category = "shirts", subcategory = "camisetas", concept = "andes", priceUsd = BigDecimal("12.50"), image = "/product.svg", gender = "male", color = "negro", stock = 5, status = "active", moderationStatus = "APPROVED"))
        jwt = Jwt.withTokenValue("test-access-token").header("alg", "none").subject("customer-sub").claim("cognito:groups", listOf("USER")).build()
    }

    @Test
    fun `checkout reserves stock and is idempotent`() {
        val request = CheckoutRequest(listOf(CheckoutLine("test-product", 2)), "Quito, Ecuador", "+593999999999")
        val first = service.create(jwt, request, "same-request")
        val second = service.create(jwt, request, "same-request")
        assertEquals(first.id, second.id)
        assertEquals(3, products.findById("test-product").orElseThrow().stock)
        assertEquals(BigDecimal("25.00"), first.totalUsd)
        assert(first.whatsappUrl.startsWith("https://wa.me/593939051525?text="))
        val decodedMessage = URLDecoder.decode(first.whatsappUrl.substringAfter("?text="), StandardCharsets.UTF_8)
        assert(decodedMessage.contains(first.id.toString()))
        assert(decodedMessage.contains("2 x Producto"))
        assert(decodedMessage.contains("Total: USD 25.00"))
    }

    @Test
    fun `checkout rejects insufficient stock without partial changes`() {
        val request = CheckoutRequest(listOf(CheckoutLine("test-product", 6)), "Quito, Ecuador", "+593999999999")
        assertThrows(IllegalArgumentException::class.java) { service.create(jwt, request, "insufficient") }
        assertEquals(5, products.findById("test-product").orElseThrow().stock)
    }

    @Test
    fun `delivered order can be returned and restores stock once`() {
        val order = service.create(jwt, CheckoutRequest(listOf(CheckoutLine("test-product", 2)), "Quito", "+593999999999"), "return-flow")
        service.updateStatus(jwt, order.id, OrderStatusRequest("CONFIRMED"))
        service.updateStatus(jwt, order.id, OrderStatusRequest("PREPARING"))
        service.updateStatus(jwt, order.id, OrderStatusRequest("SHIPPED"))
        service.updateStatus(jwt, order.id, OrderStatusRequest("DELIVERED"))
        val returned = returnService.create(jwt, CreateReturnRequest(order.id.toString(), "test-product", 2, "Talla incorrecta"))
        returnService.patch(jwt, returned.id, PatchReturnRequest("APPROVED", "Procede"))
        returnService.patch(jwt, returned.id, PatchReturnRequest("RECEIVED", "Producto recibido"))
        assertEquals(5, products.findById("test-product").orElseThrow().stock)
    }

    @Test
    fun `return cannot be received before approval`() {
        val order = service.create(jwt, CheckoutRequest(listOf(CheckoutLine("test-product", 1)), "Quito", "+593999999999"), "invalid-return-transition")
        service.updateStatus(jwt, order.id, OrderStatusRequest("CONFIRMED"))
        service.updateStatus(jwt, order.id, OrderStatusRequest("PREPARING"))
        service.updateStatus(jwt, order.id, OrderStatusRequest("SHIPPED"))
        service.updateStatus(jwt, order.id, OrderStatusRequest("DELIVERED"))
        val returned = returnService.create(jwt, CreateReturnRequest(order.id.toString(), "test-product", 1, "Talla incorrecta"))
        assertThrows(IllegalArgumentException::class.java) { returnService.patch(jwt, returned.id, PatchReturnRequest("RECEIVED")) }
        assertEquals(4, products.findById("test-product").orElseThrow().stock)
    }
}
