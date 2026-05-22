# Transcripción del Proyecto
# Sistema de Control de Entrega de Insectos Beneficos

---

## Página 2 — Pantalla de Login y Menú Principal

### Pantalla 1 — Login
El sistema presenta una pantalla de login con autenticación Microsoft (Entra ID). El usuario debe ingresar su correo corporativo y contraseña. El sistema valida internamente el token contra el tenant corporativo; si es correcto y el usuario está habilitado, adopta el perfil y roles designados y redirige a la pantalla principal.

### Pantalla 2 — Menú Principal (Home)
Tras la autenticación exitosa, el sistema muestra una pantalla con dos botones de acceso:

| Botón | Descripción | Estado |
|---|---|---|
| **Insectos benéficos** | Acceso al flujo operativo completo (publicación, requerimiento, despacho, recepción, liberación) | ✅ Habilitado (Admin y User) |
| **Evaluación de nematodos** | Módulo futuro — aún no implementado | ❌ No navega a ninguna pantalla |

Cada botón debe incluir una imagen referencial representativa de la descripción.

### Visualización de proyecciones
En la pantalla principal (Home), tanto Admin como User deben poder visualizar un texto informativo que muestre las proyecciones actuales de los productos (cantidad base + adicionales del mes).

### Notas
- **Solo el botón "Insectos benéficos"** se encuentra operativo por el momento.
- El botón "Evaluación de nematodos" queda como placeholder para desarrollo futuro.
- Ambos roles (Admin I+D y User Sanidad) tienen acceso al botón "Insectos benéficos".
- La proyección es informativa visible para ambos roles.

---

## Página 3 — Pantalla de Programación de Stock (Admin I+D)

### Aclaración importante
El botón **"Insectos benéficos"** en el Menú Principal solo está habilitado para los usuarios con perfil **Admin (I+D)**. El personal de Sanidad no tiene acceso a esta sección.

### Screen 3 — Panel de Programación y Solicitudes (Admin)
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

---## Página 1 — Contexto Inicial y Flujo Operacional

### Fecha de registro
21 de mayo de 2026

### Origen de la solicitud
El proyecto nace por la necesidad de digitalizar un proceso crítico que actualmente se gestiona de forma completamente manual mediante tablas Excel y validaciones por WhatsApp. Esto genera confusión, errores operativos, falta de trazabilidad y ausencia de reportes históricos o indicadores gráficos.

### Actores del sistema

| Área | Perfil | Rol en el sistema |
|---|---|---|
| I+D (Investigación y Desarrollo) | Admin | Publica stock semanal, valida requerimientos, gestiona despachos |
| Sanidad | Usuario | Solicita productos, valida recepción, ejecuta liberación en campo |

### Flujo operativo (5 pasos)

**Paso 1 — Publicación (I+D)**
Los usuarios del área de I+D con perfil Admin cargan al sistema el stock semanal disponible de dos productos biológicos que ellos mismos producen:
- Papel con postura
- Sobre con cascarilla de arroz

Esta publicación se realiza a través del aplicativo.

**Paso 2 — Requerimiento (Sanidad)**
Los usuarios del área de Sanidad con perfil Usuario registran en el aplicativo el requerimiento de los productos, indicando:
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
