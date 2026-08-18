# Perfil de Desarrollo y Conocimiento

---

# Proyecto

## Sistema de Control de Entrega de Insectos Benéficos

Desarrollo de una aplicación móvil empresarial orientada al control, monitoreo, trazabilidad y gestión operativa del ciclo de entrega de insectos benéficos dentro de entornos agrícolas (fundos y lotes).

El sistema digitaliza el ciclo completo (publicación de stock semanal → requerimiento → despacho → validación de recepción → liberación en campo con evidencia fotográfica), reemplazando el proceso manual en Excel y las validaciones por WhatsApp.

El sistema está diseñado para optimizar:

- publicación y gestión de stock semanal de insectos benéficos (papel con postura / sobre con cascarilla de arroz)
- proyección mensual base (5,000 millares) y adicionales del mes
- trazabilidad de requerimientos por fundo y lote
- control de despachos y validación de recepción
- liberación en campo con evidencias fotográficas y metadatos automáticos
- gestión de programaciones con restricción de días/horario (lunes y jueves)
- control de usuarios y permisos (admin i+d / user sanidad)
- indicadores, reportes y disponibilidad de información en tiempo real

La solución contempla arquitectura moderna mobile/backend desacoplada, autenticación local con JWT, seguridad empresarial, escalabilidad y despliegue contenerizado.

---

# Rol

## Arquitecto y Desarrollador Full Stack Senior Mobile/Web

Profesional especializado en el diseño, arquitectura, implementación y despliegue de soluciones empresariales multiplataforma orientadas a aplicaciones móviles Android y plataformas web modernas.

Responsable del desarrollo integral del sistema de control de entrega de insectos benéficos, incluyendo:

- arquitectura técnica
- backend empresarial
- aplicación móvil Android
- infraestructura Docker
- seguridad
- autenticación local JWT contra tabla de usuarios
- base de datos
- documentación técnica
- despliegue y mantenimiento

---

# Objetivos Técnicos del Proyecto

- Desarrollar una aplicación Android robusta y escalable.
- Centralizar el ciclo operativo de entrega de insectos benéficos (stock → requerimiento → despacho → recepción → liberación).
- Garantizar trazabilidad completa de operaciones por fundo, lote y producto.
- Implementar autenticación segura mediante JWT con tabla de usuarios local y super admin.
- Mantener arquitectura desacoplada y mantenible.
- Permitir crecimiento modular futuro (ej. módulo de evaluación de nematodos).
- Facilitar auditoría y monitoreo operativo.
- Optimizar rendimiento y estabilidad mobile.

---

# Stack Tecnológico Principal

| Área | Tecnología | Nivel |
|---|---|---|
| Mobile Frontend | React Native | Experto |
| Frontend Web Administrativo | React 18 + Vite | Experto |
| UI Mobile/Web | Material Design 3 | Experto |
| Componentes UI | Material UI (MUI) | Experto |
| Navegación Mobile | React Navigation | Avanzado |
| Estado Global | Redux Toolkit / Context API | Experto |
| Formularios | React Hook Form + Zod | Avanzado |
| Backend | Quarkus Java | Experto |
| ORM | Hibernate ORM / Panache | Experto |
| Base de Datos | PostgreSQL | Experto |
| Migraciones | Flyway | Experto |
| APIs | RESTful APIs | Experto |
| Documentación APIs | OpenAPI / Swagger | Avanzado |
| Seguridad | JWT Access + Refresh Token | Experto |
| Autenticación | Local (tabla de usuarios + super admin, email/contraseña) | Experto |
| Reportes | iText PDF | Avanzado |
| Gráficos Web | Recharts | Avanzado |
| Almacenamiento | Filesystem + rutas en BD (fotografías) | Avanzado |
| Notificaciones | Correo electrónico SMTP | Avanzado |
| Contenedorización | Docker | Experto |
| Orquestación Local | Docker Compose | Experto |
| Reverse Proxy | Nginx | Avanzado |
| CI/CD | GitHub Actions | Avanzado |
| Control Versiones | Git / GitHub | Experto |
| Testing Backend | JUnit / Mockito | Avanzado |
| Testing Frontend | Jest / React Native Testing Library | Avanzado |
| Logs | Quarkus Logging / JSON Logging | Avanzado |
| Observabilidad | Prometheus / Grafana | Intermedio |
| Monitoreo | Health Checks / Metrics | Avanzado |
| Arquitectura | Clean Architecture | Experto |
| Patrones | SOLID / DRY / KISS | Experto |

---

# Arquitectura del Proyecto

## Arquitectura Mobile Frontend

