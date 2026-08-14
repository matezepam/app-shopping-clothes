CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE identity.users (
    id BIGSERIAL PRIMARY KEY,
    cognito_sub VARCHAR(80) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    country VARCHAR(100),
    gender VARCHAR(30),
    age INTEGER CHECK (age IS NULL OR age >= 0),
    birth_date DATE,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'es',
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    avatar_url TEXT,
    current_location VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_identity_users_cognito_sub ON identity.users(cognito_sub);
CREATE INDEX idx_identity_users_created_at ON identity.users(created_at DESC);

COMMENT ON DATABASE sprint_identity IS
    'Perfiles locales vinculados a Amazon Cognito; no contiene contraseñas ni roles.';
COMMENT ON SCHEMA identity IS
    'Datos de perfil de usuarios cuya autenticación y grupos se administran en Amazon Cognito.';
COMMENT ON COLUMN identity.users.cognito_sub IS
    'Identificador global e inmutable emitido por Amazon Cognito.';
