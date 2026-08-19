# Auditoría — Proceso y ADRs

Propósito de `docs_implementacion/_auditoria/`:

- **README.md**: describe el proceso de auditoría aplicado a tareas e hitos (cómo se ejecutan las auditorías y dónde se registran los hallazgos).
- **ADRs_AUDITORIA/**: registro de decisiones de arquitectura vigentes (ADR = Architecture Decision Record). El catálogo de gates NO vive aquí: su fuente única es `docs_implementacion/_perfiles/perfil_auditor.md`.

## Proceso resumido (protocolo completo en `perfil_auditor.md`)

1. Cada tarea/HITO que cierra es sometida a **gate review** por el agente `auditor` (subagente con `edit: deny`).
2. Los gates aplicables se seleccionan SOLO del catálogo del perfil auditor (32 gates). El auditor no inventa criterios.
3. Toda auditoría registra: gates evaluados, evidencia de verificación (comandos ejecutados), resultado PASS/FAIL y hallazgos.
4. Un HITO se cierra con **auditoría integral PASS + verificación + `05_hito_NNN.md` + commit** coherente.
5. La coordinación de ciclos (diseño → implementación → auditoría) está definida en `OPENCode_orquestacion_agentes_proyecto_v2.md`.

## ADRs vigentes

| ADR | Título | Estado |
|---|---|---|
| [ADR-A001](ADRs_AUDITORIA/ADR-A001.md) | Decisiones de arquitectura vigentes | Aprobado |
| [ADR-A002](ADRs_AUDITORIA/ADR-A002.md) | Módulo Usuarios y Autenticación (1ª vertical): login por usuario, 3 perfiles, password default 00000000, DNI máx 8, soft delete | Aprobado |
| [ADR-A003](ADRs_AUDITORIA/ADR-A003.md) | Autenticación v2: login 3 pasos, roles en tabla (literales con espacios), URL runtime + SecureStore, /api/v1 + OpenAPI | Aprobado |

## Paquetes de auditoría por HITO

| HITO | Veredicto | Paquete |
|---|---|---|
| HITO-001 | PASS técnico condicionado (0 críticos) | `HITO-001` (hallazgos en `05_hito_001.md` §5) |
| HITO-002 | **PASS técnico integral (0 críticos, 0 altos)** | `HITO-002` (informe completo) |