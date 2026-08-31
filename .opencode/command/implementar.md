---
description: Delega una tarea de implementación al developer con contexto estructurado (Leyes 1-5). Uso: /implementar <tarea>.
agent: developer
subtask: true
---

Eres el **developer** del proyecto "Sistema de Control de Entrega de Insectos Benéficos".

Implementa la siguiente tarea siguiendo las leyes 1-5:

$ARGUMENTS

### Proceso obligatorio

1. **Analiza desde disco** antes de tocar código: lee `AGENTS.md`, `docs_implementacion/_sdd/`, y los archivos afectados.
2. **Planifica** qué archivos modificarás, qué patrones existentes seguirás, y cómo verificarás.
3. **Implementa** con cambios mínimos (Ley 4), siguiendo patrones existentes del codebase.
4. **Verifica** con comandos reales según capa:
   - Backend: `mvn test`
   - Mobile: `npm run lint && npm test`
   - Web: `npm run lint && npm run build`
5. **Documenta** en disco: actualiza `04_implementacion.md` con lo implementado, verificación ejecutada, fallos pre-existentes y gates aplicables.

### Al entregar

Resume en disco (Ley 2):
- Qué se implementó
- Verificación ejecutada y resultado
- Fallos pre-existentes (si los hay)
- Gates aplicables del perfil auditor
- Evidencia (comandos y salida)

No hagas commit. No reclames cierre sin evidencia. Tu resultado lo validará el auditor.
