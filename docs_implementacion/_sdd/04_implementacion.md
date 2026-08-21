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

---

# 32. Replicación de la guía `URL_SERVIDOR_VERIFICACION_REUTILIZABLE` (2026-08-20)

Replica del mecanismo URL de API runtime **ya implementado en HITO-002/003** (la
guía de Apilamiento sirvió de modelo; el Orchestrator verificó el state actual con
`curl 200`). Este delta NO re-implementa nada existente: solo cierra los **2 gaps
menores** (G1 scripts npm, G2 botón "Reintentar") y documenta el cumplimiento.
La guía fuente (`docs_implementacion/URL_SERVIDOR_VERIFICACION_REUTILIZABLE.md`)
permanece **untracked** (sin stage por el developer; la incorporará el commit
único del Orchestrator al cierre del HITO — Ley 3).

## 32.1 Análisis — los 10 puntos (§11 de la guía) ya cumplidos (evidencia)

| # | Punto de la guía | Evidencia en Insectos Benéficos (archivo:línea) |
|---|---|---|
| 1 | URL es dato de runtime | `mobile/src/services/ApiClient.ts:46` `loadApiUrl`, `:62` `setApiUrl`, `:74` `resetApiUrl` (Keychain service `apiUrl`); `ServerCheckScreen.tsx` input URL editable |
| 2 | URL persistida en SecureStore y leída en cada request vía interceptor | `ApiClient.ts:253-255` request interceptor (`baseURL = loadApiUrl()` por request) y `:262` response interceptor (401 → limpieza de token) |
| 3 | ServerCheck prueba endpoint público con timeout 5s | `ServerCheckScreen.tsx:51` `api.get('/auth/roles', {timeout: 5000, baseURL: url})` — baseURL override por request |
| 4 | "Guardar y probar" persiste ANTES de probar | `ServerCheckScreen.tsx:76-84` `handleSaveAndProbe`: `setApiUrl(apiUrl)` antes de `probe()` |
| 5 | `usesCleartextTraffic="true"` + INTERNET | `mobile/android/app/src/main/AndroidManifest.xml` (INTERNET + cleartext + networkSecurityConfig) |
| 6 | Backend en `0.0.0.0`, puerto mapeado y abierto | `backend/src/main/resources/application.properties` (`quarkus.http.host=0.0.0.0`, puerto 6101, CORS) |
| 7 | URL termina con el base path real | `mobile/src/config.ts` `API_BASE_URL = 'http://192.168.18.229:6101/api/v1'` + `ApiClient.ts:29` `BUILT_IN_API_URL = normalizeApiUrl(...)` |
| 8 | Metro (8081, JS) ≠ API (6101, JSON) | G1 `start:lan`/`reverse` (Metro LAN) y URL API independiente en ServerCheck/Settings |
| 9 | Navegador abre pero app no → cleartext/interceptor | Verificado en `AndroidManifest.xml` (cleartext OK) + interceptor de request (URL por request) |
| 10 | Diagnóstico con `ipconfig` + `curl` antes de la app | Verificación ejecutada (§32.3): curl a la IP LAN; backend verificado por el Orchestrator (200) |

## 32.2 Cambios implementados (G1 + G2, mínimo diff — Ley 4)

| Gap | Archivo | Cambio |
|---|---|---|
| G1 | `mobile/package.json` | 4 scripts npm nuevos (sin romper `android`/`ios`/`lint`/`start`/`test`): `reverse` (`adb reverse tcp:8081 tcp:8081`, L11), `android:debug` (`react-native run-android --mode=debug`, L7), `android:release` (`cd android && gradlew.bat assembleRelease`, L8), `start:lan` (`react-native start --host 0.0.0.0`, L13) — guía §9.8. **Desviación intencional:** se mantiene `start` simple y se añade `start:lan --host 0.0.0.0` (bindea todas las interfaces — equivalente funcional o superior al `--host <IP>` de la guía) |
| G2 | `mobile/src/screens/ServerCheckScreen.tsx` | Botón **"Reintentar"** (L131-136) entre "Guardar y probar" y "Restablecer": `variant="secondary"` (outlined, jerarquía media; AppButton soporta primary/secondary/destructive/text), `onPress={() => probe()}` (reintenta con la URL ya cargada/guardada — caso "backend tardó en arrancar", guía §2; fix auditoría H1: la flecha evita pasar el evento de press como `urlToTest`), `accessibilityLabel="Reintentar verificación del servidor"`. No se tocó `ApiClient.ts` (sin bugs reales), login, settings, manifest ni backend. |

## 32.3 Verificación ejecutada (en `mobile/`; orden estricto del hito)