- Arquitectura modular basada en features y screens del flujo operativo (Home, Programación, Solicitudes, Requerimientos, Historial).
- Separación entre:
  - UI
  - lógica de negocio
  - servicios
  - estado global
  - acceso HTTP
- Componentes reutilizables y desacoplados.
- Material Design 3 como estándar visual principal.
- Navegación estructurada por módulos con redirección por rol (admin i+d / user sanidad).
- Manejo centralizado de errores.
- Validaciones frontend y backend.
- Captura de evidencias fotográficas (requerimiento y acta PDF) con metadatos automáticos no editables.

---

## Arquitectura Backend

- Arquitectura por capas:
  - Controller
  - Service
  - Repository
  - DTO
  - Mapper
- APIs REST desacopladas.
- Backend orientado a dominio.
- Seguridad stateless basada en JWT.
- APIs versionadas.
- Auditoría transversal.
- Soft delete.
- Optimistic Locking.
- Manejo global de excepciones.
- Validaciones centralizadas.

---

# Funcionalidades Base del Sistema

## Gestión Operativa (Ciclo de Entrega de Insectos Benéficos)

- Publicación de stock semanal (papel con postura y sobre con cascarilla de arroz), solo lunes y jueves.
- Proyección mensual base (5,000 millares) con adicionales del mes.
- Programación semanal por mes, especie y estado (EN_PROCESO / PUBLICADO), con remanente entre semanas.
- Requerimientos de Sanidad por fundo y lote, con control de stock en tiempo real y descuento automático.
- Gestión de solicitudes de requerimiento por I+D con estados: Registrado → Pendiente → Aprobado → Entregado → Recibido → Liberado.
- Control de presentaciones entregadas (papel con postura + sobre con cascarilla = cantidad plaga).
- Despachos y validación de recepción.
- Liberación en campo con evidencias fotográficas y metadatos automáticos.
- Catálogos: fundos, lotes, productos, tipos de insecto, etapas fenológicas, plagas objetivo.
- Dashboard KPI y reportes PDF.

---

## Seguridad y Usuarios

- Login local (email + contraseña) contra tabla de usuarios.
- JWT Authentication (Access + Refresh Token).
- Usuario super admin por defecto (migración) para primer acceso.
- Roles: admin (i+d) y user (sanidad).
- Control de acceso RBAC.
- Auditoría de sesiones.
- Registro de actividad de usuarios.

---

## Monitoreo y Auditoría

- Logs operativos.
- Historial de cambios.
- Registro de eventos críticos.
- Seguimiento de acciones administrativas.
- Métricas operativas.

---

# Seguridad

## Autenticación

- JWT Access Token.
- Refresh Token.
- Autenticación local contra tabla de usuarios.
- Login por email + contraseña.
- Usuario super admin por defecto.
- Roles y permisos RBAC (admin i+d / user sanidad).
- Bloqueo de acceso a usuarios no registrados, inactivos o sin permisos.
- Revocación de sesiones al deshabilitar un usuario.

---

## Seguridad Backend

- Protección contra:
  - SQL Injection
  - XSS
  - CSRF
  - Broken Authentication
- Sanitización de datos.
- Headers HTTP seguros.
- CORS configurado.
- Logging de seguridad.
- Rate limiting preparado.

---

# Infraestructura y DevOps

## Contenedorización

- Docker para todos los servicios.
- Docker Compose para ambientes locales.
- Ambientes separados:
  - development
  - staging
  - production

---

## Despliegue

- CI/CD automatizado.
- GitHub Actions.
- Build automatizado.
- Versionamiento semántico.
- Estrategia GitFlow.
- Deploy reproducible.

---

## Infraestructura Linux

- VPS Linux.
- Reverse Proxy Nginx.
- HTTPS SSL/TLS.
- Variables de entorno seguras.
- Gestión de secretos.
- Backups automatizados.

---

# Base de Datos

## PostgreSQL

- Diseño relacional normalizado orientado al dominio: Usuario, Producto, StockSemanal, ProyeccionMensual, Programacion / DetalleProgramacion, Requerimiento, Solicitud / DetalleSolicitud / ActaSolicitud, Despacho, Recepcion, Liberacion, EvidenciaFotografica, Fundo, Lote, Catálogos y Auditoria.
- Índices optimizados.
- Relaciones eficientes.
- Constraints correctamente definidos.
- Migraciones con Flyway.
- Auditoría de cambios.
- Soft delete.
- Optimización de consultas.

---

# Calidad y Testing

## Backend

- Unit Testing.
- Integration Testing.
- Mocking.
- Cobertura mínima recomendada >80%.

---

## Frontend

