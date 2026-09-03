-- V14__cumplimiento_programacion.sql
-- Tabla de cumplimiento de producción por semana de programación.
-- Permite registrar la producción real (papel/sobre) vs lo programado.

CREATE TABLE IF NOT EXISTS cumplimiento_programacion (
    id BIGSERIAL PRIMARY KEY,
    programacion_detalle_id BIGINT NOT NULL REFERENCES detalle_programaciones(id),
    programacion_id BIGINT NOT NULL REFERENCES programaciones(id),
    semana INT NOT NULL,
    fecha DATE NOT NULL,
    papel_real INT NOT NULL DEFAULT 0,
    sobre_real INT NOT NULL DEFAULT 0,
    total_real INT NOT NULL DEFAULT 0,
    creado_por BIGINT NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cumplimiento_detalle UNIQUE (programacion_detalle_id)
);

CREATE INDEX idx_cumplimiento_programacion_id ON cumplimiento_programacion(programacion_id);
CREATE INDEX idx_cumplimiento_fecha ON cumplimiento_programacion(fecha);
