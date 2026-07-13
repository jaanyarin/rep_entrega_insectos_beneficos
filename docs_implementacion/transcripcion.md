# Transcripción del Proyecto
# Sistema de Control de Entrega de Insectos Beneficos

---

## Página 1 — Contexto Inicial y Flujo Operacional

### Fecha de registro
21 de mayo de 2026

### Origen de la solicitud
El proyecto nace por la necesidad de digitalizar un proceso crítico que actualmente se gestiona de forma completamente manual mediante tablas Excel y validaciones por WhatsApp. Esto genera confusión, errores operativos, falta de trazabilidad y ausencia de reportes históricos o indicadores gráficos.

### Actores del sistema

| Área | Perfil | Rol en el sistema |
|---|---|---|
| I+D (Investigación y Desarrollo) | admin | Publica stock semanal, valida requerimientos, gestiona despachos |
| Sanidad | Usuario | Solicita productos, valida recepción, ejecuta liberación en campo |

### Flujo operativo (5 pasos)

**Paso 1 — Publicación (I+D)**
Los usuarios del área de I+D con perfil admin cargan al sistema el stock semanal disponible de dos productos biológicos que ellos mismos producen:
- Papel con postura
- Sobre con cascarilla de arroz

Esta publicación se realiza a través del aplicativo.

**Paso 2 — Requerimiento (Sanidad)**
Los usuarios del área de Sanidad con perfil usuario registran en el aplicativo el requerimiento de los productos, indicando:
- Fundo
- Lote
- Cantidad por producto

**Paso 3 — Despacho (I+D)**
I+D recibe la solicitud, valida el stock disponible contra el requerimiento (normalmente el stock cubre el pedido) y procede a realizar la entrega física.

**Paso 4 — Validación de Recepción (Sanidad)**
Sanidad confirma la recepción de lo despachado por I+D.

**Paso 5 — Liberación en Campo (Sanidad)**
Una vez recibido el producto, Sanidad ejecuta la liberación colocando los productos en campo (fundo, lote). Esta acción se valida mediante una captura fotográfica que registra automáticamente la fecha y hora de la toma.

### Premisas de stock

- Proyección mensual base: **5,000 millares** (nunca baja de esa cifra).
- Pueden existir adicionales puntuales: +10, +100 millares, etc., que se registran como ajuste dentro del mes.
- Días de publicación semanal: **lunes y jueves**, I+D muestra la cantidad disponible.
- Con esa información, Sanidad hace su pedido indicando dónde se va a consumir (fundo, lote).

### Problemática actual

- Proceso manual en Excel → confusión y errores.
- Validaciones mediante WhatsApp → información no trazable.
- Sin reportes históricos.
- Sin gráficos ni indicadores del proceso.
- Sin control centralizado del ciclo completo.

---

## Página 2 — Pantalla de Login y Menú Principal

### Pantalla 1 — Login
El sistema presenta una pantalla de login con autenticación local. El usuario debe ingresar su correo electrónico y contraseña. El sistema valida internamente contra la tabla de usuarios en base de datos; si es correcto y el usuario está habilitado, adopta el perfil y roles designados y redirige a la pantalla principal.

### Pantalla 2 — Menú Principal (Home)
Tras la autenticación exitosa, el sistema muestra una pantalla con dos botones de acceso:

| Botón | Descripción | Estado |
|---|---|---|
| **Insectos benéficos** | Acceso al flujo operativo completo (publicación, requerimiento, despacho, recepción, liberación) | ✅ Habilitado (admin y user) |
| **Evaluación de nematodos** | Módulo futuro — aún no implementado | ❌ No navega a ninguna pantalla |

Cada botón debe incluir una imagen referencial representativa de la descripción.

### Visualización de proyecciones
En la pantalla principal (Home), tanto admin como user deben poder visualizar un texto informativo que muestre las proyecciones actuales de los productos (cantidad base + adicionales del mes).

### Notas
- **Solo el botón "Insectos benéficos"** se encuentra operativo por el momento.
- El botón "Evaluación de nematodos" queda como placeholder para desarrollo futuro.
- Ambos roles (admin i+d y user sanidad) tienen acceso al botón "Insectos benéficos".
- La proyección es informativa visible para ambos roles.

---

## Página 3 — Pantalla de Programación de Stock (admin i+d)

### Aclaración importante
El botón **"Insectos benéficos"** redirige según el rol del usuario:
- **admin (i+d)**: accede al panel de programación (screen 3) con gestión de stock y solicitudes.
- **user (sanidad)**: accede al panel de requerimientos (screen 9) para registrar solicitudes de productos.

### Screen 3 — Panel de Programación y Solicitudes (admin)
Al hacer clic en "Insectos benéficos", se accede a una pantalla con los siguientes elementos:

**Botones:**
- **Botón 01 — Programación**: acceso a la gestión de programación de stock semanal.
- **Botón 02 — Solicitud de Requerimiento**: acceso al listado de solicitudes registradas por Sanidad. Al lado de este botón debe existir un **indicador numérico de notificación** que muestre la cantidad de solicitudes pendientes registradas por los usuarios.

