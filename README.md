# Sistema de Control de Entrega de Insectos Benéficos

Sistema de información para el control de stock semanal y la entrega de insectos
benéficos a fundos agrícolas. Cubre la programación semanal de publicación
(EN_PROCESO → PUBLICADO), la proyección mensual, los requerimientos por fundo/lote
(Registrado → Liberado) y el despacho/recepción/liberación en campo con
evidencias fotográficas y acta PDF.

## Stack

| Capa | Tecnología |
|---|---|
| Autenticación | JWT local (tabla `usuarios` + super admin) |
| Backend | Quarkus (Java), PostgreSQL + Flyway, iText PDF, SMTP |
| Mobile | React Native CLI (React Navigation, react-native-paper MD3, React Hook Form + Zod) |
| Web | React 18 + Vite + MUI |
| Infra | Docker / Docker Compose, Nginx, GitHub Actions, VPS Linux |

Decisiones de arquitectura vigentes y decisiones descartadas: ver
[`docs_implementacion/_auditoria/ADRs_AUDITORIA/`](docs_implementacion/_auditoria/ADRs_AUDITORIA/)
(`ADR-A001.md`, `ADR-A002.md`, `ADR-A003.md`).

## Estructura del repositorio

```text
backend/      API Quarkus v2 — auth/usuarios bajo /api/v1, login 3 pasos, roles en tabla, + programaciones/especies (V4)
mobile/       App React Native CLI 0.86 / React 19.2.3 — auth v2 (login 3 pasos, URL runtime,
              SecureStore/keychain) + módulo Programación — versión 1.3.0
web/          Frontend React + Vite (pendiente de scaffold)
docs_implementacion/
├── _sdd/                      Especificación, plan, tareas e implementación
├── _perfiles/                 Perfiles de desarrollador y auditor (agentes IA)
├── _auditoria/                Proceso de auditoría y ADRs
├── _diagramas/                Diagramas PUML + PNG
├── _usuario/                  Entregables PPTX/DOCX
├── OPENCode_orquestacion_agentes_proyecto_v2.md
└── transcripcion.md
```

## Estado actual

- **HITO-001 cerrado (2026-08-18) = Infraestructura base**: scaffold backend Quarkus + mobile
  base (auth/navegación) + autenticación JWT local (tabla `usuarios` + super admin).
- **HITO-002 cerrado (2026-08-19) = Auth v2**: login 3 pasos (rol→usuario→DNI), roles en tabla
  (`roles` + `usuarios.rol_id`, Flyway V3), API `/api/v1` + OpenAPI, cambio de contraseña con nuevo
  JWT, SecureStore/keychain + ServerCheck/Settings de URL runtime, Super Admin id=1 inmune
  (ADR-A003). Versión de artefactos: **1.1.0** (32 tests BE · 27 tests MO · APK v2 61.5 MB).
- **HITO-003 cerrado técnicamente (2026-08-19) = UI Vanguard y navegación mobile**: tema con tokens,
  fuentes Poppins, iconos Material Community, componentes base, navegación Home/slot vacío/Catálogos/
  Perfil, Perfil con historial y logout confirmado. Versión de artefactos: **1.2.0**, `versionCode 3`.
- **HITO-004 cerrado (2026-08-21) = Módulo Programación de Stock**: listado por mes, edición con
  restricción de días (lunes/jueves), creación de programaciones (botón "Nuevo"), endpoint
  `POST /api/v1/programaciones` con RBAC y migración V4. Versión de artefactos: **1.3.0**, `versionCode 4`
  (39 tests BE · 63 tests MO).
- **Pendientes**: frontend web (React/Vite), CI/CD (GitHub Actions), hitos funcionales
  (requerimientos, evidencias fotográficas). Ver
  [`docs_implementacion/_sdd/`](docs_implementacion/_sdd/).

## Verificación por capa

```text
Backend : mvn test / mvn clean package
Mobile  : npm run lint · npm test · gradle assembleRelease (release cold ≈ 2-6 min)
Web     : npm run lint · npm run build
Docker  : docker-compose build
```

Para agentes de IA (OpenCode): la fuente de verdad operacional es `AGENTS.md`.