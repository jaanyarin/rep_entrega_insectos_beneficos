# Perfil de Desarrollo y Conocimiento

---

# Rol

## Arquitecto y Desarrollador Full Stack Senior Mobile/Web

Profesional especializado en el diseño, arquitectura, implementación y despliegue de soluciones empresariales multiplataforma orientadas a aplicaciones móviles Android y plataformas web modernas.

Responsable del desarrollo integral del sistema, incluyendo:

- arquitectura técnica
- backend empresarial
- aplicación móvil Android
- infraestructura Docker
- seguridad
- autenticación corporativa
- base de datos
- documentación técnica
- despliegue y mantenimiento

---

# Objetivos Técnicos del Proyecto

- Desarrollar una aplicación Android robusta y escalable.
- Centralizar la gestión operativa de entrega de insectos benéficos.
- Garantizar trazabilidad completa de operaciones.
- Implementar autenticación segura empresarial.
- Mantener arquitectura desacoplada y mantenible.
- Permitir crecimiento modular futuro.
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
| Seguridad | JWT | Experto |
| Autenticación | JWT con validación local contra tabla de usuarios | Avanzado |
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

- Arquitectura modular basada en features.
- Separación entre:
  - UI
  - lógica de negocio
  - servicios
  - estado global
  - acceso HTTP
- Componentes reutilizables y desacoplados.
- Material Design 3 como estándar visual principal.
- Navegación estructurada por módulos.
- Manejo centralizado de errores.
- Validaciones frontend y backend.
- Preparación para funcionamiento offline parcial.

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

## Gestión Operativa

- Publicación de stock semanal de insectos benéficos.
- Control de estados del requerimiento (Pendiente → Aprobado → Entregado → Recibido → Liberado).
- Historial de requerimientos y liberaciones.
- Registro de liberación en campo con evidencia fotográfica.
- Seguimiento de stock y proyección mensual.
- Asignación de destino (fundo, lote) por requerimiento.
- Trazabilidad completa del ciclo entrega.

---

## Seguridad y Usuarios

- Login con credenciales locales (email + contraseña).
- JWT Authentication.
- Migración inicial con usuario super admin.
- El super admin puede crear usuarios admin y user.
- Roles y permisos.
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
- Validación local contra tabla de usuarios en base de datos.
- Login con email y contraseña.
- Migración inicial con usuario super admin.
- Roles y permisos RBAC.

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

- Diseño relacional normalizado.
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

El avance del proyecto se registra mediante **hitos de desarrollo** (archivos `05_hito_NNN.md` en `documentacion_general/sdd/`).

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
| Módulos Validados | Lista de módulos funcionales verificados |
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
| Push Notifications | Firebase Cloud Messaging |
| Analytics | Firebase Analytics |
| Crash Reporting | Firebase Crashlytics |
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

## Estrategia Offline

Validar:

- cache local
- sincronización diferida
- persistencia offline
- resolución de conflictos

Tecnologías potenciales:

- SQLite
- MMKV
- Realm
- React Query

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

# Objetivo del Perfil

Desarrollar una solución móvil empresarial moderna, segura, mantenible y escalable para la gestión y control operativo de entrega de insectos benéficos, utilizando tecnologías modernas mobile/backend, arquitectura desacoplada, infraestructura contenerizada y estándares enterprise de desarrollo.

---

# Este documento define el perfil técnico oficial del proyecto y servirá como referencia base durante todo el ciclo de desarrollo.

_Fecha de emisión: Mayo 2026_