**Tabla — Proyección del Mes:**
Ubicada en la parte central de la pantalla, muestra las cantidades disponibles de los productos desglosadas por semana, con las siguientes columnas:

| Semana | Papel con postura | Sobre con cascarilla | Total |
|---|---|---|---|
| ... | ... | ... | ... |

- El **Total** es la suma de los dos productos por semana.
- La información de la tabla se actualiza automáticamente cada vez que se registra una programación.
- Al registrar una programación, el sistema debe enviar un **aviso por correo electrónico** a los usuarios de Sanidad informando la disponibilidad de las cantidades programadas.

**Barra de progreso:**
En la parte inferior de la tabla debe existir una barra de progreso que mida visualmente el **consumo mensual vs la disponibilidad** de los productos.

### Screen 4 — Listado de Programaciones por Mes
Al hacer clic en el botón **Programación** se accede a esta pantalla. De arriba hacia abajo:

1. **Selector de fecha (rango)**: permite seleccionar un rango de fechas para filtrar.
2. **Galería vertical de registros**: cada registro contiene:
   - Fecha del registro
   - Mes al que pertenece
   - Cantidad total del mes (valor calculado de todas las semanas)
   - Dos botones: **Ver** y **Editar**

**Ver:** abre una vista emergente (modal) con la información de los registros programados en ese mes (solo visualización).

**Editar:** redirige al Screen 5.

### Screen 5 — Edición de Programación
Pantalla de edición con los siguientes campos de arriba hacia abajo:

1. **Filtro de mes**: seleccionar el mes a editar.
2. **Filtro de especie**: seleccionar el tipo de insecto benéfico.
3. **Tabla de proyección final**: con las mismas columnas (Semana, Papel con postura, Sobre con cascarilla, Total). Al seleccionar el mes, muestra los registros semanales correspondientes.
4. **Botón — Enviar stock**: al hacer clic, envía una notificación por correo a los usuarios de Sanidad informando los cambios.

### Restricción de edición
La edición de la programación solo está permitida bajo las siguientes condiciones:
- **Días permitidos:** lunes y jueves de la semana.
- **Horario permitido:** desde las 00:00 hasta las 23:59 de esos dos días.
- Fuera de ese horario y días, no se permite la edición.

---

## Página 4 — Flujo de Solicitudes de Requerimiento (admin i+d)

### Screen 6 — Panel de Solicitudes de Requerimiento

**Acceso:** desde Botón 02 (Solicitud de Requerimiento) en Screen 3, exclusivo admin i+d

Misma estructura que Screen 3, enfocada exclusivamente en solicitudes:

- **Botón — Solicitud de Requerimiento**: con indicador numérico de notificaciones (solicitudes pendientes)
- **Tabla de proyección del mes**: columnas Semana, Papel con postura, Sobre con cascarilla, Total
- **Barra de progreso**: consumo mensual vs disponibilidad

Al hacer clic en Solicitud de Requerimiento → navega a Screen 7.

---

### Screen 7 — Listado de Solicitudes de Requerimiento

**Acceso:** desde Screen 6 al hacer clic en Solicitud de Requerimiento

**Estructura:**
1. **Filtro de rango de fechas**: selector desde-hasta en la parte superior
2. **Galería vertical de registros**: cada registro muestra fecha de solicitud, especie y estado con color
3. **Botón Nuevo** → redirige a Screen 8 (creación)
4. **Botón Editar** por registro → redirige a Screen 8 (edición)

**Estados y colores:**

| Estado | Color | Hex |
|---|---|---|
| Registrado | Gris | #9E9E9E |
| Pendiente | Ámbar | #FFC107 |
| Aprobado | Verde | #4CAF50 |
| Entregado | Azul | #2196F3 |
| Recibido | Verde azulado | #009688 |
| Liberado | Púrpura | #9C27B0 |

---

### Screen 8 — Formulario de Solicitud de Requerimiento

**Acceso:** desde botón Nuevo (creación) o Editar (edición) en Screen 7

**Campos del formulario (de arriba abajo):**

| Campo | Tipo |
|---|---|
| Fecha | Selector de fecha |
| Fundo | Desplegable |
| Lote | Desplegable |
| Especie | Desplegable |
| Cantidad plaga | Input |
| Objetivo | Desplegable |
| Estado | Desplegable (Aprobado, Entregado) + Botón PDF 📄 |
| Fecha de liberación | Selector de fecha |
| Hora de liberación | Selector de hora |
| Observaciones | Input multilinea |

**Subtítulo — Presentaciones entregadas:**
- Papel con postura (input número)
- Sobre con cascarilla de arroz (input número)

**Botón PDF:** al lado del selector de Estado. Abre un popup para capturar foto del acta con vista previa.

**Comportamiento por modo:**

| Aspecto | Creación (Nuevo) | Edición |
|---|---|---|
| Campos de formulario | Todos habilitados | Solo Estado habilitado |
| Papel con postura | Deshabilitado | Deshabilitado (se habilita solo si Estado = Entregado) |
| Sobre con cascarilla | Deshabilitado | Deshabilitado (se habilita solo si Estado = Entregado) |
| Botón Guardar | Habilitado si datos completos | Habilitado solo si papel + sobre = cantidad plaga |
| Notificación | — | Al cambiar Aprobado → Entregado: correo a Sanidad |