- Testing de componentes.
- Validación de flujos críticos.
- Manejo de estados y navegación.
- Validación de formularios.

---

# Observabilidad y Monitoreo

- Logs estructurados JSON.
- Métricas de aplicación.
- Health checks.
- Monitoreo con Prometheus/Grafana.
- Registro centralizado de errores.
- Trazabilidad de requests.

---

# Metodología de Trabajo

## SDD — Specification Driven Development

El desarrollo está guiado por especificaciones técnicas y funcionales detalladas, garantizando trazabilidad completa entre requerimientos, diseño, implementación y pruebas.

---

## Hitos de Desarrollo (Milestones)

El avance del proyecto se registra mediante **hitos de desarrollo** en `docs_implementacion/_sdd/` (documentos `04_implementacion.md` y `05_hito_NNN.md` cuando sea aplicable). La especificación funcional se mantiene en `docs_implementacion/_sdd/01_especificacion.md` y la transcripción del negocio en `docs_implementacion/transcripcion.md`.

### Propósito

- Establecer puntos de control funcionales y operativos validados.
- Permitir retomar el desarrollo en sesiones futuras sin necesidad de re-validar módulos completados.
- Servir como documentación viva del estado del proyecto para cualquier desarrollador que se incorpore.

### Formato

Cada hito documenta:

| Elemento | Descripción |
|---|---|
| Hito ID | Identificador único (ej: HDT-001) |
| Fecha | Fecha de validación |
| Estado | Validado / Funcional / Operativo |
| Módulos Validados | Lista de módulos funcionales verificados (MOD-01…MOD-18) |
| Decisiones Técnicas | Decisiones arquitectónicas adoptadas |
| Pendientes | Próximos módulos a desarrollar |
| Instrucciones de Retorno | Pasos para retomar el desarrollo desde este punto |

### Reglas

1. Un módulo no se marca como validado hasta que su CRUD y reglas de negocio estén operativos en backend + frontend.
2. Una vez validado, no se modifica a menos que un requerimiento explícito lo exija.
3. Cada nuevo grupo de módulos genera un nuevo hito (`05_hito_002.md`, `05_hito_003.md`, etc.).
4. El hito activo siempre es el de mayor número.

---

## Principios

- Clean Code.
- SOLID.
- DRY.
- KISS.
- Seguridad primero.
- Arquitectura desacoplada.
- Reutilización de componentes.
- Escalabilidad preparada.
- Documentación continua.

---

# Competencias Técnicas Complementarias

| Área | Tecnología / Concepto |
|---|---|
| HTTP Client | Axios |
| Gestión Configuración | dotenv |
| Validaciones | Zod |
| Cache | Redis (recomendado) |
| Mobile Storage | Secure Storage / AsyncStorage |
| Envío de correos | JavaMail / SMTP |
| Generación PDF | iText PDF |
| Captura de imágenes | react-native-image-picker / DocumentPicker |
| Mobile Build | Gradle |
| Android Release | Signed APK / AAB |
| API Testing | Postman / Bruno |
| Calidad Código | SonarQube |
| Convenciones | Conventional Commits |
| Package Manager | npm / pnpm |
| Arquitectura API | OpenAPI First |
| Observabilidad | Prometheus / Grafana |
| Logs Centralizados | Loki / ELK Stack |

---

# Consideraciones Arquitectónicas Estratégicas

## Distribución Mobile

Definir modelo de distribución:

- APK privada
- Play Store
- distribución empresarial interna

Impacta:

- certificados
- firma digital
- CI/CD
- seguridad
- releases

---

## Estrategia de Evidencias Fotográficas

Definir (el MVP **no incluye operación offline**; las fotos requieren conexión):

- almacenamiento en filesystem con rutas en base de datos
- compresión automática server-side (máx. 5 MB, formatos JPG/PNG)
- metadatos de fecha/hora tomados del dispositivo, no editables
- hasta 2 fotografías por requerimiento y captura de acta PDF por solicitud
- validación de captura obligatoria antes de finalizar la liberación

---

## Seguridad Mobile Avanzada

Evaluar:

- Secure Storage
- SSL Pinning
- Root Detection
- Obfuscation
- protección APK
- manejo seguro de tokens

---

## Escalabilidad Backend

Definir evolución futura:

- monolito modular
- microservicios
- arquitectura hexagonal
- separación por dominios

---

## Observabilidad

Definir:

- dashboards
- alertas
- correlación de requests
- monitoreo distribuido
- auditoría operativa

---

## Estrategia Infraestructura

Definir:

- VPS
- Kubernetes
- Docker Swarm
- alta disponibilidad
- backups
- disaster recovery

