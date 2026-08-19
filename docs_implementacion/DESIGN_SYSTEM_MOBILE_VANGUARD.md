# Sistema de Diseño Mobile Vanguard

> **Proyecto:** Control de Equipos de Apilamiento Packing  
> **Plataforma:** React Native Android  
> **Objetivo:** Definir reglas visuales y de interacción para que un agente de IA pueda implementar o refactorizar directamente las vistas móviles del proyecto, manteniendo consistencia con la identidad visual de Grupo Vanguard.

---

## 1. Instrucción principal para el agente

El agente debe aplicar este documento como fuente de verdad visual para todas las pantallas móviles.

### Reglas obligatorias

1. Usar principalmente los colores primarios corporativos de Vanguard.
2. Evitar colores decorativos fuertes en botones o tarjetas principales.
3. Usar colores secundarios únicamente para estados, alertas, indicadores y etiquetas.
4. Mantener una interfaz limpia, clara, corporativa y orientada a operación en campo.
5. Aplicar tipografía `Poppins` en toda la aplicación.
6. Usar componentes reutilizables y tokens centralizados.
7. No escribir colores, tamaños, radios o sombras directamente dentro de las pantallas.
8. Toda pantalla debe respetar navegación inferior, encabezados, espaciado y estados definidos aquí.
9. Mantener compatibilidad con Android y diferentes tamaños de pantalla.
10. Todas las áreas táctiles deben medir como mínimo `44 x 44 dp`.

---

## 2. Identidad visual

### 2.1 Colores primarios corporativos

Estos colores deben dominar la aplicación.

```ts
export const primaryColors = {
  greyLighter: "#D4D6D9",
  greyLight: "#A7ACB1",
  greyDark: "#80878E",
  greyDarker: "#59626B",
  greyMain: "#3C4651",

  blueLighter: "#DDE8ED",
  blueLight: "#B8CED9",
  blueDark: "#96B7C7",
  blueDarker: "#74A0B5",
  blueMain: "#558BA5",
};
```

### 2.2 Colores secundarios

Usarlos solo para estados, feedback y elementos auxiliares.

```ts
export const secondaryColors = {
  teal: "#30586B",
  blue: "#6BA6C2",
  sky: "#B3E1F8",
  ice: "#F5FCFF",
  wine: "#9F4F64",
  red: "#D7594E",
  orange: "#DB9647",
  yellow: "#F2CF68",
  lime: "#95BA21",
  green: "#54904C",
};
```

### 2.3 Escala neutral

```ts
export const neutralColors = {
  100: "#F7F9FA",
  200: "#E8EDF2",
  300: "#D4DAE0",
  400: "#B5BEC8",
  500: "#8A95A3",
  600: "#5E6B78",
  700: "#4A5460",
  800: "#3C4651",
  900: "#262E36",
  white: "#FFFFFF",
  black: "#000000",
};
```

---

## 3. Tokens semánticos

Las pantallas deben consumir estos tokens, no colores físicos directamente.

```ts
export const colors = {
  background: {
    default: "#FFFFFF",
    page: "#F7F9FA",
    paper: "#FFFFFF",
    neutral: "#E8EDF2",
    elevated: "#FFFFFF",
    authOverlay: "rgba(255,255,255,0.88)",
    backdrop: "rgba(22,28,36,0.48)",
  },

  text: {
    primary: "#3C4651",
    secondary: "#5E6B78",
    tertiary: "#8A95A3",
    disabled: "#8A95A3",
    inverse: "#FFFFFF",
    link: "#558BA5",
  },

  border: {
    default: "#D4DAE0",
    subtle: "#E8EDF2",
    strong: "#A7ACB1",
    focus: "#3C4651",
    error: "#D7594E",
  },

  action: {
    primary: "#3C4651",
    primaryHover: "#4A5460",
    primaryPressed: "#262E36",
    secondary: "#558BA5",
    secondaryHover: "#74A0B5",
    disabled: "#D4DAE0",
  },

  status: {
    info: "#6BA6C2",
    infoBackground: "#DDE8ED",
    success: "#54904C",
    successBackground: "#E7F2E5",
    warning: "#DB9647",
    warningBackground: "#FAEBD8",
    error: "#D7594E",
    errorBackground: "#FBE4E2",
    neutral: "#8A95A3",
    neutralBackground: "#E8EDF2",
  },
};
```

