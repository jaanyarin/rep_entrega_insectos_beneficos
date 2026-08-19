/**
 * typography.ts — Tokens tipográficos del Sistema de Diseño Mobile Vanguard
 * (docs_implementacion/DESIGN_SYSTEM_MOBILE_VANGUARD.md §5).
 *
 * Las 4 fuentes Poppins viven en `android/app/src/main/assets/fonts/`
 * (nombres exactos de familia: Poppins-Regular/Medium/SemiBold/Bold).
 */

export const fontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

/** Escala tipográfica mobile (§5). */
export const typography = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 26,
  },
  subtitle1: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 22,
  },
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
};