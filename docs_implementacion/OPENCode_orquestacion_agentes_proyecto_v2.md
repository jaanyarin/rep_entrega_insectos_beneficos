# OpenCode — Orquestación de Agentes para el Proyecto

## 1. Propósito

Este documento define cómo OpenCode debe orquestar el desarrollo del proyecto mediante agentes y subagentes especializados, coordinados y no redundantes.

Los perfiles funcionales y técnicos existentes siguen siendo la fuente de conocimiento del proyecto:

- `docs_implementacion/_perfiles/perfil_desarrollador.md`
- `docs_implementacion/_perfiles/perfil_auditor.md`

Este documento **no reemplaza esos perfiles**. Define exclusivamente la mecánica de coordinación, delegación, control, auditoría y cierre.

---

# 2. Decisiones técnicas confirmadas

| Área | Decisión |
|---|---|
| Autenticación | JWT local exclusivamente |
| Entra ID | Descartado |
| OAuth 2.0 / OIDC | No obligatorio para este proyecto |
| Web | React + Vite |
| Mobile | React Native CLI + Gradle |
| Developer | Puede modificar código |
| Developer | No realiza commit final del HITO |
| Auditor | No modifica código |
| Auditoría | Después de cada tarea modificadora |
| Auditoría | Auditoría integral al cierre del HITO |
| Ciclos Developer ↔ Auditor | Máximo 3 |
| Tarea | Unidad de trabajo |
| HITO | Agrupador de varias tareas |
| Commit | Preferentemente al cierre validado del HITO |
| SDD | Fuente de verdad del estado funcional/técnico del proyecto |
| Git | Historial del código y entregables |
| `.opencode/state` | No obligatorio inicialmente |
| Perfil Developer | Fuente de reglas para construir |
| Perfil Auditor | Fuente única del catálogo de gates |
| Orchestrator | Fuente de reglas de coordinación |

---

# 3. Jerarquía de fuentes de verdad

La orquestación debe respetar esta separación:

```text
                         PROYECTO
                            |
                 +----------+----------+
                 |                     |
              AGENTS.md              SDD
                 |                     |
                 |             especificación,
                 |             hitos, decisiones,
                 |             estado funcional
                 |
        +--------+---------+
        |                  |
perfil_desarrollador   perfil_auditor
        |                  |
   cómo construir      cómo evaluar
        |                  |
        +--------+---------+
                 |
            ORCHESTRATOR
                 |
       cómo coordinar ambos
```

## 3.1 `perfil_desarrollador.md`

Define cómo debe trabajar el Developer:

- arquitectura;
- stack;
- patrones;
- seguridad;
- testing;
- documentación;
- Leyes 1–5;
- construcción APK;
- criterios UI/UX;
- SDD;
- versionado.

## 3.2 `perfil_auditor.md`

Es la **fuente única del catálogo de gates de auditoría**.

No se deben duplicar los gates en otros agentes.

Ejemplos:

- `G-ARQ`
- `G-API`
- `G-SEC`
- `G-VAL`
- `G-ORM`
- `G-MIG`
- `G-TX`
- `G-EXC`
- `G-AUD`
- `G-MOB`
- `G-MOB-NAV`
- `G-MOB-STATE`
- `G-MOB-FORM`
- `G-MOB-UI`
- `G-MOB-FOTO`
- `G-MOB-SEC`
- `G-NOTIF-EMAIL`
- `G-MOB-BUILD`
- `G-WEB`
- `G-TEST-BE`
- `G-TEST-FE`
- `G-DOC`
- `G-DEVOPS`
- `G-OBS`
- `G-OWASP`
- `G-INFRA`
- `G-ANAL`
- `G-NOTRIAL`
- `G-EFF`
- `G-UX`
- `G-APK`
- `G-DOC-SYNC`

El Auditor selecciona únicamente los gates aplicables al cambio, pero no inventa criterios alternativos.

