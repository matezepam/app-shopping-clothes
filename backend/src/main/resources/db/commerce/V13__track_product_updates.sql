ALTER TABLE commerce.products
    ADD COLUMN updated_at TIMESTAMP;

UPDATE commerce.products
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE commerce.products
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX idx_products_updated_at
    ON commerce.products(updated_at DESC);

COMMENT ON COLUMN commerce.products.updated_at IS
    'Último cambio comercial, editorial, de inventario o de moderación aplicado al producto.';
