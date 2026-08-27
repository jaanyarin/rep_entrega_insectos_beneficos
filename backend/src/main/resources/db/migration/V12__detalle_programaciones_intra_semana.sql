-- V12 — detalle_programaciones: de 4 semanas fijas a filas reales por día (Lunes/Jueves).
--
-- Contexto (HITO-012): la programación ahora genera UNA fila por cada Lunes y Jueves
-- reales del mes (variable, ~8). El día (LUNES/JUEVES) se deriva de la columna `fecha`,
-- NO se añade una columna `dia`. Por eso la unicidad pasa de `(programacion_id, semana)`
-- a `(programacion_id, fecha)` (un mismo mes/año solo tiene un Lunes/Jueves por fecha).
--
-- La BD fue vaciada por el usuario (no hay filas de detalle que migrar), pero esta
-- migración es idempotente: se limita a dropear la UK antigua y crear la nueva por `fecha`.
ALTER TABLE detalle_programaciones
    DROP CONSTRAINT IF EXISTS detalle_programaciones_programacion_id_semana_key;

ALTER TABLE detalle_programaciones
    ADD CONSTRAINT detalle_programaciones_programacion_id_fecha_key
        UNIQUE (programacion_id, fecha);
