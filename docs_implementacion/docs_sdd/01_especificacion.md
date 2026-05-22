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
- [13. Reportes](#13-reportes)
- [14. Consideraciones Técnicas](#14-consideraciones-técnicas)
- [15. Pendientes Funcionales](#15-pendientes-funcionales)
- [16. Anexos](#16-anexos)

---

# 1. Información General

| Campo | Detalle |
|---|---|
| Proyecto | Sistema de Control de Entrega de Insectos Beneficos |
| Tipo de Sistema | Plataforma Full Stack Empresarial |
| Plataforma | Android + Web |
| Versión Documento | 1.0 |
| Estado | En elaboración |
| Fecha | 2026-05-21 |
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
- Gestión de usuarios y autenticación mediante cuenta Microsoft corporativa.
- Gestión de roles y permisos (Admin I+D / Usuario Sanidad).
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

| Rol | Área | Descripción |
|---|---|---|
| ADMIN | I+D | Acceso total a publicación de stock, proyecciones, despachos, reportes, dashboard, catálogos y monitoreo operativo |
| USER | Sanidad | Acceso operativo para registro de requerimientos, validación de recepción, liberación en campo y captura de evidencias fotográficas |

---

# 7. Módulos del Sistema

| Código | Módulo | Descripción |
|---|---|---|
| MOD-01 | Autenticación | Gestión de autenticación mediante cuenta Microsoft corporativa y control de sesiones |
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
| RF-001 | Autenticación | Inicio de sesión Microsoft | El sistema deberá permitir el inicio de sesión únicamente mediante cuentas Microsoft corporativas | Admin, User | Alta |
| RF-002 | Autenticación | Validación de dominio corporativo | El sistema deberá validar que la cuenta pertenezca al dominio corporativo autorizado | Admin, User | Alta |
| RF-003 | Autenticación | Validación de usuario registrado | El sistema deberá permitir el acceso únicamente a usuarios previamente registrados y habilitados | Admin, User | Alta |
| RF-004 | Autenticación | Validación de usuario activo | El sistema deberá validar que el usuario se encuentre en estado activo | Admin, User | Alta |
| RF-005 | Autenticación | Asignación de roles | El sistema deberá recuperar y aplicar el rol asignado al usuario autenticado | Admin, User | Alta |
| RF-006 | Autenticación | Persistencia de sesión | El sistema deberá mantener la sesión activa mediante JWT mientras el token esté vigente | Admin, User | Alta |
| RF-007 | Autenticación | Expiración de sesión | El sistema deberá cerrar automáticamente la sesión después de un periodo configurable de inactividad | Admin, User | Alta |
| RF-008 | Autenticación | Cierre manual de sesión | El sistema deberá permitir al usuario cerrar sesión manualmente | Admin, User | Alta |
| RF-009 | Autenticación | Registro de auditoría de acceso | El sistema deberá registrar eventos de autenticación (inicio, cierre, fecha, hora, usuario) | Admin, User | Alta |
| RF-010 | Autenticación | Bloqueo de acceso no autorizado | El sistema deberá denegar el acceso a usuarios no registrados, inactivos o sin permisos | Admin, User | Alta |
| RF-011 | Autenticación | Administración de usuarios | El sistema deberá permitir al administrador registrar, habilitar, deshabilitar y actualizar usuarios | Admin | Alta |
| RF-012 | Autenticación | Administración de roles | El sistema deberá permitir al administrador asignar y modificar roles de usuario | Admin | Alta |
| RF-013 | Autenticación | Control de permisos por rol | El sistema deberá restringir el acceso a funcionalidades según el rol asignado | Admin, User | Alta |
| RF-014 | Autenticación | Seguridad de tokens | El sistema deberá utilizar JWT para proteger las sesiones activas | Admin, User | Alta |
| RF-015 | Autenticación | Restricción de navegación por rol | El sistema deberá mostrar únicamente las funcionalidades autorizadas según el rol | Admin, User | Alta |
| RF-016 | Autenticación | Revocación inmediata de acceso | El sistema deberá invalidar sesiones activas cuando un usuario sea deshabilitado | Admin | Alta |
| RF-017 | Autenticación | Mensajes de validación de acceso | El sistema deberá mostrar mensajes visuales de confirmación o error durante la autenticación | Admin, User | Media |

## MOD-02 — USUARIOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-018 | Usuarios | Registro de usuarios | El sistema deberá permitir al administrador registrar usuarios autorizados | Admin | Alta |
| RF-019 | Usuarios | Actualización de usuarios | El sistema deberá permitir actualizar información de usuarios registrados | Admin | Alta |
| RF-020 | Usuarios | Desactivación de usuarios | El sistema deberá permitir desactivar usuarios sin eliminar su información histórica | Admin | Alta |
| RF-021 | Usuarios | Reactivación de usuarios | El sistema deberá permitir reactivar usuarios previamente deshabilitados | Admin | Media |
| RF-022 | Usuarios | Asignación de roles | El sistema deberá permitir asignar roles (ADMIN/USER) a usuarios registrados | Admin | Alta |
| RF-023 | Usuarios | Asignación de área | El sistema deberá permitir asignar el área (I+D / Sanidad) a cada usuario registrado | Admin | Alta |
| RF-024 | Usuarios | Consulta de usuarios | El sistema deberá permitir visualizar el listado de usuarios registrados | Admin | Alta |
| RF-025 | Usuarios | Búsqueda de usuarios | El sistema deberá permitir realizar búsquedas de usuarios mediante filtros | Admin | Alta |
| RF-026 | Usuarios | Validación de usuarios duplicados | El sistema deberá impedir el registro de usuarios con el mismo correo corporativo | Admin | Alta |
| RF-027 | Usuarios | Validación de rol asignado | El sistema deberá requerir que todo usuario tenga un rol asignado | Admin | Alta |
| RF-028 | Usuarios | Visualización de última sesión | El sistema deberá mostrar la fecha y hora del último acceso de cada usuario | Admin | Media |
| RF-029 | Usuarios | Mensajes de validación administrativa | El sistema deberá mostrar mensajes visuales de confirmación y error | Admin | Media |

## MOD-03 — PUBLICACIÓN DE STOCK

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-030 | Publicación Stock | Registro de stock semanal | El sistema deberá permitir a I+D registrar el stock semanal disponible de insectos benéficos | Admin | Alta |
| RF-031 | Publicación Stock | Selección de producto | El sistema deberá permitir seleccionar el producto: Papel con postura o Sobre con cascarilla de arroz | Admin | Alta |
| RF-032 | Publicación Stock | Registro de cantidad disponible | El sistema deberá permitir registrar la cantidad disponible en millares por producto | Admin | Alta |
| RF-033 | Publicación Stock | Días de publicación controlados | El sistema deberá permitir la publicación de stock únicamente los días lunes y jueves (configurable) | Admin | Alta |
| RF-034 | Publicación Stock | Actualización de stock publicado | El sistema deberá permitir actualizar el stock publicado antes de su cierre | Admin | Alta |
| RF-035 | Publicación Stock | Histórico de publicaciones | El sistema deberá mantener el historial de todas las publicaciones de stock realizadas | Admin | Media |
| RF-036 | Publicación Stock | Visualización de stock actual | El sistema deberá mostrar el stock disponible actual a los usuarios de Sanidad | Admin, User | Alta |
| RF-037 | Publicación Stock | Cierre de publicación semanal | El sistema deberá permitir cerrar la publicación de la semana para evitar modificaciones | Admin | Alta |
| RF-038 | Publicación Stock | Notificación visual de nueva publicación | El sistema deberá indicar visualmente cuándo hay una nueva publicación de stock disponible | User | Media |
| RF-039 | Publicación Stock | Mensajes de validación | El sistema deberá mostrar mensajes visuales de confirmación y error | Admin | Media |

## MOD-04 — PROYECCIÓN MENSUAL

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-040 | Proyección Mensual | Registro de proyección base | El sistema deberá permitir registrar la proyección mensual base de 5,000 millares | Admin | Alta |
| RF-041 | Proyección Mensual | Registro de adicionales | El sistema deberá permitir registrar cantidades adicionales a la proyección base en el mes | Admin | Alta |
| RF-042 | Proyección Mensual | Mes de referencia | El sistema deberá asociar la proyección a un mes y año específico | Admin | Alta |
| RF-043 | Proyección Mensual | Visualización de proyección vs consumo | El sistema deberá mostrar la comparativa entre lo proyectado y lo realmente consumido | Admin, User | Alta |
| RF-044 | Proyección Mensual | Historial de proyecciones | El sistema deberá mantener el historial de proyecciones mensuales | Admin | Media |
| RF-045 | Proyección Mensual | Restricción de proyección menor a base | El sistema deberá impedir registrar una proyección menor a 5,000 millares | Admin | Alta |
| RF-046 | Proyección Mensual | Actualización de adicionales | El sistema deberá permitir modificar los adicionales registrados durante el mes | Admin | Media |

## MOD-05 — REQUERIMIENTOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-047 | Requerimientos | Registro de requerimiento | El sistema deberá permitir a Sanidad registrar un requerimiento de insectos benéficos | User | Alta |
| RF-048 | Requerimientos | Selección de fundo | El sistema deberá permitir seleccionar el fundo destino del requerimiento | User | Alta |
| RF-049 | Requerimientos | Selección de lote | El sistema deberá permitir seleccionar el lote dentro del fundo seleccionado | User | Alta |
| RF-050 | Requerimientos | Selección de producto | El sistema deberá permitir seleccionar el producto requerido | User | Alta |
| RF-051 | Requerimientos | Registro de cantidad requerida | El sistema deberá permitir ingresar la cantidad requerida en millares por producto | User | Alta |
| RF-052 | Requerimientos | Validación contra stock disponible | El sistema deberá validar que la cantidad requerida no supere el stock disponible publicado | System | Alta |
| RF-053 | Requerimientos | Múltiples productos por requerimiento | El sistema deberá permitir solicitar ambos productos en un mismo requerimiento | User | Alta |
| RF-054 | Requerimientos | Consulta de requerimientos | El sistema deberá permitir visualizar el listado de requerimientos registrados | Admin, User | Alta |
| RF-055 | Requerimientos | Detalle de requerimiento | El sistema deberá permitir visualizar el detalle completo de un requerimiento | Admin, User | Alta |
| RF-056 | Requerimientos | Estado del requerimiento | El sistema deberá manejar estados: Pendiente, Atendido, Parcial, Entregado | Admin, User | Alta |
| RF-057 | Requerimientos | Edición de requerimiento pendiente | El sistema deberá permitir editar requerimientos en estado Pendiente | User | Media |
| RF-058 | Requerimientos | Historial de requerimientos | El sistema deberá mantener el historial de requerimientos por fundo y lote | Admin, User | Alta |
| RF-059 | Requerimientos | Mensajes de validación | El sistema deberá mostrar mensajes de error si no hay stock suficiente | User | Media |
| RF-168 | Requerimientos | Screen 9 — Panel de Requerimientos (User) | El sistema deberá mostrar una pantalla (Screen 9) al User al hacer clic en Insectos benéficos desde Home, con dos botones (Nuevo Requerimiento, Historial de Requerimiento), una tabla de proyección mensual con columnas Sem, Papel con postura, Sobre con cascarilla, Total, y una barra de progreso consumo vs disponibilidad | User | Alta |
| RF-169 | Requerimientos | Botón Nuevo Requerimiento en Screen 9 | El sistema deberá mostrar un botón Nuevo Requerimiento en Screen 9 que redirija a Screen 10 (formulario de requerimiento) | User | Alta |
| RF-170 | Requerimientos | Botón Historial de Requerimiento en Screen 9 | El sistema deberá mostrar un botón Historial de Requerimiento en Screen 9 que redirija a Screen 12 (listado de requerimientos del usuario) | User | Alta |
| RF-171 | Requerimientos | Tabla de proyección mensual en Screen 9 | El sistema deberá mostrar en Screen 9 una tabla titulada "Proyección [mes] [año] — [cantidad base] millares" con columnas: Sem, Papel con postura, Sobre con cascarilla, Total (suma de papel y sobre), registrada por semana del mes actual | Admin, User | Alta |
| RF-172 | Requerimientos | Barra de progreso en Screen 9 | El sistema deberá mostrar en Screen 9 una barra de progreso que mida visualmente el consumo mensual vs la disponibilidad de productos | User | Alta |
| RF-173 | Requerimientos | Screen 10 — Formulario de Requerimiento | El sistema deberá mostrar un formulario (Screen 10) al hacer clic en Nuevo Requerimiento, con los campos de arriba abajo: Fecha (selector, default fecha actual), Fundo (desplegable), Lote (desplegable), Especie (desplegable), Etapa fenológica (desplegable), Cantidad (input numérico), Stock (etiqueta informativa con stock disponible), Plaga objetivo (desplegable), Observaciones (input multilinea), y un botón Foto al lado de Observaciones | User | Alta |
| RF-174 | Requerimientos | Botón Foto en Screen 10 | El sistema deberá mostrar un botón Foto al lado del campo Observaciones en Screen 10, que permita abrir la cámara del dispositivo y capturar hasta 2 fotografías, mostrando una vista previa en miniatura de cada foto capturada | User | Alta |
| RF-175 | Requerimientos | Botón Enviar Solicitud en Screen 10 | El sistema deberá mostrar un botón Enviar Solicitud en Screen 10, que al hacer clic valide que todos los campos obligatorios (excepto Observaciones) estén completos, guarde el requerimiento y muestre un mensaje de confirmación, redirigiendo luego a Screen 9 | User | Alta |
| RF-176 | Requerimientos | Visualización de stock en etiqueta de Screen 10 | El sistema deberá mostrar en la etiqueta Stock de Screen 10 la cantidad disponible del producto seleccionado, actualizada en tiempo real a medida que se registran requerimientos | User | Alta |
| RF-177 | Requerimientos | Descuento automático de stock al enviar | El sistema deberá descontar automáticamente la cantidad del requerimiento del stock disponible al confirmar el envío, evitando que se pueda superar el stock restante | System | Alta |
| RF-178 | Requerimientos | Bloqueo de requerimientos por stock cero | El sistema deberá impedir el registro de nuevos requerimientos cuando el stock disponible llegue a cero, mostrando un mensaje de stock agotado | System | Alta |
| RF-179 | Requerimientos | Screen 12 — Historial de Requerimientos | El sistema deberá mostrar una pantalla (Screen 12) al hacer clic en Historial de Requerimiento desde Screen 9, con un filtro de rango de fechas en la parte superior y una galería vertical con los requerimientos registrados por el usuario | User | Alta |
| RF-180 | Requerimientos | Galería de Screen 12 con botones Ver y Editar | El sistema deberá mostrar en la galería de Screen 12 registros con: fecha de requerimiento, especie, estado (como etiqueta), botón Ver y botón Editar (navega a Screen 13) | User | Alta |
| RF-181 | Requerimientos | Popup Ver detalle de requerimiento en Screen 12 | El sistema deberá mostrar un popup al hacer clic en Ver, con los datos del requerimiento: fecha, fundo, lote, especie, cantidad, plaga objetivo, fecha liberación y observaciones, más un botón para ocultar el popup | User | Alta |
| RF-182 | Requerimientos | Screen 13 — Edición de Requerimiento | El sistema deberá mostrar un formulario (Screen 13) al hacer clic en Editar desde Screen 12, con los mismos campos de Screen 10 pre-cargados con los datos del requerimiento, más los campos fecha y hora de liberación (auto-completados al tomar foto), un botón Foto habilitado y un botón Actualizar | User | Alta |
| RF-183 | Requerimientos | Botón Foto en Screen 13 | El sistema deberá habilitar el botón Foto en Screen 13 que al tomar la fotografía complete automáticamente los campos fecha de liberación y hora de liberación con los metadatos del sistema | User | Alta |
| RF-184 | Requerimientos | Botón Actualizar en Screen 13 | El sistema deberá mostrar un botón Actualizar en Screen 13 que al hacer clic guarde los cambios (incluyendo foto, fecha y hora de liberación), muestre una notificación de confirmación y redirija a Screen 12 | User | Alta |
| RF-185 | Requerimientos | Alerta de 30 horas sin foto de liberación | El sistema deberá mostrar una alerta permanente en Screen 13 si han transcurrido más de 30 horas desde que el estado cambió a Recibido sin haberse tomado la foto de liberación, con el texto: "Alerta: No se ingresó la información de la liberación, fecha de solicitud: [fecha]" | User | Alta |

## MOD-06 — DESPACHOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-060 | Despachos | Visualización de requerimientos pendientes | El sistema deberá mostrar a I+D los requerimientos pendientes de atención | Admin | Alta |
| RF-061 | Despachos | Validación de stock previo al despacho | El sistema deberá validar el stock disponible antes de confirmar el despacho | Admin | Alta |
| RF-062 | Despachos | Registro de despacho | El sistema deberá permitir registrar el despacho de productos a Sanidad | Admin | Alta |
| RF-063 | Despachos | Cantidad despachada por producto | El sistema deberá permitir registrar la cantidad efectivamente despachada | Admin | Alta |
| RF-064 | Despachos | Despacho parcial | El sistema deberá permitir despachar parcialmente un requerimiento | Admin | Alta |
| RF-065 | Despachos | Despacho total | El sistema deberá permitir despachar la totalidad del requerimiento | Admin | Alta |
| RF-066 | Despachos | Cambio de estado a despachado | El sistema deberá actualizar el estado del requerimiento al registrar el despacho | System | Alta |
| RF-067 | Despachos | Consulta de despachos realizados | El sistema deberá permitir visualizar el historial de despachos | Admin, User | Alta |
| RF-068 | Despachos | Detalle de despacho | El sistema deberá mostrar el detalle completo de un despacho | Admin, User | Alta |
| RF-069 | Despachos | Actualización de stock post-despacho | El sistema deberá descontar automáticamente del stock disponible al registrar un despacho | System | Alta |
| RF-070 | Despachos | Mensajes de validación | El sistema deberá mostrar mensajes de confirmación y error durante el despacho | Admin | Media |

## MOD-07 — VALIDACIÓN DE RECEPCIÓN

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-071 | Validación Recepción | Visualización de despachos pendientes de recepción | El sistema deberá mostrar a Sanidad los despachos pendientes de confirmar | User | Alta |
| RF-072 | Validación Recepción | Confirmación de recepción | El sistema deberá permitir a Sanidad confirmar la recepción del despacho | User | Alta |
| RF-073 | Validación Recepción | Fecha y hora de recepción | El sistema deberá registrar automáticamente la fecha y hora de confirmación | System | Alta |
| RF-074 | Validación Recepción | Registro de observaciones | El sistema deberá permitir registrar observaciones sobre la recepción | User | Media |
| RF-075 | Validación Recepción | Recepción conforme | El sistema deberá permitir marcar la recepción como conforme o con observaciones | User | Alta |
| RF-076 | Validación Recepción | Cambio de estado post-recepción | El sistema deberá actualizar el estado del despacho al confirmar la recepción | System | Alta |
| RF-077 | Validación Recepción | Consulta de recepciones | El sistema deberá permitir visualizar el historial de recepciones | Admin, User | Alta |
| RF-078 | Validación Recepción | Mensajes de validación | El sistema deberá mostrar mensajes de confirmación al recibir conforme | User | Media |

## MOD-08 — LIBERACIÓN EN CAMPO

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-079 | Liberación | Visualización de productos recibidos pendientes de liberar | El sistema deberá mostrar a Sanidad los productos recibidos pendientes de liberación en campo | User | Alta |
| RF-080 | Liberación | Registro de liberación | El sistema deberá permitir registrar la liberación de productos en campo | User | Alta |
| RF-081 | Liberación | Selección de fundo y lote de liberación | El sistema deberá permitir indicar el fundo y lote donde se libera el producto | User | Alta |
| RF-082 | Liberación | Captura fotográfica obligatoria | El sistema deberá requerir la captura de una fotografía como parte del registro de liberación | User | Alta |
| RF-083 | Liberación | Fecha y hora automática en foto | El sistema deberá registrar automáticamente la fecha y hora de la toma fotográfica como metadato | System | Alta |
| RF-084 | Liberación | Cantidad liberada | El sistema deberá permitir registrar la cantidad efectivamente liberada en campo | User | Alta |
| RF-085 | Liberación | Liberación total o parcial | El sistema deberá permitir liberar total o parcialmente los productos recibidos | User | Alta |
| RF-086 | Liberación | Cambio de estado post-liberación | El sistema deberá actualizar el estado del producto a Liberado | System | Alta |
| RF-087 | Liberación | Consulta de liberaciones | El sistema deberá permitir visualizar el historial de liberaciones realizadas | Admin, User | Alta |
| RF-088 | Liberación | Detalle de liberación | El sistema deberá mostrar el detalle de cada liberación incluyendo la fotografía asociada | Admin, User | Alta |
| RF-089 | Liberación | Múltiples liberaciones por recepción | El sistema deberá permitir registrar múltiples liberaciones para una misma recepción | User | Media |
| RF-090 | Liberación | Mensajes de validación | El sistema deberá mostrar mensajes de confirmación y error durante la liberación | User | Media |

## MOD-09 — EVIDENCIAS FOTOGRÁFICAS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-091 | Evidencias | Captura de fotografía | El sistema deberá permitir capturar fotografías desde el dispositivo móvil | User | Alta |
| RF-092 | Evidencias | Metadatos automáticos | El sistema deberá registrar automáticamente fecha, hora y usuario en cada fotografía | System | Alta |
| RF-093 | Evidencias | Asociación a liberación | El sistema deberá asociar la fotografía al registro de liberación correspondiente | User | Alta |
| RF-094 | Evidencias | Visualización de evidencias | El sistema deberá permitir visualizar las evidencias fotográficas registradas | Admin, User | Alta |
| RF-095 | Evidencias | Múltiples fotografías por liberación | El sistema deberá permitir capturar múltiples fotografías por cada liberación | User | Media |
| RF-096 | Evidencias | Validación de captura obligatoria | El sistema deberá impedir finalizar la liberación sin haber capturado al menos una fotografía | System | Alta |

## MOD-10 — DASHBOARD KPI

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-097 | Dashboard | Stock disponible actual | El sistema deberá mostrar el stock disponible actual de cada producto | Admin, User | Alta |
| RF-098 | Dashboard | Requerimientos por período | El sistema deberá mostrar la cantidad de requerimientos en un rango de fechas | Admin, User | Alta |
| RF-099 | Dashboard | Despachos vs requerimientos | El sistema deberá mostrar la comparativa entre lo requerido y lo despachado | Admin | Alta |
| RF-100 | Dashboard | Liberaciones por fundo y lote | El sistema deberá mostrar las liberaciones agrupadas por fundo y lote | Admin, User | Alta |
| RF-101 | Dashboard | Proyección vs consumo real | El sistema deberá mostrar la comparativa entre la proyección mensual y el consumo real | Admin | Alta |
| RF-102 | Dashboard | Indicadores por producto | El sistema deberá mostrar indicadores desglosados por tipo de producto | Admin, User | Alta |
| RF-103 | Dashboard | Filtros globales | El sistema deberá permitir filtrar indicadores por fecha, producto, fundo y lote | Admin, User | Alta |
| RF-104 | Dashboard | Gráficos operativos | El sistema deberá mostrar gráficos de barras, líneas y pastel para los indicadores principales | Admin | Alta |

## MOD-11 — REPORTES PDF

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-105 | Reportes | Reporte de stock semanal | El sistema deberá generar reporte PDF del stock semanal publicado | Admin | Alta |
| RF-106 | Reportes | Reporte de requerimientos | El sistema deberá generar reporte PDF de requerimientos por período | Admin | Alta |
| RF-107 | Reportes | Reporte de despachos | El sistema deberá generar reporte PDF de despachos realizados | Admin | Alta |
| RF-108 | Reportes | Reporte de liberaciones | El sistema deberá generar reporte PDF de liberaciones por fundo y lote | Admin, User | Alta |
| RF-109 | Reportes | Reporte de proyección vs consumo | El sistema deberá generar reporte PDF comparativo de proyección vs consumo real | Admin | Alta |
| RF-110 | Reportes | Exportación de reportes | El sistema deberá permitir la descarga de reportes PDF desde la plataforma web | Admin | Media |

## MOD-12 — AUDITORÍA

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-111 | Auditoría | Registro de eventos | El sistema deberá registrar eventos de creación, actualización y eliminación lógica | System | Alta |
| RF-112 | Auditoría | Información auditada | El sistema deberá registrar usuario, fecha, hora, módulo, acción y detalle | System | Alta |
| RF-113 | Auditoría | Consulta de auditoría | El sistema deberá permitir al administrador consultar el registro de auditoría | Admin | Alta |
| RF-114 | Auditoría | Trazabilidad por registro | El sistema deberá permitir visualizar el historial de cambios de un registro específico | Admin | Alta |

## MOD-13 — CATÁLOGOS

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-115 | Catálogos | Gestión de productos | El sistema deberá permitir administrar el catálogo de productos (Papel con postura, Sobre con cascarilla de arroz) | Admin | Alta |
| RF-116 | Catálogos | Gestión de fundos | El sistema deberá permitir administrar el catálogo de fundos | Admin | Alta |
| RF-117 | Catálogos | Gestión de lotes | El sistema deberá permitir administrar los lotes asociados a cada fundo | Admin | Alta |
| RF-118 | Catálogos | Gestión de tipos de insecto | El sistema deberá permitir administrar los tipos de insectos benéficos si aplica | Admin | Media |

## MOD-14 — CONFIGURACIÓN

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-119 | Configuración | Días de publicación | El sistema deberá permitir configurar los días de publicación de stock (lunes y jueves) | Admin | Alta |
| RF-120 | Configuración | Proyección base | El sistema deberá permitir configurar la proyección base mensual | Admin | Alta |
| RF-121 | Configuración | Límites de stock | El sistema deberá permitir configurar alertas de stock mínimo | Admin | Media |

## MOD-15 — MENÚ PRINCIPAL / HOME

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-122 | Home | Pantalla de inicio post-login | El sistema deberá mostrar una pantalla principal tras la autenticación exitosa | Admin, User | Alta |
| RF-123 | Home | Botón Insectos benéficos | El sistema deberá mostrar un botón de acceso al módulo de insectos benéficos con imagen referencial | Admin, User | Alta |
| RF-124 | Home | Botón Evaluación de nematodos | El sistema deberá mostrar un botón de acceso al módulo de evaluación de nematodos con imagen referencial | Admin, User | Alta |
| RF-125 | Home | Navegación a Insectos benéficos | El sistema deberá redirigir al flujo operativo al presionar el botón Insectos benéficos | Admin, User | Alta |
| RF-126 | Home | Placeholder Evaluación de nematodos | El botón Evaluación de nematodos no deberá navegar a ninguna pantalla (placeholder futuro) | Admin, User | Alta |
| RF-127 | Home | Visualización de proyecciones en Home | El sistema deberá mostrar un texto informativo con las proyecciones mensuales de productos en la pantalla principal | Admin, User | Alta |
| RF-128 | Home | Redirección por rol en Insectos benéficos | El botón Insectos benéficos debe redirigir según el rol: Admin (I+D) a Screen 3 (Panel Programación), User (Sanidad) a Screen 9 (Panel Requerimientos) | Admin, User | Alta |

## MOD-17 — PROGRAMACIÓN DE STOCK

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-129 | Programación | Pantalla de programación | El sistema deberá mostrar una pantalla con botones Programación y Solicitud de Requerimiento, tabla de proyección del mes y barra de progreso | Admin | Alta |
| RF-130 | Programación | Botón Programación | El sistema deberá mostrar un botón para acceder a la gestión de programación semanal de stock | Admin | Alta |
| RF-131 | Programación | Botón Solicitud de Requerimiento | El sistema deberá mostrar un botón para acceder al listado de solicitudes registradas por Sanidad | Admin | Alta |
| RF-132 | Programación | Indicador de notificación de solicitudes | El sistema deberá mostrar un indicador numérico junto al botón Solicitud de Requerimiento con la cantidad de solicitudes pendientes | Admin | Alta |
| RF-133 | Programación | Tabla de proyección del mes | El sistema deberá mostrar una tabla con columnas: Semana, Papel con postura, Sobre con cascarilla, Total | Admin, User | Alta |
| RF-134 | Programación | Cálculo de columna Total | El sistema deberá calcular automáticamente la columna Total como la suma de Papel con postura + Sobre con cascarilla | System | Alta |
| RF-135 | Programación | Actualización automática de tabla | El sistema deberá actualizar automáticamente la tabla de proyección al registrar una programación | System | Alta |
| RF-136 | Programación | Barra de progreso consumo vs disponibilidad | El sistema deberá mostrar una barra de progreso que mida visualmente el consumo mensual sobre la disponibilidad de productos | Admin | Alta |
| RF-137 | Programación | Notificación por correo al programar | El sistema deberá enviar un correo electrónico a los usuarios de Sanidad al registrar una programación con las cantidades disponibles | System | Alta |
| RF-138 | Programación | Selector de rango de fechas | El sistema deberá permitir seleccionar un rango de fechas para filtrar programaciones | Admin | Alta |
| RF-139 | Programación | Galería vertical de registros | El sistema deberá mostrar una galería vertical con los registros de programación, cada uno con: fecha, mes, cantidad total del mes y botones Ver/Editar | Admin | Alta |
| RF-140 | Programación | Modal de visualización (Ver) | El sistema deberá mostrar una vista emergente con los registros programados del mes al hacer clic en Ver | Admin | Alta |
| RF-141 | Programación | Pantalla de edición (Editar) | El sistema deberá mostrar una pantalla de edición con filtro de mes, filtro de especie y tabla de proyección final | Admin | Alta |
| RF-142 | Programación | Filtro de mes en edición | El sistema deberá permitir seleccionar el mes a editar mediante un filtro | Admin | Alta |
| RF-143 | Programación | Filtro de especie en edición | El sistema deberá permitir seleccionar la especie de insecto benéfico a editar | Admin | Alta |
| RF-144 | Programación | Tabla de proyección final editable | El sistema deberá mostrar una tabla editable con las mismas columnas (Semana, Papel con postura, Sobre con cascarilla, Total) al seleccionar un mes | Admin | Alta |
| RF-145 | Programación | Botón Enviar stock | El sistema deberá mostrar un botón para confirmar y enviar la programación de stock editada | Admin | Alta |
| RF-146 | Programación | Notificación por correo al enviar stock | El sistema deberá enviar un correo electrónico a los usuarios de Sanidad al hacer clic en Enviar stock, notificando los cambios | System | Alta |
| RF-147 | Programación | Validación de días de edición | El sistema deberá permitir la edición de programación únicamente los días lunes y jueves | System | Alta |
| RF-148 | Programación | Validación de horario de edición | El sistema deberá permitir la edición de programación únicamente entre las 00:00 y 23:59 horas de los días permitidos | System | Alta |

## MOD-18 — SOLICITUDES DE REQUERIMIENTO

| Código | Módulo | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|---|
| RF-149 | Solicitudes | Screen 6 — Panel de Solicitudes | El sistema deberá mostrar una pantalla (Screen 6) con la misma estructura de Screen 3 (tabla de proyección del mes y barra de progreso), pero enfocada exclusivamente en Solicitud de Requerimiento como único botón de acceso | Admin | Alta |
| RF-150 | Solicitudes | Acceso a Screen 6 | El sistema deberá permitir al Admin acceder a Screen 6 desde el Botón 02 (Solicitud de Requerimiento) de Screen 3 | Admin | Alta |
| RF-151 | Solicitudes | Botón Solicitud de Requerimiento en Screen 6 | El sistema deberá mostrar un botón Solicitud de Requerimiento en Screen 6 con indicador numérico de solicitudes pendientes | Admin | Alta |
| RF-152 | Solicitudes | Screen 7 — Listado de Solicitudes | El sistema deberá mostrar una pantalla (Screen 7) con un filtro de rango de fechas en la parte superior y una galería vertical de registros debajo, al hacer clic en Solicitud de Requerimiento | Admin | Alta |
| RF-153 | Solicitudes | Filtro de rango de fechas en Screen 7 | El sistema deberá permitir seleccionar un rango de fechas para filtrar las solicitudes mostradas en la galería | Admin | Alta |
| RF-154 | Solicitudes | Galería de solicitudes en Screen 7 | El sistema deberá mostrar una galería vertical con registros de solicitud que incluyan: fecha de solicitud, especie y estado, con el color correspondiente según la tabla de estados definida | Admin | Alta |
| RF-155 | Solicitudes | Visualización de colores por estado | El sistema deberá mostrar el estado de cada solicitud con el color correspondiente: Registrado (#9E9E9E), Pendiente (#FFC107), Aprobado (#4CAF50), Entregado (#2196F3), Recibido (#009688), Liberado (#9C27B0) | Admin | Alta |
| RF-156 | Solicitudes | Botón Nuevo en Screen 7 | El sistema deberá mostrar un botón Nuevo en Screen 7 que redirija a Screen 8 en modo creación | Admin | Alta |
| RF-157 | Solicitudes | Botón Editar en Screen 7 | El sistema deberá mostrar un botón Editar por cada registro en la galería de Screen 7 que redirija a Screen 8 en modo edición | Admin | Alta |
| RF-158 | Solicitudes | Screen 8 — Formulario de Solicitud | El sistema deberá mostrar un formulario (Screen 8) con los siguientes campos de arriba abajo: Fecha (selector), Fundo (desplegable), Lote (desplegable), Especie (desplegable), Cantidad plaga (input), Objetivo (desplegable), Estado (desplegable: Aprobado, Entregado), Fecha de liberación (selector), Hora de liberación (selector), Observaciones (input multilinea) | Admin | Alta |
| RF-159 | Solicitudes | Subtítulo Presentaciones entregadas | El sistema deberá mostrar debajo del campo Observaciones un subtítulo "Presentaciones entregadas" con los campos: Papel con postura (input número) y Sobre con cascarilla de arroz (input número) | Admin | Alta |
| RF-160 | Solicitudes | Botón PDF junto a Estado | El sistema deberá mostrar un botón con icono de PDF al lado del selector de Estado, que al hacer clic abra un popup para capturar una foto del acta | Admin | Alta |
| RF-161 | Solicitudes | Popup de captura de acta PDF | El sistema deberá mostrar un panel emergente (popup) al hacer clic en el botón PDF, permitiendo tomar una fotografía del acta, y al confirmar mostrar una vista previa de la imagen capturada | Admin | Media |
| RF-162 | Solicitudes | Deshabilitar papel/sobre en creación | El sistema deberá mantener deshabilitados los campos Papel con postura y Sobre con cascarilla de arroz al crear una nueva solicitud (Nuevo) | System | Alta |
| RF-163 | Solicitudes | Modo edición — solo cambio de estado | El sistema deberá permitir en modo edición únicamente la modificación del campo Estado, manteniendo los demás campos bloqueados | Admin | Alta |
| RF-164 | Solicitudes | Habilitar papel/sobre cuando estado = Entregado | El sistema deberá habilitar los campos Papel con postura y Sobre con cascarilla de arroz únicamente cuando el Estado seleccionado sea Entregado, y será obligatorio registrar ambos valores | Admin | Alta |
| RF-165 | Solicitudes | Validación papel+sobre = cantidad plaga | El sistema deberá validar que la suma de Papel con postura + Sobre con cascarilla de arroz sea exactamente igual a la Cantidad plaga registrada; solo cuando se cumpla esta condición se habilitará el botón Guardar | System | Alta |
| RF-166 | Solicitudes | Notificación por correo al cambiar a Entregado | El sistema deberá enviar una notificación por correo electrónico a los perfiles User (Sanidad) cuando el estado de una solicitud cambie de Aprobado a Entregado | System | Alta |
| RF-167 | Solicitudes | Guardar y retornar a Screen 7 | El sistema deberá guardar la solicitud al hacer clic en Guardar (habilitado solo si se cumple la validación) y redirigir a Screen 7, actualizando la galería con los cambios de estado | Admin | Alta |

---

# 9. Reglas de Negocio

| Código | Regla | Módulo |
|---|---|---|
| RN-001 | Solo los usuarios con rol ADMIN del área I+D pueden publicar y gestionar stock | Publicación Stock |
| RN-002 | Solo los usuarios con rol USER del área Sanidad pueden registrar requerimientos y liberaciones | Requerimientos / Liberación |
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
| RN-015 | El botón Insectos benéficos en el Menú Principal solo está disponible para usuarios con rol ADMIN | Home |
| RN-016 | La edición de la programación de stock solo está permitida los días lunes y jueves | Programación |
| RN-017 | La edición de la programación de stock solo está permitida en el horario de 00:00 a 23:59 horas de los días hábiles | Programación |
| RN-018 | Al registrar o enviar una programación, el sistema debe notificar por correo electrónico a todos los usuarios de Sanidad | Programación |
| RN-019 | La columna Total de la tabla de proyección debe calcularse automáticamente como la suma de ambos productos | Programación |
| RN-020 | La tabla de proyección debe actualizarse automáticamente ante cualquier cambio en la programación | Programación |
| RN-021 | La solicitud de requerimiento debe manejar los siguientes estados en orden secuencial: Registrado → Pendiente → Aprobado → Entregado → Recibido → Liberado | Solicitudes |
| RN-022 | Cada estado de solicitud debe representarse con el color asignado: Registrado (#9E9E9E), Pendiente (#FFC107), Aprobado (#4CAF50), Entregado (#2196F3), Recibido (#009688), Liberado (#9C27B0) | Solicitudes |
| RN-023 | Al crear una nueva solicitud, los campos Papel con postura y Sobre con cascarilla de arroz deben permanecer deshabilitados | Solicitudes |
| RN-024 | En modo edición, solo el campo Estado debe estar habilitado para modificación; el resto de campos deben permanecer bloqueados | Solicitudes |
| RN-025 | Los campos Papel con postura y Sobre con cascarilla de arroz solo se habilitan cuando el Estado es Entregado, y su registro es obligatorio | Solicitudes |
| RN-026 | La suma de Papel con postura + Sobre con cascarilla de arroz debe ser exactamente igual a la Cantidad plaga para habilitar el botón Guardar | Solicitudes |
| RN-027 | El sistema debe enviar una notificación por correo electrónico al usuario solicitante (Sanidad) cuando Admin registre un cambio de estado en su solicitud | Solicitudes |
| RN-028 | La captura de acta PDF mediante el botón PDF debe abrir un popup que permita tomar una fotografía y mostrar una vista previa antes de confirmar | Solicitudes |
| RN-029 | El campo Stock en Screen 10 debe mostrar en tiempo real el stock disponible del producto seleccionado, calculado como stock total menos requerimientos ya registrados | Requerimientos |
| RN-030 | Al enviar un requerimiento en Screen 10, el sistema debe descontar automáticamente la cantidad solicitada del stock disponible del producto | Requerimientos |
| RN-031 | No se permite registrar un requerimiento si la cantidad solicitada supera el stock disponible del producto | Requerimientos |
| RN-032 | Cuando el stock disponible llegue a cero, el sistema debe bloquear el registro de nuevos requerimientos y mostrar mensaje "Stock agotado" | Requerimientos |
| RN-033 | El botón Foto en Screen 10 debe permitir capturar hasta 2 fotografías por requerimiento, mostrando vista previa en miniatura de cada una | Requerimientos |
| RN-034 | Las fotografías capturadas desde Screen 10 deben quedar asociadas al requerimiento como evidencia | Requerimientos |
| RN-035 | Si han transcurrido más de 30 horas desde que el estado de un requerimiento cambió a Recibido sin haberse tomado la foto de liberación, Screen 13 debe mostrar una alerta permanente | Requerimientos |
| RN-036 | La fecha y hora de liberación en Screen 13 deben auto-completarse con los metadatos del sistema al momento de tomar la fotografía de liberación | Requerimientos |

---

# 10. Requerimientos No Funcionales

| Código | Nombre | Descripción | Prioridad |
|---|---|---|---|
| RNF-001 | Seguridad | La autenticación debe realizarse mediante Microsoft Identity con JWT | Alta |
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
| Requerimiento | Solicitud de productos realizada por Sanidad |
| DetalleRequerimiento | Producto, cantidad y destino por requerimiento |
| Despacho | Entrega de productos de I+D a Sanidad |
| Recepcion | Confirmación de recepción del despacho por Sanidad |
| Liberacion | Registro de liberación en campo con evidencia fotográfica |
| EvidenciaFotografica | Fotografía asociada a una liberación con metadatos |
| Fundo | Unidad agrícola destino de los productos |
| Lote | Subdivisión del fundo |
| Auditoria | Registro de trazabilidad de eventos |
| Programacion | Programación semanal de stock por mes, producto y especie |
| DetalleProgramacion | Detalle por semana de las cantidades programadas de cada producto |
| Solicitud | Solicitud de requerimiento de insectos benéficos gestionada por I+D, con gestión de estados (Registrado → Pendiente → Aprobado → Entregado → Recibido → Liberado), cantidades por presentación y captura de acta PDF |
| DetalleSolicitud | Detalle de presentaciones entregadas (Papel con postura, Sobre con cascarilla de arroz) asociadas a una solicitud en estado Entregado |
| ActaSolicitud | Evidencia fotográfica del acta asociada a una solicitud, capturada mediante el botón PDF en Screen 8 |
| FotoRequerimiento | Fotografía capturada desde Screen 10 como evidencia del requerimiento, hasta 2 por requerimiento |

---

# 12. Flujos Operativos

## Flujo General de Navegación

```
[Inicio]
    │
    ▼
┌─────────────────────────────────────┐
│ Login Microsoft                     │
│ - Correo corporativo + contraseña   │
│ - Validación token + tenant         │
│ - Asignación de rol (Admin/User)    │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ Menú Principal (Home)               │
│ - Texto informativo: proyecciones   │
│ ┌────────────────┐┌──────────────┐ │
│ │ Insectos       ││ Evaluación   │ │
│ │ benéficos      ││ nematodos    │ │
│ │ 🐞 (imagen)    ││ 🔬 (imagen)  │ │
│ │ ✅ Habilitado  ││ ❌ Placeholder│ │
│ └────────────────┘└──────────────┘ │
└──────────────┬──────────────────────┘
                ▼
          ┌─────┴─────┐
          │           │
          ▼           ▼
┌────────────────────────────┐  ┌──────────────────────────────┐
│ Rol: Admin (I+D)           │  │ Rol: User (Sanidad)           │
└────────────┬───────────────┘  └──────────────┬───────────────┘
             │                                  │
             ▼                                  ▼
┌──────────────────────────────────┐  ┌──────────────────────────────┐
│ Screen 3 — Panel Programación   │  │ Screen 9 — Panel             │
│                                 │  │ Requerimientos (User)        │
│  ┌──────────┐ ┌────────────┐   │  │                              │
│  │Programac │ │Solic. Req. │🔢│  │  ┌──────────┐ ┌──────────┐   │
│  └──────────┘ └────────────┘   │  │  │Nuevo Req │ │Historial │   │
│                                │  │  └──────────┘ └──────────┘   │
│  ┌────────────────────────┐   │  │                              │
│  │ Tabla Proyección       │   │  │  ┌──────────────────────┐    │
│  │ Sem│Papel│Sobre│Total  │   │  │  │Proyección mayo       │    │
│  ├────────────────────────┤   │  │  │ 5,000 millares       │    │
│  │ ██████████████░░ 60%   │   │  │  │Sem│Pap│Sob│Tot       │    │
│  └────────────────────────┘   │  │  ├──────────────────────┤    │
└──────────────┬─────────────────┘  │  │ ████████████░░ 65%   │    │
               │                    │  └──────────────────────┘    │
      ┌────────┴────────┐           └──────────────┬───────────────┘
      ▼                 ▼                           │
┌──────────┐  ┌──────────────────┐                  ▼
│ Screen 4 │  │ Screen 6 — Panel │  ┌──────────────────────────────┐
│Prog.List │  │ Solicitudes      │  │ Screen 10 — Formulario       │
└────┬─────┘  │ (desde Botón 02) │  │ Nuevo Requerimiento          │
     │        │                  │  │                              │
  ┌──┴──┐     │  ┌────────────┐ │  │  · Fecha         [📅]       │
  ▼     ▼     │  │Solic.Req   │🔢│  │  · Fundo         [▼]        │
┌───┐ ┌────┐  │  └────────────┘ │  │  · Lote          [▼]        │
│Ver│ │Scr │  │  ┌────────────┐ │  │  · Especie       [▼]        │
│Mod│ │5   │  │  │Proy. Tabla │ │  │  · Etapa fenol.  [▼]        │
└───┘ └────┘  │  └────────────┘ │  │  · Cantidad      [___]      │
               └────────┬───────┘  │  · Stock         [5000]     │
                        ▼          │  · Plaga objetivo [▼]       │
                  ┌──────────┐     │  · Obs     [___]  [📷 Foto] │
                  │ Screen 7 │     │                              │
                  │ Listado  │     │          [Enviar Solicitud]  │
                  └────┬─────┘     └──────────────────────────────┘
                       ▼
                  ┌──────────┐
                  │ Screen 8 │
                  │ Formul.  │
                  └──────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌──────────────┐  ┌──────────────────────────────┐
│ Screen 4     │  │ Screen 6 — Panel Solicitudes │
│ Programación │  │ (desde Botón 02 de Screen 3) │
│ Listado      │  │                              │
└──────┬───────┘  │                              │
       │          │  ┌──────────────────────┐    │
    ┌──┴──┐       │  │ Solic. Requerimiento │ 🔢 │
    ▼     ▼       │  └──────────────────────┘    │
┌─────┐ ┌──────┐  │  ┌──────────────────────┐    │
│ Ver │ │Screen│  │  │ Tabla Proyección     │    │
│Modal│ │ 5    │  │  │ Sem│Pap│Sob│Tot       │    │
│     │ │Edit  │  │  ├──────────────────────┤    │
│     │ │Stock │  │  │ ████████████░░ 60%   │    │
│     │ └──────┘  │  └──────────────────────┘    │
│     │           └──────────────┬───────────────┘
└─────┘                          ▼
                     ┌──────────────────────────────┐
                     │ Screen 7 — Listado           │
                     │ Solicitudes de Requerimiento │
                     │                              │
                     │  [Rango de fechas  ▼]        │
                     │                              │
                     │  ┌────────────────────────┐  │
                     │  │ 2026-05-22 │ Especie A │  │
                     │  │ Estado: ● Aprobado    │  │
                     │  │               [Editar] │  │
                     │  ├────────────────────────┤  │
                     │  │ 2026-05-21 │ Especie B │  │
                     │  │ Estado: ● Pendiente   │  │
                     │  │               [Editar] │  │
                     │  └────────────────────────┘  │
                     │                              │
                     │           [ + Nuevo ]        │
                     └──────────────┬───────────────┘
                                    │
                          ┌─────────┴─────────┐
                          ▼                   ▼
                    ┌─────────────────────────────────┐
                    │ Screen 8 — Formulario Solicitud │
                    │ (Nuevo / Editar)                │
                    │                                 │
                    │  · Fecha            [📅]        │
                    │  · Fundo            [▼]         │
                    │  · Lote             [▼]         │
                    │  · Especie          [▼]         │
                    │  · Cantidad plaga   [___]       │
                    │  · Objetivo         [▼]         │
                    │  · Estado    [▼]  [📄 PDF]     │
                    │  · Fecha liberac.   [📅]        │
                    │  · Hora liberac.    [🕐]        │
                    │  · Observaciones    [___]       │
                    │                                 │
                    │  Presentaciones entregadas:     │
                    │  · Papel postura    [___]       │
                    │  · Sobre cascarilla [___]       │
                    │                                 │
                    │         [💾 Guardar]            │
                    └─────────────────────────────────┘
                                    │
                          (Guardar → retorna a Screen 7,
                           galería actualizada)

---
               │
               ▼
┌─────────────────────────────────────┐
│ 1. Publicación de Stock (I+D)       │  Lunes y Jueves
│    - Producto                        │
│    - Cantidad en millares            │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 2. Requerimiento (Sanidad)          │
│    - Fundo + Lote                    │
│    - Producto + Cantidad            │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 3. Despacho (I+D)                   │
│    - Validar stock                   │
│    - Registrar entrega               │
│    - Descontar stock                 │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 4. Validación de Recepción (Sanidad)│
│    - Confirmar recepción conforme    │
│    - Observaciones (opcional)        │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ 5. Liberación en Campo (Sanidad)    │
│    - Fundo + Lote destino           │
│    - Captura fotográfica             │
│    - Fecha/hora automática           │
└──────────────┬──────────────────────┘
               ▼
             [Fin]
```

---

## Especificación de Pantallas — Screens 6, 7 y 8

### Screen 6 — Panel de Solicitudes de Requerimiento

**Acceso:**
- desde Botón 02 (Solicitud de Requerimiento) en Screen 3 (exclusivo Admin I+D)

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
- Barra de progreso consumo vs disponibilidad

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

### Screen 9 — Panel de Requerimientos (User)

**Acceso:** desde Menú Principal (Home) al hacer clic en Insectos benéficos, exclusivo para rol User (Sanidad)

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
- Botón **Historial de Requerimiento** → placeholder (pendiente de definir)
- Tabla **Proyección [mes] [año] — [cantidad base] millares** con columnas: Sem, Papel con postura, Sobre con cascarilla, Total (suma automática)
- Barra de progreso consumo mensual vs disponibilidad

---

### Screen 10 — Formulario de Nuevo Requerimiento (User)

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

### Screen 12 — Historial de Requerimientos (User)

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
  - Botón **Editar** → pendiente de definir

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
- Cuando Admin registre un cambio de estado en la solicitud (desde Screens 7→8), el sistema debe enviar un correo electrónico al usuario (Sanidad) que realizó el requerimiento original, informando el nuevo estado

---

### Screen 13 — Edición de Requerimiento (User)

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

# 13. Reportes

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

# 14. Consideraciones Técnicas

- El sistema debe implementar optimistic locking para evitar conflictos de concurrencia.
- Las fotografías deben almacenarse en filesystem con compresión automática server-side.
- La proyección base mensual (5,000 millares) debe ser configurable por administrador.
- Los días de publicación (lunes y jueves) deben ser configurables.
- Los metadatos de las fotografías (fecha, hora) deben tomarse del dispositivo al momento de la captura y no deben ser editables por el usuario.
- El sistema debe manejar timezone America/Lima (UTC -5).
- La edición de programación debe restringirse a días lunes y jueves en horario 00:00-23:59 (configurable).
- El sistema debe integrar un servicio de envío de correos electrónicos (SMTP) para notificar a los usuarios de Sanidad.
- La tabla de proyección del mes debe recalcularse automáticamente ante cualquier cambio en la programación.
- La barra de progreso debe reflejar en tiempo real la relación entre el consumo mensual y la disponibilidad total.

---

# 15. Pendientes Funcionales

| # | Pendiente | Estado |
|---|---|---|

---

# 16. Anexos

| Anexo | Descripción |
|---|---|
