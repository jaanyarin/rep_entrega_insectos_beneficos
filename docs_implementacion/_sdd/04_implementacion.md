# SOFTWARE DEVELOPMENT DOCUMENT (SDD)
# 04_IMPLEMENTACION.md

---

# 1. Control Documental

| Campo | Valor |
|---|---|
| Documento | 04_IMPLEMENTACION — Estado e historial de implementación |
| Proyecto | Sistema de Control de Entrega de Insectos Benéficos |
| Tipo Documento | SDD (historial de implementación) |
| Estado | Vigente (vertical 1 implementada) |
| Versión | 1.0.0 |
| Fecha | 2026-08-18 |
| Responsable | Orchestrator / Developer |
| Repositorio | C:\repos\rep_entrega_insectos_beneficos |
| Clasificación | Interno |

---

# 2. Objetivo del Documento

Registrar el estado real de la implementación (Ley 2: estado en disco) y el historial de
decisiones/avances por HITO. Se alimenta en cada tarea y se consulta antes de retomar trabajo.

---

# 3. Alcance del Documento

Cubre el HITO-001 (infraestructura base + vertical 1: módulo de usuarios/autenticación) y
será la base para hitos posteriores (requerimientos, programación, evidencias).

---

# 4. Referencias

| Documento | Descripción |
|---|---|
| 01_especificacion.md | Especificación funcional v1.1 (RF reconciliados con ADR-A002) |
| ADR-A001 | Decisiones de arquitectura vigentes (stack) |
| ADR-A002 | Módulo Usuarios/Autenticación (login por usuario, 3 perfiles, soft delete) |
| perfil_desarrollador.md | Leyes 1-5 |
| perfil_auditor.md | Catálogo de 32 gates |
| 05_hito_001.md | Acta de cierre del HITO-001 (verificación y auditoría) |

---

# 5. Definiciones y Acrónimos

| Término | Definición |
|---|---|
| JWT | JSON Web Token (autenticación local, HS256 dev) |
| Soft delete | Eliminación lógica vía `estado=INACTIVO`; nunca DELETE físico |
| DNI | Contraseña del usuario tras primer ingreso; numérico, máx 8 dígitos (VARCHAR(8)) |
| Perfil | SUPER_ADMIN / ADMIN / USUARIO |

---

# 6. Estrategia General de Implementación

Vertical 1 = línea base técnica (scaffold backend + BD Docker + auth) + primer flujo completo
(usuarios/autenticación/home por perfil). Decisión rectora: **ADR-A002**. Flujo:
análisis previo (Ley 1) → implementación → verificación (Ley 5) → auditoría integral →
artefactos de cierre → commit único coherente.

---

# 7. Arquitectura General del Sistema

```text
mobile (React Native CLI) ──► backend API Quarkus (:6101) ──► PostgreSQL 16 (Docker)
        JWT local                                 Flyway V1/V2        (insectos_beneficos)
```

---

# 8. Arquitectura Backend

- Quarkus 3.38.x, Java 17 (Maven Wrapper `mvnw`).
- Paquetes: controllers sin lógica; servicios con reglas de negocio; Panache (active record);
  excepciones globales → `{codigo, mensaje}` (ManejadorErrores).
- Seguridad: smallrye-jwt HS256 (clave JWK dev), `@RolesAllowed` con claim `groups` → perfil.

---

# 9. Arquitectura Frontend Mobile

- React Native CLI (sin Expo), TypeScript.
- Navegación: react-navigation native-stack con auth flow condicional
  (`Login` → `CambiarPassword` si debeCambiarPassword → `Home` por perfil → 4 placeholders).
- Estado global: React Context (`AuthContext`) con token en memoria (deuda H9 pendiente).
- UI: componentes core + StyleSheet (deuda H8: paper MD3 pendiente).

---

# 10. Arquitectura Frontend Web

No implementada (fuera de alcance del HITO-001). Pendiente de scaffold (React+Vite+MUI).

---

# 11. Arquitectura Base de Datos

- PostgreSQL 16 en Docker (`docker-compose.yml` raíz, db `insectos_beneficos`).
- Flyway: V1 `usuarios` (UNIQUE usuario, CHECK perfil/estado, timestamps, last_login_at,
  dni VARCHAR(8), debe_cambiar_password) · V2 seed SUPER_ADMIN `Admin PowerApps` / 00000000 (BCrypt).

