/**
 * shadows.ts — Token de sombras/elevación del Sistema de Diseño Mobile Vanguard
 * (docs_implementacion/DESIGN_SYSTEM_MOBILE_VANGUARD.md §8).
 *
 * - Tarjetas normales: z1.
 * - AppBar fija / tarjeta destacada: z2.
 * - Modal / bottom sheet: modal.
 */

export const shadows = {
  z1: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  z2: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: {width: -20, height: 20},
    shadowOpacity: 0.24,
    shadowRadius: 40,
    elevation: 12,
  },
};