> **Coherencia con `perfil_auditor.md`:** este catálogo (32 gates) es la copia espejo de la fuente única. Si `perfil_auditor.md` cambia, el Orchestrator debe actualizar esta lista en el mismo commit o detenerse y solicitar reconciliación (Ley 2 / drift documental = 0).

## 3.3 Documento de orquestación

Este documento define:

- quién recibe el prompt;
- cómo se interpreta;
- cómo se descompone;
- qué agente trabaja;
- cuándo se audita;
- cómo se corrige;
- cuándo se detiene;
- cuándo se solicita intervención humana;
- cuándo se cierra una tarea;
- cuándo se cierra un HITO;
- cuándo se permite un commit.

---

# 4. Arquitectura de agentes

La estructura conceptual es:

```text
                         USUARIO
                            |
                            v
                    +---------------+
                    | ORCHESTRATOR  |
                    +---------------+
                            |
                +-----------+-----------+
                |                       |
                v                       v
        +---------------+       +---------------+
        |   DEVELOPER   |       |    AUDITOR    |
        +---------------+       +---------------+
                |                       |
                | modifica             | solo lectura/
                | código               | verificación
                v                       v
             CÓDIGO <---------------- AUDITORÍA
```

## 4.1 Orchestrator

Es el único agente responsable de coordinar el flujo.

Responsabilidades:

1. interpretar el prompt del usuario;
2. consultar el estado existente;
3. determinar si corresponde una tarea nueva, una corrección, una auditoría o un HITO;
4. identificar el HITO activo;
5. descomponer el trabajo;
6. evitar duplicación de tareas;
7. delegar al Developer;
8. solicitar Auditoría;
9. procesar PASS/FAIL/BLOCKED;
10. controlar los tres ciclos máximos;
11. impedir avanzar cuando existe un bloqueo;
12. cerrar el HITO cuando todos sus requisitos estén satisfechos;
13. coordinar documentación;
14. controlar el commit final del HITO.

El Orchestrator **no debe implementar código de negocio salvo una intervención mínima de coordinación estrictamente necesaria**.

---

# 5. Developer

El Developer es el agente ejecutor.

Debe consultar siempre:

```text
AGENTS.md
perfil_desarrollador.md
SDD relevante
ADRs relevantes
código existente
tests/configuración existente
```

Antes de modificar código debe aplicar obligatoriamente:

```text
PLAN
  ↓
ANALIZAR
  ↓
IMPLEMENTAR
  ↓
VERIFICAR
  ↓
DOCUMENTAR
```

Nunca:

```text
PROBAR
  ↓
FALLA
  ↓
CAMBIAR COSAS A CIEGAS
  ↓
PROBAR OTRA VEZ
```

## Developer puede

- leer archivos;
- buscar patrones;
- modificar código;
- crear archivos;
- ejecutar tests;
- ejecutar lint;
- ejecutar builds;
- ejecutar verificaciones;
- documentar;
- preparar cambios para auditoría.

## Developer no debe

- ignorar el perfil;
- modificar arquitectura sin justificarla;
- duplicar código existente;
- realizar trial/error;
- saltarse el análisis previo;
- declarar una tarea como validada;
- aprobar su propio trabajo;
- modificar gates del Auditor;
- hacer commit final del HITO.

---

# 6. Auditor

El Auditor es independiente del Developer.

Debe consultar:

```text
AGENTS.md
perfil_auditor.md
perfil_desarrollador.md
SDD relevante
ADRs relevantes
diff real
código real
tests
logs/verificaciones
```

## Auditor puede

- leer;
- inspeccionar;
- ejecutar verificaciones;
- revisar diff;
- revisar arquitectura;
- seleccionar gates aplicables;
- emitir hallazgos;
- clasificar severidad;
- emitir PASS;
- emitir FAIL;
- emitir BLOCKED;
- generar documentación de auditoría.

## Auditor no puede

- modificar código del Developer;
- corregir el defecto directamente;
- aprobarse a sí mismo;
- alterar la definición de un gate;
- ocultar un hallazgo;
- convertir un FAIL en PASS sin evidencia;
- hacer cambios funcionales para "ayudar" al Developer.