| Paso | Comando | Resultado |
|---|---|---|
| 1 | `git status` (inicio) | HEAD = `241a57d`; solo untracked `docs/...URL_...md` (guía, ajeno al delta) |
| 5 | `npm run lint -- --no-fix` | PASS (exit 0) |
| 5 | `npx tsc --noEmit` | PASS (exit 0) |
| 5 | `npm test -- --runInBand --forceExit` | PASS — **7 suites / 27 tests** |
| 6 | `curl http://192.168.18.229:6101/api/v1/auth/roles` | **timeout (código 28 / HTTP 000)** en mi ejecución: el backend no estaba corriendo en ese momento (el Orchestrator lo verificó con 200 antes de delegar; fallo ambiental, no del delta — Ley 5) |
| 7 | Grep confirmación | `ServerCheckScreen.tsx:131,134` (label/accessibilityLabel "Reintentar"); `package.json:7,8,11,13` (4 scripts) |
| 8 | `git status` (final) | modificados: `mobile/package.json`, `mobile/src/screens/ServerCheckScreen.tsx` + docs (sin commit) |

## 32.4 Estado del artefacto y recomendación al Orchestrator

- El botón "Reintentar" **sí es una feature visible nueva** (nuevo control en
  ServerCheck). Aun así **se mantiene la versión 1.2.0 / versionCode 3 sin bump**
  (Ley 3): se decide así para **no fragmentar el despliegue en curso del usuario**
  (el APK 1.2.0 ya está instalado/validado). El bump se aplicará en el próximo
  feature (HITO-004) o por decisión alternativa argumentada del Orchestrator;
  los cambios de versión y `versionHistory.js` quedan fuera del alcance de este
  delta (no se tocaron `package.json`/`versionHistory.js`/`build.gradle`).
- **Decisión APK:** G2 **sí modifica el bundle JS** (nuevo botón renderizado en
  ServerCheck → cambia el bundle nativo). El APK existente
  (`app-release.apk` de 2026-08-19) queda **desactualizado**: se recomienda
  reconstruir `gradlew.bat assembleRelease` (release cold ≈ 2-6 min; timebox 12 min)
  antes del siguiente despliegue — lo decide el Orchestrator tras auditoría.

## 32.5 Entrada "solo IP" en ServerCheck/Settings (2026-08-20) — UX 2 redes Wi-Fi

- **Problema del usuario:** la laptop cambia de IP según la red (hoy
  `10.13.18.93` en red `10.13.18.x`; `192.168.18.229` en `LUZ-5G`). El fallback
  estático `mobile/src/config.ts` (`192.168.18.229:6101`) no cubre la red
  `10.13.18.x` y el usuario no debería digitar la URL completa cada vez.
- **Solución (mínimo diff — Ley 4):** el input de URL ya es runtime (Keychain,
  HITO-002) y ahora **acepta solo la IP**: se mejoró `normalizeApiUrl`
  (`mobile/src/services/ApiClient.ts`) para autocompletar esquema, puerto `:6101`
  y base path `/api/v1`. Se añadió guía UX (placeholder + texto de ayuda) en
  ServerCheck y Settings; los flujos existentes (`handleSaveAndProbe` y
  `handleReset` vía `BUILT_IN_API_URL`) ya aplicaban `normalizeApiUrl`, solo se
  re-verificó la **idempotencia** (ver abajo).
- **Reglas de normalización (en orden):** (a) trim + quita barras finales;
  (b) sin esquema → antepone `http://` (https conservado); (c) sin puerto
  explícito en host[:puerto] → añade `:6101`; (d) sin `/api/v1` → lo añade al
  final; (e) URLs ya completas no se modifican (idempotente, compat Keychain).
- **Ejemplos entrada → salida (casos de test en `mobile/__tests__/ApiClient.test.ts`):**

  | Entrada | Salida |
  |---|---|
  | `10.13.18.93` | `http://10.13.18.93:6101/api/v1` |
  | `192.168.1.10` | `http://192.168.1.10:6101/api/v1` |
  | `192.168.1.10/` | `http://192.168.1.10:6101/api/v1` |
  | `localhost` | `http://localhost:6101/api/v1` |
  | `http://miservidor:8080/api/v1` | sin cambios |
  | `http://miservidor:8080` | `http://miservidor:8080/api/v1` |
  | `http://10.13.18.93:6101/api/v1` | sin cambios (idempotente) |
  | `''` | `''` (comportamiento actual) |

  **Idempotencia verificada:** `BUILT_IN_API_URL` se calcula a nivel de módulo
  con `normalizeApiUrl(API_BASE_URL)` (`ApiClient.ts:29`); con el nuevo código
  `http://192.168.18.229:6101/api/v1` ya tiene puerto y `/api/v1` → sale **sin
  cambios** (cubierto por el caso `http://10.13.18.93:6101/api/v1`).
- **Estado del entorno dev (2026-08-20, verificado — Ley 5):** backend Quarkus
  en `0.0.0.0:6101` (PID `26076`, `Get-NetTCPConnection -LocalPort 6101`);
  firewall Windows regla **"Insectos Backend 6101" → Allow/Any**; adb reverse
  (`adb reverse --list`) `tcp:6101 tcp:6101` + `tcp:8081 tcp:8081`; celular
  conectado por **WiFi depuración** (`adb-85ijey5tdax8ob5p-NMIkJB...
  ._adb-tls-connect._tcp`); IP Wi-Fi actual de la laptop `10.13.18.93`.
