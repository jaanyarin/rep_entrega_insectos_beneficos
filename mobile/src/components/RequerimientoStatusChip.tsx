/**
 * RequerimientoStatusChip — Chip de estado del módulo Requerimientos.
 *
 * El `StatusChip` del design system usa tokens semánticos, pero el dominio de
 * requerimientos exige los colores EXACTOS de la tabla (RN-022): Registrado
 * #9E9E9E · Pendiente #FFC107 · Aprobado #4CAF50 · Entregado #2196F3 ·
 * Recibido #009688 · Liberado #9C27B0. Este chip lee el mapa de
 * `utils/requerimientos.ts` y aplica `backgroundColor` + texto en el mismo
 * estilo (radio píldora, texto siempre visible) para mantener consistencia
 * con el `StatusChip` del sistema.
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {EstadoRequerimiento} from '../services/ApiClient';
import {theme} from '../theme';
import {estadoInfo} from '../utils/requerimientos';

interface Props {
  estado: EstadoRequerimiento;
}

export default function RequerimientoStatusChip({estado}: Props) {
  const info = estadoInfo(estado);
  return (
    <View
      style={[styles.chip, {backgroundColor: `${info.color}22`}]}
      accessibilityRole="text">
      <Text style={[styles.text, {color: info.color}]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    height: 26,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
