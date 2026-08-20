/**
 * versionHistory.js — Historial de versiones visible al usuario.
 * Fuente de verdad del historial (Ley 3). web/ la adoptará cuando exista.
 * Formato: array de {version, fecha, cambios[]}.
 */

const versionHistory = [
  {
    version: '1.2.0',
    fecha: '2026-08-19',
    cambios: [
      'Nuevo sistema visual Vanguard con fuentes Poppins e iconos Material Community.',
      'Navegación inferior Home, slot vacío, Catálogos y Perfil.',
      'Perfil con información de versión y confirmación para cerrar sesión.',
      'Corrección de doble toque en el inicio de sesión (el teclado ya no bloquea el botón Ingresar).',
      'Pantallas respetan las barras del sistema (safe areas) y el botón atrás ya no cierra la aplicación.',
      'Perfil completo: avatar, historial de versiones y cierre de sesión con confirmación.',
      'Catálogos y navegación inferior con espacio reservado para un cuarto acceso.',
    ],
  },
  {
    version: '1.1.0',
    fecha: '2026-08-19',
    cambios: [
      'Login en 3 pasos: rol → usuario → DNI, con roles Super Admin / Admin / Usuario.',
      'URL del servidor configurable en runtime (ServerCheck / Settings).',
      'SecureStore con react-native-keychain para el token JWT.',
      'Axios con interceptores: 401 → cierre de sesión y timeout de 15 segundos.',
      'Backend en /api/v1 con autenticación v2 (JWT local).',
    ],
  },
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