---

## 4. Jerarquía de uso de color

### Regla 70-20-10

- **70 %:** blanco y neutros claros.
- **20 %:** `greyMain`, `blueMain`, `teal` y tonos primarios.
- **10 %:** colores de estado y acentos secundarios.

### Aplicación

| Elemento            | Color recomendado       |
| ------------------- | ----------------------- |
| Fondo principal     | `#F7F9FA` o `#FFFFFF`   |
| AppBar              | `#3C4651`               |
| Botón principal     | `#3C4651`               |
| Botón secundario    | borde y texto `#558BA5` |
| Navegación activa   | `#558BA5`               |
| Navegación inactiva | `#8A95A3`               |
| Título principal    | `#3C4651`               |
| Texto secundario    | `#5E6B78`               |
| Enlaces             | `#558BA5`               |
| Iconos principales  | `#3C4651`               |
| Tarjetas            | `#FFFFFF`               |
| Bordes              | `#D4DAE0`               |

### Restricciones

- No usar rojo, naranja, verde, morado o amarillo como fondo permanente de módulos.
- No asignar un color distinto a cada opción del menú principal.
- No usar degradados fuertes salvo en la pantalla de autenticación o cabecera destacada.
- No utilizar más de un color de acento por pantalla, excepto para estados.

---

## 5. Tipografía

### Familia

```ts
export const fontFamily = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
};
```

### Escala tipográfica mobile

```ts
export const typography = {
  display: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    lineHeight: 40,
  },
  h1: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    lineHeight: 26,
  },
  subtitle1: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle2: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    lineHeight: 22,
  },
  body1: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  body2: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  caption: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },
};
```

### Reglas

- No usar texto menor de `12 px`.
- Títulos de pantalla: `20 px`, `SemiBold`.
- Títulos de tarjeta: `16 px`, `SemiBold`.
- Texto normal: `14 px`, `Regular`.
- Etiquetas de campo: `13-14 px`, `Medium`.
- Botones: `14-16 px`, `SemiBold`.
- Evitar títulos completos en mayúsculas.

---

## 6. Espaciado

Usar escala base de 4.

```ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
};
```

### Aplicación

- Margen horizontal de pantalla: `16 px`.
- Separación entre secciones: `24 px`.
- Separación entre campos: `16 px`.
- Padding interno de tarjeta: `16 px`.
- Separación entre icono y texto: `12 px`.
- Separación entre título y subtítulo: `4-8 px`.

---

## 7. Bordes y radios

```ts
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};
```

### Reglas

| Componente   |          Radio |
| ------------ | -------------: |
| Input        |           8 px |
| Botón        |           8 px |
| Tarjeta      |          12 px |
| Modal        |          16 px |
| Bottom sheet | 24 px superior |
| Chip         |         999 px |
| Avatar       |       circular |

No utilizar radios excesivos en todos los elementos. Reservar radios grandes para modales, paneles y pantalla de login.

---

## 8. Sombras y elevación

```ts
export const shadows = {
  z1: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  z2: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: "#000000",
    shadowOffset: { width: -20, height: 20 },
    shadowOpacity: 0.24,
    shadowRadius: 40,
    elevation: 12,
  },
};
```

### Uso

- Tarjetas normales: `z1`.
- AppBar fija o tarjeta destacada: `z2`.
- Modal, drawer o bottom sheet: `modal`.
- No aplicar sombra a todos los inputs.

---

## 9. Iconografía

### Librería recomendada

Usar una sola librería:

```bash
npm install react-native-vector-icons
```

Preferencia:

- Material Community Icons.
- Material Icons.

### Tamaños

