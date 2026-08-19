/**
 * index.ts — Tema unificado del Sistema de Diseño Mobile Vanguard (§26).
 *
 * Toda pantalla/componente consume `theme` (NUNCA colores hardcodeados).
 * En nuestro proyecto no hay alias `@/theme`: se importa con ruta relativa
 * `../theme`.
 */

import {colors} from './colors';
import {fontFamily, typography} from './typography';
import {spacing} from './spacing';
import {radius} from './radius';
import {shadows} from './shadows';
import {
  primaryColors,
  secondaryColors,
  neutralColors,
} from './colors';

export {
  colors,
  fontFamily,
  typography,
  spacing,
  radius,
  shadows,
  primaryColors,
  secondaryColors,
  neutralColors,
};

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
};

export type AppTheme = typeof theme;