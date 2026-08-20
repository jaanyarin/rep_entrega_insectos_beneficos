# SOFTWARE DEVELOPMENT DOCUMENT (SDD)
# 04_IMPLEMENTACION.md

---

# 1. Control Documental

| Campo | Valor |
|---|---|
| Documento | 04_IMPLEMENTACION — Estado e historial de implementación |
| Proyecto | Sistema de Control de Entrega de Insectos Benéficos |
| Tipo Documento | SDD (historial de implementación) |
| Estado | HITO-003 cerrado (auditoría integral PASS) |
| Versión | 1.2.0 |
| Fecha | 2026-08-19 |
| Responsable | Orchestrator / Developer |
| Repositorio | C:\repos\rep_entrega_insectos_beneficos |
| Clasificación | Interno |

---

# 2. Objetivo del Documento

Registrar el estado real de la implementación (Ley 2: estado en disco) y el historial de
decisiones/avances por HITO. Se alimenta en cada tarea y se consulta antes de retomar trabajo.

---

# 3. Alcance del Documento

Cubre el HITO-001 (infraestructura base + vertical 1: módulo de usuarios/autenticación) y el
HITO-002 (auth v2) y HITO-003 (sistema visual Vanguard y navegación mobile); será la base
para hitos posteriores (requerimientos, programación, evidencias).

---

# 4. Referencias

| Documento | Descripción |
|---|---|
| 01_especificacion.md | Especificación funcional v1.1 (RF reconciliados con ADR-A002 y ADR-A003) |
| ADR-A001 | Decisiones de arquitectura vigentes (stack) |
| ADR-A002 | Módulo Usuarios/Autenticación (3 perfiles, soft delete) |
| ADR-A003 | Auth v2: login 3 pasos (rol→usuario→DNI), roles en tabla `roles`, /api/v1 + OpenAPI, SecureStore |
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
| Rol (perfil) | Literales con espacios en tabla `roles`: 'Super Admin' / 'Admin' / 'Usuario'; JWT claim `groups` con el literal |
| Login 3 pasos | Selección de rol → usuario → DNI (contraseña); autocompleta `00000000` si `passwordResetRequired` |

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
        JWT local 8h                                 Flyway V1/V2/V3  (insectos_beneficos)
        (SecureStore/keychain)