| Uso              |   Tamaño |
| ---------------- | -------: |
| Icono inline     |    16 px |
| Input            |    20 px |
| Botón            |    20 px |
| Menú             |    24 px |
| Acción destacada | 28-32 px |
| Estado vacío     | 48-64 px |

### Reglas

- No usar emojis como iconos.
- No usar caracteres Unicode decorativos.
- No mezclar estilos filled, rounded y outlined sin criterio.
- Cada icono debe tener `accessibilityLabel` cuando represente una acción.

---

## 10. Estructura base de pantalla

Cada pantalla principal debe seguir este orden:

1. `SafeAreaView`.
2. Barra superior o `AppHeader`.
3. Área de contenido con `ScrollView` o `FlatList`.
4. Botón principal fijo o dentro del flujo según el caso.
5. Navegación inferior para módulos principales.

```tsx
<SafeAreaView style={styles.safeArea}>
  <AppHeader title="Registro de Avería" showBack />

  <ScrollView
    contentContainerStyle={styles.content}
    keyboardShouldPersistTaps="handled"
  >
    {/* contenido */}
  </ScrollView>

  <BottomNavigation />
</SafeAreaView>
```

---

## 11. AppBar

### Diseño

- Altura: `56 px`.
- Fondo: `#3C4651`.
- Texto: blanco.
- Título: `18-20 px`, `SemiBold`.
- Iconos: blancos, `24 px`.
- Padding horizontal: `16 px`.

### Acciones

- Flecha atrás a la izquierda cuando corresponda.
- Máximo dos acciones a la derecha.
- Acciones adicionales dentro de menú contextual.

---

## 12. Navegación inferior

### Opciones principales

1. Inicio.
2. Equipos.
3. Catálogos.
4. Perfil.

### Diseño

- Altura visual: `64-72 px`.
- Fondo blanco.
- Borde superior `#E8EDF2`.
- Icono activo: `#558BA5`.
- Texto activo: `#558BA5`.
- Icono inactivo: `#8A95A3`.
- Texto inactivo: `#8A95A3`.
- Icono: `22-24 px`.
- Label: `11-12 px`.

---

## 13. Tarjetas

```ts
export const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#E8EDF2",
  padding: 16,
};
```

### Reglas

- Una tarjeta debe representar una sola unidad lógica.
- Usar título, resumen, estado y acción secundaria.
- Evitar tarjetas internas dentro de tarjetas.
- Para listas, usar tarjetas compactas o filas con separadores.
- El estado debe mostrarse con chip, no pintando toda la tarjeta.

---

## 14. Botones

### Primario contenido

```ts
{
  minHeight: 48,
  borderRadius: 8,
  backgroundColor: '#3C4651',
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
}
```

Texto blanco, `Poppins-SemiBold`, `14-16 px`.

### Secundario outlined

- Fondo blanco.
- Borde `#558BA5`.
- Texto `#558BA5`.
- Altura mínima `48 px`.

### Text button

- Sin fondo.
- Texto `#558BA5`.
- Usar para acciones de menor jerarquía.

### Botón destructivo

- Fondo `#D7594E`.
- Debe mostrar confirmación antes de ejecutar.
- No usarlo como acción principal habitual.

### Estados

- `pressed`: oscurecer entre 8 % y 12 %.
- `disabled`: fondo `#D4DAE0`, texto `#8A95A3`.
- `loading`: bloquear doble toque y mostrar indicador.

---

## 15. Inputs y selects

### Dimensiones

- Altura input normal: `52-56 px`.
- Altura textarea: mínimo `112 px`.
- Radio: `8 px`.
- Padding horizontal: `14-16 px`.

### Colores

- Borde normal: `#B5BEC8`.
- Borde foco: `#3C4651`.
- Borde error: `#D7594E`.
- Texto: `#3C4651`.
- Placeholder: `#8A95A3`.
- Label: `#5E6B78`.
- Fondo disabled: `#F7F9FA`.

### Reglas

- Mostrar label permanente; no depender solo del placeholder.
- Mostrar mensaje de error debajo del campo.
- El error debe explicar cómo corregir el valor.
- Usar teclado adecuado: email, numérico, teléfono, fecha.
- En contraseña incluir mostrar/ocultar.
- Los selects deben tener icono de expansión.

