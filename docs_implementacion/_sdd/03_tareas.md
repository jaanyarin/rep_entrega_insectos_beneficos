# SOFTWARE DEVELOPMENT DOCUMENT (SDD)
# 03_TAREAS.md

---

# 1. Objetivo del Documento

Registrar el desglose de tareas del proyecto y su estado (Ley 2 — estado en disco).

---

# 2. Estrategia General de Desarrollo

Tareas descompuestas por el Orchestrator y ejecutadas por un único Developer por tarea;
cada tarea cierra con verificación (Ley 5) y, al fin del HITO, auditoría integral PASS.

---

# 3. Estructura de Gestión de Tareas

| Prefijo | Área |
|---|---|
| BE- | Backend |
| MO- | Mobile |
| WEB- | Web |
| BD- | Base de datos |

---

# 4. Estados de Tareas

| Estado | Descripción |
|---|---|
| Pendiente | No iniciada |
| En Progreso | En ejecución |
| En Validación | Verificación/auditoría |
| Completado | Implementada y verificada |
| Bloqueado | Bloqueo humano/técnico |
| Cancelado | Descartada |

---

# 5. Prioridades de Desarrollo

| Prioridad | Descripción |
|---|---|
| Crítica | Bloquea el HITO |
| Alta | Requerida antes del próximo HITO |
| Media | Mejora |
| Baja | Opcional |

---

# 6. Roadmap General de Desarrollo

| Orden | Componente |
|---|---|
| 1 | Vertical 1: usuarios/autenticación (HITO-001) — CERRADA |
| 2 | Web + CI/CD |
| 3 | Requerimientos / programación / evidencias |

---

# 7. Tareas de Infraestructura

| ID | Tarea | Prioridad |
|---|---|---|
| INF-001 | docker-compose PostgreSQL 16 (raíz) | Alta — Completado |

---

# 8. Tareas Base de Datos

| ID | Tarea | Prioridad |
|---|---|---|
| BD-001 | Migración V1 usuarios (enums, timestamps, soft delete) | Alta — Completado |
| BD-002 | Migración V2 seed SUPER_ADMIN (Admin PowerApps / 00000000) | Alta — Completado |

---

# 9. Tareas Backend

| ID | Tarea | Prioridad |
|---|---|---|
| BE-001 | Scaffold Quarkus + Maven Wrapper | Alta — Completado |
| BE-002 | Login JWT local por `usuario` (anti-enumeración, inactivo→403) | Alta — Completado |
| BE-003 | Cambio de contraseña obligatorio (DNI máx 8) | Alta — Completado |
| BE-004 | CRUD usuarios con RBAC y soft delete | Alta — Completado |
| BE-005 | Tests REST (26) + package jar | Alta — Completado |

---

# 10. Tareas Frontend Android

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| MO-001 | Navegación react-navigation (auth flow) | Alta | Completado |
| MO-002 | Login por usuario+contraseña | Alta | Completado |
| MO-003 | Cambio de contraseña obligatorio (DNI) | Alta | Completado |
| MO-004 | Homes por perfil (2 botones / 2 divs SUPER_ADMIN) | Alta | Completado |
| MO-005 | Lint + tests + APK (evidencia existente) | Alta | Completado |

---

# 11. Tareas Frontend Web

| ID | Tarea | Prioridad | Estado |
|---|---|---|---|
| WEB-001 | Scaffold React+Vite+MUI | Alta | Pendiente |

---

# 12. Tareas Seguridad

| ID | Tarea | Prioridad |
|---|---|---|
| SEG-001 | JWT HS256 + RBAC por perfil | Alta — Completado |
| SEG-002 | Secrets por env + rate limiting + CORS explícito | Alta — Pendiente (deuda H10) |
| SEG-003 | Secure Storage + firma release móvil | Alta — Pendiente (deuda H9) |

---

# 13. Tareas Auditoría

| ID | Tarea | Prioridad |
|---|---|---|
| AUD-001 | Gate review integral HITO-001 | Alta — Completado (PASS condicionado, 0 críticos) |

---

# 14. Tareas Evidencias Fotográficas

| ID | Tarea | Prioridad |
|---|---|---|
| FOTO-001 | Módulo evidencias (hito futuro) | Media — Pendiente |

---

# 15. Tareas Dashboard KPI

| ID | Tarea | Prioridad |
|---|---|---|
| KPI-001 | Dashboard (hito futuro) | Media — Pendiente |

---

# 16. Tareas Reportes PDF

| ID | Tarea | Prioridad |
|---|---|---|
| PDF-001 | Reportes/actas iText (hito futuro) | Media — Pendiente |

---

# 17. Tareas QA y Testing

| ID | Tarea | Prioridad |
|---|---|---|
| QA-001 | Tests flujos críticos mobile (RNTL) | Alta — Pendiente (deuda H6) |
| QA-002 | Cobertura backend con jacoco | Media — Pendiente (deuda H17) |

---

# 18. Tareas Despliegue

| ID | Tarea | Prioridad |
|---|---|---|
| DEP-001 | CI/CD GitHub Actions | Alta — Pendiente |
| DEP-002 | Nginx/HTTPS/VPS prod | Media — Pendiente |

---

# 19. Dependencias Técnicas

| Componente | Dependencia |
|---|---|
| Backend | Maven Wrapper (mvn no está en PATH) |
| Mobile | Gradle Wrapper (gradle no está en PATH) |
| BD | Docker (postgres:16) |

---

# 20. Riesgos Técnicos

| Riesgo | Impacto |
|---|---|
| Secrets dev hardcodeados | Alto en prod |
| Token en memoria (mobile) | Alto en distribución |
| API sin versionar antes de crecer | Medio |

---

# 21. Consideraciones Finales

Todo avance deja estado en disco (Ley 2). La deuda técnica está registrada en `05_hito_001.md` §5
y priorizada para el siguiente HITO.