```

---

# 8. Arquitectura Backend

- Quarkus 3.38.x, Java 17 (Maven Wrapper `mvnw`).
- Paquetes: controllers sin lógica; servicios con reglas de negocio; Panache (active record);
  excepciones globales → `{codigo, mensaje}` (ManejadorErrores).
- Rutas bajo `/api/v1` (auth + usuarios) con OpenAPI activado (`quarkus-smallrye-openapi`,
  Swagger `/q/swagger-ui`).
- Login 3 pasos: `GET /api/v1/auth/roles` → `GET /api/v1/auth/usuarios-by-rol/{rolId}` →
  `POST /api/v1/auth/local-login {usuarioId,password}` → `{token,passwordResetRequired}`;
  `POST /api/v1/auth/change-password` emite un **nuevo JWT**.
- JWT smallrye-jwt HS256 (clave JWK dev): claims `sub`, `groups` (rol literal con espacios),
  `rolId`, `nombre`, `dni`, `passwordResetRequired`; expiración **8h**; sin correo/área.
- Tabla `roles` (V3) + `usuarios.rol_id` FK; Super Admin seed id=1 **inmune**; soft delete por
  estado ACTIVO/INACTIVO.

---

# 9. Arquitectura Frontend Mobile

- React Native CLI (sin Expo), TypeScript.
- Navegación: react-navigation native-stack con auth flow condicional:
  anónimo → `ServerCheck`/`Login`/`Settings`; reset → `CambiarPassword`; sesión → `Home` por perfil.
- Servicios: `ApiClient.ts` (axios + `react-native-keychain`; token y URL en SecureStore;
  interceptor 401 → limpia SOLO el token y hace logout; timeout 15s; `parseToken` sin atob/Buffer).
- Screens: `ServerCheckScreen`/`SettingsScreen` (URL runtime 'Configurar servidor'),
  `LoginScreen` 3 pasos (rol→usuario→DNI máx 8, autocompleta `00000000` si passwordResetRequired),
  `CambiarPasswordScreen` (→ nuevo JWT).
- Estado global: React Context (`AuthContext`) con session restore desde Keychain y
  `refreshUser` vía `parseToken`; `utils/roles.ts` (isSuperAdmin/isAdminOrSuperAdmin con
  literales con espacios).
- UI: componentes core + StyleSheet (deuda H8: paper MD3 pendiente).
- UI: tema Vanguard con tokens, fuentes Poppins, iconos Material Community y componentes base
  reutilizables; Perfil sin react-native-paper.

---

# 10. Arquitectura Frontend Web

No implementada (fuera de alcance del HITO-001). Pendiente de scaffold (React+Vite+MUI).

---

# 11. Arquitectura Base de Datos

- PostgreSQL 16 en Docker (`docker-compose.yml` raíz, db `insectos_beneficos`).
- Flyway: V1 `usuarios` (UNIQUE usuario, CHECK perfil/estado, timestamps, last_login_at,
  dni VARCHAR(8), debe_cambiar_password) · V2 seed SUPER_ADMIN `Admin PowerApps` / 00000000 (BCrypt)
  · V3 tabla `roles` (literales 'Super Admin'/'Admin'/'Usuario') + `usuarios.rol_id` FK, con
  migración de datos desde la columna `perfil` y rollback documentado (H12).

---

# 12. Estrategia APIs REST

- Versionado aplicado: rutas bajo `/api/v1` + OpenAPI (`quarkus-smallrye-openapi`, H5 resuelto).
- `GET /api/v1/auth/roles` (público) · `GET /api/v1/auth/usuarios-by-rol/{rolId}` ·
  `POST /api/v1/auth/local-login {usuarioId,password}` → `{token,passwordResetRequired}` ·
  `POST /api/v1/auth/change-password` → nuevo JWT ·
  `GET/POST/PUT/DELETE /api/v1/usuarios` (RBAC Super Admin/Admin).

---

# 13. Seguridad

- JWT local contra tabla `usuarios`; 401 anti-enumeración; inactivos → 403.
- Claims v2: `sub`, `groups` (rol literal con espacios), `rolId`, `nombre`, `dni`,
  `passwordResetRequired`; expiración 8h; sin correo/área.
- BCrypt (`at.favre.lib:bcrypt`) para contraseñas incl. seed; Super Admin id=1 inmune.
- Mobile: token y URL en SecureStore (`react-native-keychain`); 401 → cleanup de token + logout (H9 parcial).
- Deuda: revocación/refresh token, rate limiting, secrets env, CORS explícito, SSL Pinning/firma/cleartext (H9/H10).

---

# 14. Estrategia Fotografías

No implementada (hito de evidencias). Lineamiento: filesystem + metadatos inmutables (ADR-A001 D5).

---

# 15. Estrategia Auditoría

- `creado_por`, `created_at`, `updated_at`, `last_login_at` en `usuarios`.
- Deuda H13: log de acciones críticas (crear/desactivar/cambio password) y eventos de
  autenticación (RF-009) pendiente.

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

- Backend: Testcontainers Postgres 16, RestAssured — 32 tests (13 Auth + 19 Usuarios) PASS.
- Mobile: jest + react-test-renderer (RNTL) — 27 tests (7 suites) PASS con `test-utils/helpers.ts`;
- Mobile: jest + react-test-renderer (RNTL) — 27 tests (7 suites) PASS con `test-utils/helpers.ts`;
  flujos críticos de auth y navegación cubiertos (H6 parcial, hallazgo F2 remediado).

---

# 25. Riesgos Técnicos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| mvn/gradle fuera de PATH | Build local | Maven Wrapper + gradlew integrados |
| Versión desincronizada package↔gradle | Trazabilidad | Unificado a 1.0.0 + versionHistory (Ley 3) |
| Secretos dev hardcodeados | Seguridad prod | Secrets por env en próxima fase (H10) |
| FB token/URL en memoria | Seguridad móvil | SecureStore (keychain) implementado en HITO-002; SSL Pinning/firma/cleartext pendientes (H9 parcial) |

---

# 26. Deuda Técnica Controlada

Registrada en `05_hito_001.md` §5 (H5-H18) y en `MATRIZ_RIESGOS.md` (pendiente). Estado al
cierre del HITO-002:
- **H5 resuelto** (API `/api/v1` + OpenAPI).
- **H9 parcial** (SecureStore/keychain implementado; pendientes SSL Pinning, firma release, cleartext HTTP).
- **H6 parcial** → tests de flujos críticos de auth cubiertos (hallazgo F2 remediado).
- **H12 resuelto** (migración V3 con FK `rol_id` y rollback documentado).
- Siguen: H7 (RHF+Zod), H8 (paper MD3), H10 (rate limiting/CORS/secrets), H13 (log crítico/eventos de
  autenticación RF-009), H14 (util DNI compartido — resuelto en su mayoría), H15 (accessibilityLabel),
  H16 (health check), H17 (jacoco), H11 (reconciliación RF-002..RF-017).

---

# 27. Roadmap Técnico Futuro

1. Reconciliar RF-002..RF-017 (H11) + deuda alta restante (H10, H13, H16, H17).
2. Web React+Vite (scaffold) y/o CI/CD base (pendientes).
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
| HITO-002 | Orchestrator | En cierre (auditoría integral pendiente) |
| HITO-003 (fase 2) | Orchestrator | Pendiente auditoría final (delta UI completado, APK 1.2.0 reconstruido) |

---

# 30. Delta HITO-003 — Vanguard UI completado (2026-08-19)

El commit `9a1bf0f` implementó la primera mitad del HITO-003 (theme, componentes
base, ServerCheck/Home/Catalogos/Perfil base, bump 1.2.0). Este delta completa las
pantallas pendientes y los bugs V1-V10. Todo en `mobile/`, sin commits (el commit
lo realiza el Orchestrator tras auditoría).

## 30.1 Cambios implementados (D1–D7)

| # | Archivo | Cambio |
|---|---|---|
| D1 | `mobile/src/screens/LoginScreen.tsx` | **Bug 3 corregido**: `keyboardShouldPersistTaps="handled"` en el ScrollView (el primer tap ya no solo descarta teclado). **Bug 1**: SafeAreaView edges `['top','bottom']`. Re-thema Vanguard completo: AppCard (radius.lg + shadows.z2 + authOverlay), AppInput (contraseña), AppButton (primario + variant `text` para "← Volver…"/"Configurar servidor"), 0 hardcodes (`#1a5c2a/#f5f5f5/#e8f2ea/#999/#d32f2f` → tokens: background.page, text.primary/secondary/tertiary, action.primary/secondary, status.error, typography Poppins). Flujo 3 pasos, textos, validaciones y accessibilityLabels intactos. |
| D2 | `mobile/src/screens/CambiarPasswordScreen.tsx` | SafeAreaView edges top/bottom + theme Vanguard (AppCard/AppInput×2 secureTextEntry/AppButton) + **V6**: BackHandler raíz del stack reset. Sin botón atrás (V7). Validaciones y textos del test intactos. |
| D3 | `mobile/src/screens/SettingsScreen.tsx` | Theme Vanguard (AppCard + AppInput URL + AppButton Guardar + AppButton text Restablecer/Volver). Sin SafeAreaView: esta pantalla se muestra CON header del stack → el native-stack resuelve el inset superior (no duplica padding). Lógica `loadApiUrl/setApiUrl/resetApiUrl` y textos exactos intactos. |
| D4 | `mobile/src/screens/PlaceholderScreen.tsx` | EmptyState Vanguard con icono `wrench-outline` (MaterialCommunityIcons, sin emojis). Se eliminó el falso `loading` de AuthContext (esta pantalla solo se alcanza autenticado). Título vía `options.title` del stack. |
| D5 | `mobile/src/screens/HomeScreen.tsx` y `CambiarPasswordScreen.tsx` | **V6**: `BackHandler.addEventListener('hardwareBackPress', () => true)` con cleanup `sub.remove()` en las raíces de los stacks autenticado/reset → el botón físico NO cierra la app. |
| D6 | `mobile/src/screens/PerfilScreen.tsx` | Elevado al estándar: ErrorBoundary envolvente; avatar circular con inicial del nombre (action.secondary + texto blanco, radius pill); nombre (h3) + "Perfil: {rol}" (body1 secondary); card "Información de la aplicación" (Versión {APP_VERSION}); card "Historial de versiones" con TODO `history` (versión + fecha + bullets de cambios); "Cerrar sesión" destructivo → ConfirmDialog tone danger; `paddingBottom = 32 + insets.bottom + 68` (useSafeAreaInsets). BottomNavigation active="Perfil". |
| D7 | `mobile/src/screens/HomeScreen.tsx` | Logout con ConfirmDialog (título "Cerrar sesión", message "¿Deseas cerrar la sesión actual?", tone danger, confirmAccessibilityLabel). 0 hardcodes: `#e8f2ea`→status.neutralBackground, `#fff`→background.paper, `#ccc`→border.default, `#1565c0`→action.secondary, `#b71c1c`→status.error, `#fff` botones→text.inverse. "Configurar servidor" sigue solo para Super Admin. Textos del ADR y BottomNavigation intactos. |
| — | `mobile/src/navigation/RootNavigator.tsx` | 1-línea: splash `#f5f5f5` → `theme.colors.background.page` (gate G-MOB 0 hardcodes). |