La independencia del Auditor es obligatoria.

---

# 7. Flujo principal

Ante un prompt del usuario:

```text
PROMPT
  |
  v
ORCHESTRATOR
  |
  +-- consultar estado
  |
  +-- consultar SDD
  |
  +-- identificar HITO
  |
  +-- analizar alcance
  |
  +-- detectar trabajo existente
  |
  +-- descomponer tareas
  |
  v
PLAN
  |
  v
DEVELOPER
  |
  +-- análisis previo
  +-- alternativas
  +-- implementación
  +-- verificación
  +-- documentación
  |
  v
AUDITOR
  |
  +-- seleccionar gates
  +-- revisar evidencia
  +-- revisar diff
  +-- ejecutar verificaciones
  |
  +----------+----------+
  |                     |
 PASS                    FAIL
  |                     |
  |                     v
  |                 DEVELOPER
  |                     |
  |                 ciclo N+1
  |                     |
  |                 AUDITOR
  |
  v
TAREA VALIDADA
  |
  v
siguiente tarea
  |
  v
AUDITORÍA INTEGRAL HITO
  |
  +----------+----------+
  |                     |
 PASS                  FAIL
  |                     |
  v                     v
VERSIONADO          REMEDIACIÓN
  |
  v
COMMIT HITO
```

---

# 8. Tareas

Una tarea es la unidad mínima de trabajo coordinado.

Ejemplo:

```text
HITO-007
  |
  +-- T007.01 Entidad Requerimiento
  +-- T007.02 Migración Flyway
  +-- T007.03 Repository
  +-- T007.04 Service
  +-- T007.05 API REST
  +-- T007.06 Web
  +-- T007.07 Mobile
  +-- T007.08 Tests
  +-- T007.09 E2E
```

No toda tarea necesita modificar código, pero toda tarea modificadora requiere auditoría.

---

# 9. Dependencias entre tareas

El Orchestrator debe crear un grafo de dependencias antes de delegar.

Ejemplo:

```text
Entidad
  |
  v
Migración
  |
  v
Repository
  |
  v
Service
  |
  v
Controller/API
  |
  +---------> Web
  |
  +---------> Mobile
  |
  v
Tests E2E
```

No se debe ejecutar una tarea que depende de otra todavía no validada.

---

# 10. Prohibición de duplicidad

Antes de crear una tarea, el Orchestrator debe comprobar:

1. si ya existe una tarea equivalente;
2. si ya existe código equivalente;
3. si ya existe un patrón reutilizable;
4. si el cambio está parcialmente implementado;
5. si existe un HITO anterior que ya resolvió el problema;
6. si existe documentación que contradice la nueva tarea.

Si ya existe una solución reutilizable:

```text
NO CREAR
```

Se reutiliza.

Esto implementa la Ley 4 — Eficiencia.

---

# 11. Auditoría por tarea

Toda tarea que modifique código debe seguir:

```text
Developer
   |
   v
implementación
   |
   v
verificación del Developer
   |
   v
Auditor
```

El Auditor selecciona los gates aplicables.

Ejemplo para una API:

```text
G-ARQ
G-API
G-SEC
G-VAL
G-EXC
G-AUD
G-TEST-BE
```

No necesariamente todos los gates del catálogo.

---

# 12. Resultado de auditoría

El Auditor debe producir exactamente uno de:

## PASS

La tarea cumple los gates aplicables.

## FAIL

Existe al menos un incumplimiento que requiere remediación.

El reporte debe contener:

```text
Gate:
Severidad:
Archivo:
Línea:
Evidencia:
Problema:
Remediación:
```

## BLOCKED

La auditoría no puede concluir porque falta una condición externa.

Ejemplos:

- dispositivo Android no disponible;
- dependencia externa inaccesible;
- credencial necesaria no disponible;
- build imposible por infraestructura;
- requisito ambiguo.

BLOCKED no equivale a PASS.

---

# 13. Severidad

