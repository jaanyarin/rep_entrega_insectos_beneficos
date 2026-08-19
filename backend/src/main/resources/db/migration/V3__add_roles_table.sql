-- V3__add_roles_table.sql
-- ADR-A003 D-AUTH2-1: tabla roles (literales con espacios) + usuarios.rol_id FK.
-- Migra los datos existentes desde la columna `perfil` (SUPER_ADMIN/ADMIN/USUARIO)
-- a filas de la tabla roles y luego elimina la columna (resuelve deuda H12 parcial:
-- documenta rollback al final del archivo).
--
-- Los nombres de rol son EXACTAMENTE 'Super Admin' / 'Admin' / 'Usuario' (sin
-- acentos) y deben coincidir con @RolesAllowed en el codigo y con el claim
-- "groups" del JWT.

-- 1) Tabla de roles (estado ACTIVO/INACTIVO consistente con `usuarios`, timestamps)
CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    estado      VARCHAR(10)  NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2) Poblar los 3 roles en orden deterministico
--    (id 1 = Super Admin, id 2 = Admin, id 3 = Usuario en entornos nuevos)
INSERT INTO roles (nombre) VALUES ('Super Admin'), ('Admin'), ('Usuario');

-- 3) Columna FK nullable -> backfill desde `perfil` -> NOT NULL + FK + indice
ALTER TABLE usuarios ADD COLUMN rol_id BIGINT;

UPDATE usuarios u
SET rol_id = r.id
FROM roles r
WHERE r.nombre = CASE u.perfil
    WHEN 'SUPER_ADMIN' THEN 'Super Admin'
    WHEN 'ADMIN'       THEN 'Admin'
    WHEN 'USUARIO'     THEN 'Usuario'
END;

ALTER TABLE usuarios ALTER COLUMN rol_id SET NOT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id);
CREATE INDEX idx_usuarios_rol ON usuarios (rol_id);

-- 4) La columna `perfil` (y su indice) desaparece: la semantica vive en roles
DROP INDEX IF EXISTS idx_usuarios_perfil;
ALTER TABLE usuarios DROP COLUMN perfil;

-- ============================================================================
-- ROLLBACK (documentado — deuda H12 parcial; NUNCA se ejecuta automaticamente):
--
--   ALTER TABLE usuarios ADD COLUMN perfil VARCHAR(20)
--       CHECK (perfil IN ('SUPER_ADMIN', 'ADMIN', 'USUARIO'));
--   UPDATE usuarios u
--   SET perfil = CASE r.nombre
--       WHEN 'Super Admin' THEN 'SUPER_ADMIN'
--       WHEN 'Admin'       THEN 'ADMIN'
--       ELSE 'USUARIO'
--   END
--   FROM roles r
--   WHERE r.id = u.rol_id;
--   ALTER TABLE usuarios ALTER COLUMN perfil SET NOT NULL;
--   ALTER TABLE usuarios DROP COLUMN rol_id;            -- elimina FK + indice por cascada
--   DROP INDEX IF EXISTS idx_usuarios_rol;
--   DROP TABLE IF EXISTS roles;
--   CREATE INDEX idx_usuarios_perfil ON usuarios (perfil);
-- ============================================================================