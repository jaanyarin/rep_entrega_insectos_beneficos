/**
 * versionHistory.js — Historial de versiones visible al usuario.
 * Fuente de verdad del historial (Ley 3). web/ la adoptará cuando exista.
 * Formato: array de {version, fecha, cambios[]}.
 */

const versionHistory = [
  {
    version: '1.0.0',
    fecha: '2026-08-18',
    cambios: [
      'Primera vertical: autenticación por usuario + contraseña (JWT local).',
      'Cambio de contraseña obligatorio al primer ingreso (nueva contraseña = DNI, numérico máx 8 dígitos).',
      'Home por perfil: USUARIO (Nuevo Requerimiento, Historial de Requerimiento), ADMIN (Programación, Solicitud de Requerimientos), SUPER_ADMIN (2 divs).',
      'Backend Quarkus 3.x con CRUD de usuarios (soft delete por estado), PostgreSQL 16 en Docker.',
    ],
  },
];

export default versionHistory;