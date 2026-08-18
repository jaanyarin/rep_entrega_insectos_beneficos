# ADR-A001 — Decisiones de arquitectura vigentes (Sistema de Control de Entrega de Insectos Benéficos)

- **Estado**: Aprobado
- **Fecha**: 2026-07-13 (alineado con `docs_implementacion/_sdd/01_especificacion.md`, doc. 1.1)
- **Responsable**: Jose Anyarin

## Contexto

El proyecto inicia su HITO-001 (infraestructura base) sin línea base de producto.
Al no existir decisiones de arquitectura registradas, los agentes y desarrolladores
carecerían de criterio para elegir tecnologías. Este ADR consolida las decisiones
confirmadas manualmente y deriva del stack ya usado en el bootstrap mobile existente.

## Decisiones

### D1 — Autenticación: JWT local

- **Decisión**: autenticación local por JWT con tabla `usuarios` (BCrypt) y super admin.
- **Descartado**: Microsoft Entra ID, OAuth, OIDC, Firebase, notificaciones push externas.
- **Justificación**: control local del ciclo de vida, sin dependencias externas de identidad;
  operativa offline-consciente de la organización.

### D2 — Backend: Quarkus + PostgreSQL + Flyway

- **Decisión**: API REST Quarkus (Java), PostgreSQL como base de datos, migraciones Flyway.
- **Complementos confirmados**: iText (PDF de acta por solicitud), envío de correos SMTP.
- **Justificación**: renderización de PDF controlada (acta), notificaciones por correo,
  stack Java estándar para el equipo.

### D3 — Mobile: React Native CLI + Gradle (sin Expo/EAS)

- **Decisión**: React Native CLI (bootstrap actual 0.86 / React 19.2.3), Gradle para builds.
- **Librerías confirmadas**: React Navigation, react-native-paper (MD3), React Hook Form + Zod,
  `versionHistory.js` como historial visible.
- **Descartado**: Expo / EAS.
- **Justificación**: control nativo de Gradle, preferencia del lifecycle del equipo, historial
  de versión propio (Ley 3).

### D4 — Web: React 18 + Vite + MUI

- **Decisión**: frontend web con React 18, Vite como bundler, Material UI (MUI).
- **Justificación**: consistencia de UX con el rol admin i+d (publicación/configuración) y
  tiempo de desarrollo por Vite.

### D5 — Almacenamiento de evidencias: Filesystem server + metadatos inmutables

- **Decisión**: JPG/PNG ≤ 5 MB, hasta 2 fotos por requerimiento, hasta solo-metadatos editables
  se conservan fuera de la imagen. Actas en PDF por solicitud.
- **Descartado**: Firebase (evidencias o backend de fotos).
- **Justificación**: control del lado del servidor (carpetas por requerimiento), inmutabilidad
  de metadatos de captura, acta PDF generada por el backend.

### D6 — Infraestructura: Docker / Docker Compose + Nginx + GitHub Actions + VPS Linux

- **Decisión**: despliegue en VPS Linux con Docker Compose, proxy inverso Nginx, CI/CD GitHub Actions.
- **Justificación**: reproducibilidad de entornos y ruta de despliegue definida del HITO-001.

### D7 — Capa offline: NO incluida en la línea base

- **Decisión**: la palabra "offline" en el perfil desarrollador es una nota MVP; no se implementa
  en la línea base ni se usa como justificación para nuevas dependencias.
- **Justificación**: evitar arrastre de dependencias no planeadas (regla de análisis previo, Ley 1).

## Consecuencias

- Toda nueva decisión de arquitectura o cambio de alguna anterior debe registrarse como **nuevo ADR**
  (ADR-A002+) antes de tocar código; no editar un ADR ya aprobado con fines retroactivos sin
  reconciliación explícita.
- El Orchestrator bloquea la implementación si un HITO necesita una decisión no registrada.
- Este ADR es referencia directa de `AGENTS.md` (§2 Stack confirmado).

## Referencias

- `docs_implementacion/_sdd/01_especificacion.md` — especificación funcional.
- `docs_implementacion/_perfiles/perfil_auditor.md` — catálogo de gates (fuente única).
- `docs_implementacion/openCode_orquestacion_agentes_proyecto_v2.md` — coordinación de agentes.
- `AGENTS.md` — fuente de verdad operacional (stack, hitos, verificación).