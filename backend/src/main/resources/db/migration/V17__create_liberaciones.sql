-- V17__create_liberaciones.sql
-- Tabla de liberaciones en campo (HITO-015 / MOD-08).
-- Registra la liberación de insectos benéficos en el fundo/lote destino.
-- Requiere al menos 1 foto como evidencia (RN-009).
-- Soporta liberación parcial y múltiples liberaciones por recepción (RF-085/089).

CREATE TABLE IF NOT EXISTS liberaciones (
    id BIGSERIAL PRIMARY KEY,
    requerimiento_id BIGINT NOT NULL REFERENCES requerimientos(id),
    fundo_id BIGINT NOT NULL REFERENCES fundos(id),
    lote_id BIGINT NOT NULL REFERENCES lotes(id),
    cantidad_liberada NUMERIC(10,2) NOT NULL,
    observaciones TEXT,
    fecha_liberacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    hora_liberacion VARCHAR(10) NOT NULL,
    creado_por BIGINT NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_liberaciones_requerimiento ON liberaciones(requerimiento_id);
CREATE INDEX idx_liberaciones_fundo ON liberaciones(fundo_id);
CREATE INDEX idx_liberaciones_creado_por ON liberaciones(creado_por);
