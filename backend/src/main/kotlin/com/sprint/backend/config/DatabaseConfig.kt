package com.sprint.backend.config

import com.sprint.backend.admin.ModerationHistory
import com.sprint.backend.admin.ModerationHistoryRepository
import com.sprint.backend.audit.ActivityLog
import com.sprint.backend.audit.ActivityLogRepository
import com.sprint.backend.categories.Category
import com.sprint.backend.categories.CategoryRepository
import com.sprint.backend.inventory.InventoryMovement
import com.sprint.backend.inventory.InventoryMovementRepository
import com.sprint.backend.orders.Order
import com.sprint.backend.orders.OrderRepository
import com.sprint.backend.products.Product
import com.sprint.backend.products.ProductRepository
import com.sprint.backend.returns.ReturnRequestEntity
import com.sprint.backend.returns.ReturnRequestRepository
import com.sprint.backend.suppliers.Supplier
import com.sprint.backend.suppliers.SupplierRepository
import com.sprint.backend.users.User
import com.sprint.backend.users.UserRepository
import com.zaxxer.hikari.HikariDataSource
import jakarta.persistence.EntityManagerFactory
import org.flywaydb.core.Flyway
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.DependsOn
import org.springframework.context.annotation.Primary
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.orm.jpa.JpaTransactionManager
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.annotation.EnableTransactionManagement
import javax.sql.DataSource

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackageClasses = [UserRepository::class],
    entityManagerFactoryRef = "identityEntityManagerFactory",
    transactionManagerRef = "identityTransactionManager"
)
class IdentityDatabaseConfig {
    @Bean
    @ConfigurationProperties("app.datasource.identity")
    fun identityDataSourceProperties() = DataSourceProperties()

    @Bean
    @ConfigurationProperties("app.datasource.identity.hikari")
    fun identityDataSource(
        @Qualifier("identityDataSourceProperties") properties: DataSourceProperties
    ): HikariDataSource = properties.initializeDataSourceBuilder().type(HikariDataSource::class.java).build()

    @Bean
    fun identityFlyway(
        @Qualifier("identityDataSource") dataSource: DataSource,
        @Value("\${app.database.migrations-enabled:true}") migrationsEnabled: Boolean
    ): Flyway = Flyway.configure()
        .dataSource(dataSource)
        .locations("classpath:db/identity")
        .schemas("identity")
        .defaultSchema("identity")
        .load()
        .also { if (migrationsEnabled) it.migrate() }

    @Bean
    @DependsOn("identityFlyway")
    fun identityEntityManagerFactory(
        builder: EntityManagerFactoryBuilder,
        @Qualifier("identityDataSource") dataSource: DataSource,
        @Value("\${app.database.ddl-auto:validate}") ddlAuto: String
    ): LocalContainerEntityManagerFactoryBean = builder
        .dataSource(dataSource)
        .packages(User::class.java)
        .persistenceUnit("identity")
        .properties(hibernateProperties(ddlAuto))
        .build()

    @Bean
    fun identityTransactionManager(
        @Qualifier("identityEntityManagerFactory") entityManagerFactory: EntityManagerFactory
    ): PlatformTransactionManager = JpaTransactionManager(entityManagerFactory)
}

@Configuration
@EnableJpaRepositories(
    basePackageClasses = [
        ProductRepository::class,
        CategoryRepository::class,
        SupplierRepository::class,
        InventoryMovementRepository::class,
        OrderRepository::class,
        ReturnRequestRepository::class,
        ModerationHistoryRepository::class,
        ActivityLogRepository::class
    ],
    entityManagerFactoryRef = "commerceEntityManagerFactory",
    transactionManagerRef = "commerceTransactionManager"
)
class CommerceDatabaseConfig {
    @Bean
    @Primary
    @ConfigurationProperties("app.datasource.commerce")
    fun commerceDataSourceProperties() = DataSourceProperties()

    @Bean
    @Primary
    @ConfigurationProperties("app.datasource.commerce.hikari")
    fun commerceDataSource(
        @Qualifier("commerceDataSourceProperties") properties: DataSourceProperties
    ): HikariDataSource = properties.initializeDataSourceBuilder().type(HikariDataSource::class.java).build()

    @Bean
    fun commerceFlyway(
        @Qualifier("commerceDataSource") dataSource: DataSource,
        @Value("\${app.database.migrations-enabled:true}") migrationsEnabled: Boolean
    ): Flyway = Flyway.configure()
        .dataSource(dataSource)
        .locations("classpath:db/commerce")
        .schemas("commerce", "audit")
        .defaultSchema("commerce")
        .load()
        .also { if (migrationsEnabled) it.migrate() }

    @Bean
    @Primary
    @DependsOn("commerceFlyway")
    fun commerceEntityManagerFactory(
        builder: EntityManagerFactoryBuilder,
        @Qualifier("commerceDataSource") dataSource: DataSource,
        @Value("\${app.database.ddl-auto:validate}") ddlAuto: String
    ): LocalContainerEntityManagerFactoryBean = builder
        .dataSource(dataSource)
        .packages(
            Product::class.java,
            Category::class.java,
            Supplier::class.java,
            InventoryMovement::class.java,
            Order::class.java,
            ReturnRequestEntity::class.java,
            ModerationHistory::class.java,
            ActivityLog::class.java
        )
        .persistenceUnit("commerce")
        .properties(hibernateProperties(ddlAuto))
        .build()

    @Bean
    @Primary
    fun commerceTransactionManager(
        @Qualifier("commerceEntityManagerFactory") entityManagerFactory: EntityManagerFactory
    ): PlatformTransactionManager = JpaTransactionManager(entityManagerFactory)
}

private fun hibernateProperties(ddlAuto: String): Map<String, Any> = mapOf(
    "hibernate.hbm2ddl.auto" to ddlAuto,
    "hibernate.hbm2ddl.create_namespaces" to true,
    "hibernate.format_sql" to true
)
