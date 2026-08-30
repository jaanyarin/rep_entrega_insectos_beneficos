-- V13__sync_log.sql
-- Tabla de log de sincronización offline (HITO-013 offline).
-- Registra cada operación push/pull/photo_upload para auditoría
-- y resolución de conflictos.

CREATE TABLE IF NOT EXISTS sync_log (
    id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(20) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT NOT NULL,
    device_id VARCHAR(100),
    local_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS','CONFLICT','ERROR')),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_log_created ON sync_log(created_at);
CREATE INDEX idx_sync_log_record ON sync_log(table_name, record_id);
CREATE INDEX idx_sync_log_device ON sync_log(device_id);