## 30.2 Ajustes de tests (Ley 5)

`mobile/__tests__/HomeScreen.test.tsx`: el logout ya no es directo (ahora pasa por
ConfirmDialog — contrato funcional del ADR): el test presiona "Cerrar sesión"
(abre el diálogo), verifica el mensaje y confirma con "Confirmar cierre de sesión".
Contrato funcional preservado (limpia Keychain y desmonta Home); se documentó en
el propio test. El resto de suites no requirió cambios.

## 30.3 Verificación ejecutada (en `mobile/`)

| Comando | Resultado |
|---|---|
| `git status` (inicio) | Limpio (HEAD = `9a1bf0f`) |
| `npm run lint -- --no-fix` | PASS (exit 0). 1 error previo de `View` sin uso en SettingsScreen corregido en el mismo delta |
| `npx tsc --noEmit` | PASS (exit 0) |
| `npm test -- --runInBand --forceExit` | PASS — **7 suites / 27 tests** (LoginScreen, CambiarPasswordScreen, HomeScreen, AuthContext, App, roles, ApiClient) |
| `gradlew.bat assembleRelease --no-daemon` | **BUILD SUCCESSFUL** (delta: 5m49s; post-remediación H-01..H-06: 2m19s — timebox 12 min OK) |
| APK resultante | `mobile/android/app/build/outputs/apk/release/app-release.apk` — fecha 2026-08-19 21:30:03, 65.546.532 bytes (~62,5 MB) |