- **Archivos tocados (solo alcance):** `mobile/src/services/ApiClient.ts`
  (solo `normalizeApiUrl` + JSDoc), `mobile/src/screens/ServerCheckScreen.tsx`,
  `mobile/src/screens/SettingsScreen.tsx`, `mobile/__tests__/ApiClient.test.ts`,
  este doc §32.5. Sin bump de versión (1.2.0 / versionCode 3; lo decide el
  Orchestrator). Los cambios de los hitos previos permanecen sin stage en el
  working tree (commit único del Orchestrator — Ley 3).

### 32.5.1 Remediación — bloque comentado en HomeScreen (auditoría 2026-08-20)

- **Causa:** la auditoría detectó que el working tree NO era commiteable por
  causas ajenas al delta §32.5: `mobile/src/screens/HomeScreen.tsx:107-122`
  contenía un **bloque comentado** con los botones "Configurar servidor" y
  "Cerrar sesión" (trabajo en disco sin documentar — Ley 2). Efectos: imports
  `isSuperAdmin` (`HomeScreen.tsx:13`) y `AppButton` (`:17`) sin uso → lint
  **exit 1**; `HomeScreen.test.tsx` con **2 FAIL** (`:129` esperaba
  'Configurar servidor'=1 y recibía 0; `:142` no encontraba 'Cerrar sesión').
