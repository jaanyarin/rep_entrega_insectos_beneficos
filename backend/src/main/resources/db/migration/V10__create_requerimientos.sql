-- V10__create_requerimientos.sql
-- Tabla de requerimientos de insectos benéficos (HITO-008).
-- Referencia a catálogos existentes:
--   fundos, lotes (V6), especies (V4), etapas_fenologicas, plagas (V8),
--   usuarios (V1). El estado sigue el ciclo del dominio:
--   REGISTRADO → PENDIENTE → APROBADO → ENTREGADO → RECIBIDO → LIBERADO.
-- Presentaciones de entrega (papel con postura / sobre con cascarilla)
-- solo aplican cuando estado = ENTREGADO (validado a nivel de servicio).

CREATE TABLE requerimientos (
    id BIGSERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    fundo_id BIGINT NOT NULL REFERENCES fundos(id),
    lote_id BIGINT NOT NULL REFERENCES lotes(id),
    especie_id BIGINT NOT NULL REFERENCES especies(id),
    etapa_fenologica_id BIGINT REFERENCES etapas_fenologicas(id),
    cantidad NUMERIC(10,2) NOT NULL,
    plaga_id BIGINT REFERENCES plagas(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO' CHECK (estado IN ('REGISTRADO','PENDIENTE','APROBADO','ENTREGADO','RECIBIDO','LIBERADO')),
    stock_disponible NUMERIC(10,2),
    fecha_liberacion TIMESTAMPTZ,
    hora_liberacion VARCHAR(10),
    observaciones TEXT,
    papel_con_postura NUMERIC(10,2),
    sobre_con_cascarilla NUMERIC(10,2),
    creado_por BIGINT REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_requerimientos_estado ON requerimientos(estado);
CREATE INDEX idx_requerimientos_fecha ON requerimientos(fecha);
CREATE INDEX idx_requerimientos_fundo ON requerimientos(fundo_id);
CREATE INDEX idx_requerimientos_creado_por ON requerimientos(creado_por);
