CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS commerce;
CREATE SCHEMA IF NOT EXISTS audit;

ALTER TABLE public.users SET SCHEMA identity;

ALTER TABLE public.categories SET SCHEMA commerce;
ALTER TABLE public.products SET SCHEMA commerce;
ALTER TABLE public.suppliers SET SCHEMA commerce;
ALTER TABLE public.supplier_products SET SCHEMA commerce;
ALTER TABLE public.orders SET SCHEMA commerce;
ALTER TABLE public.order_items SET SCHEMA commerce;
ALTER TABLE public.inventory_movements SET SCHEMA commerce;
ALTER TABLE public.return_requests SET SCHEMA commerce;

ALTER TABLE public.moderation_history SET SCHEMA audit;
ALTER TABLE public.order_status_history SET SCHEMA audit;

ALTER SEQUENCE IF EXISTS public.users_id_seq SET SCHEMA identity;
ALTER SEQUENCE IF EXISTS public.categories_id_seq SET SCHEMA commerce;
ALTER SEQUENCE IF EXISTS public.order_items_id_seq SET SCHEMA commerce;

CREATE TABLE audit.activity_log (
    id UUID PRIMARY KEY,
    actor_user_id BIGINT REFERENCES identity.users(id) ON DELETE SET NULL,
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

CREATE INDEX idx_activity_log_occurred_at ON audit.activity_log(occurred_at DESC);
CREATE INDEX idx_activity_log_actor_sub ON audit.activity_log(actor_sub, occurred_at DESC);
CREATE INDEX idx_activity_log_outcome ON audit.activity_log(outcome, occurred_at DESC);

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

COMMENT ON SCHEMA identity IS 'Perfiles locales vinculados a identidades administradas por Amazon Cognito';
COMMENT ON SCHEMA commerce IS 'Datos transaccionales de catálogo, inventario, proveedores, pedidos y devoluciones';
COMMENT ON SCHEMA audit IS 'Trazabilidad inmutable de actividades y decisiones del sistema';
COMMENT ON TABLE audit.activity_log IS 'Registro técnico sin tokens ni cuerpos de solicitudes';