El Auditor debe respetar exactamente la clasificación de `perfil_auditor.md`:

```text
CRÍTICO
ALTO
MEDIO
BAJO
```

Los criterios de bloqueo son los definidos por el perfil auditor.

No crear una escala paralela.

---

# 14. Ciclo máximo Developer ↔ Auditor

Máximo:

```text
3 ciclos
```

Ejemplo:

```text
Ciclo 1
Developer → Auditor → FAIL

Ciclo 2
Developer → Auditor → FAIL

Ciclo 3
Developer → Auditor → FAIL

       ↓

BLOQUEO
       ↓
SOLICITAR INTERVENCIÓN HUMANA
```

Nunca crear un loop infinito.

Si el tercer ciclo termina en FAIL, el Orchestrator debe detener la automatización.

---

# 15. HITO

Un HITO agrupa múltiples tareas relacionadas.

Ejemplo:

```text
HITO-007
Gestión de Requerimientos

T007.01
T007.02
T007.03
T007.04
T007.05
T007.06
T007.07
T007.08
```

Un HITO solo puede cerrarse cuando:

- sus tareas requeridas están validadas;
- no existen bloqueos abiertos;
- la auditoría integral PASS;
- tests requeridos PASS;
- documentación actualizada;
- versionado coherente;
- artefactos requeridos disponibles o explícitamente marcados como pendientes según las leyes del perfil;
- el estado del proyecto queda recuperable desde disco.

---

# 16. Auditoría integral del HITO

Además de las auditorías por tarea, al finalizar el HITO se ejecuta una revisión integral.

Debe comprobar:

```text
Arquitectura
API
Seguridad
Base de datos
Mobile
Web
Tests
Documentación
DevOps
Observabilidad
Versionado
Trazabilidad
Ley 1
Ley 2
Ley 3
Ley 4
Ley 5
```

Los gates concretos provienen exclusivamente de:

```text
perfil_auditor.md
```

---

# 17. Política de commits

## Regla principal

Una tarea no implica automáticamente un commit.

El flujo recomendado es:

```text
TAREAS
   ↓
auditorías individuales
   ↓
HITO COMPLETO
   ↓
auditoría integral
   ↓
PASS
   ↓
versionado/documentación
   ↓
COMMIT
```

Esto reduce ruido y mantiene commits con significado funcional.

> **Cumplimiento de la Ley 2 (perfil_desarrollador.md):** todo avance concluye con `git` limpio **o** con el estado documentado en disco. Como el commit único sucede al cierre del HITO, cada tarea/punto de control intermedio debe dejar su estado registrado en `docs_implementacion/_sdd/04_implementacion.md` (o `05_hito_NNN.md`) ANTES de pasar a la siguiente tarea. Si un avance queda sin commit y sin documentación, el Orchestrator lo trata como hallazgo (G-NOTRIAL / G-DOC-SYNC).
>
> Opcional y compatible: si el desarrollador necesita commitear trabajo intermedio (WIP) para proteger el avance, se permite un `feat(wip,n):` con scope explícito y se deja reflejado en la documentación; nunca se fuerza reorganizar el historial (no rebase con fines estéticos).

## Commit final

El Orchestrator debe crear o coordinar un único commit coherente para el HITO validado.

Ejemplo:

```text
feat(backend,mobile,web): implementa gestión de requerimientos
```

El mensaje debe seguir Conventional Commits.

## No hacer

```text
commit por archivo
commit por agente
commit por prueba
commit por corrección interna
commit automático después de cada FAIL
```

---

# 18. Git y estado de trabajo

Git conserva el historial del código.

SDD conserva el estado documental y funcional.

No se debe utilizar memoria conversacional como fuente de estado.

El trabajo debe poder recuperarse únicamente leyendo:

```text
AGENTS.md
docs_implementacion/
git
```

---

# 19. `.opencode/state`

No se considera obligatorio inicialmente.

Si posteriormente se necesita, tendrá exclusivamente información operacional regenerable, por ejemplo:

