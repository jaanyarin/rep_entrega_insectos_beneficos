-- V11__create_fotos_requerimiento.sql
-- Tabla de fotos adjuntas a requerimientos de insectos benéficos (HITO-010).
-- Referencia a requerimientos (V10). Cada requerimiento puede tener hasta 2 fotos
-- (validado a nivel de servicio), JPEG o PNG ≤ 5 MB.
-- Los metadatos (exif, ubicación GPS, etc.) se almacenan como TEXT plano;
-- son inmutables (no editables por el usuario).

CREATE TABLE fotos_requerimiento (
    id BIGSERIAL PRIMARY KEY,
    requerimiento_id BIGINT NOT NULL REFERENCES requerimientos(id),
    ruta VARCHAR(500) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    metadatos TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fotos_requerimiento_requerimiento_id ON fotos_requerimiento(requerimiento_id);
