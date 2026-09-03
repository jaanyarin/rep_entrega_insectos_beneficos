-- V15__create_despachos.sql
-- Tabla de despachos de insectos benéficos (HITO-015 / MOD-06).
-- Registra cada despacho parcial o total de un requerimiento aprobado.
-- El stock se descuenta automáticamente al registrar el despacho (RN-007/069).

CREATE TABLE IF NOT EXISTS despachos (
    id BIGSERIAL PRIMARY KEY,
    requerimiento_id BIGINT NOT NULL REFERENCES requerimientos(id),
    cantidad_despachada NUMERIC(10,2) NOT NULL,
    papel_con_postura NUMERIC(10,2),
    sobre_con_cascarilla NUMERIC(10,2),
    observaciones TEXT,
    creado_por BIGINT NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_despachos_requerimiento ON despachos(requerimiento_id);
CREATE INDEX idx_despachos_creado_por ON despachos(creado_por);
