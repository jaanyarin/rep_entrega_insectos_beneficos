# Auditoría HITO-008 — Backend del módulo de requerimientos

**Fecha:** 2026-08-25 · **Alcance:** migración V10, API de requerimientos, cálculo de stock y
validaciones de transición de estados · **Fuente de gates:** `perfil_auditor.md`

## Veredicto

> PASS técnico del alcance backend: 0 críticos · 0 altos · 11 gates aplicables aprobados.
> La validación end-to-end desde mobile, el APK release y las evidencias de campo quedan fuera
> del alcance de este hito y están documentados como deuda.

## Evidencia ejecutada

| Check | Resultado |
|---|---|
| `backend\\mvnw.cmd test -Dtest=RequerimientoResourceTest` | PASS, 6/6 |
| `backend\\mvnw.cmd package` | PASS, 53/53 tests; BUILD SUCCESS |
| Testcontainers + Flyway | PASS, PostgreSQL 16; migraciones V1-V10 aplicadas desde esquema vacío |
| RBAC | PASS, endpoint de requerimientos protegido; petición sin token devuelve 401 |
| `git diff --check` | PASS |
| Trazabilidad de versión | PASS, mobile se mantiene en 1.4.0 / versionCode 5 sin bump ni APK desactualizado |

## Gates aplicables

| Gate | Resultado |
|---|---|
| G-MIG | PASS: V10 crea `requerimientos`, FKs, CHECK de estados e índices |
| G-ORM | PASS: entidad JPA, repositorio Panache, relaciones y consultas de stock |
| G-TX | PASS: escrituras del servicio transaccionales |
| G-ARQ | PASS: servicio, mapper, DTOs y resources separados por responsabilidad |
| G-API | PASS: GET/POST/PUT de requerimientos y endpoint de stock bajo `/api/v1` |
| G-SEC | PASS: JWT y `@RolesAllowed` para Super Admin/Admin/Usuario |
| G-VAL | PASS: catálogos, cantidad, stock, estados y regla papel+sobre |
| G-EXC | PASS: errores de dominio devueltos mediante `ApiException`/manejador estándar |
| G-TEST-BE | PASS: 6 pruebas específicas y 53 pruebas de suite sin fallos |
| G-EFF | PASS: cálculo de stock reutilizado por creación, actualización y resource |
| G-DOC-SYNC | PASS: README, AGENTS, 04/05, package.json, Gradle y versionHistory conservan 1.4.0 |

## Deuda y fuera de alcance

- Validación end-to-end de las pantallas mobile contra el backend real.
- Rebuild de APK release: no corresponde a la Opción A porque no se modificó el artefacto mobile.
- Evidencias fotográficas, actas PDF, frontend web y CI/CD.
- El cierre Git (commit único y push) queda pendiente del Orchestrator.

## Incidente de verificación

El primer `package` encontró un proceso Quarkus dev que bloqueaba un JAR en `target/`. Se confirmó
que pertenecía a este repositorio, se detuvo y el segundo `package` terminó correctamente.
También quedó documentado en `05_hito_008.md` el incidente previo de checksum Flyway V7 y la regla
de no editar migraciones aplicadas.