## 30.4 Estado del artefacto

- Versión se mantiene en **1.2.0 / versionCode 3** (sin bump — Ley 3).
- `versionHistory.js` ya tenía la entrada 1.2.0 (commit `9a1bf0f`); no se duplicó.
  El **AMEND autorizado por el Orchestrator** amplió la entrada 1.2.0 con los fixes
  del delta (login doble toque, safe areas, back físico, logout con confirmación,
  perfil completo, Catálogos con slot reservado) — sin crear versión nueva.
- APK 1.2.0 **reconstruido** con el bundle JS del delta + remediación (evidencia de
  Ley 3); auditoría integral PASS (0 críticos / 0 altos / 0 medios pendientes).

---

# 31. Release de producción — firma propia (H9, 2026-08-19)

## 31.1 Cambio

- Cierre parcial de la deuda **H9** (firma release): el `release` deja de usar
  `signingConfigs.debug` (keystore debug, password `android`) y pasa a un
  **keystore de producción propio**.
- `mobile/android/app/build.gradle`: nuevo `signingConfigs.release` que lee
  credenciales desde `mobile/android/keystore.properties` (**ignorado por git**);
  si el archivo no existe, cae a debug solo en desarrollo local (dev, no distribuir).
- `.gitignore`: añadidos `mobile/android/keystore.properties` y
  `mobile/android/app/insectos-beneficios-release.keystore` (nunca se suben).
