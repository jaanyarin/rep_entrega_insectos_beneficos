-- V1__create_usuarios.sql
-- Tabla de usuarios (login local JWT) - ADR-A002 (D-AUTH-1..5).
-- No se reescribe: cualquier cambio posterior exige V3+ (checksum estable Flyway).
CREATE TABLE usuarios (
    id                   BIGSERIAL PRIMARY KEY,
    usuario              VARCHAR(150) NOT NULL UNIQUE,
    nombre               VARCHAR(150) NOT NULL,
    perfil               VARCHAR(20)  NOT NULL CHECK (perfil IN ('SUPER_ADMIN', 'ADMIN', 'USUARIO')),
    contrasena_hash      VARCHAR(100) NOT NULL,
    debe_cambiar_password BOOLEAN     NOT NULL DEFAULT TRUE,
    dni                  VARCHAR(8)   NULL,
    estado               VARCHAR(10)  NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    creado_por           BIGINT       NULL,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_login_at        TIMESTAMPTZ  NULL
);

CREATE INDEX idx_usuarios_perfil ON usuarios (perfil);
CREATE INDEX idx_usuarios_estado ON usuarios (estado);