/**
 * colors.ts — Tokens de color del Sistema de Diseño Mobile Vanguard
 * (docs_implementacion/DESIGN_SYSTEM_MOBILE_VANGUARD.md §2.1, §2.2, §2.3 y §3).
 *
 * Prohibido hardcodear colores en pantallas (§26): todo componente/pantalla
 * consume estos tokens vía `theme`.
 */

/** §2.1 Colores primarios corporativos Vanguard. */
export const primaryColors = {
  greyLighter: '#D4D6D9',
  greyLight: '#A7ACB1',
  greyDark: '#80878E',
  greyDarker: '#59626B',
  greyMain: '#3C4651',

  blueLighter: '#DDE8ED',
  blueLight: '#B8CED9',
  blueDark: '#96B7C7',
  blueDarker: '#74A0B5',
  blueMain: '#558BA5',
};

/** §2.2 Colores secundarios (solo estados, feedback y elementos auxiliares). */
export const secondaryColors = {
  teal: '#30586B',
  blue: '#6BA6C2',
  sky: '#B3E1F8',
  ice: '#F5FCFF',
  wine: '#9F4F64',
  red: '#D7594E',
  orange: '#DB9647',
  yellow: '#F2CF68',
  lime: '#95BA21',
  green: '#54904C',
};

/** §2.3 Escala neutral. */
export const neutralColors = {
  100: '#F7F9FA',
  200: '#E8EDF2',
  300: '#D4DAE0',
  400: '#B5BEC8',
  500: '#8A95A3',
  600: '#5E6B78',
  700: '#4A5460',
  800: '#3C4651',
  900: '#262E36',
  white: '#FFFFFF',
  black: '#000000',
};

/** §3 Tokens semánticos (las pantallas consumen estos, no colores físicos). */
export const colors = {
  background: {
    default: '#FFFFFF',
    page: '#F7F9FA',
    paper: '#FFFFFF',
    neutral: '#E8EDF2',
    elevated: '#FFFFFF',
    authOverlay: 'rgba(255,255,255,0.88)',
    backdrop: 'rgba(22,28,36,0.48)',
  },

  text: {
    primary: '#3C4651',
    secondary: '#5E6B78',
    tertiary: '#8A95A3',
    disabled: '#8A95A3',
    inverse: '#FFFFFF',
    link: '#558BA5',
  },

  border: {
    default: '#D4DAE0',
    subtle: '#E8EDF2',
    strong: '#A7ACB1',
    focus: '#3C4651',
    error: '#D7594E',
  },

  action: {
    primary: '#3C4651',
    primaryHover: '#4A5460',
    primaryPressed: '#262E36',
    secondary: '#558BA5',
    secondaryHover: '#74A0B5',
    disabled: '#D4DAE0',
  },

  status: {
    info: '#6BA6C2',
    infoBackground: '#DDE8ED',
    success: '#54904C',
    successBackground: '#E7F2E5',
    warning: '#DB9647',
    warningBackground: '#FAEBD8',
    error: '#D7594E',
    errorBackground: '#FBE4E2',
    neutral: '#8A95A3',
    neutralBackground: '#E8EDF2',
  },
};