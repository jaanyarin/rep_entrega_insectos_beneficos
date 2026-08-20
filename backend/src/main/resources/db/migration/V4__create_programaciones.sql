CREATE TABLE especies (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO especies (nombre, estado) VALUES ('Chrysopa sp.', 'ACTIVO'), ('Cryptolaemus', 'ACTIVO');

CREATE TABLE programaciones (
    id BIGSERIAL PRIMARY KEY,
    anio INT NOT NULL,
    mes INT NOT NULL,
    especie_id BIGINT NOT NULL REFERENCES especies(id),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_publicacion TIMESTAMPTZ,
    estado VARCHAR(20) NOT NULL DEFAULT 'EN_PROCESO' CHECK (estado IN ('EN_PROCESO', 'PUBLICADO')),
    stock_inicial_base INT NOT NULL DEFAULT 5000,
    UNIQUE(anio, mes, especie_id)
);

CREATE TABLE detalle_programaciones (
    id BIGSERIAL PRIMARY KEY,
    programacion_id BIGINT NOT NULL REFERENCES programaciones(id) ON DELETE CASCADE,
    semana INT NOT NULL,
    fecha DATE NOT NULL,
    stock_inicial INT NOT NULL DEFAULT 0,
    papel_con_postura INT NOT NULL DEFAULT 0,
    sobre_con_cascarilla INT NOT NULL DEFAULT 0,
    total INT NOT NULL DEFAULT 0,
    stock_final INT NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'EN_PROCESO' CHECK (estado IN ('EN_PROCESO', 'PUBLICADO')),
    UNIQUE(programacion_id, semana)
);