```text
current_hito
current_task
agent
status
audit_cycle
last_audit
next_action
```

No debe convertirse en una segunda fuente de verdad del proyecto.

Si existe contradicción entre `.opencode/state` y SDD/AGENTS.md, el Orchestrator debe detenerse y solicitar reconciliación.

---

# 20. Cambios que requieren intervención humana

El Orchestrator debe detenerse y preguntar al usuario cuando:

- existen requisitos contradictorios;
- hay dos interpretaciones funcionales válidas;
- se requiere una decisión arquitectónica no definida;
- se requiere modificar un ADR;
- el cambio puede romper una funcionalidad validada;
- el Auditor produce tres FAIL consecutivos;
- existe un conflicto entre documentación y código que no puede resolverse por evidencia;
- se requiere una nueva dependencia tecnológica relevante;
- se requiere cambiar el stack;
- se requiere cambiar la política de seguridad;
- se requiere alterar un gate del Auditor;
- existe riesgo de pérdida de datos;
- una migración destructiva no está suficientemente especificada.

Nunca resolver estas situaciones mediante prueba/error.

---

# 21. JWT — decisión vigente

La autenticación del proyecto es:

```text
JWT local
```

Incluye:

- Access Token;
- Refresh Token;
- tabla local de usuarios;
- email/contraseña;
- RBAC;
- usuario super admin inicial;
- revocación de sesiones;
- auditoría de sesiones.

No se debe introducir como requisito:

```text
Microsoft Entra ID
OAuth 2.0
OpenID Connect
```

salvo que un requerimiento futuro explícito cambie esta decisión.

Una modificación futura deberá tratarse como una nueva decisión arquitectónica y no como una interpretación automática del agente.

---

# 22. Web y Mobile

## Web

```text
React 18
Vite
Material UI
```

## Mobile

```text
React Native CLI
React Navigation
react-native-paper / Material Design 3
Gradle
APK/AAB
```

No introducir Expo/EAS.

---

# 23. Contrato de comunicación entre agentes

El Orchestrator debe transmitir al Developer un contexto estructurado:

```text
HITO:
TASK:
OBJETIVO:
ALCANCE:
ARCHIVOS RELEVANTES:
DEPENDENCIAS:
PATRONES A REUTILIZAR:
RESTRICCIONES:
GATES ESPERADOS:
VERIFICACIÓN REQUERIDA:
CRITERIOS DE TERMINACIÓN:
```

La verificación debe incluir los comandos reales y tiempos por capa:

```text
Backend : mvn test / mvn clean package
Mobile  : npm run lint · npm test · gradle assembleRelease (release cold ≈ 2-6 min; usar timeout acorde, no cortar builds)
Web     : npm run lint · npm run build
Docker  : docker-compose build
```

### Regla de tiempo de build (obligatoria en toda delegación)

- `gradle assembleRelease`: **si el APK release ya existe**
  (`mobile/android/app/build/outputs/apk/release/app-release.apk`) y el comando supera los
  **3 minutos**, el build se **detiene** y el Developer pasa a la siguiente tarea (no recompilar).
- El APK existente vale como evidencia (Ley 3: artefacto marcado como reconstruido).
- Si el APK NO existe y la tarea requiere APK, el build es obligatorio (timeout acorde, NO cortar).
- El Orchestrator debe incluir esta regla en el campo `VERIFICACIÓN REQUERIDA` de cada tarea mobile.

El Developer debe devolver:

```text
TASK:
ESTADO:
ANÁLISIS:
ALTERNATIVAS:
DECISIÓN:
CAMBIOS:
ARCHIVOS:
VERIFICACIONES:
RESULTADOS:
RIESGOS:
PENDIENTES:
```

El Auditor debe devolver:

```text
TASK:
RESULTADO: PASS | FAIL | BLOCKED
GATES EVALUADOS:
HALLAZGOS:
SEVERIDAD:
EVIDENCIA:
REMEDIACIÓN:
RIESGOS:
```

---

# 24. Regla de comunicación