---

# Competencias Personales

| Competencia | Descripción |
|---|---|
| Pensamiento analítico | Evaluación crítica de arquitectura y requerimientos |
| Ownership | Responsabilidad total sobre entregables |
| Seguridad | Priorización de protección de datos y acceso |
| Escalabilidad | Diseño preparado para crecimiento |
| Comunicación técnica | Traducción negocio ↔ tecnología |
| Atención al detalle | Validaciones y consistencia |
| Adaptabilidad | Evolución continua de arquitectura |
| Proactividad | Identificación temprana de riesgos |

---

# Leyes Normativas del Perfil (obligatorias)

> Estas leyes nacen de **errores reales** cometidos durante el desarrollo (ver la Matriz de lecciones aprendidas del perfil auditor y el historial registrado en `docs_implementacion/_sdd/04_implementacion.md`). Su objetivo es que **no se repitan**: se aprende de lo ocurrido y se convierte en regla verificable.

## Ley 1 — Análisis previo obligatorio (prohibido el trial/error)

Ningún cambio de código comienza sin análisis. El **trial/error** (probar a ciegas, iterar sobre errores en ejecución) está **prohibido**.

Antes de tocar código, el desarrollador debe realizar y dejar evidencia de:

| Verificación | Qué hacer | Evidencia mínima |
|---|---|---|
| Contrato backend | `grep` en services/controllers para confirmar que el endpoint soporta lo planeado (p. ej. `actualizarEstado` en `SolicitudService` para el cambio Registrado → Pendiente) | Servicio citado |
| Patrones existentes | Buscar si el cambio ya existe o hay un patrón equivalente reutilizable (p. ej. el manejo de estados de `SolicitudResource` aplicable a `ProgramacionResource`) | Archivo reutilizado |
| Config de tests | Revisar config (jest/gradle) antes de correr; detectar fallos **pre-existentes** y documentarlos | Config leída |
| Estimación de build | Estimar tiempo de build/rebuild y definir timeout acorde (release cold ≈ 2-6 min) | Estimación en el plan |
| Alternativas | ≥2 opciones viables con pros/contras y decisión justificada | Sección de alternativas en el plan |

Flujo estricto: **plan → analizar → implementar → verificar → documentar → commit**. No existe el "probar a ver si funciona".

## Ley 2 — Estado en disco, nunca en memoria

Las sesiones de desarrollo (agentes/openCode) comparten **solo el disco**, no memoria ni contexto. Por lo tanto:

- Todo avance concluye con `commit` explícito y `git` limpio o con el estado documentado.
- El "dónde quedó el trabajo" debe poder responderse **desde el disco**: `docs_implementacion/_sdd/` (04_implementacion.md y 05_hito_NNN.md), `versionHistory.js` (convención del historial visible), `mobile/package.json`.
- Nunca depender de lo que "recuerda" una sesión anterior.

## Ley 3 — Trazabilidad de versión (Ley V) y resumen de retorno (Ley R)

- Cada funcionalidad cerrada = bump (minor/patch según regla) + entrada en `versionHistory.js` + actualización de AGENTS/README/04_implementacion.md **en el mismo commit**.
- El artefacto (APK/web) debe quedar reconstruido o **marcarse explícitamente pendiente** — nunca un estado ambiguo (prohibido: bump de versión sin artefacto, o APK con versión desincronizada).
- El historial de versiones debe ser **visible al usuario** (mobile: Perfil → botón historial; web: pendiente de implementar) y responder "¿qué versión tengo y qué contiene?".
- Ninguna tarea se deja "a medias": si un entregable no se completa, se documenta su estado para que la siguiente sesión pueda retomarlo sin repetir ni perder trabajo.

## Ley 4 — Eficiencia

- Mínimo diff posible; **reutilizar patrones existentes** (DRY): no duplicar componentes, handlers ni acciones cuando ya existe un equivalente.
- No crear endpoints, componentes ni campos redundantes.
- Cada cambio tiene **un comando de verificación documentado** (build/test/lint) que SIEMPRE se ejecuta.
- La eficiencia es la palabra clave: resolver con la menor cantidad de cambios correctos y verificados.

## Ley 5 — Verificación obligatoria y fallos pre-existentes

- Todo cambio corre su verificación documentada antes de commitear.
- Los fallos pre-existentes se detectan y documentan **en el análisis** (no al final); no se atribuyen a otro trabajo, no se ignoran y no se agravan.

---

# Construcción del APK — React Native CLI (Gradle local, SIN Expo)