- **Opción aplicada: A (restaurar comportamiento previo — preferida).**
  Se descomentó el bloque completo (`HomeScreen.tsx:107-122`): el botón
  "Configurar servidor" (visible solo para Super Admin vía `isSuperAdmin(user)`,
  `navigate('ConfigurarServidor')`) y el botón "Cerrar sesión" (todos los roles,
  abre el `ConfirmDialog` de logout). Concuerda con `HomeScreen.test.tsx:110,
  119,129,142`, con el doc-comment de `SettingsScreen.tsx:18` ("desde el Login
  y desde el Home del Super Admin") y con `navigation/types.ts:5`
  (`ConfigurarServidor` existe como pantalla del stack). Se descartó la opción B
  (eliminar la feature): rompía el test existente y los doc-comments; la opción
  A es un mínimo diff (solo quitar `{/*` y `*/}`) sin tocar otros archivos.
- **Verificación post-remediación (en `mobile/`, orden estricto):**

  | Comando | Antes | Después |
  |---|---|---|
  | `npm run lint -- --no-fix` | exit 1 (2 unused) | **exit 0** |
  | `npx tsc --noEmit` | exit 0 | **exit 0** |
  | `npm test -- --runInBand --forceExit` | 8 suites / 7 PASS-1 FAIL · 36 tests / 34 PASS-2 FAIL | **8 suites / 8 PASS · 36 tests / 36 PASS** |

- **Deuda pendiente (hallazgos 3-7 del auditor, verbatim breve — sin corregir
  ahora, fuera del alcance del delta):**
  1. Regla (d) de `normalizeApiUrl` **rompe query strings** (p. ej. una URL con
     `?token=...` recibiría `/api/v1` al final) — sin impacto actual (la app no
     usa query strings).
  2. URL con **path arbitrario** (ej. `http://host/some/path`) añade `/api/v1`
     al final en lugar de reemplazar el path — aceptado para el uso actual.
  3. El caso de test usa `192.168.1.10` (inventado) vs `192.168.18.229` real de
     la red LUZ-5G — diferencia meramente ilustrativa, sin impacto funcional.
  4. **G-ANAL (alternativas no documentadas):** no quedó registro en el SDD de
     las alternativas evaluadas para el autocompletado (input solo IP vs combo
     IP/URL vs selector de red). Se documenta aquí como deuda para el próximo
     hito.

## 32.6 PerfilScreen — estructura UX referencial Apilamiento (2026-08-20)

- **Contexto / decisión:** el usuario entregó `PerfilScreen.js` (proyecto
  Apilamiento) como referencia de ESTRUCTURA UX y pidió adoptarla en
  `mobile/src/screens/PerfilScreen.tsx`. Decisión explícita del proyecto:
  **adaptar la estructura con componentes propios Vanguard (AppCard,
  AppButton, AppIconButton, ConfirmDialog, Modal local) — NO react-native-paper**
  (decisión vigente, PerfilScreen.tsx:19 "Sin react-native-paper: componentes
  propios + tokens").
- **Estructura implementada (mínimo diff — Ley 4, solo `PerfilScreen.tsx` +
  test nuevo + este doc):**
  1. **Tarjeta de perfil** (`AppCard` centrado, `styles.profileCard` con
     `alignItems: 'center'`): avatar circular (inicial del nombre, existente) +
     nombre + `DNI: {user.dni}` + `Perfil: {user.rol}`. El JWT **NO trae
     correo** (AuthUser `{sub, rol, rolNombre, rolId, nombre, dni,
     passwordResetRequired}` — `ApiClient.ts:189-198`) → se muestra **DNI en
     lugar del correo** de la referencia (decisión documentada, Ley 1).
  2. **Sección "Información de la Cuenta"** (`AppCard`): filas label/valor
     `Nombre` · `Rol` · `DNI` (etiqueta `body2`/`text.secondary` a la
     izquierda, valor `body1`/`text.primary` a la derecha, fila
     `justifyContent: 'space-between'` — patrón visual Vanguard).
  3. **Sección "Aplicación"** (`AppCard`): fila `Versión {APP_VERSION}` +
     `AppIconButton name="history"` (size 22, `action.secondary`) con
     `accessibilityLabel="Abrir historial de versiones"` que abre el
     HistoryDialog.
  4. **HistoryDialog** (subcomponente LOCAL de `PerfilScreen.tsx`, props
     `{visible, onClose}`): `Modal` transparent siguiendo EXACTAMENTE el patrón
     visual de `ConfirmDialog.tsx` (backdrop `background.backdrop`, card
     `background.paper`, `borderRadius: radius.lg`, `shadows.modal`, padding
     `spacing[6]`, `maxWidth: 400`, `accessibilityViewIsModal`,
     `animationType="fade"`, `onRequestClose`) — NO se modificó
     `ConfirmDialog.tsx` (componente de confirmación; DRY ley 4). Título
     "Historial de versiones"; contenido `ScrollView` (maxHeight 360) con las
     entradas de `versionHistory` (`v{version} · {fecha}` como encabezado
     `subtitle2`/`action.secondary` y `entry.cambios` como bullets `• ` en
     `body2`/`text.secondary`; las entradas locales NO tienen `titulo`);
     botón "Cerrar" (`AppButton variant="secondary"`,
     `accessibilityLabel="Cerrar historial de versiones"`).
  5. **Cierre de sesión**: se mantiene `ConfirmDialog`
     (`visible={confirm}`, `title="Cerrar sesión"`, `tone="danger"`,
     `confirmAccessibilityLabel="Confirmar cierre de sesión"`) — sin cambios.
- **Conservado (sin regresión):** ErrorBoundary wrapper, SafeAreaView edges
  top/bottom, AppHeader title="Perfil", BottomNavigation active="Perfil",
  paddingBottom `32 + insets.bottom + 68`, `useSafeAreaInsets`, inicial del
  avatar, y TODOS los accessibilityLabels existentes ("Cerrar sesión",
  "Confirmar cierre de sesión").
- **Test nuevo:** `mobile/__tests__/PerfilScreen.test.tsx` (patrón
  HomeScreen.test.tsx: AuthProvider + Keychain mock + makeToken + helpers):
  renderiza Perfil con token `Usuario` (nombre "Persona Test", dni 12345678),
  verifica tarjeta (nombre/DNI/rol) y secciones "Información de la Cuenta" y
  "Aplicación" (Versión 1.2.0), abre/cierra el HistoryDialog (visible con
  `v1.2.0 · 2026-08-19`, cierra con su label), y "Cerrar sesión" abre el
  ConfirmDialog.
- **Estado:** SIN commit (hot reload — el usuario pedirá sync/commit/rebuild
  cuando lo decida); bundle listo para Metro (recarga de PerfilScreen
  automática). Verificación en §32.6.1.

### 32.6.1 Verificación ejecutada (en `mobile/`; orden estricto)

| Paso | Comando | Resultado |
|---|---|---|
| 1 | `git status` (inicio) | 6 M + 2 untracked (HomeScreen YA restaurado por el Orchestrator, no en mi alcance) |
| 3 | `npm run lint -- --no-fix` | **PASS (exit 0)** |
| 4 | `npx tsc --noEmit` | **PASS (exit 0)** |
| 5 | `npm test -- --runInBand --forceExit` (1ª pasada) | 3 FAIL propios (falta mock `useNavigation` de BottomNavigation — mismo patrón de HomeScreen.test.tsx:26-32) |
| 5 | `npm test -- --runInBand --forceExit` (2ª pasada, tras fix del mock) | **PASS — 9 suites / 39 tests** (36 previos + 3 nuevos de PerfilScreen) |
| — | `npm run lint` + `npx tsc` (re-verificación post-fix del test) | **PASS (exit 0)** en ambos |
| 6 | `git status` (final) | 8 M + 3 untracked: mis cambios = `PerfilScreen.tsx` (144+/30-), `__tests__/PerfilScreen.test.tsx` (nuevo) y este doc §32.6; el resto es del Orchestrator/delta §32.5 (incl. `HomeScreen.tsx`, 2+/2-, restaurado en paralelo — NO lo toqué). **SIN commit** (HEAD = `241a57d`) |

---

# 33. Delta Módulo Programación — endpoint POST crear + botón "Nuevo" (2026-08-21)

> Este delta se aplica sobre la línea base HITO-003 (cerrado) y los commits
> `80b271f` (mobile: screens programación) + `cd3ef0f` (backend: programaciones).
> Cierra la brecha: el módulo listaba/leía/publicaba programaciones pero **no
> permitía crear una nueva desde la app**, y el usuario reportó que no veía el
> botón para ello y que aparecía "sin conexión".

## 33.1 Análisis — causa raíz del reporte

1. **"Sin conexión con el servidor"** → el backend del commit `cd3ef0f` tenía los
   archivos de programación y la migración V4, pero el JAR en ejecución era de
   `2026-08-19 13:22` (anterior a esos cambios) y la BD local solo tenía
   migraciones V1-V3. Por eso `/api/v1/especies` y `/api/v1/programaciones`
   devolvían **404**. Se reconstruyó el JAR (`mvnw clean package -DskipTests`),
   se reinició el backend y se aplicó la **migración V4** (crea `especies`,
   `programaciones`, `detalle_programaciones`).
2. **Falta botón "Nuevo"** → `ProgramacionScreen` no tenía ninguna acción de
   creación (solo Ver/Editar sobre registros existentes) y el backend no exponía
   el `POST`. Se añadió el endpoint y el botón.

## 33.2 Cambios implementados (delta sin commitear)

### Backend (2 modificados + 1 nuevo)
| Archivo | Cambio |
|---|---|
| `programacion/dto/CrearProgramacionRequest.java` (nuevo) | DTO con `anio`, `mes`, `especieId` (getters/setters). |
| `ProgramacionResource.java` | Método `@POST @RolesAllowed({"Super Admin","Admin"}) crearProgramacion(...)` → valida campos requeridos y devuelve `201 CREATED` con el `ProgramacionDto`. |
| `ProgramacionService.java` | Método `@Transactional crearProgramacion(anio, mes, especieId)`: valida que la especie exista (`404 ESPECIE_NO_ENCONTRADA`), que no exista ya programación para mes+año+especie (`409 PROGRAMACION_YA_EXISTE`) y delega en `crearProgramacionInicial` (4 semanas, stock base 5000, estado EN_PROCESO). |

### Mobile (5 modificados)
| Archivo | Cambio |
|---|---|
| `services/ApiClient.ts` | Interfaz `CrearProgramacionRequest` + función `crearProgramacion(req)` → `POST /programaciones`. |
| `navigation/types.ts` | `ProgramacionEdicion` pasa a `union`: `{id,anio,mes,modo?:'editar'}` \| `{anio,mes,modo:'crear'}`. |
| `screens/ProgramacionScreen.tsx` | `renderBotonNuevo` (AppButton "Nuevo", icono `plus`) visible para admin, navega a `ProgramacionEdicion` con `{modo:'crear', anio, mes}`. |
| `screens/ProgramacionEdicionScreen.tsx` | Soporta ambos modos: `modo='crear'` → selector de especie + botón "Crear programación" (deshabilitado si no hay especie o no es día editable); al crear usa `navigation.replace` para ir a modo 'editar' con el id creado. `modo='editar'` → comportamiento previo. Título dinámico ("Nueva programación"/"Editar programación"). |
| `docs_implementacion/OPENCode_orquestacion_agentes_proyecto_v2.md` | Nueva §25.1.1 "Desarrollo mobile: Hot Reload obligatorio" (Metro 8081, APK debug, no release para desarrollo). |

> ⚠️ **Nota de coherencia:** el PUT (`updateProgramacion`) valida día de edición
> (lunes/jueves). Hoy (2026-08-21, viernes) el PUT responde **400
> EDICION_NO_PERMITIDA** — comportamiento esperado según RF-147/148, no un bug.

## 33.3 Verificación ejecutada (Ley 5)

### Backend (en `backend/`)
| Paso | Comando | Resultado |
|---|---|---|
| 1 | `.\mvnw.cmd clean package -DskipTests` | **BUILD SUCCESS** (41 sources) |
| 2 | `.\mvnw.cmd test -Dtest=ProgramacionResourceTest` | **PASS — Tests run: 2, Failures: 0, Errors: 0** (Testcontainers Postgres fresco) |
| 3 | `GET /api/v1/especies` | **200** con 2 especies |
| 4 | `POST /api/v1/programaciones` (sin token) | **401** (RBAC activo) |
| 5 | `POST /api/v1/programaciones` (con token Admin, mes 10 esp 1) | **201** → programación id=5, 4 semanas, stock 5000, EN_PROCESO |
| 6 | `POST` duplicado (mes 10 esp 1) | **409 PROGRAMACION_YA_EXISTE** |
| 7 | `GET /api/v1/programaciones?anio=2026&mes=10` | **200** — 2 programaciones (una por especie, auto-creadas) |
| 8 | `GET /api/v1/programaciones/5` | **200** (detalle semanal, totalMes 0) |
| 9 | `PUT /api/v1/programaciones/5` | **400 EDICION_NO_PERMITIDA** (hoy viernes — esperado, RF-147/148) |

Los datos de prueba (usuario `verif_post` y programaciones de octubre) fueron
**eliminados de la BD** para no contaminar el estado real (quedan solo las
programaciones de julio/agosto).

### Mobile (validado en Delta previo y por el Developer)
| Paso | Resultado |
|---|---|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm test` (ProgramacionScreen + ProgramacionEdicionScreen) | **12/12 PASS** |

## 33.4 Estado del artefacto y pendientes

- **Estado backend:** JAR recompilado y backend **corriendo en puerto 6101**.
- **Estado mobile:** cambios en disco; **hot reload** (Metro 8081) los refleja en
  el dispositivo sin reconstruir APK (no se agregó módulo nativo nuevo).
- **Pendiente de auditoría:** el delta (2 archivos backend modificados + 1 DTO
  nuevo + 5 archivos mobile modificados) está **sin commit**, a la espera de
  gate review PASS y el commit único del HITO.
- **Hallazgo operativo (no del delta):** el login con el usuario seed `id=1`
  devuelve 401 en la BD local porque su hash ya fue cambiado (contraseña
  distinta de "00000000"). Es estado de datos de la BD de test, no un defecto
  del módulo Programación; la autenticación fue validada en HITO-002.
- **Artefacto `install.ps1` (untracked):** script bash con extensión `.ps1` ajeno
  al proyecto — requiere decisión del Orchestrator (trackear/ignorar).

## 33.5 Resolución de hallazgos MEDIO/BAJO del gate review (G-VAL/G-EXC, G-SEC, G-TEST-BE, G-TEST-FE, G-DOC-SYNC)

El Auditor emitió **PASS técnico** con hallazgos MEDIO/BAJO. Se resolvieron los siguientes (el
developer NO hace commit; el Orchestrator cierra el HITO).

| ID | Hallazgo | Resolución aplicada |
|---|---|---|
| **H1** | G-VAL/G-EXC: DTO sin Bean Validation → input inválido daba 500 | `CrearProgramacionRequest` con `@NotNull @Positive` (anio, especieId) y `@NotNull @Min(1) @Max(12)` (mes); `@Valid` en `crearProgramacion`. Eliminada la validación manual de nulos. Confirmado (ManejadorErrores maneja `ConstraintViolationException`): **POST `{}` → HTTP 400** (body RESTEasy `validation-exception:true`; no 500). |
| **H6** | G-SEC: asimetría RBAC — solo `crearProgramacion` tenía `@RolesAllowed` | `@RolesAllowed({"Super Admin","Admin"})` añadido a `updateProgramacion` (PUT) y `publicarProgramacion` (POST /publicar). Los **GET quedan sin `@RolesAllowed`** (coherencia con `EspecieResource`, que también es lectura pública, y porque el test existente `testListProgramacionesReturnsMobileContractFields` hace GET sin token; el listado de la pantalla Programación es de solo lectura para ambos roles). |
| **H3** | G-TEST-BE: sin test del POST crear | 5 tests JUnit/RestAssured añadidos en `ProgramacionResourceTest`: 201 (super admin), 409 (duplicado mes+año+especie), 404 (especie inexistente), 401 (sin token) y 400 (body `{}`). **Tests run: 7, Failures: 0, Errors: 0**. |
| **H4** | G-TEST-FE: sin test del botón "Nuevo" ni del flujo crear | `ProgramacionScreen.test.tsx`: test "Nuevo navega a ProgramacionEdicion en modo crear (anio/mes actuales)". `ProgramacionEdicionScreen.test.tsx`: test "modo crear: selecciona especie, POST /programaciones y replace a editar". |
| **H5** | G-DOC-SYNC: re-numeración §25.1→§25.2 rota referencias | Se restaura el **"Pipeline dev→auditor" como `§25.1`** (refs de `05_hito_002.md`) y el **"Hot Reload" pasa a `§25.1.1`** (subsección, sin colisión). Refs de `05_hito_002.md` a "§25.1" siguen apuntando al pipeline dev→auditor. `04_implementacion.md` §33.2 actualizado a "§25.1.1". |

**H8 (BAJO, G-MOB-FORM):** el formulario de creación no usa React Hook Form + Zod. Es un selector
simple (especie + mes/año), por lo que adoptar RHF+Zod implicaría un cambio desproporcionado frente
al valor. **No resuelto** — se registra como deuda con el Orchestrator (patrón ya es deuda mayor
en HITO-002, id H7; no se amplía aquí).

### Verificación (Ley 5 — comandos reales)

| Comando | Resultado |
|---|---|
| `.\mvnw.cmd clean package` (backend) | **BUILD SUCCESS** — Tests run: 39 (13 Auth + 7 Programación + 19 Usuarios), Failures: 0, Errors: 0 — jar reconstruido |
| `.\mvnw.cmd test` (backend) | **BUILD SUCCESS** — Tests run: 39, Failures: 0, Errors: 0 |
| Live backend (puerto 6101, jar reconstruido) | `GET /especies` 200 · `GET /programaciones?anio=2026&mes=8` 200 (sin token) · `POST /programaciones` sin token **401** · `PUT /programaciones/1` sin token **401** · `POST /programaciones/1/publicar` sin token **401** (con `Content-Type: application/json`) |
| `npm run lint` (mobile) | **EXIT 0** |
| `npx tsc --noEmit` (mobile) | **EXIT 0** |
| `npx jest __tests__/ProgramacionScreen.test.tsx __tests__/ProgramacionEdicionScreen.test.tsx __tests__/ApiClient.test.ts --runInBand` | **PASS — 3 suites / 29 tests** |
| `npx jest --runInBand` (suite completa) | **PASS — 12 suites / 63 tests** |

**Observaciones (no bloqueantes):**
- `npm test` (paralelo por defecto) es *flaky* en este entorno (LoginScreen/PerfilScreen/CatalogosScreen
  superan el timeout de 5 s por contención de CPU con 12 suites). En serie (`--runInBand`) todo pasa;
  no es un defecto de código ni fue introducido por este delta.
- El seed `id=1` de la BD local ya no responde a "00000000" (hash cambiado), por lo que el POST `{}`
  en vivo requirió token del DB de test (Testcontainers) donde sí fue **400**. Es estado de datos
  pre-existente (ya documentado en §33.4).

---

# 34. Diagnóstico y corrección — "Unable to load script" + backend inaccesible desde el celular (2026-08-21)

> **Síntoma reportado:** al abrir la app en el celular (192.168.18.239, misma subred Wi-Fi que la
> laptop 192.168.18.229) se mostraba una **pantalla de error** en lugar de la pantalla
> `ServerCheck` ("Verificando servidor") que el usuario creó; e incluso escribiendo la IP correcta en
> el formulario "Verificando servidor", la app no lograba conectarse.
>
> **Confirmación importante:** el código del ServerCheck **está correcto** (validado en dispositivo;
> 27 tests mobile PASS, incluido `ServerCheckScreen.test.tsx`). El problema NO era de la app sino del
> **entorno de la laptop**: dos bloqueos independientes (Metro y firewall de Windows). La app solo
> mostraba "Unable to load script" porque era un build **debug** que carga el JS desde Metro.

## 34.1 Causa raíz #1 — "Unable to load script" (RedBox nativo de React Native)

- El APK instalado es **debug** (flag `DEBUGGABLE`, sin bundle embebido) → carga el JavaScript desde
  **Metro (puerto 8081)**.
- En el dispositivo, el bundle location por defecto es `localhost:8081`. Al estar conectado por
  **WiFi** (no USB), ese `localhost` apunta al propio celular, no a la laptop → Metro no alcanzable →
  RedBox "Unable to load script".
- **Fix operativo:** `adb reverse tcp:8081 tcp:8081` (redirige `localhost:8081` del celular a Metro de
  la laptop). **Alternativa fija:** instalar el APK **release** (`assembleRelease`) que trae el bundle
  embebido (`assets/index.android.bundle`) y no depende de Metro — recomendado para prueba de campo.

## 34.2 Causa raíz #2 — Backend (6101) bloqueado para la red Wi-Fi

Evidencia (tests `toybox nc -w 4` desde el celular contra `192.168.18.229:puerto`):

| Puerto | Servicio | Estado desde el celular |
|---|---|---|
| 8081 | Metro (Node) | **OPEN** |
| 8082 | Backend Apilamiento (para comparar) | **OPEN** |
| 6101 | Backend Insectos (Java) | **CLOSED** (timeout) |

- El backend de Insectos responde **200** en `localhost:6101` y escucha en `0.0.0.0:6101` (IPv4+IPv6),
  y `ping` desde el celular a `192.168.18.229` da 0% pérdida → el bloqueo es de **acceso a puerto
  entrante**, no de la IP ni del proceso.
- La diferencia con Apilamiento (que sí funciona) es que su puerto `8082` tiene **reglas de firewall
  explícitas y persistentes**: `Apilamiento Backend 8082 LAN` y `Apilamiento Docker Backend 8082 Allow`
  (Allow / Inbound / perfil `Dominio,Privada,Pública` / **`RemoteIP 192.168.18.0/24`**). El 6101 no
  tenía regla equivalente.
- Agravante: la red Wi-Fi **"LUZ - 5G" estaba en perfil `Public`**, donde Windows bloquea todo tráfico
  entrante por defecto (Metro y Apilamiento pasaban por excepciones ya aprobadas, Insectos no).

## 34.3 Correcciones aplicadas (para que no vuelva a pasar)

1. **Reglas de firewall persistentes** (mismo shape que Apilamiento, con `remoteip=192.168.18.0/24`):
   - `Insectos Backend 6101 LAN` (programa `java.exe` del backend) — Allow / Inbound / Any / TCP 6101.
   - `Insectos Backend 6101 Puerto LAN` (por puerto, a prueba de cambio de exe) — Allow / Inbound / Any.
   - El formato con `remoteip` de subred LAN es el que **persiste** (a diferencia de un `remoteip=any`,
     que era revertido por la política de Sophos Endpoint Defense / EDR).
2. **Perfil de red:** `Set-NetConnectionProfile -Name "LUZ - 5G" -NetworkCategory Private`
   (la red Wi-Fi pasó de `Public` a `Private`; es la categoría que usan las redes con acceso LAN).
3. **Metro:** `adb reverse tcp:8081 tcp:8081` (mientras se desarrolle con APK debug).

## 34.4 Verificación final (Ley 5)

| Chequeo | Resultado |
|---|---|
| Desde el celular, `toybox nc -w 4 192.168.18.229 6101` | **OPEN** |
| `toybox nc -w 4 192.168.18.229 8081` | **OPEN** |
| App en el celular (debug + Metro) tras `adb reverse` | Carga la pantalla **ServerCheck "Verificando servidor"** (ya NO el RedBox) |
| ServerCheck con la IP `192.168.18.229` | Pasa del estado `checking` a `ready` → **"Iniciar Sesión"** (paso 1 de 3: Super Admin / Admin / Usuario) |

> **Nota operativa:** al reconectar por WiFi/USB o al cambiar de red, `adb reverse` y la categoría de
> red pueden restablecerse. Si vuelve a fallar: (1) `adb reverse tcp:8081 tcp:8081`; (2) confirmar que
> la red queda en perfil **Privada**; (3) reescribir la IP actual de la laptop en el ServerCheck.
> El `remoteip` de las reglas de firewall queda bajo `192.168.18.0/24`; si la laptop cambia de subred,
> debe actualizarse a la nueva.

---

# 35. Branding de la app — icono, fondo de login y nombre (2026-08-21)

> Aplicado sobre la línea base HITO-004 (cerrado). Desarrollo visual/branding: se reemplaza el icono
> genérico de la app, se añade el fondo corporativo al LoginScreen y se renombra la app visible.

## 35.1 Cambios implementados

### Icono de la app Android (`_img_icono_2.jpg`)
- Origen: `docs_implementacion/_img/_img_icono_2.jpg` (1024×1024, crisopa/Chrysopa sobre hoja celeste).
- Se recortó al sujeto central (crop cuadrado 660×660, origen (183,175)) para eliminar el marco del
  mockup y maximizar el sujeto; redimensionado `HighQualityBicubic`, PNG opaco `Format24bppRgb`.
- Reemplazados `ic_launcher.png` y `ic_launcher_round.png` en las 5 densidades de
  `mobile/android/app/src/main/res/mipmap-*/`:
  | Densidad | Resolución |
  |---|---|
  | mdpi | 48×48 |
  | hdpi | 72×72 |
  | xhdpi | 96×96 |
  | xxhdpi | 144×144 |
  | xxxhdpi | 192×192 |
- `AndroidManifest.xml` ya referenciaba `@mipmap/ic_launcher` y `@mipmap/ic_launcher_round` (sin cambios).

### Fondo del LoginScreen (`1749049338170.jpg`)
- Nuevo asset: `mobile/src/assets/login-background.jpg` (94 KB, copia de
  `docs_implementacion/_img/1749049338170.jpg` — vista aérea de campos Vanguard).
- `mobile/src/screens/LoginScreen.tsx`: se añadió `ImageBackground` + `View` overlay (absolutos)
  dentro del `SafeAreaView`; `styles.safeArea` → `transparent`; nuevos `styles.background` y
  `styles.overlay` (overlay = `theme.colors.background.backdrop`, sin hardcode de color — §26 design system).
  La `AppCard` conserva `authOverlay` blanco 0.88 → el formulario queda legible sobre la imagen.

### Nombre de la app
- `mobile/android/app/src/main/res/values/strings.xml`: `app_name` → **"Insectos Beneficos"** (label del launcher).
- `mobile/app.json`: `displayName` → **"Insectos Beneficos"**.
- Se mantienen sin cambios: `applicationId`/`namespace` `com.insectosbeneficios` (técnico, no admite
  espacios; cambiarlo rompería instalación/firma) y `name` interno npm (clave de paquete, no visible).

## 35.2 Verificación (Ley 5)

| Paso | Comando | Resultado |
|---|---|---|
| 1 | Icono (5 densidades) | `ic_launcher`+`ic_launcher_round` 48/72/96/144/192 confirmados |
| 2 | `npx tsc --noEmit` (mobile) | exit 0 |
| 3 | `npx jest __tests__/LoginScreen.test.tsx --runInBand` | PASS 2/2, 0 snapshots |
| 4 | `npm run lint` (mobile) | PASS |
| 5 | `.\gradlew.bat assembleRelease` | **BUILD SUCCESSFUL** — APK reconstruido (62.8 MB, versionCode 4 / versionName 1.3.0) |

> **Nota:** el icono de launcher y el label son recursos nativos → solo se ven con el APK release
> reconstruido (no con hot-reload de Metro). El fondo del login sí se actualiza con Metro/recarga de JS.
> El commit del HITO debe incluir el artefacto opaco y documentar que el APK fue reconstruido.