---

# 12. Estrategia APIs REST

- Versionado no aplicado aún (deuda H5: migrar a `/api/v1` + OpenAPI).
- `POST /api/auth/login` (público) · `POST /api/auth/cambiar-password` (autenticado) ·
  `GET/POST/PUT/DELETE /api/usuarios` (RBAC SUPER_ADMIN/ADMIN).

---

# 13. Seguridad

- JWT local contra tabla `usuarios`; 401 anti-enumeración; inactivos → 403.
- BCrypt (`at.favre.lib:bcrуpt`) para contraseñas incl. seed.
- Deuda: refresh token/revocación, rate limiting, secrets env, CORS explícito (H9/H10).

---

# 14. Estrategia Fotografías

No implementada (hito de evidencias). Lineamiento: filesystem + metadatos inmutables (ADR-A001 D5).

---

# 15. Estrategia Auditoría

- `creado_por`, `created_at`, `updated_at`, `last_login_at` en `usuarios`.
- Deuda H13: log de acciones críticas (crear/desactivar/cambio password) pendiente.

---

# 16. Estrategia Logging

Logs Quarkus planos en dev (deuda H16: health check + métricas pendientes).

---

# 17. Estrategia Manejo Errores

- Global `ManejadorErrores` → JSON `{codigo, mensaje}` (uniformes), 404/400/403/409 mapeados,
  500 genérico sin detalles. Mobile parsea `mensaje` para UX.

---

# 18. Estrategia Docker

- `docker-compose.yml`: postgres:16 con volumen persistente, healthcheck, credenciales dev.
- Backend NO en contenedor en esta vertical (siguiente fase).

---

# 19. Estrategia CI/CD

No implementada en HITO-001 (deuda pendiente: GitHub Actions).

---

# 20. Estrategia Despliegue

Perfil prod no configurado (Nginx/HTTPS/VPS fuera de alcance).

---

# 21. Estrategia Backups

No definida aún (pendiente próxima fase).

---

# 22. Estrategia Monitoreo

Solo healthcheck del contenedor Postgres; backend sin `/q/health` (H16).

---

# 23. Estándares de Desarrollo

Leyes 1-5 (perfil_desarrollador.md). Conventional Commits al cierre de HITO. UTF-8, mensajes en español.

---

# 24. Estrategia Testing

- Backend: Testcontainers Postgres 16, RestAssured — 26 tests (8 auth + 18 usuarios) PASS.
- Mobile: jest + RNTL — smoke test del App (1) PASS; flujos críticos pendientes (H6).

---

# 25. Riesgos Técnicos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| mvn/gradle fuera de PATH | Build local | Maven Wrapper + gradlew integrados |
| Versión desincronizada package↔gradle | Trazabilidad | Unificado a 1.0.0 + versionHistory (Ley 3) |
| Secretos dev hardcodeados | Seguridad prod | Secrets por env en próxima fase (H10) |
| FB token en memoria | Seguridad móvil | Secure Storage planificado (H9) |

---

# 26. Deuda Técnica Controlada

Registrada en `05_hito_001.md` §5 (H5-H18) y en `MATRIZ_RIESGOS.md`(pendiente): API versionado/OpenAPI,
tests FE flujos críticos, RHF+Zod, paper MD3, Secure Storage/firma release, rate limiting/CORS/secrets,
RF-002..017 reconciliación, FK creado_por, rollback Flyway, log crítico, util DNI compartido,
accessibilityLabel, health check, jacoco.

---

# 27. Roadmap Técnico Futuro

1. Reconciliar RF-002..RF-017 (G-DOC-SYNC) + deuda alta (H5-H10).
2. Web React+Vite (scaffold) + CI/CD base.
3. Próximo HITO funcional: requerimientos/programación (a coordinar con negocio).

---

# 28. Consideraciones Finales

El estado siempre se consulta desde disco (Ley 2). Cualquier contradicción entre fuentes:
detenerse y solicitar reconciliación (jamás trial/error, Ley 1).

---

# 29. Aprobaciones

| Rol | Responsable | Estado |
|---|---|---|
| Negocio | Jose Anyarin | Aprobado (2026-08-18) |
| Orchestrator | — | Aprobado (cierre HITO-001) |
| Auditor | — | PASS técnico integral (0 críticos) |
