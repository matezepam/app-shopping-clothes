DROP INDEX IF EXISTS commerce.uq_orders_identity_user_idempotency;

CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_user_sub_idempotency
    ON commerce.orders(user_sub, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN commerce.orders.identity_user_id IS
    'Referencia informativa al perfil local; puede cambiar si el perfil se vuelve a aprovisionar.';
COMMENT ON COLUMN commerce.orders.user_sub IS
    'Referencia lógica principal y estable al usuario administrado por Amazon Cognito.';
