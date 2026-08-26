ALTER TABLE audit.moderation_history
    ADD COLUMN product_name VARCHAR(160),
    ADD COLUMN product_sku VARCHAR(80);

UPDATE audit.moderation_history history
SET product_name = product.name,
    product_sku = product.sku
FROM commerce.products product
WHERE product.id = history.product_id;

ALTER TABLE audit.moderation_history
    ALTER COLUMN product_name SET NOT NULL,
    ALTER COLUMN product_sku SET NOT NULL;

ALTER TABLE audit.moderation_history
    DROP CONSTRAINT moderation_history_product_id_fkey;

COMMENT ON TABLE audit.moderation_history IS
    'Historial independiente con instantánea del producto; se conserva aunque el registro comercial sea eliminado.';
