-- V2__seed_super_admin.sql
-- Seed unico (ADR-A002 D-AUTH-3): SUPER_ADMIN 'Admin PowerApps', password 00000000 (BCrypt, $2a cost 12),
-- debe_cambiar_password = true. Generado con at.favre.lib:bcrypt 0.10.2 y verificado por la suite de tests.
INSERT INTO usuarios (usuario, nombre, perfil, contrasena_hash, debe_cambiar_password, dni, estado, creado_por, created_at, updated_at, last_login_at)
VALUES ('Admin PowerApps',
        'Admin PowerApps',
        'SUPER_ADMIN',
        '$2a$12$kjD9Ea/VG8O3A4eDoxaiI.vgxdsRzeyLa.wKa3rCegOfENqK4rKIa',
        TRUE,
        NULL,
        'ACTIVO',
        NULL,
        now(),
        now(),
        NULL);