Los agentes no deben depender de memoria conversacional.

La comunicación relevante debe quedar representada mediante:

- archivos;
- SDD;
- documentación de HITO;
- resultados de auditoría;
- Git;
- artefactos verificables.

El resultado de un agente debe ser suficientemente explícito para que otro agente pueda continuar sin asumir información no registrada.

---

# 25. Prevención de trabajo paralelo conflictivo

Por defecto:

```text
NO paralelizar tareas que modifican los mismos archivos.
```

Se permite paralelismo únicamente cuando:

1. las tareas son independientes;
2. no comparten archivos críticos;
3. no dependen una de otra;
4. el resultado puede integrarse sin conflicto;
5. el Orchestrator puede determinar claramente quién es responsable de cada cambio.

Ejemplo seguro:

```text
Backend tests       ──┐
                     ├──> integración
Web componente      ──┤
                     │
Mobile componente    ──┘
```

Ejemplo inseguro:

```text
Developer A → modifica UserService
Developer B → modifica UserService
```

Debe evitarse.

---

# 26. Regla de propiedad de archivos

El Orchestrator debe evitar que dos agentes modifiquen simultáneamente el mismo archivo.

Cada tarea debe tener un alcance explícito:

```text
TASK-001
ownership:
backend/src/.../UserResource.java
```

Si otra tarea necesita ese mismo archivo, debe esperar o coordinarse secuencialmente.

---

# 27. Proceso completo recomendado

```text
                 USUARIO
                    |
                    v
              ORCHESTRATOR
                    |
                    v
             leer estado SDD
                    |
                    v
            analizar requerimiento
                    |
                    v
             identificar HITO
                    |
                    v
             crear PLAN
                    |
                    v
          descomponer en TAREAS
                    |
                    v
          analizar dependencias
                    |
                    v
               DEVELOPER
                    |
          plan → analizar
                    |
              implementar
                    |
               verificar
                    |
              documentar
                    |
                    v
                AUDITOR
                    |
          seleccionar GATES
                    |
             revisar evidencia
                    |
             PASS/FAIL/BLOCKED
                    |
       +------------+------------+
       |                         |
      FAIL                     PASS
       |                         |
       v                         v
   Developer               siguiente tarea
       |                         |
    ciclo N+1                    |
       |                         |
       +------> Auditor          |
                                 v
                         todas las tareas
                              completas
                                 |
                                 v
                        AUDITORÍA HITO
                                 |
                         +-------+-------+
                         |               |
                        FAIL            PASS
                         |               |
                         v               v
                    remediación     versionado
                                      docs
                                       |
                                       v
                                      COMMIT
                                       |
                                       v
                                  HITO CERRADO
```

---

# 28. Objetivo final de la orquestación

El sistema debe conseguir:

```text
UN PROMPT
   ↓
UNA INTERPRETACIÓN
   ↓
UN PLAN
   ↓
TAREAS SIN DUPLICIDAD
   ↓
DEVELOPER
   ↓
VERIFICACIÓN
   ↓
AUDITOR
   ↓
CORRECCIÓN CONTROLADA
   ↓
AUDITORÍA FINAL
   ↓
COMMIT COHERENTE
   ↓
HITO CERRADO
```

Y debe impedir:

```text
trial/error
loops infinitos
duplicidad de agentes
duplicidad de código
commits innecesarios
auditor que modifica
developer que se autoaprueba
estado únicamente en memoria
gates duplicados
decisiones arquitectónicas inventadas
trabajo sobre tareas dependientes no terminadas
```

---

# 29. Condición para considerar terminada una tarea

Una tarea no está terminada porque el Developer diga "terminado".

Está terminada cuando:

```text
Implementación
     +
Verificación
     +
Auditoría PASS
     +
Documentación necesaria
     +
Estado recuperable
```

---

# 30. Condición para considerar terminado un HITO

Un HITO no está terminado porque todas las tareas tengan código.

Está terminado cuando:

