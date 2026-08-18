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
[`docs_implementacion/_auditoria/ADRs_AUDITORIA/ADR-A001.md`](docs_implementacion/_auditoria/ADRs_AUDITORIA/ADR-A001.md).

## Estructura del repositorio

```text
backend/      API Quarkus (HITO-001 pendiente de scaffold)
mobile/       App React Native (bootstrap 0.86 / React 19.2.3)
web/          Frontend React + Vite (HITO-001 pendiente de scaffold)
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

- Hito actual: **HITO-001 = Infraestructura base** (scaffold backend Quarkus +
  mobile base + web base + autenticación JWT local + CI/CD base). Ver
  [`docs_implementacion/_sdd/`](docs_implementacion/_sdd/).
- El backend aún no tiene código de aplicación; mobile solo contiene el bootstrap
  con login local; web no ha sido scaffoldada.

## Verificación por capa

```text
Backend : mvn test / mvn clean package
Mobile  : npm run lint · npm test · gradle assembleRelease (release cold ≈ 2-6 min)
Web     : npm run lint · npm run build
Docker  : docker-compose build
```

Para agentes de IA (OpenCode): la fuente de verdad operacional es `AGENTS.md`.