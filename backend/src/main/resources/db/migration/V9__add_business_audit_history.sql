CREATE TABLE moderation_history (
    id UUID PRIMARY KEY,
    product_id VARCHAR(120) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    moderator_user_id BIGINT REFERENCES users(id),
    moderator_sub VARCHAR(80) NOT NULL,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'OBSERVED')),
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    changed_by_user_id BIGINT REFERENCES users(id),
    changed_by_sub VARCHAR(80) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_history_product_created
    ON moderation_history(product_id, created_at DESC);
CREATE INDEX idx_order_status_history_order_created
    ON order_status_history(order_id, created_at DESC);

INSERT INTO moderation_history (id, product_id, moderator_user_id, moderator_sub, decision, note, created_at)
SELECT gen_random_uuid(), p.id, u.id, p.moderated_by, p.moderation_status, p.moderation_note, p.moderated_at
FROM products p
LEFT JOIN users u ON u.cognito_sub = p.moderated_by
WHERE p.moderated_at IS NOT NULL AND p.moderated_by IS NOT NULL;

INSERT INTO order_status_history (id, order_id, changed_by_user_id, changed_by_sub, status, created_at)
SELECT gen_random_uuid(), o.id, o.user_id, COALESCE(u.cognito_sub, 'local-user-' || u.id), o.status, o.created_at
FROM orders o
JOIN users u ON u.id = o.user_id;
