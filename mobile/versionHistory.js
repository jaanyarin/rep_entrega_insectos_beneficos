/**
 * versionHistory.js — Historial de versiones visible al usuario.
 * Fuente de verdad del historial (Ley 3). web/ la adoptará cuando exista.
 * Formato: array de {version, fecha, cambios[]}.
 */

const versionHistory = [
  {
    version: '1.4.0',
    fecha: '2026-08-24',
    cambios: [
      'Módulo Requerimientos: panel de solicitudes (admin) con indicador de pendientes y proyección mensual.',
      'Listado de solicitudes con filtro de rango de fechas y galería por estado con color exacto (RN-022).',
      'Formulario de solicitud (admin) con modo creación/edición y validación papel+sobre = cantidad.',
      'Panel de requerimientos (user) con proyección del mes, consumo vs disponibilidad y accesos.',
      'Formulario de nuevo requerimiento con stock en tiempo real y validación cantidad ≤ stock.',
      'Historial de requerimientos con popup de detalle y edición con foto de liberación (stub) y alerta de 30 h.',
      'Navegación mobile del módulo Requerimientos (rutas y screens del Home).',
    ],
  },
  {
    version: '1.3.0',
    fecha: '2026-08-21',
    cambios: [
      'Módulo Programación: listado por mes con selector de periodo y detalle de semanas.',
      'Edición de programación con filtro de mes y especie, tabla editable de proyección y envío de stock.',
      'Creación de programación (botón "Nuevo") para Admin/Super Admin con validación de duplicados.',
      'Proyección mensual con stock inicial (5,000 millares), cálculo automático de Total y stock final.',
      'Backend: endpoint POST /api/v1/programaciones con RBAC y migración V4.',
    ],
  },
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
