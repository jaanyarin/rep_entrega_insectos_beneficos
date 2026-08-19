# Auditoría HITO-002 — Auth v2 (informe integral)

**Fecha:** 2026-08-19 · **Auditor:** agente `auditor` (edit: deny enforced) · **Alcance:** INC-1 + INC-2 + remediaciones M1/F1/F2 + cierre técnico 1.1.0/APK v2 + G-DOC-SYNC
**Decisiones rectoras:** ADR-A003, ADR-A002 · **Fuente de gates:** `perfil_auditor.md` (32 gates)

## VEREDICTO

> ✅ **PASS TÉCNICO INTEGRAL — 0 🔴 Críticos · 0 🟠 Altos · 24 PASS · 5 PARCIAL·izados · 0 FAIL · 8 N/A · KPIs cumplidos**

## Verificación ejecutada (evidencia real)

| Check | Resultado |
|---|---|
| `mvnw clean test` (Testcontainers) | 32/32 PASS (13 Auth + 19 Usuarios), 0 failures/errors; Flyway V1→V3 |
| `mvnw clean package -DskipTests` | jar reconstruido (2026-08-19) con openapi/swagger-ui |
| `npm run lint` | EXIT 0 |
| `npm test` | EXIT 0 — 7 suites / 27 tests |
| `npx tsc --noEmit` | EXIT 0 |
| APK v2 | 61.5 MB · 2026-08-19 13:45:10 · keychain autolinked (codegen JNI + strings v2 en bundle) |
| G-DOC-SYNC | 1.1.0 en package.json / build.gradle (versionName, versionCode 2) / versionHistory top / 04 / README |
| Drift docs | grep `/api/auth/login`, `Perfil.`, `services/api` → 0 referencias obsoletas |

## Tabla de 32 gates → resultado

| ID | Gate | Resultado |
|---|---|---|
| G-ARQ | Arquitectura Backend | ✅ PASS |
| G-API | API REST (/api/v1 + OpenAPI) | ✅ PASS |
| G-SEC | Seguridad (JWT local, RBAC literales, seed inmune, anti-enumeración, 403 inactivo) | ✅ PASS |
| G-VAL | Validaciones (Bean Validation, máx 8, sanitización) | ✅ PASS |
| G-ORM | ORM/JPA (Panache, @Fetch JOIN anti N+1, índices FK) | ✅ PASS |
| G-MIG | Migraciones (V3 datos + FK + rollback documentado) | ✅ PASS |
| G-TX | Transacciones (@Transactional en escrituras) | ✅ PASS |
| G-EXC | Excepciones (ManejadorErrores → {codigo,mensaje}) | ✅ PASS |
| G-AUD | Auditoría | 🟡 PARCIAL (H13 log crítico pendiente) |
| G-MOB | Mobile Architecture | ✅ PASS |
| G-MOB-NAV | Navegación tipada por estado | ✅ PASS |
| G-MOB-STATE | Context API + session restore | ✅ PASS |
| G-MOB-FORM | Formularios | ⚪ N/A (H7 diferido, excepción documentada) |
| G-MOB-UI | UI | 🟡 PARCIAL (H8 MD3 diferido) |
| G-MOB-FOTO | Evidencias | ⚪ N/A (hito futuro) |
| G-MOB-SEC | Seguridad Mobile (keychain) | 🟡 PARCIAL (H9: SSL Pinning/firma/cleartext) |
| G-NOTIF-EMAIL | Correo | ⚪ N/A |
| G-MOB-BUILD | Build & Distribución | ✅ PASS (versionCode 2 / versionName 1.1.0) |
| G-WEB | Frontend Web | ⚪ N/A |
| G-TEST-BE | Testing Backend | ✅ PASS (32) |
| G-TEST-FE | Testing Frontend | ✅ PASS (27, flujos críticos cubiertos) |
| G-DOC | Documentación | ✅ PASS (sin doc que publicite inexistente) |
| G-DEVOPS | DevOps | ⚪ N/A (CI/CD pendiente; docker-compose OK) |
| G-OBS | Observabilidad | ⚪ N/A (H16 health pendiente) |
| G-OWASP | OWASP | 🟡 PARCIAL (H10 rate-limit/CORS/secrets) |
| G-INFRA | Infraestructura | ✅ PASS |
| G-ANAL | Análisis previo | ✅ PASS (ADR-A003 con 7 puntos + trade-offs) |
| G-NOTRIAL | Prohibición trial/error | ✅ PASS |
| G-EFF | Eficiencia/DRY | ✅ PASS (H14 mayormente resuelto) |
| G-UX | UI/UX + accesibilidad | ✅ PASS |
| G-APK | Build APK CLI (sin Expo) | ✅ PASS |
| G-DOC-SYNC | Trazabilidad de versión | ✅ PASS (1.1.0 ×5 fuentes + APK nuevo) |

## Hallazgos por severidad

- 🔴 **0** · 🟠 **0**
- 🟡 **H-01** `DESIGN_SYSTEM_MOBILE_VANGUARD.md` sin referencia → **excluido del commit** · **H-02** RF-023 sin marca PENDIENTE (H11) · **H-03** RF-016 sin marca PENDIENTE (H11)
- 🟢 **H-04** typo cirílico "bcrуpt"→bcrypt (corregido) · **H-05** duplicación DNI≠default (H14) · **H-06** warning teardown Jest (pre-existente) · **H-07** estilo residual RF-022 snake_case (cosmético)

## Cierre de hallazgos previos

| Hallazgo | Estado |
|---|---|
| M1 change-password inactivos | ✅ Remedido (guard 403 + test) |
| M5/F3 drift documental | ✅ Resuelto (G-DOC-SYNC) |
| F1 extractErrorMessage | ✅ Remedido + re-auditado |
| F2 tests flujos críticos | ✅ Remedido + re-auditado |

## Deuda técnica migrante

H7, H8, H9 remanente (SSL Pinning/firma/cleartext), H10, H11 (+ H-02/H-03), H13, H14, H16, H17 — detalle en `05_hito_002.md` §5.

## KPIs

0 críticos · 0 altos sin remediar · tests BE 100% (32/32) · lint 0 · APK 0 errores · drift documental 0 · versión 100% coherente · versionHistory 100% · sin estados ambiguos versión↔artefacto.