# ADR-A003 — Autenticación v2: login 3 pasos, roles en tabla, URL runtime, /api/v1

- **Estado**: Aprobado
- **Fecha**: 2026-08-19
- **Responsable**: Jose Anyarin (validación 7 puntos) + Orchestrator
- **Supera parcialmente**: ADR-A002 (D-AUTH-1 UX login; D-AUTH-2 representación de perfiles)

## Contexto

Se autorizó aplicar el procedimiento de `docs_implementacion/LOGIN_MODELO_REUTILIZABLE.md`
(modelo de login de "Control de Equipos de Apilamiento") al desarrollo de este sistema,
con criterio adaptativo. El usuario validó los 7 puntos planteados por el Orchestrator:

| # | Decisión | Validación |
|---|---|---|
| 1 | Tabla `roles` (fiel al modelo) + `usuarios.rol_id` FK | **tabla** |
| 2 | Literales de rol con espacios: `"Super Admin" / "Admin" / "Usuario"` en BD y `@RolesAllowed` | **con espacios** |
| 3 | Login 3 pasos (Perfil → Usuario → DNI); se elimina el login de texto | **aplico** |
| 4 | Password: se mantiene **máx 8 dígitos** del ADR-A002 (no `^\d{8}$` estricto del modelo) | **máx 8** |
| 5 | URL runtime + axios + react-native-keychain + ServerCheck + Settings | **aplica** |
| 6 | `/api/v1` + quarkus-smallrye-openapi (resuelve deuda H5) | **sí** |
| 7 | Push/FCM omitido (Firebase prohibido por AGENTS.md §4) | **ok** |

## Decisiones

### D-AUTH2-1 — Tabla `roles` + FK `rol_id`

- Se crea la tabla `roles` (id, nombre literal, estado) poblada con los 3 perfiles.
- `usuarios.rol_id` FK → `roles.id`; el enum/CHECK `perfil` de V1 se migra a valores de tabla
  y la columna `perfil` se elimina (migración de datos incluida en Flyway).
- Nombres literales **con espacios**: `Super Admin`, `Admin`, `Usuario`.
- JWT: claim `groups` y `rolId` con esos literales; `@RolesAllowed({"Super Admin","Admin","Usuario"})`
  debe coincidir exactamente.
- Se conserva la semántica RBAC del ADR-A002 (SUPER_ADMIN controla todo; ADMIN gestiona ADMIN+USUARIO).

### D-AUTH2-2 — Login 3 pasos (sin login de texto)

| Endpoint (público) | Descripción |
|---|---|
| `GET /api/v1/auth/roles` | Lista de roles activos (para selector) |
| `GET /api/v1/auth/usuarios-by-rol/{rolId}` | Usuarios activos del rol, con `passwordResetRequired` (autocompletado `00000000`) |
| `POST /api/v1/auth/local-login` | `{usuarioId, password}` → `{token, passwordResetRequired}` |
| `POST /api/v1/auth/change-password` | Autenticado; `{newPassword}` → **nuevo JWT** (no pide anterior durante reset obligatorio) |

- El campo `usuario` de la entidad **se conserva** como identificador único (no se elimina),
  pero deja de usarse como input de login en la UX.
- Reset obligatorio (deuda H9/H10 del cambio): `change-password` valida numérico máx 8 dígitos,
  ≠ DNI actual, y devuelve JWT fresco sin `passwordResetRequired`.

### D-AUTH2-3 — JWT claims

Claims emitidos: `sub` (id), `groups` (rol literal con espacios), `nombre`, `rolId`, `dni`,
`passwordResetRequired`. **Omisión documentada**: `correo` (descartado por ADR-A002) y `area`
(no existe en el modelo de datos actual; se incorporará cuando exista). Expiración 8h (mantiene
modelo y ADR-A002).

### D-AUTH2-4 — URL runtime + SecureStore + axios (mobile)

- `react-native-keychain`: almacén seguro para `token` y `apiUrl` (nunca AsyncStorage).
- Módulo `api` con axios: interceptor de request inyecta baseURL + `Authorization: Bearer`;
  interceptor de response: 401 → borra token y reloguea; timeout 15s.
- `ServerCheckScreen` (primer flujo al abrir app): prueba `GET /auth/roles` con timeout 5s;
  si falla, formulario de URL (Guardar al Keychain y reintentar).
- `SettingsScreen`/"Configurar servidor" accesible desde Login y por Super Admin.
- Resuelve deuda H9 (token en memoria) y habilita despliegue sin recompilar.

### D-AUTH2-5 — Versionado API + OpenAPI

- Todas las rutas bajo `/api/v1/...` (incluye CRUD `/api/v1/usuarios`).
- `quarkus-smallrye-openapi` activado (Swagger UI en dev). Resuelve deuda H5.

### D-AUTH2-6 — Protección Super Admin seed (id=1)

- Regla reforzada: el usuario seed id=1 (Super Admin) **no puede desactivarse ni eliminarse**
  (se fusiona con la regla existente "último super admin no desactivable").

### D-AUTH2-7 — Exclusiones conscientes

- Push/FCM: **omitido** (Firebase prohibido, AGENTS §4).
- `offline`/Sync: no aplica (sin capa offline).
- Backfill masivo de hashes (V12 del modelo): N/A — no existe legacy de hashes.

## Consecuencias

1. ADR-A002 queda parcialmente superado: se mantienen D-AUTH-3 (00000000 + reset), D-AUTH-4
   (DNI máx 8), D-AUTH-5 (soft delete + timestamps) y D-AUTH-6 (stack). Cambian la UX de login
   (D-AUTH-1) y la representación de perfiles (D-AUTH-2).
2. Reconciliación documental G-DOC-SYNC en esta iteración: RF-001 (login), RF-022/RF-026
   (identidad/perfil), RF-191 (seed), §6 Roles y Permisos, más RF-002..RF-017 pendientes (H11).
3. Bump de versión a **1.1.0** con `versionHistory.js`; APK **rebuild obligatorio** (módulo
   nativo `react-native-keychain` — el artefacto 1.0.0 queda desactualizado).
4. Checks: `mvn test` (backend) · `npm run lint`/`npm test` (mobile) · `gradlew assembleRelease`
   (APK v2 obligatorio) · `docker compose up -d` (BD).

## Referencias

- `docs_implementacion/LOGIN_MODELO_REUTILIZABLE.md` (modelo aplicado con criterio).
- `AGENTS.md` §4 (prohibiciones) y §6 (regla build 3 min / verificación por capa).
- `perfil_auditor.md`: G-MIG, G-SEC, G-API, G-VAL, G-MOB-SEC, G-MOB-NAV, G-DOC-SYNC.
- ADR-A002 (predecesor), ADR-A001 (stack).
- `05_hito_001.md` §5 (deuda H5, H9, H10, H11, H12, H14).