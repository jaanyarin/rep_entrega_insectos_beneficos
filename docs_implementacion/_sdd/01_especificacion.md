# DOCUMENTO DE ESPECIFICACIÓN DE SOFTWARE
# Sistema de Control de Entrega de Insectos Beneficos

# Tabla de Contenido

- [1. Información General](#1-información-general)
- [2. Objetivo del Sistema](#2-objetivo-del-sistema)
- [3. Alcance del Sistema](#3-alcance-del-sistema)
- [4. Problemática Actual](#4-problemática-actual)
- [5. Actores del Sistema](#5-actores-del-sistema)
- [6. Roles y Permisos](#6-roles-y-permisos)
- [7. Módulos del Sistema](#7-módulos-del-sistema)
- [8. Requerimientos Funcionales](#8-requerimientos-funcionales)
- [9. Reglas de Negocio](#9-reglas-de-negocio)
- [10. Requerimientos No Funcionales](#10-requerimientos-no-funcionales)
- [11. Entidades Principales](#11-entidades-principales)
- [12. Flujos Operativos](#12-flujos-operativos)
- [13. Plataforma Web / In-House (Dashboard Administrativo)](#13-plataforma-web--in-house-dashboard-administrativo)
- [14. Reportes](#14-reportes)
- [15. Consideraciones Técnicas](#15-consideraciones-técnicas)
- [16. Pendientes Funcionales](#16-pendientes-funcionales)
- [17. Anexos](#17-anexos)

---

# 1. Información General

| Campo | Detalle |
|---|---|
| Proyecto | Sistema de Control de Entrega de Insectos Beneficos |
| Tipo de Sistema | Plataforma Full Stack Empresarial |
| Plataforma | Android + Web |
| Versión Documento | 1.1 |
| Estado | En elaboración |
| Fecha | 2026-07-13 |
| Responsable | Jose Anyarin |

---

# 2. OBJETIVO DEL SISTEMA

## 2.1 Objetivo General

Desarrollar una plataforma digital empresarial para el control operativo del ciclo de entrega de insectos benéficos, permitiendo gestionar desde la publicación de stock semanal por parte de I+D hasta la liberación en campo por parte de Sanidad, garantizando trazabilidad total, control de inventario, validación documentada mediante evidencias fotográficas y generación de reportes operativos e indicadores para la toma de decisiones.

## 2.2 Objetivos Específicos

- Centralizar el registro del stock semanal de insectos benéficos (papel con postura y sobre con cascarilla de arroz).
- Permitir a I+D publicar y actualizar el stock disponible de forma controlada.
- Digitalizar el proceso de requerimiento de productos por parte de Sanidad, con indicación de fundo, lote y cantidad.
- Controlar el flujo de despacho y entrega de productos entre I+D y Sanidad.
- Validar la recepción conforme de los productos despachados.
- Registrar la liberación en campo mediante evidencias fotográficas con fecha y hora automática.
- Eliminar el uso de hojas de cálculo Excel y validaciones por WhatsApp.
- Generar reportes operativos, históricos e indicadores gráficos del proceso completo.
- Mantener trazabilidad histórica de cada lote, producto y liberación.
- Reducir errores operativos asociados a la gestión manual.

---

# 3. ALCANCE DEL SISTEMA

## 3.1 Incluye

- Aplicativo móvil Android para operación en campo.
- Plataforma web para visualización y gestión administrativa.
- Gestión de usuarios y autenticación local mediante tabla de usuarios con JWT.
- Gestión de roles y permisos (admin de i+d / usuario de sanidad).
- Módulo de publicación de stock semanal de insectos benéficos.
- Gestión de proyección mensual de stock base (5,000 millares) + adicionales.
- Módulo de requerimiento de productos por fundo y lote.
- Módulo de despacho y control de entregas.
- Módulo de validación de recepción.
- Módulo de liberación en campo con captura fotográfica.
- Registro automático de fecha y hora en evidencias fotográficas.
- Dashboard web con indicadores operativos (stocks, requerimientos, despachos, liberaciones).
- Generación de reportes históricos y operativos.
- Historial operativo por producto, lote y fundo.
- Auditoría y trazabilidad de operaciones.
- Validaciones operativas en tiempo real.
- Mensajes visuales de confirmación, validación y error.
- Notificaciones por correo electrónico a usuarios de Sanidad ante cambios de programación y envío de stock.

## 3.2 No Incluye

- Integración con sistemas ERP externos.
- Operación offline.
- Geolocalización.
- Gestión financiera o facturación.
- Módulo de mantenimiento predictivo.
- Control de calidad de los insectos benéficos.
- Gestión de proveedores externos.
- Multiempresa.

---

# 4. PROBLEMÁTICA ACTUAL

## 4.1 Situación Actual

Actualmente el proceso de control de entrega de insectos benéficos se realiza mediante procesos manuales y registros dispersos en archivos Excel, complementados con validaciones informales a través de WhatsApp. Esto genera limitaciones críticas en la trazabilidad, control operativo y validación de la información.

No existe una plataforma centralizada que permita gestionar el ciclo completo: desde la publicación del stock semanal por parte de I+D, pasando por el requerimiento de Sanidad, el despacho, la validación de recepción y finalmente la liberación en campo con evidencia fotográfica.

La gestión actual presenta dificultades para controlar:
- stock disponible en tiempo real,
- requerimientos formalizados por fundo y lote,
- despachos y entregas,
- liberaciones en campo validadas,
- evidencias fotográficas trazables,
- historial operativo consolidado,
- indicadores del proceso,
- control de proyecciones versus consumo real.

Esto ocasiona confusiones operativas, errores en los pedidos, falta de trazabilidad, nula capacidad de generación de reportes y baja capacidad de análisis para la toma de decisiones.

## 4.2 Problemas Identificados

| Código | Problema |
|---|---|
| PRB-001 | No existe trazabilidad centralizada del stock de insectos benéficos |
| PRB-002 | No existe control estructurado de requerimientos por fundo y lote |
| PRB-003 | No existe validación documentada de despachos y entregas |
| PRB-004 | No existe evidencia fotográfica con metadatos automáticos de liberación |
| PRB-005 | El proceso depende de archivos Excel manuales |
| PRB-006 | Las validaciones se realizan por WhatsApp sin trazabilidad |
| PRB-007 | No existen indicadores operativos ni reportes históricos |
| PRB-008 | No existe control de proyección vs. consumo real |

---

# 5. Actores del Sistema

| Actor | Área | Descripción |
|---|---|---|
| Administrador | I+D | Responsable de la publicación de stock semanal, gestión de proyecciones mensuales, validación de requerimientos, gestión de despachos, monitoreo de liberaciones y generación de reportes |
| Usuario | Sanidad | Responsable del registro de requerimientos por fundo y lote, validación de recepción de despachos y ejecución de liberación en campo con evidencias fotográficas |

---

# 6. Roles y Permisos

> **Nota de reconciliación (ADR-A002, 2026-08-18):** el sistema adopta 3 perfiles
> (`SUPER_ADMIN`, `ADMIN`, `USUARIO`) en sustitución del modelo binario `admin/user`.
> El email queda descartado como identificador de login.
> **Reconciliado 2026-08-19 — ADR-A003 (login 3 pasos, roles en tabla, /api/v1):** los roles
> viven en la tabla `roles` como literales con espacios ('Super Admin' / 'Admin' / 'Usuario')
> con FK `usuarios.rol_id` (Flyway V3) y el login es de 3 pasos: selección de rol → usuario → DNI
> (contraseña). La API expone rutas bajo `/api/v1` (+ OpenAPI).

| Rol (tabla `roles`) | Área | Descripción |
|---|---|---|
| Super Admin | Global | Control total: gestión de todos los usuarios, módulos y configuración |
| Admin | I+D | Gestión de usuarios de perfil admin y usuario; publicación de stock, proyecciones, despachos, reportes, dashboard, catálogos y monitoreo operativo |
| Usuario | Sanidad | Acceso operativo para registro de requerimientos, validación de recepción, liberación en campo y captura de evidencias fotográficas |

---

# 7. Módulos del Sistema

| Código | Módulo | Descripción |
|---|---|---|
| MOD-01 | Autenticación | Gestión de autenticación local mediante tabla de usuarios con JWT y control de sesiones |
| MOD-02 | Usuarios | Administración de usuarios, roles y accesos al sistema |
| MOD-03 | Publicación de Stock | Gestión de stock semanal de insectos benéficos (papel con postura y sobre con cascarilla de arroz) |
| MOD-04 | Proyección Mensual | Gestión de proyección base (5,000 millares) y adicionales del mes |
| MOD-05 | Requerimientos | Gestión de requerimientos de Sanidad, incluyendo formulario de registro con campos (fundo, lote, especie, etapa fenológica, cantidad, plaga objetivo, observaciones, fotos), control de stock disponible en tiempo real y descuento automático al enviar solicitud |
| MOD-06 | Despachos | Gestión de despachos de I+D hacia Sanidad con validación de stock |
| MOD-07 | Validación de Recepción | Confirmación de recepción conforme por parte de Sanidad |
| MOD-08 | Liberación en Campo | Registro de liberación en campo con captura fotográfica y metadatos automáticos |
| MOD-09 | Evidencias Fotográficas | Gestión de fotografías asociadas a liberaciones en campo |
| MOD-10 | Dashboard KPI | Visualización de indicadores y métricas operativas |
| MOD-11 | Reportes PDF | Generación y exportación de reportes operativos en PDF |
| MOD-12 | Auditoría | Registro de trazabilidad y actividad operacional del sistema |
| MOD-13 | Catálogos | Administración de datos maestros (fundos, lotes, productos, tipo de insecto) |
| MOD-14 | Configuración | Configuración general del sistema |
| MOD-15 | Menú Principal / Home | Pantalla de inicio con acceso a módulos habilitados y visualización de proyecciones |
| MOD-16 | Evaluación de Nematodos | Módulo placeholder para desarrollo futuro (no implementado en MVP) |
| MOD-17 | Programación de Stock | Gestión de programación semanal de stock, edición con restricción de días/horario, tabla de proyección y notificaciones por correo |
| MOD-18 | Solicitudes de Requerimiento | Gestión del ciclo completo de solicitudes de requerimiento de insectos benéficos gestionadas por I+D, incluyendo registro, cambio de estados (Registrado → Pendiente → Aprobado → Entregado → Recibido → Liberado), control de presentaciones entregadas (papel con postura, sobre con cascarilla), validación de cantidades, notificaciones por correo y captura de acta PDF |

---

# 8. REQUERIMIENTOS FUNCIONALES

## MOD-01 — AUTENTICACIÓN

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-001 | Autenticación | Inicio de sesión local | El sistema deberá permitir el inicio de sesión local en **3 pasos (rol → usuario → DNI)** validadas contra la tabla `usuarios` (ADR-A003): selección de rol ('Super Admin'/'Admin'/'Usuario'), selección de usuario del rol y contraseña (DNI, numérico máx 8) | super_admin, admin, usuario | Alta |
| RF-002 | Autenticación | Validación de cuenta registrada | El sistema deberá validar que la cuenta (`usuario` + contraseña) corresponda a un usuario registrado en la tabla `usuarios` | super_admin, admin, usuario | Alta |
| RF-003 | Autenticación | Validación de usuario registrado | El sistema deberá permitir el acceso únicamente a usuarios previamente registrados y habilitados | super_admin, admin, usuario | Alta |
| RF-004 | Autenticación | Validación de usuario activo | El sistema deberá validar que el usuario se encuentre en estado activo | super_admin, admin, usuario | Alta |
| RF-005 | Autenticación | Asignación de perfiles | El sistema deberá recuperar y aplicar el perfil (super_admin, admin, usuario) asignado al usuario autenticado | super_admin, admin, usuario | Alta |
| RF-006 | Autenticación | Persistencia de sesión | El sistema deberá mantener la sesión activa mediante JWT mientras el token esté vigente | super_admin, admin, usuario | Alta |
| RF-007 | Autenticación | Expiración de sesión | El sistema deberá cerrar automáticamente la sesión después de un periodo configurable de inactividad | super_admin, admin, usuario | Alta |
| RF-008 | Autenticación | Cierre manual de sesión | El sistema deberá permitir al usuario cerrar sesión manualmente | super_admin, admin, usuario | Alta |
| RF-009 | Autenticación | Registro de auditoría de acceso | El sistema deberá registrar eventos de autenticación (inicio, cierre, fecha, hora, usuario) — **PENDIENTE / PARCIAL: registrado como deuda H13** | super_admin, admin, usuario | Alta |
| RF-010 | Autenticación | Bloqueo de acceso no autorizado | El sistema deberá denegar el acceso a usuarios no registrados, inactivos o sin permisos | super_admin, admin, usuario | Alta |
| RF-011 | Autenticación | Administración de usuarios | El sistema deberá permitir al super admin y admin registrar, habilitar, deshabilitar y actualizar usuarios (según RBAC del ADR-A002) | super_admin, admin | Alta |
| RF-012 | Autenticación | Administración de perfiles | El sistema deberá permitir al administrador asignar y modificar perfiles de usuario | super_admin, admin | Alta |
| RF-013 | Autenticación | Control de permisos por perfil | El sistema deberá restringir el acceso a funcionalidades según el perfil asignado | super_admin, admin, usuario | Alta |
| RF-014 | Autenticación | Seguridad de tokens | El sistema deberá utilizar JWT para proteger las sesiones activas | super_admin, admin, usuario | Alta |
| RF-015 | Autenticación | Restricción de navegación por perfil | El sistema deberá mostrar únicamente las funcionalidades autorizadas según el perfil | super_admin, admin, usuario | Alta |
| RF-016 | Autenticación | Revocación inmediata de acceso | El sistema deberá invalidar sesiones activas cuando un usuario sea deshabilitado | super_admin, admin | Alta |
| RF-017 | Autenticación | Mensajes de validación de acceso | El sistema deberá mostrar mensajes visuales de confirmación o error durante la autenticación | super_admin, admin, usuario | Media |
| RF-191 | Autenticación | Migración de super admin | El sistema deberá incluir una migración de base de datos que inserte un usuario super admin por defecto (usuario: Admin PowerApps, rol **'Super Admin'**, contraseña por defecto 00000000 hasheada, debe_cambiar_password = true) permitiendo el primer acceso al sistema; el super admin seed (id=1) es **inmune** (no desactivable ni eliminable) | System | Alta |
| RF-192 | Usuarios | Creación de usuarios por super admin | El usuario super admin debe poder crear usuarios con perfil admin y usuario desde el panel de administración | super_admin | Alta |

## MOD-02 — USUARIOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-018 | Usuarios | Registro de usuarios | El sistema deberá permitir al administrador registrar usuarios autorizados | admin | Alta |
| RF-019 | Usuarios | Actualización de usuarios | El sistema deberá permitir actualizar información de usuarios registrados | admin | Alta |
| RF-020 | Usuarios | Desactivación de usuarios | El sistema deberá permitir desactivar usuarios sin eliminar su información histórica | admin | Alta |
| RF-021 | Usuarios | Reactivación de usuarios | El sistema deberá permitir reactivar usuarios previamente deshabilitados | admin | Media |
| RF-022 | Usuarios | Asignación de perfiles | El sistema deberá permitir asignar perfiles (super_admin, admin, usuario) a usuarios registrados | super_admin, admin | Alta |
| RF-023 | Usuarios | Asignación de área | El sistema deberá permitir asignar el área (I+D / Sanidad) a cada usuario registrado | super_admin, admin | Alta |
| RF-024 | Usuarios | Consulta de usuarios | El sistema deberá permitir visualizar el listado de usuarios registrados | super_admin, admin | Alta |
| RF-025 | Usuarios | Búsqueda de usuarios | El sistema deberá permitir realizar búsquedas de usuarios mediante filtros | super_admin, admin | Alta |
| RF-026 | Usuarios | Validación de usuarios duplicados | El sistema deberá impedir el registro de usuarios con el mismo nombre de usuario (login) | super_admin, admin | Alta |
| RF-027 | Usuarios | Validación de perfil asignado | El sistema deberá requerir que todo usuario tenga un perfil asignado | super_admin, admin | Alta |
| RF-028 | Usuarios | Visualización de última sesión | El sistema deberá mostrar la fecha y hora del último acceso de cada usuario | super_admin, admin | Media |
| RF-029 | Usuarios | Mensajes de validación administrativa | El sistema deberá mostrar mensajes visuales de confirmación y error | super_admin, admin | Media |
| RF-193 | Autenticación | Cambio de contraseña obligatorio | El sistema deberá exigir el cambio de contraseña al usuario que inicie sesión con la contraseña por defecto (00000000); la nueva contraseña es el DNI (solo numérico, máximo 8 dígitos) | todos | Alta |
| RF-194 | Usuarios | Eliminación lógica (soft delete) | La eliminación de usuarios se realizará únicamente por soft delete: el estado pasa de ACTIVO a INACTIVO; nunca se elimina el registro (histórico preservado) | super_admin, admin | Alta |

## MOD-03 — PUBLICACIÓN DE STOCK

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-030 | Publicación Stock | Registro de stock semanal | El sistema deberá permitir a I+D registrar el stock semanal disponible de insectos benéficos | admin | Alta |
| RF-031 | Publicación Stock | Selección de producto | El sistema deberá permitir seleccionar el producto: Papel con postura o Sobre con cascarilla de arroz | admin | Alta |
| RF-032 | Publicación Stock | Registro de cantidad disponible | El sistema deberá permitir registrar la cantidad disponible en millares por producto | admin | Alta |
| RF-033 | Publicación Stock | Días de publicación controlados | El sistema deberá permitir la publicación de stock únicamente los días lunes y jueves (configurable) | admin | Alta |
| RF-034 | Publicación Stock | Actualización de stock publicado | El sistema deberá permitir actualizar el stock publicado antes de su cierre | admin | Alta |
| RF-035 | Publicación Stock | Histórico de publicaciones | El sistema deberá mantener el historial de todas las publicaciones de stock realizadas | admin | Media |
| RF-036 | Publicación Stock | Visualización de stock actual | El sistema deberá mostrar el stock disponible actual a los usuarios de Sanidad | admin, user | Alta |
| RF-037 | Publicación Stock | Cierre de publicación semanal | El sistema deberá permitir cerrar la publicación de la semana para evitar modificaciones | admin | Alta |
| RF-038 | Publicación Stock | Notificación visual de nueva publicación | El sistema deberá indicar visualmente cuándo hay una nueva publicación de stock disponible | user | Media |
| RF-039 | Publicación Stock | Mensajes de validación | El sistema deberá mostrar mensajes visuales de confirmación y error | admin | Media |

## MOD-04 — PROYECCIÓN MENSUAL

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-040 | Proyección Mensual | Registro de proyección base | El sistema deberá permitir registrar la proyección mensual base de 5,000 millares | admin | Alta |
| RF-041 | Proyección Mensual | Registro de adicionales | El sistema deberá permitir registrar cantidades adicionales a la proyección base en el mes | admin | Alta |
| RF-042 | Proyección Mensual | Mes de referencia | El sistema deberá asociar la proyección a un mes y año específico | admin | Alta |
| RF-043 | Proyección Mensual | Visualización de proyección vs consumo | El sistema deberá mostrar la comparativa entre lo proyectado y lo realmente consumido | admin, user | Alta |
| RF-044 | Proyección Mensual | Historial de proyecciones | El sistema deberá mantener el historial de proyecciones mensuales | admin | Media |
| RF-045 | Proyección Mensual | Restricción de proyección menor a base | El sistema deberá impedir registrar una proyección menor a 5,000 millares | admin | Alta |
| RF-046 | Proyección Mensual | Actualización de adicionales | El sistema deberá permitir modificar los adicionales registrados durante el mes | admin | Media |

## MOD-05 — REQUERIMIENTOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-047 | Requerimientos | Registro de requerimiento | El sistema deberá permitir a Sanidad registrar un requerimiento de insectos benéficos | user | Alta |
| RF-048 | Requerimientos | Selección de fundo | El sistema deberá permitir seleccionar el fundo destino del requerimiento | user | Alta |
| RF-049 | Requerimientos | Selección de lote con auto-poblado por fundo | El sistema deberá permitir seleccionar el lote dentro del fundo seleccionado; al cambiar el campo Fundo, el campo Lote debe cargarse automáticamente con los lotes asociados a dicho fundo | user | Alta |
| RF-050 | Requerimientos | Selección de producto | El sistema deberá permitir seleccionar el producto requerido | user | Alta |
| RF-051 | Requerimientos | Registro de cantidad requerida | El sistema deberá permitir ingresar la cantidad requerida en millares por producto | user | Alta |
| RF-052 | Requerimientos | Validación contra stock disponible | El sistema deberá validar que la cantidad requerida no supere el stock disponible publicado | System | Alta |
| RF-053 | Requerimientos | Múltiples productos por requerimiento | El sistema deberá permitir solicitar ambos productos en un mismo requerimiento | user | Alta |
| RF-054 | Requerimientos | Consulta de requerimientos | El sistema deberá permitir visualizar el listado de requerimientos registrados | admin, user | Alta |
| RF-055 | Requerimientos | Detalle de requerimiento | El sistema deberá permitir visualizar el detalle completo de un requerimiento | admin, user | Alta |
| RF-056 | Requerimientos | Estados del requerimiento | El sistema deberá manejar los estados definidos en RN-021: Registrado, Pendiente, Aprobado, Entregado, Recibido, Liberado | admin, user | Alta |
| RF-057 | Requerimientos | Edición de requerimiento pendiente | El sistema deberá permitir editar requerimientos en estado Pendiente | user | Media |
| RF-058 | Requerimientos | Historial de requerimientos | El sistema deberá mantener el historial de requerimientos por fundo y lote | admin, user | Alta |
| RF-059 | Requerimientos | Mensajes de validación | El sistema deberá mostrar mensajes de error si no hay stock suficiente | user | Media |
| RF-168 | Requerimientos | Screen 9 — Panel de Requerimientos (user) | El sistema deberá mostrar una pantalla (Screen 9) al user al hacer clic en Insectos benéficos desde Home, con dos botones (Nuevo Requerimiento, Historial de Requerimiento), una tabla de proyección mensual con columnas Sem, Papel con postura, Sobre con cascarilla, Total, y un termómetro de consumo mensual vs disponibilidad | user | Alta |
| RF-169 | Requerimientos | Botón Nuevo Requerimiento en Screen 9 | El sistema deberá mostrar un botón Nuevo Requerimiento en Screen 9 que redirija a Screen 10 (formulario de requerimiento) | user | Alta |
| RF-170 | Requerimientos | Botón Historial de Requerimiento en Screen 9 | El sistema deberá mostrar un botón Historial de Requerimiento en Screen 9 que redirija a Screen 12 (listado de requerimientos del usuario) | user | Alta |
| RF-171 | Requerimientos | Tabla de proyección mensual en Screen 9 | El sistema deberá mostrar en Screen 9 una tabla titulada "Proyección [mes] [año] — [cantidad base] millares" con columnas: Sem, Papel con postura, Sobre con cascarilla, Total (suma de papel y sobre), registrada por semana del mes actual | user | Alta |
| RF-172 | Requerimientos | Termómetro de consumo mensual en Screen 9 | El sistema deberá mostrar en Screen 9 un termómetro de consumo mensual que mida visualmente el consumo vs la disponibilidad de productos | user | Alta |
| RF-173 | Requerimientos | Screen 10 — Formulario de Requerimiento | El sistema deberá mostrar un formulario (Screen 10) al hacer clic en Nuevo Requerimiento, con los campos de arriba abajo: Fecha (selector, default fecha actual), Fundo (desplegable), Lote (desplegable, se auto-puebla según fundo seleccionado), Especie (desplegable), Etapa fenológica (desplegable con 6 valores predefinidos según catálogo de Bangua), Cantidad (input numérico), Stock (etiqueta informativa con stock disponible), Plaga objetivo (desplegable), Observaciones (input multilinea), y un botón Foto al lado de Observaciones | user | Alta |
| RF-174 | Requerimientos | Botón Foto en Screen 10 | El sistema deberá mostrar un botón Foto al lado del campo Observaciones en Screen 10, que permita abrir la cámara del dispositivo y capturar hasta 2 fotografías, mostrando una vista previa en miniatura de cada foto capturada | user | Alta |
| RF-175 | Requerimientos | Botón Enviar Solicitud en Screen 10 | El sistema deberá mostrar un botón Enviar Solicitud en Screen 10, que al hacer clic valide que todos los campos obligatorios (excepto Observaciones) estén completos, guarde el requerimiento y muestre un mensaje de confirmación, redirigiendo luego a Screen 9 | user | Alta |
| RF-176 | Requerimientos | Visualización de stock en etiqueta de Screen 10 | El sistema deberá mostrar en la etiqueta Stock de Screen 10 la cantidad disponible del producto seleccionado, actualizada en tiempo real a medida que se registran requerimientos | user | Alta |
| RF-177 | Requerimientos | Descuento automático de stock al enviar | El sistema deberá descontar automáticamente la cantidad del requerimiento del stock disponible al confirmar el envío, evitando que se pueda superar el stock restante | System | Alta |
| RF-178 | Requerimientos | Bloqueo de requerimientos por stock cero | El sistema deberá impedir el registro de nuevos requerimientos cuando el stock disponible llegue a cero, mostrando un mensaje de stock agotado | System | Alta |
| RF-179 | Requerimientos | Screen 12 — Historial de Requerimientos | El sistema deberá mostrar una pantalla (Screen 12) al hacer clic en Historial de Requerimiento desde Screen 9, con un filtro de rango de fechas en la parte superior y una galería vertical con los requerimientos registrados por el usuario | user | Alta |
| RF-180 | Requerimientos | Galería de Screen 12 con botones Ver y Editar | El sistema deberá mostrar en la galería de Screen 12 registros con: fecha de requerimiento, especie, estado (como etiqueta), botón Ver y botón Editar (navega a Screen 13) | user | Alta |
| RF-181 | Requerimientos | Popup Ver detalle de requerimiento en Screen 12 | El sistema deberá mostrar un popup al hacer clic en Ver, con los datos del requerimiento: fecha, fundo, lote, especie, cantidad, plaga objetivo, fecha liberación y observaciones, más un botón para ocultar el popup | user | Alta |
| RF-182 | Requerimientos | Screen 13 — Edición de Requerimiento | El sistema deberá mostrar un formulario (Screen 13) al hacer clic en Editar desde Screen 12, con los mismos campos de Screen 10 pre-cargados con los datos del requerimiento, más los campos fecha y hora de liberación (auto-completados al tomar foto), un botón Foto habilitado y un botón Actualizar | user | Alta |
| RF-183 | Requerimientos | Botón Foto en Screen 13 | El sistema deberá habilitar el botón Foto en Screen 13 que al tomar la fotografía complete automáticamente los campos fecha de liberación y hora de liberación con los metadatos del sistema | user | Alta |
| RF-184 | Requerimientos | Botón Actualizar en Screen 13 | El sistema deberá mostrar un botón Actualizar en Screen 13 que al hacer clic guarde los cambios (incluyendo foto, fecha y hora de liberación), muestre una notificación de confirmación y redirija a Screen 12 | user | Alta |
| RF-185 | Requerimientos | Alerta de 30 horas sin foto de liberación | El sistema deberá mostrar una alerta permanente en Screen 13 si han transcurrido más de 30 horas desde que el estado cambió a Recibido sin haberse tomado la foto de liberación, con el texto: "Alerta: No se ingresó la información de la liberación, fecha de solicitud: [fecha]" | user | Alta |

## MOD-06 — DESPACHOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-060 | Despachos | Visualización de requerimientos pendientes | El sistema deberá mostrar a I+D los requerimientos pendientes de atención | admin | Alta |
| RF-061 | Despachos | Validación de stock previo al despacho | El sistema deberá validar el stock disponible antes de confirmar el despacho | admin | Alta |
| RF-062 | Despachos | Registro de despacho | El sistema deberá permitir registrar el despacho de productos a Sanidad | admin | Alta |
| RF-063 | Despachos | Cantidad despachada por producto | El sistema deberá permitir registrar la cantidad efectivamente despachada | admin | Alta |
| RF-064 | Despachos | Despacho parcial | El sistema deberá permitir despachar parcialmente un requerimiento | admin | Alta |
| RF-065 | Despachos | Despacho total | El sistema deberá permitir despachar la totalidad del requerimiento | admin | Alta |
| RF-066 | Despachos | Cambio de estado a despachado | El sistema deberá actualizar el estado del requerimiento al registrar el despacho | System | Alta |
| RF-067 | Despachos | Consulta de despachos realizados | El sistema deberá permitir visualizar el historial de despachos | admin, user | Alta |
| RF-068 | Despachos | Detalle de despacho | El sistema deberá mostrar el detalle completo de un despacho | admin, user | Alta |
| RF-069 | Despachos | Actualización de stock post-despacho | El sistema deberá descontar automáticamente del stock disponible al registrar un despacho | System | Alta |
| RF-070 | Despachos | Mensajes de validación | El sistema deberá mostrar mensajes de confirmación y error durante el despacho | admin | Media |

## MOD-07 — VALIDACIÓN DE RECEPCIÓN

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-071 | Validación Recepción | Visualización de despachos pendientes de recepción | El sistema deberá mostrar a Sanidad los despachos pendientes de confirmar | user | Alta |
| RF-072 | Validación Recepción | Confirmación de recepción | El sistema deberá permitir a Sanidad confirmar la recepción del despacho | user | Alta |
| RF-073 | Validación Recepción | Fecha y hora de recepción | El sistema deberá registrar automáticamente la fecha y hora de confirmación | System | Alta |
| RF-074 | Validación Recepción | Registro de observaciones | El sistema deberá permitir registrar observaciones sobre la recepción | user | Media |
| RF-075 | Validación Recepción | Recepción conforme | El sistema deberá permitir marcar la recepción como conforme o con observaciones | user | Alta |
| RF-076 | Validación Recepción | Cambio de estado post-recepción | El sistema deberá actualizar el estado del despacho al confirmar la recepción | System | Alta |
| RF-077 | Validación Recepción | Consulta de recepciones | El sistema deberá permitir visualizar el historial de recepciones | admin, user | Alta |
| RF-078 | Validación Recepción | Mensajes de validación | El sistema deberá mostrar mensajes de confirmación al recibir conforme | user | Media |

## MOD-08 — LIBERACIÓN EN CAMPO

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-079 | Liberación | Visualización de productos recibidos pendientes de liberar | El sistema deberá mostrar a Sanidad los productos recibidos pendientes de liberación en campo | user | Alta |
| RF-080 | Liberación | Registro de liberación | El sistema deberá permitir registrar la liberación de productos en campo | user | Alta |
| RF-081 | Liberación | Selección de fundo y lote de liberación | El sistema deberá permitir indicar el fundo y lote donde se libera el producto | user | Alta |
| RF-082 | Liberación | Captura fotográfica obligatoria | El sistema deberá requerir la captura de una fotografía como parte del registro de liberación | user | Alta |
| RF-083 | Liberación | Fecha y hora automática en foto | El sistema deberá registrar automáticamente la fecha y hora de la toma fotográfica como metadato | System | Alta |
| RF-084 | Liberación | Cantidad liberada | El sistema deberá permitir registrar la cantidad efectivamente liberada en campo | user | Alta |
| RF-085 | Liberación | Liberación total o parcial | El sistema deberá permitir liberar total o parcialmente los productos recibidos | user | Alta |
| RF-086 | Liberación | Cambio de estado post-liberación | El sistema deberá actualizar el estado del producto a Liberado | System | Alta |
| RF-087 | Liberación | Consulta de liberaciones | El sistema deberá permitir visualizar el historial de liberaciones realizadas | admin, user | Alta |
| RF-088 | Liberación | Detalle de liberación | El sistema deberá mostrar el detalle de cada liberación incluyendo la fotografía asociada | admin, user | Alta |
| RF-089 | Liberación | Múltiples liberaciones por recepción | El sistema deberá permitir registrar múltiples liberaciones para una misma recepción | user | Media |
| RF-090 | Liberación | Mensajes de validación | El sistema deberá mostrar mensajes de confirmación y error durante la liberación | user | Media |

## MOD-09 — EVIDENCIAS FOTOGRÁFICAS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-091 | Evidencias | Captura de fotografía | El sistema deberá permitir capturar fotografías desde el dispositivo móvil | user | Alta |
| RF-092 | Evidencias | Metadatos automáticos | El sistema deberá registrar automáticamente fecha, hora y usuario en cada fotografía | System | Alta |
| RF-093 | Evidencias | Asociación a liberación | El sistema deberá asociar la fotografía al registro de liberación correspondiente | user | Alta |
| RF-094 | Evidencias | Visualización de evidencias | El sistema deberá permitir visualizar las evidencias fotográficas registradas | admin, user | Alta |
| RF-095 | Evidencias | Múltiples fotografías por liberación | El sistema deberá permitir capturar múltiples fotografías por cada liberación | user | Media |
| RF-096 | Evidencias | Validación de captura obligatoria | El sistema deberá impedir finalizar la liberación sin haber capturado al menos una fotografía | System | Alta |

## MOD-10 — DASHBOARD KPI

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-097 | Dashboard | Stock disponible actual | El sistema deberá mostrar el stock disponible actual de cada producto | admin, user | Alta |
| RF-098 | Dashboard | Requerimientos por período | El sistema deberá mostrar la cantidad de requerimientos en un rango de fechas | admin, user | Alta |
| RF-099 | Dashboard | Despachos vs requerimientos | El sistema deberá mostrar la comparativa entre lo requerido y lo despachado | admin | Alta |
| RF-100 | Dashboard | Liberaciones por fundo y lote | El sistema deberá mostrar las liberaciones agrupadas por fundo y lote | admin, user | Alta |
| RF-101 | Dashboard | Proyección vs consumo real | El sistema deberá mostrar la comparativa entre la proyección mensual y el consumo real | admin | Alta |
| RF-102 | Dashboard | Indicadores por producto | El sistema deberá mostrar indicadores desglosados por tipo de producto | admin, user | Alta |
| RF-103 | Dashboard | Filtros globales | El sistema deberá permitir filtrar indicadores por fecha, producto, fundo y lote | admin, user | Alta |
| RF-104 | Dashboard | Gráficos operativos | El sistema deberá mostrar gráficos de barras, líneas y pastel para los indicadores principales | admin | Alta |

## MOD-11 — REPORTES PDF

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-105 | Reportes | Reporte de stock semanal | El sistema deberá generar reporte PDF del stock semanal publicado | admin | Alta |
| RF-106 | Reportes | Reporte de requerimientos | El sistema deberá generar reporte PDF de requerimientos por período | admin | Alta |
| RF-107 | Reportes | Reporte de despachos | El sistema deberá generar reporte PDF de despachos realizados | admin | Alta |
| RF-108 | Reportes | Reporte de liberaciones | El sistema deberá generar reporte PDF de liberaciones por fundo y lote | admin, user | Alta |
| RF-109 | Reportes | Reporte de proyección vs consumo | El sistema deberá generar reporte PDF comparativo de proyección vs consumo real | admin | Alta |
| RF-110 | Reportes | Exportación de reportes | El sistema deberá permitir la descarga de reportes PDF desde la plataforma web | admin | Media |

## MOD-12 — AUDITORÍA

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-111 | Auditoría | Registro de eventos | El sistema deberá registrar eventos de creación, actualización y eliminación lógica | System | Alta |
| RF-112 | Auditoría | Información auditada | El sistema deberá registrar usuario, fecha, hora, módulo, acción y detalle | System | Alta |
| RF-113 | Auditoría | Consulta de auditoría | El sistema deberá permitir al administrador consultar el registro de auditoría | admin | Alta |
| RF-114 | Auditoría | Trazabilidad por registro | El sistema deberá permitir visualizar el historial de cambios de un registro específico | admin | Alta |

## MOD-13 — CATÁLOGOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-115 | Catálogos | Gestión de productos | El sistema deberá permitir administrar el catálogo de productos (Papel con postura, Sobre con cascarilla de arroz) | admin | Alta |
| RF-116 | Catálogos | Gestión de fundos | El sistema deberá permitir administrar el catálogo de fundos | admin | Alta |
| RF-117 | Catálogos | Gestión de lotes | El sistema deberá permitir administrar los lotes asociados a cada fundo | admin | Alta |
| RF-118 | Catálogos | Gestión de tipos de insecto | El sistema deberá permitir administrar los tipos de insectos benéficos (Crisopa, Anahirus a futuro) | admin | Alta |
| RF-189 | Catálogos | Gestión de etapas fenológicas | El sistema deberá permitir administrar el catálogo de etapas fenológicas del cultivo, con 6 valores predefinidos según el catálogo de Bangua | admin | Alta |
| RF-190 | Catálogos | Gestión de plagas objetivo | El sistema deberá permitir administrar el catálogo de plagas objetivo (ej. Trips, Pulgón, etc.) | admin | Alta |

## MOD-14 — CONFIGURACIÓN

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-119 | Configuración | Días de publicación | El sistema deberá permitir configurar los días de publicación de stock (lunes y jueves) | admin | Alta |
| RF-120 | Configuración | Proyección base | El sistema deberá permitir configurar la proyección base mensual | admin | Alta |
| RF-121 | Configuración | Límites de stock | El sistema deberá permitir configurar alertas de stock mínimo | admin | Media |

## MOD-15 — MENÚ PRINCIPAL / HOME

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-122 | Home | Pantalla de inicio post-login | El sistema deberá mostrar una pantalla principal tras la autenticación exitosa | admin, user | Alta |
| RF-123 | Home | Botón Insectos benéficos | El sistema deberá mostrar un botón de acceso al módulo de insectos benéficos con imagen referencial | admin, user | Alta |
| RF-124 | Home | Botón Evaluación de nematodos | El sistema deberá mostrar un botón de acceso al módulo de evaluación de nematodos con imagen referencial | admin, user | Alta |
| RF-125 | Home | Navegación a Insectos benéficos | El sistema deberá redirigir al flujo operativo al presionar el botón Insectos benéficos | admin, user | Alta |
| RF-126 | Home | Placeholder Evaluación de nematodos | El botón Evaluación de nematodos no deberá navegar a ninguna pantalla (placeholder futuro) | admin, user | Alta |
| RF-127 | Home | Visualización de proyecciones en Home | El sistema deberá mostrar un texto informativo con las proyecciones mensuales de productos en la pantalla principal | admin, user | Alta |
| RF-128 | Home | Redirección por rol en Insectos benéficos | El botón Insectos benéficos debe redirigir según el rol: admin (i+d) a Screen 3 (Panel Programación), user (sanidad) a Screen 9 (Panel Requerimientos) | admin, user | Alta |

## MOD-16 — EVALUACIÓN DE NEMATODOS (PLACEHOLDER)

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| Sin RF | Evaluación Nematodos | Módulo placeholder | Módulo reservado para desarrollo futuro de evaluación de nematodos. No implementado en MVP. El botón en Home no debe navegar a ninguna pantalla | admin, user | — |

## MOD-17 — PROGRAMACIÓN DE STOCK

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-129 | Programación | Pantalla de programación | El sistema deberá mostrar una pantalla con botones Programación y Solicitud de Requerimiento, tabla de proyección del mes y termómetro de consumo mensual | admin | Alta |
| RF-130 | Programación | Botón Programación | El sistema deberá mostrar un botón para acceder a la gestión de programación semanal de stock | admin | Alta |
| RF-131 | Programación | Botón Solicitud de Requerimiento | El sistema deberá mostrar un botón para acceder al listado de solicitudes registradas por Sanidad | admin | Alta |
| RF-132 | Programación | Indicador de notificación de solicitudes | El sistema deberá mostrar un indicador numérico junto al botón Solicitud de Requerimiento con la cantidad de solicitudes pendientes | admin | Alta |
| RF-133 | Programación | Tabla de proyección del mes | El sistema deberá mostrar una tabla con columnas: Semana, Papel con postura, Sobre con cascarilla, Total | admin, user | Alta |
| RF-134 | Programación | Cálculo de columna Total | El sistema deberá calcular automáticamente la columna Total como la suma de Papel con postura + Sobre con cascarilla | System | Alta |
| RF-135 | Programación | Actualización automática de tabla | El sistema deberá actualizar automáticamente la tabla de proyección al registrar una programación | System | Alta |
| RF-136 | Programación | Termómetro de consumo mensual | El sistema deberá mostrar un termómetro de consumo mensual que mida visualmente el consumo sobre la disponibilidad de productos | admin | Alta |
| RF-137 | Programación | Notificación por correo al programar | El sistema deberá enviar un correo electrónico a los usuarios de Sanidad al registrar una programación con las cantidades disponibles | System | Alta |
| RF-138 | Programación | Selector de rango de fechas | El sistema deberá permitir seleccionar un rango de fechas para filtrar programaciones | admin | Alta |
| RF-139 | Programación | Galería vertical de registros | El sistema deberá mostrar una galería vertical con los registros de programación, cada uno con: fecha, mes, cantidad total del mes y botones Ver/Editar | admin | Alta |
| RF-140 | Programación | Modal de visualización (Ver) | El sistema deberá mostrar una vista emergente con los registros programados del mes al hacer clic en Ver | admin | Alta |
| RF-141 | Programación | Pantalla de edición (Editar) | El sistema deberá mostrar una pantalla de edición con filtro de mes, filtro de especie, selector de fecha de publicación y tabla de proyección final con campos: Fecha, Stock Inicial, Papel con postura, Sobre con cascarilla, Stock Final, Estado | admin | Alta |
| RF-142 | Programación | Filtro de mes en edición | El sistema deberá permitir seleccionar el mes a editar mediante un filtro | admin | Alta |
| RF-143 | Programación | Filtro de especie en edición | El sistema deberá permitir seleccionar la especie de insecto benéfico a editar | admin | Alta |
| RF-144 | Programación | Tabla de proyección final editable | El sistema deberá mostrar una tabla editable con las columnas: Fecha, Stock Inicial (millares), Papel con postura (millares), Sobre con cascarilla (millares), Total (suma automática), Stock Final (millares), Estado (EN_PROCESO, PUBLICADO) al seleccionar un mes | admin | Alta |
| RF-145 | Programación | Botón Enviar stock | El sistema deberá mostrar un botón para confirmar y enviar la programación de stock editada | admin | Alta |
| RF-146 | Programación | Notificación por correo al enviar stock | El sistema deberá enviar un correo electrónico a los usuarios de Sanidad al hacer clic en Enviar stock, notificando los cambios | System | Alta |
| RF-147 | Programación | Validación de días de edición | El sistema deberá permitir la edición de programación únicamente los días lunes y jueves | System | Alta |
| RF-148 | Programación | Validación de horario de edición | El sistema deberá permitir la edición de programación únicamente entre las 00:00 y 23:59 horas de los días permitidos | System | Alta |
| RF-186 | Programación | Estado de programación semanal | El sistema deberá gestionar el estado de cada programación semanal con dos valores: EN_PROCESO (mientras se edita) y PUBLICADO (una vez confirmada y notificada) | admin | Alta |
| RF-187 | Programación | Stock inicial y final en programación | El sistema deberá mostrar en la tabla de proyección el Stock Inicial (proyección base del mes), el Stock Final (lo que queda disponible después de cada solicitud), la Fecha de publicación y el Estado (EN_PROCESO/PUBLICADO) | admin | Alta |
| RF-188 | Programación | Remanente entre semanas | El sistema deberá transferir automáticamente el stock no consumido de una semana a la siguiente como stock base disponible, reflejando el remanente en el Stock Inicial de la semana siguiente | System | Alta |

## MOD-18 — SOLICITUDES DE REQUERIMIENTO

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-149 | Solicitudes | Screen 6 — Panel de Solicitudes | El sistema deberá mostrar una pantalla (Screen 6) con la misma estructura de Screen 3 (tabla de proyección del mes y termómetro de consumo mensual), pero enfocada exclusivamente en Solicitud de Requerimiento como único botón de acceso | admin | Alta |
| RF-150 | Solicitudes | Acceso a Screen 6 | El sistema deberá permitir al admin acceder a Screen 6 desde el Botón 02 (Solicitud de Requerimiento) de Screen 3 | admin | Alta |
| RF-151 | Solicitudes | Botón Solicitud de Requerimiento en Screen 6 | El sistema deberá mostrar un botón Solicitud de Requerimiento en Screen 6 con indicador numérico de solicitudes pendientes | admin | Alta |
| RF-152 | Solicitudes | Screen 7 — Listado de Solicitudes | El sistema deberá mostrar una pantalla (Screen 7) con un filtro de rango de fechas en la parte superior y una galería vertical de registros debajo, al hacer clic en Solicitud de Requerimiento | admin | Alta |
| RF-153 | Solicitudes | Filtro de rango de fechas en Screen 7 | El sistema deberá permitir seleccionar un rango de fechas para filtrar las solicitudes mostradas en la galería | admin | Alta |
| RF-154 | Solicitudes | Galería de solicitudes en Screen 7 | El sistema deberá mostrar una galería vertical con registros de solicitud que incluyan: fecha de solicitud, especie y estado, con el color correspondiente según la tabla de estados definida | admin | Alta |
| RF-155 | Solicitudes | Visualización de colores por estado | El sistema deberá mostrar el estado de cada solicitud con el color correspondiente: Registrado (#9E9E9E), Pendiente (#FFC107), Aprobado (#4CAF50), Entregado (#2196F3), Recibido (#009688), Liberado (#9C27B0) | admin | Alta |
| RF-156 | Solicitudes | Botón Nuevo en Screen 7 | El sistema deberá mostrar un botón Nuevo en Screen 7 que redirija a Screen 8 en modo creación | admin | Alta |
| RF-157 | Solicitudes | Botón Editar en Screen 7 | El sistema deberá mostrar un botón Editar por cada registro en la galería de Screen 7 que redirija a Screen 8 en modo edición | admin | Alta |
| RF-158 | Solicitudes | Screen 8 — Formulario de Solicitud | El sistema deberá mostrar un formulario (Screen 8) con los siguientes campos de arriba abajo: Fecha (selector), Fundo (desplegable), Lote (desplegable), Especie (desplegable), Cantidad plaga (input), Objetivo (desplegable), Estado (desplegable: Aprobado, Entregado), Fecha de liberación (selector), Hora de liberación (selector), Observaciones (input multilinea) | admin | Alta |
| RF-159 | Solicitudes | Subtítulo Presentaciones entregadas | El sistema deberá mostrar debajo del campo Observaciones un subtítulo "Presentaciones entregadas" con los campos: Papel con postura (input número) y Sobre con cascarilla de arroz (input número) | admin | Alta |
| RF-160 | Solicitudes | Botón PDF junto a Estado | El sistema deberá mostrar un botón con icono de PDF al lado del selector de Estado, que al hacer clic abra un popup para capturar una foto del acta | admin | Alta |
| RF-161 | Solicitudes | Popup de captura de acta PDF | El sistema deberá mostrar un panel emergente (popup) al hacer clic en el botón PDF, permitiendo tomar una fotografía del acta, y al confirmar mostrar una vista previa de la imagen capturada | admin | Media |
| RF-162 | Solicitudes | Deshabilitar papel/sobre en creación | El sistema deberá mantener deshabilitados los campos Papel con postura y Sobre con cascarilla de arroz al crear una nueva solicitud (Nuevo) | System | Alta |
| RF-163 | Solicitudes | Modo edición — solo cambio de estado | El sistema deberá permitir en modo edición únicamente la modificación del campo Estado, manteniendo los demás campos bloqueados | admin | Alta |
| RF-164 | Solicitudes | Habilitar papel/sobre cuando estado = Entregado | El sistema deberá habilitar los campos Papel con postura y Sobre con cascarilla de arroz únicamente cuando el Estado seleccionado sea Entregado, y será obligatorio registrar ambos valores | admin | Alta |
| RF-165 | Solicitudes | Validación papel+sobre = cantidad plaga | El sistema deberá validar que la suma de Papel con postura + Sobre con cascarilla de arroz sea exactamente igual a la Cantidad plaga registrada; solo cuando se cumpla esta condición se habilitará el botón Guardar | System | Alta |
| RF-166 | Solicitudes | Notificación por correo al cambiar a Entregado | El sistema deberá enviar una notificación por correo electrónico a los perfiles user (sanidad) cuando el estado de una solicitud cambie de Aprobado a Entregado | System | Alta |
| RF-167 | Solicitudes | Guardar y retornar a Screen 7 | El sistema deberá guardar la solicitud al hacer clic en Guardar (habilitado solo si se cumple la validación) y redirigir a Screen 7, actualizando la galería con los cambios de estado | admin | Alta |

---

# 9. Reglas de Negocio

| Código | Regla | Módulo |
|---|---|---|
| RN-001 | Solo los usuarios con rol admin del área i+d pueden publicar y gestionar stock | Publicación Stock |
| RN-002 | Solo los usuarios con rol user del área sanidad pueden registrar requerimientos y liberaciones | Requerimientos / Liberación |
| RN-003 | La publicación de stock solo se permite los días lunes y jueves (configurable) | Publicación Stock |
| RN-004 | La proyección mensual base nunca puede ser menor a 5,000 millares | Proyección Mensual |
| RN-005 | Un requerimiento no puede superar el stock disponible publicado | Requerimientos |
| RN-006 | Todo despacho debe estar asociado a un requerimiento existente | Despachos |
| RN-007 | Al registrar un despacho, el stock disponible se descuenta automáticamente | Despachos |
| RN-008 | No se puede despachar más cantidad de la requerida | Despachos |
| RN-009 | Toda liberación en campo debe incluir al menos una fotografía como evidencia | Liberación |
| RN-010 | La fotografía de liberación debe registrar automáticamente fecha y hora del dispositivo | Liberación |
| RN-011 | No se puede liberar más cantidad de la recibida | Liberación |
| RN-012 | Un usuario deshabilitado no puede acceder al sistema | Autenticación |
| RN-013 | Todo evento de creación, actualización o desactivación debe registrarse en auditoría | Auditoría |
| RN-014 | No se permite la eliminación física de registros; solo desactivación lógica | General |
| RN-015 | El botón insectos benéficos en el menú principal está disponible para usuarios con rol admin y user, redirigiendo según el rol: admin a screen 3 (panel programación), user a screen 9 (panel requerimientos) | Home |
| RN-016 | La edición de la programación de stock solo está permitida los días lunes y jueves | Programación |
| RN-017 | La edición de la programación de stock solo está permitida en el horario de 00:00 a 23:59 horas de los días permitidos (lunes y jueves) | Programación |
| RN-018 | Al registrar o enviar una programación, el sistema debe notificar por correo electrónico a todos los usuarios de Sanidad | Programación |
| RN-019 | La columna Total de la tabla de proyección debe calcularse automáticamente como la suma de ambos productos | Programación |
| RN-020 | La tabla de proyección debe actualizarse automáticamente ante cualquier cambio en la programación | Programación |
| RN-021 | La solicitud de requerimiento debe manejar los siguientes estados en orden secuencial: Registrado → Pendiente → Aprobado → Entregado → Recibido → Liberado | Solicitudes |
| RN-022 | Cada estado de solicitud debe representarse con el color asignado: Registrado (#9E9E9E), Pendiente (#FFC107), Aprobado (#4CAF50), Entregado (#2196F3), Recibido (#009688), Liberado (#9C27B0) | Solicitudes |
| RN-023 | Al crear una nueva solicitud, los campos Papel con postura y Sobre con cascarilla de arroz deben permanecer deshabilitados | Solicitudes |
| RN-024 | En modo edición, solo el campo Estado debe estar habilitado para modificación; el resto de campos deben permanecer bloqueados | Solicitudes |
| RN-025 | Los campos Papel con postura y Sobre con cascarilla de arroz solo se habilitan cuando el Estado es Entregado, y su registro es obligatorio | Solicitudes |
| RN-026 | La suma de Papel con postura + Sobre con cascarilla de arroz debe ser exactamente igual a la Cantidad plaga para habilitar el botón Guardar | Solicitudes |
| RN-027 | El sistema debe enviar una notificación por correo electrónico al usuario solicitante (Sanidad) cuando admin registre un cambio de estado en su solicitud | Solicitudes |
| RN-028 | La captura de acta PDF mediante el botón PDF debe abrir un popup que permita tomar una fotografía y mostrar una vista previa antes de confirmar | Solicitudes |
| RN-029 | El campo Stock en Screen 10 debe mostrar en tiempo real el stock disponible del producto seleccionado, calculado como stock total menos requerimientos ya registrados | Requerimientos |
| RN-030 | Al enviar un requerimiento en Screen 10, el sistema debe descontar automáticamente la cantidad solicitada del stock disponible del producto | Requerimientos |
| RN-031 | No se permite registrar un requerimiento si la cantidad solicitada supera el stock disponible del producto | Requerimientos |
| RN-032 | Cuando el stock disponible llegue a cero, el sistema debe bloquear el registro de nuevos requerimientos y mostrar mensaje "Stock agotado" | Requerimientos |
| RN-033 | El botón Foto en Screen 10 debe permitir capturar hasta 2 fotografías por requerimiento, mostrando vista previa en miniatura de cada una | Requerimientos |
| RN-034 | Las fotografías capturadas desde Screen 10 deben quedar asociadas al requerimiento como evidencia | Requerimientos |
| RN-035 | Si han transcurrido más de 30 horas desde que el estado de un requerimiento cambió a Recibido sin haberse tomado la foto de liberación, Screen 13 debe mostrar una alerta permanente | Requerimientos |
| RN-036 | La fecha y hora de liberación en Screen 13 deben auto-completarse con los metadatos del sistema al momento de tomar la fotografía de liberación | Requerimientos |
| RN-037 | El stock final semanal publicado debe tender a cero; de existir remanente no consumido por Sanidad, este se transfiere automáticamente como stock base disponible para la siguiente semana | Programación |
| RN-038 | La programación semanal debe gestionarse con estados EN_PROCESO (edición activa) y PUBLICADO (confirmado y notificado a Sanidad) | Programación |
| RN-039 | Al cambiar el estado de una programación de EN_PROCESO a PUBLICADO, el sistema debe notificar por correo electrónico a todos los usuarios de Sanidad con el detalle de las cantidades disponibles | Programación |

---

# 10. Requerimientos No Funcionales

| Código | Nombre | Descripción | Prioridad |
|---|---|---|---|
| RNF-001 | Seguridad | La autenticación debe realizarse mediante JWT con validación local contra tabla de usuarios | Alta |
| RNF-002 | Disponibilidad | El sistema debe tener una disponibilidad del 99.5% en horario operativo | Alta |
| RNF-003 | Rendimiento | Las consultas de stock y requerimientos deben responder en menos de 3 segundos | Alta |
| RNF-004 | Concurrentes | El sistema debe soportar al menos 20 usuarios simultáneos | Alta |
| RNF-005 | Timezone | El sistema debe operar en horario America/Lima (UTC -5) | Alta |
| RNF-006 | Almacenamiento | Las fotografías deben almacenarse en filesystem con rutas en base de datos | Alta |
| RNF-007 | Tamaño fotos | Las fotografías no deben exceder 5 MB y deben comprimirse automáticamente | Media |
| RNF-008 | Formatos fotos | Las fotografías deben aceptarse en formato JPG y PNG | Media |
| RNF-009 | Escalabilidad | La arquitectura debe permitir agregar nuevos productos, fundos y lotes sin cambios estructurales | Alta |
| RNF-010 | Mantenibilidad | El sistema debe seguir una arquitectura modular y desacoplada | Alta |
| RNF-011 | Trazabilidad | Todas las operaciones críticas deben quedar registradas en auditoría | Alta |
| RNF-012 | Respaldo | La base de datos debe respaldarse diariamente | Alta |
| RNF-013 | Notificaciones por correo | El sistema debe integrar envío de correos electrónicos para notificar programaciones y envíos de stock | Alta |
| RNF-014 | Restricción temporal | La edición de programación debe validarse contra días (lun/jue) y horario (00:00-23:59) del servidor | Alta |

---

# 11. Entidades Principales

| Entidad | Descripción |
|---|---|
| Usuario | Persona registrada con acceso al sistema (I+D o Sanidad) |
| Producto | Insecto benéfico disponible (Papel con postura, Sobre con cascarilla de arroz) |
| StockSemanal | Publicación de stock disponible realizada por I+D |
| ProyeccionMensual | Proyección base + adicionales del mes |
| Requerimiento | Solicitud de insectos benéficos creada por el usuario de Sanidad (MOD-05). Representa la solicitud inicial con detalle de fundo, lote, especie, cantidad y plaga objetivo. El requerimiento es gestionado por I+D a través del flujo de Solicitudes (MOD-18), donde se le da seguimiento mediante cambios de estado. |
| DetalleRequerimiento | Producto (papel con postura / sobre con cascarilla), cantidad y destino por requerimiento |
| Despacho | Entrega de productos de I+D a Sanidad |
| Recepcion | Confirmación de recepción del despacho por Sanidad |
| Liberacion | Registro de liberación en campo con evidencia fotográfica |
| EvidenciaFotografica | Fotografía asociada a una liberación con metadatos |
| Fundo | Unidad agrícola destino de los productos |
| Lote | Subdivisión del fundo |
| Auditoria | Registro de trazabilidad de eventos |
| Programacion | Programación semanal de stock por mes, producto y especie, con estado (EN_PROCESO, PUBLICADO) y seguimiento de stock inicial, stock final y fechas de publicación |
| DetalleProgramacion | Detalle por semana de las cantidades programadas de cada producto, con fecha de semana, stock inicial, stock final y estado individual |
| SaldoStock | Control de saldos: diferencia entre proyección mensual base y stock real registrado, permitiendo gestionar adicionales mensuales |
| Solicitud | Representa el ciclo de gestión que I+D (admin) realiza sobre un requerimiento creado por Sanidad. Cada Solicitud se origina de un Requerimiento y gestiona su avance a través de los estados (Registrado → Pendiente → Aprobado → Entregado → Recibido → Liberado), incluyendo el control de presentaciones entregadas (papel con postura, sobre con cascarilla) y captura de acta PDF |
| DetalleSolicitud | Detalle de presentaciones entregadas (Papel con postura, Sobre con cascarilla de arroz) asociadas a una solicitud en estado Entregado |
| ActaSolicitud | Evidencia fotográfica del acta asociada a una solicitud, capturada mediante el botón PDF en Screen 8 |
| FotoRequerimiento | Fotografía capturada desde Screen 10 como evidencia del requerimiento, hasta 2 por requerimiento |

---

# 12. Flujos Operativos

## 12.1 Flujo del Ciclo Operativo (5 pasos del negocio)

El proceso operativo general consta de 5 pasos secuenciales que involucran a ambos roles:

```
┌─────────────────────────────────────┐
│ Paso 1 — Publicación de Stock (I+D) │  Lunes y Jueves
│ - I+D publica stock semanal         │
│   (Papel con postura / Sobre        │
│    con cascarilla de arroz)         │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Paso 2 — Requerimiento (Sanidad)    │
│ - Sanidad registra solicitud        │
│   indicando: Fundo + Lote           │
│   Producto + Cantidad               │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Paso 3 — Despacho (I+D)            │
│ - I+D valida stock disponible       │
│ - Registra entrega física           │
│ - Descuenta del stock               │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Paso 4 — Validación Recepción       │
│           (Sanidad)                 │
│ - Sanidad confirma recepción        │
│   conforme                          │
│ - Observaciones (opcional)          │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Paso 5 — Liberación en Campo        │
│           (Sanidad)                 │
│ - Sanidad libera en campo           │
│   (Fundo + Lote destino)            │
│ - Captura fotográfica obligatoria   │
│ - Fecha/hora automática             │
└──────────────┬──────────────────────┘
               ▼
             [Fin]
```

## 12.2 Flujo de Navegación del Administrador (I+D)

Ruta que sigue el usuario con rol **admin** (área i+d) desde el inicio de sesión hasta la gestión completa de programación y solicitudes:

```
[Inicio]
    │
    ▼
┌─────────────────────────────────────────┐
│ Login Local                             │
│ - Email + contraseña                    │
│ - Validación contra tabla de usuarios   │
│ - Asignación de rol: admin              │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│ Menú Principal (Home)                   │
│ - Texto informativo: proyecciones       │
│ ┌──────────────────┐ ┌──────────────┐  │
│ │ Insectos         │ │ Evaluación   │  │
│ │ benéficos   🐞   │ │ nematodos 🔬 │  │
│ │ ✅ Habilitado    │ │ ❌ Placeholder│  │
│ └──────────────────┘ └──────────────┘  │
└──────────────────┬──────────────────────┘
                   │  (clic en Insectos benéficos)
                   ▼
┌─────────────────────────────────────────┐
│ Screen 3 — Panel de Programación        │
│                                         │
│  ┌────────────┐ ┌──────────────────┐   │
│  │ Programac. │ │ Solic. Requerim. │🔢│   │
│  └────────────┘ └──────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐    │
│  │   Tabla de Proyección del Mes  │    │
│  │ Sem│Stk.Ini│Papel│Sobre│Stk.Fin│    │
│  ├────────────────────────────────┤    │
│  │   Termómetro de consumo 60%    │    │
│  └────────────────────────────────┘    │
└──────────────────┬──────────────────────┘
                   │
          ┌────────┴────────┐
          ▼                  ▼
┌──────────────────┐  ┌──────────────────────────────┐
│ Botón:           │  │ Botón:                       │
│ Programación     │  │ Solicitud de Requerimiento   │
└────────┬─────────┘  └──────────────┬───────────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐  ┌──────────────────────────────┐
│ Screen 4         │  │ Screen 6 — Panel Solicitudes  │
│ Listado de       │  │ (misma estructura que Scr 3)  │
│ Programaciones   │  │ ┌──────────────────────────┐ │
└────┬─────────────┘  │ │ Solic. Requerimiento  🔢 │ │
     │                │ └──────────────────────────┘ │
  ┌──┴──┐             │ ┌──────────────────────────┐ │
  ▼     ▼             │ │ Tabla Proyección del Mes │ │
┌───┐ ┌──────┐       │ │ Termómetro de consumo    │ │
│Ver│ │Screen│       │ └──────────────────────────┘ │
│Mod│ │ 5    │       └──────────────┬───────────────┘
│   │ │Edit  │                      │
│   │ │Stock │                      ▼
│   │ │      │           ┌──────────────────────────────┐
│   │ │      │           │ Screen 7 — Listado de        │
│   │ │      │           │ Solicitudes de Requerimiento │
│   │ │      │           │                              │
│   │ │      │           │ [Rango de fechas  ▼]         │
│   │ │      │           │ ┌────────────────────────┐   │
│   │ │      │           │ │ Fecha │ Especie │Estado │   │
│   │ │      │           │ │              [Editar]  │   │
│   │ │      │           │ └────────────────────────┘   │
│   │ │      │           │          [ + Nuevo ]         │
│   │ │      │           └──────────────┬───────────────┘
│   │ │      │                          │
│   │ │      │              ┌───────────┴───────────┐
│   │ │      │              ▼                       ▼
│   │ │      │    ┌────────────────────────┐  ┌──────────────┐
│   │ │      │    │ Screen 8 (Nuevo)       │  │ Screen 8     │
│   │ │      │    │ Formulario completo    │  │ (Editar)     │
│   │ │      │    │ (todos los campos      │  │ Solo Estado  │
│   │ │      │    │  habilitados)          │  │ habilitado   │
│   │ │      │    └────────────────────────┘  └──────────────┘
│   │ │      │                                          │
│   │ │      │                               (Si Estado = Entregado:
│   │ │      │                                papel+sobre obligatorios)
│   │ │      │                                          │
│   │ │      │                               ┌──────────┘
│   │ │      │                               ▼
│   │ │      │                    ┌────────────────────────┐
│   │ │      │                    │ Guardar → retorna a    │
│   │ │      │                    │ Screen 7 (galería      │
│   │ │      │                    │ actualizada)           │
│   │ │      │                    └────────────────────────┘
│   ▼        │
└──────┐     │
       │     │
       ▼     │
┌────────────┘
│
▼
┌─────────────────────────────────────────┐
│ Screen 5 — Edición de Programación      │
│ - Filtro de mes y especie               │
│ - Tabla editable:                       │
│   Fecha │ Stock Inicial │ Papel │ Sobre │
│   Stock Final │ Estado                  │
│ - Botón: Enviar stock                   │
│   (notifica por correo a Sanidad)       │
└─────────────────────────────────────────┘
```

## 12.3 Flujo de Navegación del Usuario (Sanidad)

Ruta que sigue el usuario con rol **user** (área sanidad) desde el inicio de sesión hasta la liberación en campo:

```
[Inicio]
    │
    ▼
┌─────────────────────────────────────────┐
│ Login Local                             │
│ - Email + contraseña                    │
│ - Validación contra tabla de usuarios   │
│ - Asignación de rol: user               │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│ Menú Principal (Home)                   │
│ - Texto informativo: proyecciones       │
│ ┌──────────────────┐ ┌──────────────┐  │
│ │ Insectos         │ │ Evaluación   │  │
│ │ benéficos   🐞   │ │ nematodos 🔬 │  │
│ │ ✅ Habilitado    │ │ ❌ Placeholder│  │
│ └──────────────────┘ └──────────────┘  │
└──────────────────┬──────────────────────┘
                   │  (clic en Insectos benéficos)
                   ▼
┌─────────────────────────────────────────┐
│ Screen 9 — Panel de Requerimientos      │
│                                         │
│  ┌────────────────┐ ┌──────────────┐   │
│  │ Nuevo Req.     │ │ Historial    │   │
│  └────────────────┘ └──────────────┘   │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Proyección [mes] — [base] mill.│    │
│  │ Sem│Papel│Sobre│Total          │    │
│  ├────────────────────────────────┤    │
│  │   Termómetro de consumo 65%    │    │
│  └────────────────────────────────┘    │
└──────────────────┬──────────────────────┘
                   │
          ┌────────┴────────┐
          ▼                  ▼
┌──────────────────┐  ┌──────────────────────────────┐
│ Botón:           │  │ Botón:                       │
│ Nuevo Requerim.  │  │ Historial de Requerimiento   │
└────────┬─────────┘  └──────────────┬───────────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐  ┌──────────────────────────────┐
│ Screen 10        │  │ Screen 12                    │
│ Formulario Nuevo │  │ Historial de Requerimientos  │
│ Requerimiento    │  │                              │
│                  │  │ [Rango de fechas  ▼]         │
│ · Fecha   [📅]  │  │ ┌──────────────────────────┐ │
│ · Fundo   [▼]   │  │ │Fecha│Especie│Estado       │ │
│ · Lote    [▼]   │  │ │        [Ver] [Editar]    │ │
│ · Especie [▼]   │  │ └──────────────────────────┘ │
│ · Etapa fenol.  │  └──────────────┬───────────────┘
│    [▼] 6 vals   │            │          │
│ · Cantidad [___]│      ┌─────┘          └─────┐
│ · Stock [4500]  │      ▼                      ▼
│ · Plaga obj [▼] │  ┌──────────────┐  ┌──────────────────┐
│ · Obs [___][📷] │  │ Popup Ver    │  │ Screen 13        │
│                  │  │ (solo lectura│  │ Editar Requerim. │
│ [Enviar Solic.]  │  │  detalle)    │  │ (para liberación)│
└──────────────────┘  └──────────────┘  │                  │
                                        │ · Campos pre-    │
                                        │   cargados (solo │
                                        │   lectura)        │
                                        │ · Fecha liberac. │
                                        │   (auto al tomar │
                                        │    foto)         │
                                        │ · Hora liberac.  │
                                        │   (auto al tomar │
                                        │    foto)         │
                                        │ · 📷 Foto        │
                                        │                  │
                                        │ [Actualizar]     │
                                        └──────────────────┘
```

---

## Especificación de Pantallas — Screens 6, 7 y 8

### Screen 6 — Panel de Solicitudes de Requerimiento

**Acceso:**
- desde Botón 02 (Solicitud de Requerimiento) en Screen 3 (exclusivo admin i+d)

**Estructura:** (misma disposición que Screen 3)

```
┌──────────────────────────────────────────────────┐
│              Solicitudes de Requerimiento         │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  [ Solicitud de Requerimiento ]       🔢   │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Proyección del Mes                        │  │
│  │  Semana │ Papel postura │ Sobre │ Total    │  │
│  ├────────────────────────────────────────────┤  │
│  │  S1     │ 1,250         │ 1,250 │ 2,500   │  │
│  │  S2     │ 1,250         │ 1,250 │ 2,500   │  │
│  │  S3     │ 1,250         │ 1,250 │ 2,500   │  │
│  │  S4     │ 1,250         │ 1,250 │ 2,500   │  │
│  ├────────────────────────────────────────────┤  │
│  │  Total  │ 5,000         │ 5,000 │ 10,000  │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  ████████████████████░░░░░░ 65%                   │
│  Consumo mensual vs disponibilidad                │
└──────────────────────────────────────────────────┘
```

**Elementos:**
- Botón "Solicitud de Requerimiento" con indicador numérico de notificaciones (solicitudes pendientes)
- Tabla de proyección del mes (Semana, Papel con postura, Sobre con cascarilla, Total)
- Termómetro de consumo mensual

---

### Screen 7 — Listado de Solicitudes de Requerimiento

**Acceso:** al hacer clic en "Solicitud de Requerimiento" desde Screen 6

**Estructura:**

```
┌──────────────────────────────────────────────────┐
│          Solicitudes de Requerimiento             │
│                                                   │
│  Rango de fechas:  [01/05/2026] ── [31/05/2026]  │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │ 📅 22/05/2026  │  Especie: Chrysopa sp.    │  │
│  │  Estado: ● Aprobado          [Editar]      │  │
│  ├────────────────────────────────────────────┤  │
│  │ 📅 21/05/2026  │  Especie: Chrysopa sp.    │  │
│  │  Estado: ● Pendiente         [Editar]      │  │
│  ├────────────────────────────────────────────┤  │
│  │ 📅 20/05/2026  │  Especie: Cryptolaemus    │  │
│  │  Estado: ● Registrado        [Editar]      │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  Tabla de colores de estado:                      │
│  ● Registrado   #9E9E9E    ● Recibido    #009688 │
│  ● Pendiente    #FFC107    ● Liberado    #9C27B0 │
│  ● Aprobado     #4CAF50                          │
│  ● Entregado    #2196F3                          │
│                                                   │
│                      [ + Nuevo ]                  │
└──────────────────────────────────────────────────┘
```

**Elementos:**
- Filtro de rango de fechas (selector desde-hasta)
- Galería vertical de solicitudes con:
  - Fecha de solicitud
  - Especie
  - Estado con indicador de color (seis estados posibles)
- Botón **Nuevo** → abre Screen 8 en modo creación
- Botón **Editar** por registro → abre Screen 8 en modo edición

---

### Screen 8 — Formulario de Solicitud de Requerimiento

**Acceso:**
- **Nuevo**: desde botón Nuevo en Screen 7
- **Editar**: desde botón Editar en Screen 7

**Estructura:**

```
┌──────────────────────────────────────────────────┐
│                Solicitud de Requerimiento         │
│                                                   │
│  Fecha                [ 22/05/2026        📅 ]  │
│  Fundo                [ Fundo Los Pinos    ▼ ]  │
│  Lote                 [ Lote A-12          ▼ ]  │
│  Especie              [ Chrysopa sp.       ▼ ]  │
│  Cantidad plaga       [ 5000              ⬜ ]  │
│  Objetivo             [ Control de plagas  ▼ ]  │
│  Estado               [ Aprobado      ▼ ] [📄] │
│  Fecha de liberación  [ 25/05/2026        📅 ]  │
│  Hora de liberación   [ 08:30             🕐 ]  │
│  Observaciones        [___________________]      │
│                    (input multilinea)            │
│                                                   │
│  ── Presentaciones entregadas ──                  │
│  Papel con postura         [ 2500       ⬜ ]     │
│  Sobre con cascarilla      [ 2500       ⬜ ]     │
│                                                   │
│                [ 💾 Guardar ]                     │
└──────────────────────────────────────────────────┘
```

**Comportamiento por modo:**

| Aspecto | Creación (Nuevo) | Edición |
|---|---|---|
| Campos de formulario | Todos habilitados para ingreso | Solo Estado habilitado |
| Papel con postura | Deshabilitado | Deshabilitado (se habilita solo si Estado = Entregado) |
| Sobre con cascarilla | Deshabilitado | Deshabilitado (se habilita solo si Estado = Entregado) |
| Botón Guardar | Habilitado si datos obligatorios completos | Habilitado solo si papel + sobre = cantidad plaga (cuando Estado = Entregado) |
| Notificación | — | Al cambiar de Aprobado a Entregado → correo a usuarios Sanidad |

**Reglas de validación en Guardar:**
1. Si Estado = Entregado: papel con postura y sobre con cascarilla son obligatorios
2. Si Estado = Entregado: papel con postura + sobre con cascarilla debe ser exactamente igual a cantidad plaga
3. Si no se cumple la condición anterior, el botón Guardar permanece deshabilitado

**Botón PDF (📄):**
- Ubicado al lado del selector de Estado
- Al hacer clic: abre un popup con cámara para capturar fotografía del acta
- Al confirmar la captura: muestra vista previa de la imagen
- La foto del acta queda asociada a la solicitud

---

### Screen 9 — Panel de Requerimientos (user)

**Acceso:** desde Menú Principal (Home) al hacer clic en Insectos benéficos, exclusivo para rol user (sanidad)

**Estructura:**

```
┌──────────────────────────────────────────────────┐
│             Requerimientos — Sanidad               │
│                                                    │
│  ┌──────────────────────┐ ┌──────────────────┐   │
│  │ Nuevo Requerimiento  │ │ Historial Req.   │   │
│  └──────────────────────┘ └──────────────────┘   │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │ Proyección mayo — 5,000 millares           │   │
│  │ Sem │ Papel postura │ Sobre │ Total        │   │
│  ├────────────────────────────────────────────┤   │
│  │ S1  │ 1,250         │ 1,250 │ 2,500       │   │
│  │ S2  │ 1,250         │ 1,250 │ 2,500       │   │
│  │ S3  │ 1,250         │ 1,250 │ 2,500       │   │
│  │ S4  │ 1,250         │ 1,250 │ 2,500       │   │
│  ├────────────────────────────────────────────┤   │
│  │ Total│ 5,000        │ 5,000 │ 10,000      │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  ████████████████████░░░░░░ 65%                    │
│  Consumo mensual vs disponibilidad                 │
└──────────────────────────────────────────────────┘
```

**Elementos:**
- Botón **Nuevo Requerimiento** → redirige a Screen 10
- Botón **Historial de Requerimiento** → redirige a Screen 12
- Tabla **Proyección [mes] [año] — [cantidad base] millares** con columnas: Sem, Papel con postura, Sobre con cascarilla, Total (suma automática)
- Termómetro de consumo mensual

---

### Screen 10 — Formulario de Nuevo Requerimiento (user)

**Acceso:** desde botón Nuevo Requerimiento en Screen 9

**Estructura:**

```
┌──────────────────────────────────────────────────┐
│              Nuevo Requerimiento                   │
│                                                    │
│  Fecha              [ 22/05/2026          📅 ]   │
│  Fundo              [ Fundo Los Pinos      ▼ ]   │
│  Lote               [ Lote A-12            ▼ ]   │
│  Especie            [ Chrysopa sp.         ▼ ]   │
│  Etapa fenológica   [ Floración            ▼ ]   │
│  Cantidad           [ 500                ⬜ ]   │
│  Stock              [ 4,500 millares disponibles ]│
│  Plaga objetivo     [ Pulgón               ▼ ]   │
│  Observaciones      [_____________________]      │
│                                      [📷 Foto]   │
│                                                    │
│              [ Enviar Solicitud ]                  │
└──────────────────────────────────────────────────┘
```

**Campos del formulario:**

| Campo | Tipo | Obligatorio | Detalle |
|---|---|---|---|
| Fecha | Selector fecha | Sí | Default: fecha actual del dispositivo |
| Fundo | Desplegable | Sí | Catálogo de fundos registrados |
| Lote | Desplegable | Sí | Catálogo de lotes asociados al fundo seleccionado |
| Especie | Desplegable | Sí | Catálogo de especies de insectos benéficos |
| Etapa fenológica | Desplegable | Sí | Catálogo de etapas fenológicas del cultivo |
| Cantidad | Input numérico | Sí | Cantidad requerida en millares |
| Stock | Etiqueta (solo lectura) | — | Muestra el stock disponible del producto seleccionado, se actualiza en tiempo real |
| Plaga objetivo | Desplegable | Sí | Catálogo de plagas objetivo |
| Observaciones | Input multilinea | No | Texto libre |
| Fotos | Botón 📷 | No | Abre cámara, hasta 2 fotos con vista previa |

**Reglas de negocio:**
- Todos los campos son obligatorios excepto Observaciones y Fotos
- El campo **Stock** muestra el stock disponible calculado como: stock total - requerimientos ya registrados
- Al cambiar el campo **Especie**, el stock mostrado debe actualizarse al disponible de esa especie
- Al cambiar el campo **Cantidad**, se valida que no supere el stock disponible
- Si el stock disponible es 0, se bloquea el envío y se muestra mensaje "Stock agotado"
- Al hacer clic en **Enviar Solicitud**: guarda el requerimiento, descuenta la cantidad del stock, muestra mensaje de confirmación y redirige a Screen 9

**Botón Foto (📷):**
- Ubicado al lado derecho del campo Observaciones
- Al hacer clic: abre la cámara del dispositivo móvil
- Permite capturar hasta 2 fotografías por requerimiento
- Cada foto capturada se muestra como vista previa en miniatura dentro del screen
- Las fotos quedan asociadas al requerimiento como evidencia

---

> **Nota sobre la numeración de pantallas:** No existe Screen 11. La numeración salta de Screen 10 a Screen 12 intencionalmente, reservando el número 11 para posibles pantallas intermedias futuras (ej. confirmación de disponibilidad, vista previa de despacho) que pudieran requerirse en versiones posteriores del sistema.

### Screen 12 — Historial de Requerimientos (user)

**Acceso:** desde botón Historial de Requerimiento en Screen 9

**Estructura:**

```
┌──────────────────────────────────────────────────┐
│           Historial de Requerimientos              │
│                                                    │
│  Rango de fechas:  [01/05/2026] ── [31/05/2026]  │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │ 📅 22/05/2026  │  Especie: Chrysopa sp.    │  │
│  │  Estado: ● Aprobado         [Ver] [Editar] │  │
│  ├────────────────────────────────────────────┤  │
│  │ 📅 20/05/2026  │  Especie: Cryptolaemus    │  │
│  │  Estado: ● Pendiente        [Ver] [Editar] │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Elementos:**
- Filtro de rango de fechas (selector desde-hasta)
- Galería vertical con registros de requerimiento que incluyen:
  - Fecha de requerimiento
  - Especie
  - Estado (etiqueta con color según tabla de estados)
  - Botón **Ver** → abre popup con detalle completo
  - Botón **Editar** → redirige a Screen 13 (formulario de edición con carga de foto de liberación)

**Popup Ver:**

```
┌──────────────────────────────────────────────────┐
│               Detalle de Requerimiento             │
│                                                    │
│  Fecha:           22/05/2026                       │
│  Fundo:           Fundo Los Pinos                  │
│  Lote:            Lote A-12                        │
│  Especie:         Chrysopa sp.                     │
│  Cantidad:        500 millares                     │
│  Plaga objetivo:  Pulgón                           │
│  Fecha liberac.:  25/05/2026                       │
│  Observaciones:   Aplicar en horas de la mañana    │
│                                                    │
│                   [ Cerrar ]                       │
└──────────────────────────────────────────────────┘
```

**Notificaciones:**
- Cuando admin registre un cambio de estado en la solicitud (desde Screens 7→8), el sistema debe enviar un correo electrónico al usuario (Sanidad) que realizó el requerimiento original, informando el nuevo estado

---

### Screen 13 — Edición de Requerimiento (user)

**Acceso:** desde botón Editar en Screen 12 (galería de Historial de Requerimientos)

**Estructura:**

```
┌──────────────────────────────────────────────────┐
│              Editar Requerimiento                  │
│                                                    │
│  ⚠ Alerta: No se ingresó la información de la     │
│    liberación, fecha de solicitud: 22/05/2026      │
│  (visible solo si >30h desde estado Recibido       │
│   sin foto de liberación)                          │
│                                                    │
│  Fecha              [ 22/05/2026          📅 ]   │
│  Fundo              [ Fundo Los Pinos      ▼ ]   │
│  Lote               [ Lote A-12            ▼ ]   │
│  Especie            [ Chrysopa sp.         ▼ ]   │
│  Etapa fenológica   [ Floración            ▼ ]   │
│  Cantidad           [ 500                ⬜ ]   │
│  Stock              [ 4,500 millares disponibles ]│
│  Plaga objetivo     [ Pulgón               ▼ ]   │
│  Fecha liberación   [ 25/05/2026     (auto)  ]   │
│  Hora liberación    [ 08:30           (auto)  ]   │
│  Observaciones      [_____________________]      │
│                                      [📷 Foto]   │
│                                                    │
│              [ Actualizar ]                        │
└──────────────────────────────────────────────────┘
```

**Campos del formulario:**

| Campo | Tipo | Estado | Detalle |
|---|---|---|---|
| Fecha | Selector fecha | Pre-cargado | Dato original del requerimiento |
| Fundo | Desplegable | Pre-cargado | Dato original del requerimiento |
| Lote | Desplegable | Pre-cargado | Dato original del requerimiento |
| Especie | Desplegable | Pre-cargado | Dato original del requerimiento |
| Etapa fenológica | Desplegable | Pre-cargado | Dato original del requerimiento |
| Cantidad | Input numérico | Pre-cargado | Dato original del requerimiento |
| Stock | Etiqueta | Solo lectura | Stock disponible actual |
| Plaga objetivo | Desplegable | Pre-cargado | Dato original del requerimiento |
| Fecha liberación | Etiqueta | Auto-completado | Se rellena con los metadatos del sistema al tomar la foto |
| Hora liberación | Etiqueta | Auto-completado | Se rellena con los metadatos del sistema al tomar la foto |
| Observaciones | Input multilinea | Pre-cargado | Dato original, editable |
| Fotos | Botón 📷 | Habilitado | Toma foto de liberación, hasta 2 |

**Botón Foto (📷):**
- Habilitado para tomar la fotografía de liberación
- Al capturar la foto: los campos **Fecha liberación** y **Hora liberación** se completan automáticamente con los metadatos del sistema
- Permite hasta 2 fotografías con vista previa en miniatura

**Botón Actualizar:**
- Guarda los cambios realizados (incluyendo foto, fecha y hora de liberación)
- Muestra notificación de confirmación
- Redirige a Screen 12 con la galería actualizada

**Alerta de 30 horas:**
- Si han transcurrido más de 30 horas desde que el estado del requerimiento cambió a **Recibido** y no se ha tomado la foto de liberación, se muestra una alerta permanente en la parte superior de Screen 13
- Texto de la alerta: *"Alerta: No se ingresó la información de la liberación, fecha de solicitud: [fecha]"*
- La alerta permanece visible hasta que se tome la foto de liberación

---

# 13. Plataforma Web / In-House (Dashboard Administrativo)

Además del aplicativo móvil, el sistema debe incluir una plataforma web (In-House) de escritorio para la gestión administrativa y visualización de datos. Esta plataforma está destinada principalmente al perfil admin (i+d), con acceso restringido para user (sanidad) según los módulos habilitados.

## 13.1 Navegación por Tabs

La plataforma web se organiza mediante una interfaz de pestañas (tabs) con las siguientes secciones:

| Tab | Descripción | Acceso |
|---|---|---|
| **Programa** | Gestión de la programación mensual y semanal de stock con tabla de proyección, edición de stock inicial/final, fechas de publicación y estados (EN_PROCESO/PUBLICADO). Incluye termómetro de consumo mensual y porcentaje de cumplimiento. | admin |
| **Requerimiento** | Registro y visualización de solicitudes de requerimiento de insectos benéficos. Formulario completo con campos: fecha, fundo, lote, especie, etapa fenológica, cantidad, stock, plaga objetivo, observaciones y fotos. | admin, user |
| **Saldos** | Control de saldos mensuales: muestra la diferencia entre la proyección mensual base (5,000 millares) y el stock real registrado, permitiendo gestionar adicionales y ajustes del mes. | admin |
| **Consolidado** | Tabla dinámica tipo Excel que consolida en una sola vista: programa, requerimiento, ejecutado y saldo, con filtros por mes, semana, fundo, lote y especie. Permite exportación a PDF. | admin |
| **Gráfica** | Visualización gráfica de indicadores (barras, líneas, pastel) para: proyección vs consumo real, requerimientos por período, despachos, liberaciones por fundo/lote, stock disponible, evolución semanal. | admin |

## 13.2 Funcionalidades Principales del In-House

- Visualización de la programación mensual con proyección base (5,000 millares) y adicionales.
- Tabla semanal con columnas: Semana, Fecha, Stock Inicial, Papel con postura, Sobre con cascarilla, Total, Stock Final, Estado.
- Termómetro de consumo mensual con porcentaje de cumplimiento.
- Gestión de requerimientos con formulario de registro y edición limitada.
- Control de saldos mensuales (proyección vs real).
- Consolidado tipo Excel con filtros múltiples.
- Dashboard de indicadores con gráficos operativos (Recharts).
- Exportación de reportes en PDF.
- Diferenciación de accesos por rol: admin ve todos los tabs; user ve solo requerimiento y consolidado (solo lectura).

---

# 14. Reportes

| Reporte | Descripción | Frecuencia |
|---|---|---|
| Stock semanal publicado | Detalle del stock publicado por producto | Semanal |
| Requerimientos por período | Listado de requerimientos con detalle de fundo, lote y cantidad | Diario / Semanal / Mensual |
| Despachos realizados | Historial de despachos con detalle por requerimiento | Diario / Semanal / Mensual |
| Liberaciones por fundo y lote | Liberaciones agrupadas por ubicación | Diario / Semanal / Mensual |
| Proyección vs consumo | Comparativa entre lo proyectado y lo consumido en el mes | Mensual |
| Reporte general del ciclo | Ciclo completo por requerimiento desde publicación hasta liberación | Por requerimiento |
| Programación de stock por mes | Detalle de la programación semanal de productos por mes y especie | Mensual |

---

# 15. Consideraciones Técnicas

- El sistema debe implementar optimistic locking para evitar conflictos de concurrencia.
- Las fotografías deben almacenarse en filesystem con compresión automática server-side.
- La proyección base mensual (5,000 millares) debe ser configurable por administrador.
- Los días de publicación (lunes y jueves) deben ser configurables.
- Los metadatos de las fotografías (fecha, hora) deben tomarse del dispositivo al momento de la captura y no deben ser editables por el usuario.
- El sistema debe manejar timezone America/Lima (UTC -5).
- La edición de programación debe restringirse a días lunes y jueves en horario 00:00-23:59 (configurable).
- El sistema debe integrar un servicio de envío de correos electrónicos (SMTP) para notificar a los usuarios de Sanidad.
- La tabla de proyección del mes debe recalcularse automáticamente ante cualquier cambio en la programación.
- El termómetro de consumo mensual debe reflejar en tiempo real la relación entre el consumo mensual y la disponibilidad total.

---

# 16. Pendientes Funcionales

| # | Pendiente | Estado |
|---|---|---|

---

# 17. Anexos

| Anexo | Descripción |
|---|---|