---

## 16. Chips y estados

```ts
export const statusStyles = {
  pending: {
    color: "#DB9647",
    backgroundColor: "#FAEBD8",
    label: "Pendiente",
  },
  approved: {
    color: "#54904C",
    backgroundColor: "#E7F2E5",
    label: "Aprobado",
  },
  active: {
    color: "#54904C",
    backgroundColor: "#E7F2E5",
    label: "Operativo",
  },
  fault: {
    color: "#D7594E",
    backgroundColor: "#FBE4E2",
    label: "Averiado",
  },
  cancelled: {
    color: "#5E6B78",
    backgroundColor: "#E8EDF2",
    label: "Anulado",
  },
  info: {
    color: "#30586B",
    backgroundColor: "#DDE8ED",
    label: "Información",
  },
};
```

### Diseño

- Altura: `24-28 px`.
- Padding horizontal: `10-12 px`.
- Radio tipo píldora.
- Texto: `12 px`, `Medium`.
- No depender únicamente del color; siempre mostrar texto.

---

## 17. Notificaciones y feedback

### Tipos

| Tipo        | Color principal | Ejemplo                         |
| ----------- | --------------- | ------------------------------- |
| Éxito       | `#54904C`       | Registro guardado correctamente |
| Información | `#6BA6C2`       | Datos actualizados              |
| Advertencia | `#DB9647`       | Faltan campos por completar     |
| Error       | `#D7594E`       | No se pudo guardar el registro  |

### Toast / Snackbar

- Posición preferida: parte inferior, encima de navegación.
- Duración éxito: `2500-3500 ms`.
- Duración info: `3000-4000 ms`.
- Error persistente: `5000-7000 ms` o cierre manual.
- Incluir icono, mensaje y acción opcional.
- Máximo dos líneas.

### Confirmaciones

Usar modal para:

- Eliminar registros.
- Finalizar servicios.
- Anular PSR.
- Cerrar sesión.
- Descartar cambios.

Ejemplo:

```tsx
<ConfirmDialog
  title="Finalizar servicio"
  message="Esta acción cerrará el servicio y no permitirá nuevos cambios."
  confirmLabel="Finalizar"
  cancelLabel="Cancelar"
  tone="warning"
/>
```

### Estados de carga

- Mostrar `ActivityIndicator` dentro del botón durante una operación.
- No permitir doble envío.
- Para listas, usar skeleton cuando la espera sea perceptible.
- Para carga inicial completa, usar indicador centrado con texto breve.

### Estado vacío

Debe incluir:

1. Icono ilustrativo.
2. Título claro.
3. Mensaje de ayuda.
4. Acción principal cuando corresponda.

Ejemplo:

```text
No hay averías registradas
Cuando se registre una avería aparecerá en esta sección.
[Registrar avería]
```

### Error de conexión

```text
Sin conexión con el servidor
Verifica tu red o la dirección configurada e inténtalo nuevamente.
[Reintentar]
```

---

## 18. Pantalla de login

### Composición

- Imagen corporativa o fotografía de packing como fondo.
- Overlay suave para asegurar legibilidad.
- Card blanca o blanca semitransparente.
- Logo Vanguard centrado.
- Título del aplicativo.
- Usuario seleccionado.
- Campo contraseña si el flujo actual lo requiere.
- Botón iniciar sesión.
- Acciones secundarias: cambiar usuario y configurar servidor.

### Card

- Margen horizontal: `24 px`.
- Padding: `24 px`.
- Radio: `16 px`.
- Fondo: `rgba(255,255,255,0.94)`.
- Sombra: `z2`.

### Consideración de arquitectura

El diseño visual admite el login actual; sin embargo, cuando se implemente Microsoft Identity, el botón principal debe cambiar a:

```text
Continuar con Microsoft
```

No se debe crear un formulario manual de usuario y contraseña si la autenticación corporativa Microsoft ya está activa.

---

