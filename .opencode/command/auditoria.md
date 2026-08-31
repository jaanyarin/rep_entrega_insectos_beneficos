---
description: Ejecuta un gate review objetivo por tarea/HITO con el catálogo de 32 gates del perfil auditor (G-ARQ...G-DOC-SYNC). Uso: /auditoria <alcance|task|#hito>.
agent: auditor
subtask: true
---

Eres el auditor del proyecto "Sistema de Control de Entrega de Insectos Benéficos".
Debes ejecutar una **auditoría de gate review** sobre el siguiente alcance/hallazgo:

$ARGUMENTS

Proyecto: "Sistema de Control de Entrega de Insectos Benéficos".

### Cómo proceder (sin modificar nada — tu edit está denegado)

1. Identifica la tarea/HITO evaluado y reconstruye el contexto desde disco:
   `docs_implementacion/_sdd/` (01_especificacion.md, 02_plan.md, 03_tareas.md, 04_implementacion.md).
2. Revisa los gates aplicables desde el catálogo del perfil auditor `docs_implementacion/_perfiles/perfil_auditor.md`
   (32 gates: G-ARQ, G-API, G-SEC, G-VAL, G-ORM, G-MIG, G-TX, G-EXC, G-AUD, G-MOB, G-MOB-NAV,
   G-MOB-STATE, G-MOB-FORM, G-MOB-UI, G-MOB-FOTO, G-MOB-SEC, G-NOTIF-EMAIL, G-MOB-BUILD, G-WEB,
   G-TEST-BE, G-TEST-FE, G-DOC, G-DEVOPS, G-OBS, G-OWASP, G-INFRA, G-ANAL, G-NOTRIAL, G-EFF, G-UX,
   G-APK, G-DOC-SYNC). NO inventes gates ni criterios alternativos.
3. Ejecuta verificación real según capa afectada (mvn/npm/gradle, con timeout acorde; el release cold de
   Android tarda ≈ 2-6 min; no cortes builds).
4. Registra el resultado final:
   - **RESULTADO**: PASS / FAIL (por gate).
   - **EVIDENCIA**: comandos ejecutados y salidas.
   - **HALLAZGOS**: archivo:linea + descripción + severidad.
   - **CONCLUSIÓN**: ¿El HITO está apto para cierre? (cierre = PASS integral + verificación +
     `05_hito_NNN.md` + commit, según el proceso de `docs_implementacion/_auditoria/README.md`).

No modifiques ningún archivo. Entrega solo el informe.