- El APK se construye **localmente con Gradle**: `npm run android:debug` / `npm run android:release` (NO `eas-cli`, NO `expo`, NO EAS Cloud).
- Configuración congelada: `main=index.js`, `hermesEnabled=true`, `newArchEnabled=true`, `app.json` solo `name`/`displayName`.
- Tiempos realistas: release en frío ≈ 2-6 min; usar timeouts acordes y **no cortar un build sin criterio** (si se corta, el estado queda marcado pendiente según Ley 3).
- Al terminar el build, verificar: timestamp del APK y que `versionName`/`versionCode` en `mobile/android/app/build.gradle` === `mobile/package.json`.
- Despliegue a dispositivos: verificar `adb devices -l` (seriales conocidos: `qctoduvsa6v4cyhi`, `85ijey5tdax8ob5p`); instalar con `adb -s <serial> install -r app-release.apk`. Si no hay dispositivos conectados, se reporta como **bloqueado**, nunca como realizado.

---

# Criterio UI/UX (alto criterio y buenas prácticas)

- Consistencia con el tema del proyecto (react-native-paper **MD3** en mobile / MUI en web; tokens centralizados en `theme`).
- Toda pantalla cubre los estados: **carga**, **vacío**, **error (con reintentar)** y **feedback de éxito**.
- El teclado móvil nunca debe cubrir los inputs (KeyboardAvoidingView + ScrollView).
- Acciones destructivas/irreversibles confirman; las reversibles (soft delete) son visibles y explicadas.
- Errores **semánticos**, no técnicos: p. ej. un 409 "el fundo tiene lotes asociados" debe ofrecer la alternativa (desactivar) o "la especie tiene requerimientos activos" debe restringir su baja lógica.
- Accesibilidad: `accessibilityLabel` en acciones, contraste suficiente, targets táctiles ≥44px.
- Fechas/hora en `es-PE` y formato consistente.
- Estado visual explícito (chips/badges) para cero ambigüedad: estados de solicitud (Registrado/Pendiente/Aprobado/Entregado/Recibido/Liberado con su color) y de programación (EN_PROCESO/PUBLICADO).
- Recuperación ante errores con mensajes que indiquen la acción concreta a tomar.

**Referencias:** Jakob Nielsen, *10 Usability Heuristics* (Nielsen Norman Group, 1994, rev. 2024); Material Design 3 (material.io); consideraciones WCAG 2.1 (contraste, foco, etiquetas).

---

# Exploración de alternativas (no quedarse con la 1ª opción)

Para decisiones no triviales:

- Listar ≥2-3 opciones viables con sus trade-offs (riesgo, esfuerzo, impacto).
- Elegir la de mejor relación costo-beneficio y **justificar** la decisión (p. ej. el caso DELETE con FK se resolvió evaluando opciones A/B/C/D y eligiendo desactivación lógica en UI).
- Registrar la decisión y su porqué en el plan del HITO para que la auditoría la pueda evaluar.

---

# Criterios de Documentación

- Secciones SDD numeradas y siempre actualizadas (`04_implementacion.md`, `05_hito_NNN.md`).
- `versionHistory.js` es la **fuente de verdad** del historial visible al usuario.
- Conventional Commits con scope: `feat(web,mobile):`, `fix(backend):`, `db:`, `docs:`, etc.
- Coherencia entre AGENTS.md, README.md, versión del app y documentación: **drift documental = hallazgo de auditoría**.
- Cada HITO documenta: contexto, decisión, cambios por capa, tests y verificación end-to-end, artefactos y estado.

---

# Fuentes y buenas prácticas de referencia

- NN/g — *10 Usability Heuristics*: https://www.nngroup.com/articles/ten-usability-heuristics/
- React Native — generar APK firmado con Gradle (CLI, sin Expo): https://reactnative.dev/docs/signed-apk-android
- *The Twelve-Factor App* (Heroku): https://12factor.net
- Arquitectura por capas / Clean Architecture (Controller → Service → Repository → DTO → Mapper; evitar fat controllers): dev.to — *Clean Architecture for Mobile Apps* (2025), y patrones SOLID/DIP aplicados a layers.

---

# Objetivo del Perfil

Desarrollar una solución móvil/web empresarial moderna, segura, mantenible y escalable para el control operativo del ciclo de entrega de insectos benéficos (publicación de stock, requerimientos por fundo y lote, despacho, recepción y liberación en campo), utilizando tecnologías modernas mobile/backend, arquitectura desacoplada, infraestructura contenerizada y estándares enterprise de desarrollo.

---

# Este documento define el perfil técnico oficial del proyecto y servirá como referencia base durante todo el ciclo de desarrollo.

_Fecha de emisión: Mayo 2026_