## 19. Menú principal

### Recomendación

Mostrar todos los módulos con la misma familia visual. No usar un color fuerte distinto por módulo.

Cada opción debe contener:

- Icono lineal.
- Título.
- Descripción breve.
- Flecha de navegación.
- Fondo blanco.
- Acento sutil azul o gris.

### Módulos

- Ingreso de PSR.
- Ingreso de Equipo.
- Registro de Avería.
- Detalles de Equipo.
- Finalización del Servicio.

### Estado visual recomendado

```ts
{
  backgroundColor: '#FFFFFF',
  borderColor: '#E8EDF2',
  iconColor: '#558BA5',
  titleColor: '#3C4651',
  descriptionColor: '#5E6B78',
}
```

---

## 20. Listados

Para PSR, equipos, averías y servicios:

- Usar `FlatList`.
- Implementar búsqueda.
- Implementar filtros mediante bottom sheet.
- Mostrar estados con chips.
- Mantener acción rápida o menú contextual.
- Permitir pull-to-refresh.
- Implementar paginación cuando corresponda.

### Tarjeta de lista

Orden recomendado:

1. Código o identificador.
2. Chip de estado.
3. Información principal.
4. Información secundaria.
5. Flecha o menú contextual.

---

## 21. Formularios

### Orden

1. Información requerida.
2. Información operativa.
3. Observaciones.
4. Evidencias o documentos.
5. Acción principal.

### Reglas

- Marcar campos obligatorios con `*`.
- Validar al salir del campo y al enviar.
- Llevar automáticamente al primer error.
- Preservar datos al navegar temporalmente.
- Confirmar antes de descartar cambios.
- El botón de guardar debe estar visible sin depender de scroll excesivo.

---

## 22. Evidencias fotográficas

### Componente

- Cuadrícula de 2 o 3 columnas según ancho.
- Miniatura con radio `8 px`.
- Botón para tomar foto.
- Botón para seleccionar archivo, solo si aplica.
- Acción eliminar con confirmación.
- Indicador de carga individual.

### Reglas

- Mostrar cantidad mínima requerida.
- Comprimir imagen antes de subir cuando sea necesario.
- No perder fotos si falla otra parte del formulario.
- Mostrar progreso y reintento por cada archivo.

---

## 23. Accesibilidad

- Contraste mínimo WCAG AA.
- Texto normal con contraste mínimo `4.5:1`.
- Áreas táctiles mínimas de `44 x 44 dp`.
- No depender exclusivamente del color.
- Agregar `accessibilityRole` y `accessibilityLabel`.
- Respetar escalado de fuente cuando no rompa la interfaz.
- Mantener orden lógico de navegación.

---

## 24. Diseño responsive

### Breakpoints orientativos

```ts
export const breakpoints = {
  compact: 360,
  medium: 480,
  expanded: 768,
};
```

### Reglas

- Usar `useWindowDimensions()`.
- No usar anchos fijos de pantalla.
- Los formularios ocupan `100 %` del ancho disponible.
- Limitar contenido en tablets a un ancho máximo de `720 px`.
- Ajustar cuadrículas de fotos y tarjetas según ancho.
- Probar al menos en `360 x 640`, `390 x 844` y `412 x 915`.

---

## 25. Arquitectura de archivos recomendada

```text
mobile/src/
├── components/
│   ├── AppButton/
│   ├── AppCard/
│   ├── AppHeader/
│   ├── AppInput/
│   ├── AppSelect/
│   ├── BottomNavigation/
│   ├── ConfirmDialog/
│   ├── EmptyState/
│   ├── LoadingState/
│   ├── StatusChip/
│   └── Toast/
├── screens/
│   ├── auth/
│   ├── home/
│   ├── psr/
│   ├── equipment/
│   ├── faults/
│   ├── service/
│   └── profile/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── components.ts
│   └── index.ts
└── assets/
    ├── fonts/
    ├── icons/
    └── images/
```

---

## 26. Archivo de tema unificado

```ts
// mobile/src/theme/index.ts

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
};

export type AppTheme = typeof theme;
```