**Validaciones:**
- Si Estado = Entregado: papel y sobre son obligatorios
- papel + sobre debe ser exactamente igual a cantidad plaga para habilitar Guardar
- Al guardar → retorna a Screen 7 con galería actualizada

---

## Página 5 — Flujo de Requerimientos (user sanidad)

### Screen 9 — Panel de Requerimientos (user)

**Acceso:** desde Menú Principal (Home) al hacer clic en Insectos benéficos, exclusivo user (sanidad)

**Estructura:**
1. **Botón — Nuevo Requerimiento**: redirige a Screen 10
2. **Botón — Historial de Requerimiento**: redirige a Screen 12 (historial de requerimientos del usuario)
3. **Tabla — Proyección [mes] [año] — [cantidad base] millares**: columnas Sem, Papel con postura, Sobre con cascarilla, Total
4. **Barra de progreso**: consumo mensual vs disponibilidad

---

### Screen 10 — Formulario de Nuevo Requerimiento (user)

**Acceso:** desde botón Nuevo Requerimiento en Screen 9

**Campos del formulario (de arriba abajo):**

| Campo | Tipo | Obligatorio | Detalle |
|---|---|---|---|
| Fecha | Selector fecha | Sí | Default: fecha actual |
| Fundo | Desplegable | Sí | Catálogo de fundos |
| Lote | Desplegable | Sí | Catálogo de lotes por fundo |
| Especie | Desplegable | Sí | Catálogo de especies |
| Etapa fenológica | Desplegable | Sí | Catálogo de etapas |
| Cantidad | Input numérico | Sí | En millares |
| Stock | Etiqueta (solo lectura) | — | Stock disponible en tiempo real |
| Plaga objetivo | Desplegable | Sí | Catálogo de plagas |
| Observaciones | Input multilinea | No | Texto libre |
| Fotos | Botón 📷 | No | Hasta 2 fotos con vista previa |

**Botón Enviar Solicitud:**
- Valida que todos los campos obligatorios estén completos (excepto Observaciones y Fotos)
- Al hacer clic: guarda el requerimiento, descuenta la cantidad del stock, muestra mensaje de confirmación y redirige a Screen 9

**Reglas de stock:**
- El campo **Stock** se actualiza en tiempo real según la especie seleccionada
- Al cambiar **Especie**, el stock mostrado se actualiza al disponible de esa especie
- La **Cantidad** no puede superar el stock disponible
- Si el stock es 0, se bloquea el envío y se muestra "Stock agotado"
- Cada envío descuenta automáticamente la cantidad del stock

**Botón Foto (📷):**
- Abre la cámara del dispositivo móvil
- Permite capturar hasta 2 fotografías
- Muestra vista previa en miniatura de cada foto en el screen
- Las fotos quedan asociadas al requerimiento como evidencia

---

### Screen 12 — Historial de Requerimientos (user)

**Acceso:** desde botón Historial de Requerimiento en Screen 9

**Estructura:**
1. **Filtro de rango de fechas**: selector desde-hasta en la parte superior
2. **Galería vertical**: registros con fecha de requerimiento, especie, estado (etiqueta con color), botón **Ver** (abre popup detalle) y botón **Editar** (navega a Screen 13)

**Popup Ver:**
Al hacer clic en Ver se muestra un popup con los siguientes datos del requerimiento:
- Fecha, Fundo, Lote, Especie, Cantidad, Plaga objetivo, Fecha de liberación, Observaciones
- Botón **Cerrar** para ocultar el popup

**Notificaciones:**
Cuando admin registre un cambio de estado en la solicitud (desde su flujo Screens 7→8), el sistema debe enviar un correo electrónico al usuario de Sanidad que realizó el requerimiento, informando el nuevo estado.

---

### Screen 13 — Edición de Requerimiento (user)

**Acceso:** desde botón Editar en Screen 12

**Descripción:**
Pantalla de edición del requerimiento con los mismos campos de Screen 10 pre-cargados, más los campos **Fecha liberación** y **Hora liberación** que se auto-completan al tomar la foto.

**Campos:**
- Mismos campos que Screen 10 (Fecha, Fundo, Lote, Especie, Etapa fenológica, Cantidad, Stock, Plaga objetivo, Observaciones) — todos pre-cargados con los datos originales
- **Fecha liberación**: se auto-completa con metadatos del sistema al tomar la foto
- **Hora liberación**: se auto-completa con metadatos del sistema al tomar la foto
- **Botón Foto 📷**: habilitado para capturar la foto de liberación

**Alerta de 30 horas:**
Si han transcurrido más de 30 horas desde que el estado cambió a **Recibido** sin haberse tomado la foto de liberación, se muestra una alerta permanente en la parte superior:
> *"Alerta: No se ingresó la información de la liberación, fecha de solicitud: [fecha]"*

**Botón Actualizar:**
- Guarda los cambios (foto, fecha y hora de liberación)
- Muestra notificación de confirmación
- Redirige a Screen 12

---
