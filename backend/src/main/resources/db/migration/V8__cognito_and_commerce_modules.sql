ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cognito_sub VARCHAR(80) UNIQUE;

DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users_roles;
DROP TABLE IF EXISTS roles;

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES categories(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, slug) VALUES
('Hombre', 'men'), ('Mujer', 'women'), ('Souvenirs', 'souvenirs'),
('Camisetas', 'shirts'), ('Hoodies', 'hoodies'), ('Gorras', 'caps'), ('Arte', 'art')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE suppliers (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    tax_id VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(150),
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_products (
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id VARCHAR(120) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (supplier_id, product_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL,
    total_usd NUMERIC(12,2) NOT NULL,
    idempotency_key VARCHAR(120),
    shipping_address VARCHAR(300) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_orders_user_idempotency ON orders(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(120) NOT NULL REFERENCES products(id),
    product_name VARCHAR(160) NOT NULL,
    unit_price_usd NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_usd NUMERIC(12,2) NOT NULL
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY,
    product_id VARCHAR(120) NOT NULL REFERENCES products(id),
    supplier_id UUID REFERENCES suppliers(id),
    type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    resulting_stock INTEGER NOT NULL CHECK (resulting_stock >= 0),
    reference VARCHAR(160),
    created_by VARCHAR(80) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE return_requests (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id VARCHAR(120) NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    admin_note VARCHAR(500),
    stock_restored BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE products ADD COLUMN IF NOT EXISTS moderation_note VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS moderated_by VARCHAR(80);
ALTER TABLE products ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_inventory_product_created ON inventory_movements(product_id, created_at DESC);
CREATE INDEX idx_returns_status ON return_requests(status);