Toda pantalla debe importar desde el tema:

```ts
import { theme } from "@/theme";
```

No permitido:

```ts
backgroundColor: "#3C4651";
```

Permitido:

```ts
backgroundColor: theme.colors.action.primary;
```

---

## 27. Componentes mínimos a implementar

El agente debe crear o normalizar estos componentes antes de diseñar pantallas:

1. `AppButton`.
2. `AppIconButton`.
3. `AppInput`.
4. `AppSelect`.
5. `AppTextArea`.
6. `AppCard`.
7. `AppHeader`.
8. `StatusChip`.
9. `BottomNavigation`.
10. `ToastProvider`.
11. `ConfirmDialog`.
12. `EmptyState`.
13. `LoadingState`.
14. `ErrorState`.
15. `PhotoPicker`.

Cada componente debe soportar:

- Estado normal.
- Estado presionado.
- Estado deshabilitado.
- Estado loading cuando aplique.
- Accesibilidad.
- Tema centralizado.

---

## 28. Pantallas que deben seguir este diseño

1. Login.
2. Inicio / menú principal.
3. Listado de PSR.
4. Registro y edición de PSR.
5. Listado de equipos.
6. Registro y edición de equipo.
7. Detalle del equipo.
8. Registro de avería.
9. Historial de averías.
10. Evidencias fotográficas.
11. Finalización del servicio.
12. Catálogos.
13. Perfil.
14. Configuración del servidor.

---

## 29. Criterios de aceptación visual

Una pantalla se considera aceptada cuando:

- Usa exclusivamente tokens del tema.
- Usa Poppins.
- Mantiene margen horizontal de 16 px.
- Usa colores primarios como base.
- Usa colores secundarios solo para estados.
- Tiene jerarquía visual clara.
- Incluye estados loading, vacío y error.
- Tiene navegación y botones consistentes.
- No contiene emojis o caracteres como iconos.
- Funciona en pantallas pequeñas.
- Cumple las áreas táctiles mínimas.
- No presenta texto truncado sin alternativa.

---

## 30. Prompt operativo para agente de IA

Copiar esta instrucción cuando se solicite la implementación:

```text
Lee completamente el archivo:
documentacion_general/base/DESIGN_SYSTEM_MOBILE_VANGUARD.md

Analiza primero la estructura actual del proyecto React Native y no reemplaces funcionalidades existentes sin necesidad.

Implementa el sistema de diseño Vanguard descrito en el documento siguiendo este orden:

1. Identifica el directorio real de la aplicación móvil.
2. Revisa dependencias y arquitectura actual.
3. Crea o actualiza los tokens del tema.
4. Configura la tipografía Poppins utilizando archivos ya autorizados dentro del proyecto o una dependencia válida.
5. Crea los componentes base reutilizables.
6. Reemplaza colores y estilos hardcodeados.
7. Refactoriza primero Login e Inicio.
8. Continúa con PSR, Equipos, Averías y Finalización del Servicio.
9. Implementa estados loading, vacío, error, éxito y confirmación.
10. Conserva navegación, reglas de negocio, llamadas API y validaciones existentes.
11. Ejecuta lint, pruebas y compilación Android.
12. Corrige errores antes de finalizar.
13. Documenta los archivos creados o modificados.

No uses emojis como iconos.
No inventes endpoints.
No elimines funcionalidades existentes.
No agregues colores fuera del sistema definido.
No dupliques componentes.
No escribas estilos globales directamente en las pantallas cuando puedan reutilizarse.
```

---

## 31. Resultado esperado

La aplicación debe verse corporativa, sobria y consistente con Vanguard:

- Predominio de blanco, gris corporativo y azul Vanguard.
- Navegación clara.
- Formularios legibles.
- Estados fáciles de identificar.
- Menor ruido visual.
- Componentes reutilizables.
- Implementación directa por agentes de IA y desarrolladores.

---

**Versión:** 1.0  
**Fecha:** 2026-07-21  
**Aplicación:** Control de Equipos de Apilamiento Packing
