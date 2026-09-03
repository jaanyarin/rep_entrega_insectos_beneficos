-- V16__create_recepciones.sql
-- Tabla de recepciones de insectos benéficos (HITO-015 / MOD-07).
-- Registra la confirmación de recepción por parte de Sanidad.
-- La fecha/hora de recepción se registra automáticamente (RF-073).

CREATE TABLE IF NOT EXISTS recepciones (
    id BIGSERIAL PRIMARY KEY,
    requerimiento_id BIGINT NOT NULL REFERENCES requerimientos(id),
    conforme BOOLEAN NOT NULL DEFAULT true,
    observaciones TEXT,
    fecha_recepcion TIMESTAMPTZ NOT NULL DEFAULT now(),
    creado_por BIGINT NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recepciones_requerimiento ON recepciones(requerimiento_id);
CREATE INDEX idx_recepciones_creado_por ON recepciones(creado_por);
