CREATE SCHEMA IF NOT EXISTS commerce;
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE commerce.categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES commerce.categories(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commerce.products (
    id VARCHAR(120) PRIMARY KEY,
    sku VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    collection VARCHAR(30) NOT NULL,
    category VARCHAR(40) NOT NULL,
    subcategory VARCHAR(40) NOT NULL,
    concept VARCHAR(40) NOT NULL,
    price_usd NUMERIC(10,2) NOT NULL CHECK (price_usd >= 0),
    compare_at_price_usd NUMERIC(10,2),
    image TEXT NOT NULL,
    images TEXT,
    description TEXT,
    story TEXT,
    gender VARCHAR(20) NOT NULL,
    color VARCHAR(30) NOT NULL,
    sizes TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    moderation_note VARCHAR(500),
    moderated_by VARCHAR(80),
    moderated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commerce.suppliers (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    tax_id VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(150),
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commerce.supplier_products (
    supplier_id UUID NOT NULL REFERENCES commerce.suppliers(id) ON DELETE CASCADE,
    product_id VARCHAR(120) NOT NULL REFERENCES commerce.products(id) ON DELETE CASCADE,
    PRIMARY KEY (supplier_id, product_id)
);

CREATE TABLE commerce.orders (
    id UUID PRIMARY KEY,
    identity_user_id BIGINT NOT NULL,
    user_sub VARCHAR(80) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL,
    total_usd NUMERIC(12,2) NOT NULL CHECK (total_usd >= 0),
    idempotency_key VARCHAR(120),
    shipping_address VARCHAR(300) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_orders_identity_user_idempotency
    ON commerce.orders(identity_user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_orders_identity_user_created
    ON commerce.orders(identity_user_id, created_at DESC);
CREATE INDEX idx_orders_user_sub_created
    ON commerce.orders(user_sub, created_at DESC);

CREATE TABLE commerce.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES commerce.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(120) NOT NULL REFERENCES commerce.products(id),
    product_name VARCHAR(160) NOT NULL,
    unit_price_usd NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_usd NUMERIC(12,2) NOT NULL
);

CREATE TABLE commerce.inventory_movements (
    id UUID PRIMARY KEY,
    product_id VARCHAR(120) NOT NULL REFERENCES commerce.products(id),
    supplier_id UUID REFERENCES commerce.suppliers(id),
    type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    resulting_stock INTEGER NOT NULL CHECK (resulting_stock >= 0),
    reference VARCHAR(160),
    created_by VARCHAR(80) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_product_created
    ON commerce.inventory_movements(product_id, created_at DESC);

CREATE TABLE commerce.return_requests (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES commerce.orders(id),
    product_id VARCHAR(120) NOT NULL REFERENCES commerce.products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    admin_note VARCHAR(500),
    stock_restored BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_returns_status ON commerce.return_requests(status);

CREATE TABLE audit.moderation_history (
    id UUID PRIMARY KEY,
    product_id VARCHAR(120) NOT NULL REFERENCES commerce.products(id) ON DELETE CASCADE,
    moderator_identity_user_id BIGINT,
    moderator_sub VARCHAR(80) NOT NULL,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'OBSERVED')),
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit.order_status_history (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES commerce.orders(id) ON DELETE CASCADE,
    changed_by_identity_user_id BIGINT,
    changed_by_sub VARCHAR(80) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit.activity_log (
    id UUID PRIMARY KEY,
    actor_identity_user_id BIGINT,
    actor_sub VARCHAR(80),
    roles VARCHAR(200),
    http_method VARCHAR(10) NOT NULL,
    request_path VARCHAR(300) NOT NULL,
    status_code INTEGER NOT NULL,
    outcome VARCHAR(20) NOT NULL,
    request_id VARCHAR(80) NOT NULL,
    duration_ms BIGINT NOT NULL CHECK (duration_ms >= 0),
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_history_product_created
    ON audit.moderation_history(product_id, created_at DESC);
CREATE INDEX idx_order_status_history_order_created
    ON audit.order_status_history(order_id, created_at DESC);
CREATE INDEX idx_activity_log_occurred_at
    ON audit.activity_log(occurred_at DESC);
CREATE INDEX idx_activity_log_actor_sub
    ON audit.activity_log(actor_sub, occurred_at DESC);
CREATE INDEX idx_activity_log_outcome
    ON audit.activity_log(outcome, occurred_at DESC);

CREATE OR REPLACE FUNCTION audit.prevent_activity_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'audit.activity_log es inmutable';
END;
$$;

CREATE TRIGGER trg_activity_log_immutable
BEFORE UPDATE OR DELETE ON audit.activity_log
FOR EACH ROW EXECUTE FUNCTION audit.prevent_activity_log_mutation();

COMMENT ON DATABASE sprint_commerce IS
    'Operación comercial y trazabilidad de Sprint Clothes.';
COMMENT ON SCHEMA commerce IS
    'Catálogo, proveedores, inventario, pedidos y devoluciones.';
COMMENT ON SCHEMA audit IS
    'Trazabilidad inmutable de solicitudes, moderaciones y estados.';
COMMENT ON COLUMN commerce.orders.identity_user_id IS
    'Referencia lógica al perfil de sprint_identity; no es una FK entre bases.';
COMMENT ON COLUMN commerce.orders.user_sub IS
    'Referencia estable al sub emitido por Amazon Cognito.';
COMMENT ON TABLE audit.activity_log IS
    'Registro técnico inmutable sin tokens, contraseñas ni cuerpos de solicitudes.';

INSERT INTO commerce.categories (name, slug) VALUES
    ('Hombre', 'men'),
    ('Mujer', 'women'),
    ('Souvenirs', 'souvenirs'),
    ('Camisetas', 'shirts'),
    ('Hoodies', 'hoodies'),
    ('Gorras', 'caps'),
    ('Arte', 'art')
ON CONFLICT (slug) DO NOTHING;
