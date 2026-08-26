CREATE TABLE audit.product_deletion_requests (
    id UUID PRIMARY KEY,
    product_id VARCHAR(120) NOT NULL,
    product_name VARCHAR(160) NOT NULL,
    product_sku VARCHAR(80) NOT NULL,
    previous_status VARCHAR(20) NOT NULL,
    requested_by_sub VARCHAR(80) NOT NULL,
    requested_by_label VARCHAR(150) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    moderator_sub VARCHAR(80),
    moderator_note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE UNIQUE INDEX uq_product_deletion_request_pending
    ON audit.product_deletion_requests(product_id)
    WHERE status = 'PENDING';

CREATE INDEX idx_product_deletion_requests_status_created
    ON audit.product_deletion_requests(status, created_at DESC);

COMMENT ON TABLE audit.product_deletion_requests IS
    'Solicitudes auditables de eliminación definitiva; conserva la evidencia aunque el producto sea eliminado.';