- Keystore generado con `keytool` (RSA 2048, PKCS12, validez 10 000 días ≈ hasta
  2054): alias `insectos`, DN `CN=InsectosBeneficios, OU=ID, O=VanguardFresh, L=Lima, C=PE`.
- Ruta del keystore: `mobile/android/app/insectos-beneficios-release.keystore`.
  **Obligación del responsable:** respaldar el keystore y `keystore.properties`
  en al menos 2 lugares (bóveda + copia offline); su pérdida impide firmar
  actualizaciones futuras.

## 31.2 Verificación

| Comando | Resultado |
|---|---|
| `gradlew.bat assembleRelease --no-daemon` | **BUILD SUCCESSFUL** (3m7s; timebox 12 min OK) |
| `apksigner verify --print-certs` | **V2 Signer: `CN=InsectosBeneficios, OU=ID, O=VanguardFresh, L=Lima, C=PE`** (NO es Android Debug) |
| APK | `app-release.apk` — 2026-08-19 22:11:23, 65.546.556 bytes — versionName 1.2.0 / versionCode 3 |
| `git check-ignore` | keystore + keystore.properties ignorados correctamente |
| Firma SHA-256 | `356e07892a11479905cb8d23ea81a8dcae78abd368cab7b78a49a770f91d3d07` |

## 31.3 Instalación (cambio de firma)

- **Desinstalar la app instalada** (firmada con debug key) antes de instalar el
  APK de producción: firmas distintas → la instalación directa falla en Android.
- Los datos de negocio viven en el backend PostgreSQL (no en el celular); solo se
  pierde sesión/URL guardada en el keychain (se reconfigura en ServerCheck).
- Pendiente del H9 tras este cambio: **SSL Pinning** y restricción del cleartext
  HTTP en release (hoy `base-config cleartextTrafficPermitted="true"` modo dev).

## 31.4 Corrección de fallback (2026-08-19, tras reporte "No se pudo conectar")

- **Causa raíz:** al desinstalar la app se limpia el SecureStore (`apiUrl`); el
  ServerCheck prueba contra `BUILT_IN_API_URL` (fallback en `mobile/src/config.ts`),
  que aún apuntaba a la IP del HITO-001 (`10.13.18.97:6101`) → red inalcanzable.
- **Fix:** `mobile/src/config.ts` → `API_BASE_URL = 'http://192.168.18.229:6101/api/v1'`
  (IP actual de la laptop del responsable, red LUZ - 5G; histórico documentado).
- **Verificación:** `gradlew assembleRelease` BUILD SUCCESSFUL 2m42s; APK
  `app-release.apk` 2026-08-19 22:22:22, 65.546.560 bytes; firma de producción
  `CN=InsectosBeneficios, O=VanguardFresh` (SHA-256 `356e...`).
- **Para el usuario:** en el ServerCheck del celular debe presionar
  **"Restablecer"** (vuelve al fallback corregido) o escribir manualmente
  `http://192.168.18.229:6101/api/v1` y **"Guardar y probar"**. Alternativa: si la
  laptop cambia de IP (DHCP), configurarla manualmente en Settings.
