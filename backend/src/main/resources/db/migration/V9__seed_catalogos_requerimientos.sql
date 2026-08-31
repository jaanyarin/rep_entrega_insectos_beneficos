-- V9__seed_catalogos_requerimientos.sql
-- Seed de catálogos del módulo de requerimientos (HITO-007).
-- Solo nombre; estado default 'ACTIVO'.
-- Correcciones del usuario: "CUAJA" -> "FLORACIÓN Y CUAJA"; "CRECIMIENTO DE
-- BAYAS" completo; "Lepidópteros larva" -> "LEPIDÓPTEROS LARVA".

INSERT INTO etapas_fenologicas (nombre) VALUES
    ('FORMACIÓN'),
    ('POST COSECHA'),
    ('BROTACIÓN'),
    ('FLORACIÓN Y CUAJA'),
    ('CRECIMIENTO DE BAYAS'),
    ('ENVERO'),
    ('COSECHA');

INSERT INTO plagas (nombre) VALUES
    ('PSEUDOCOCCIDAE'),
    ('TRIPS'),
    ('ARAÑITA ROJA'),
    ('LEPIDÓPTEROS LARVA'),
    ('ACARO HIALINO');

INSERT INTO nematodos (nombre) VALUES
    ('MELOIDOGYNE SPP.'),
    ('XIPHINEMA INDEX'),
    ('LONGIDORUS SPP.'),
    ('PRATYLENCHUS SPP.'),
    ('TYLENCHULUS SEMIPENETRANS');

INSERT INTO patrones (nombre) VALUES
    ('SALT CREEK'),
    ('FREEDOM'),
    ('MGT 101-14'),
    ('MGT 101-15'),
    ('MGT 101-16');
