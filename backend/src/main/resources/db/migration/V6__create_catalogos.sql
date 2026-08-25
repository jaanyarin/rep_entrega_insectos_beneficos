-- V6__create_catalogos.sql
-- Catálogos agrícolas: fundos, variedades y lotes (HITO-006).
-- Normalización 1NF→3NF a partir de la tabla de lotes de uva (Vanguard):
--   FUNDO, VARIEDAD (con COLOR) y LOTE se separan en tres tablas.
-- Columnas descartadas por decisión: equipo, cliente, cultivo, guid.
-- Timestamps de auditoría: created_at / updated_at (patrón del resto del dominio).

CREATE TABLE fundos (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE variedades (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    color       VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE lotes (
    id          BIGSERIAL PRIMARY KEY,
    fundo_id    BIGINT       NOT NULL REFERENCES fundos (id),
    variedad_id BIGINT       NOT NULL REFERENCES variedades (id),
    nombre      VARCHAR(20)  NOT NULL,
    area        NUMERIC(10,2),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (fundo_id, nombre)
);

CREATE INDEX idx_lotes_fundo ON lotes (fundo_id);
CREATE INDEX idx_lotes_variedad ON lotes (variedad_id);