```text
Todas las tareas requeridas
          +
Auditorías individuales PASS
          +
Auditoría integral PASS
          +
Tests requeridos PASS
          +
Documentación actualizada
          +
Versionado coherente
          +
Artefactos verificados/estado explícito
          +
Git preparado
          ↓
      COMMIT HITO
          ↓
      HITO CERRADO
```

---

# 31. Regla fundamental

> **El Developer produce cambios.**
>
> **El Auditor produce evidencia de conformidad o incumplimiento.**
>
> **El Orchestrator produce coordinación.**
>
> **El SDD conserva el estado del proyecto.**
>
> **Git conserva la historia del código.**
>
> **El perfil Auditor define los gates.**
>
> **Ningún agente puede aprobar su propio trabajo.**

---

# 32. Próximo paso de implementación en OpenCode

La implementación concreta se organiza según el mecanismo nativo de OpenCode (los archivos de configuración fuera del cwd son ignorados; usar rutas relativas al cwd):

```text
.opencode/
├── agents/
│   ├── orchestrator.md        (definición del agente primario de coordinación)
│   ├── developer.md           (subagente ejecutor — edición permitida)
│   └── auditor.md             (subagente evaluador — edit: deny, nunca modifica código)
│
├── command/
│   └── auditoria.md           (gate-review invocable por tarea/HITO)
│
└── opencode.json              ($schema, instructions → AGENTS.md, default_agent)
```

Las **reglas** no viven en `.opencode/rules/` (opencode no tiene ese mecanismo): se declaran en `AGENTS.md` (raíz) y en el prompt de cada agente.

Además:

```text
AGENTS.md
README.md
docs_implementacion/
├── _perfiles/
│   ├── perfil_desarrollador.md
│   └── perfil_auditor.md
├── _auditoria/
│   ├── README.md
│   └── ADRs_AUDITORIA/
│       └── ADR-A001.md
└── _sdd/
    ├── 01_especificacion.md
    ├── 02_plan.md
    ├── 03_tareas.md
    ├── 04_implementacion.md
    └── 05_hito_NNN.md            (futuro — por cada HITO)
```

## Línea base del proyecto

El repositorio actual tiene `backend/` sin código de aplicación, `mobile/` con un proyecto React Native mínimo (login local) y **sin** frontend web. Por ello:

- **HITO-001 = Infraestructura base**: scaffold backend Quarkus + Bootstrap mobile (navegación/auth) + frontend web React/Vite + autenticación local JWT (tabla de usuarios + super admin) + CI/CD base + convenciones verificadas.
- **Ningún HITO funcional** (ej. "Gestión de Requerimientos") se planifica sobre infraestructura inexistente.
- El Orchestrator siempre verifica la línea base real en disco antes de descomponer tareas (regla de no duplicidad, §10).

## Regla de cohesión de la configuración OpenCode

1. Los agentes `.opencode/agents/*.md` solo **lean e invoquen** el catálogo de gates de `perfil_auditor.md`; no lo duplican.
2. `AGENTS.md` es la fuente de verdad operacional (versión, hitos, comandos de verificación); el SDD es la fuente funcional/técnica.
3. Si una regla documentada contradice a otra fuente (perfil, SDD, config), el Orchestrator **se detiene y solicita reconciliación** (§20) — nunca resuelve por prueba/error.

La siguiente fase no debe empezar creando código de aplicación.

Primero debe implementarse y probarse la **infraestructura de agentes**, verificando:

1. que el Orchestrator puede delegar;
2. que Developer y Auditor tienen responsabilidades separadas;
3. que el Auditor no puede modificar código;
4. que se respetan los tres ciclos;
5. que el estado se recupera desde disco;
6. que el commit solo ocurre después del PASS integral;
7. que los gates provienen del perfil auditor;
8. que una tarea no se duplica;
9. que una tarea dependiente no se ejecuta prematuramente;
10. que los bloqueos humanos detienen correctamente la automatización.

Solo después de validar ese mecanismo se debe utilizar para desarrollar funcionalidades del producto.
