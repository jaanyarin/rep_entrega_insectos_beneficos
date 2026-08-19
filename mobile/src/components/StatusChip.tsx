/**
 * StatusChip — Chip de estado del Sistema de Diseño Mobile Vanguard (§16,
 * §27). Radio píldora, texto SIEMPRE visible (no depender solo del color),
 * texto 12 px Medium.
 *
 * Tonos: pending / approved / active / fault / cancelled / info (design §16)
 * más alias del dominio de requerimientos (registered/entregado/recibido/
 * liberado) mapeados a los mismos tokens semánticos.
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme';

export type StatusTone =
  | 'pending'
  | 'approved'
  | 'active'
  | 'fault'
  | 'cancelled'
  | 'info'
  | 'registered'
  | 'entregado'
  | 'recibido'
  | 'liberado'
  | 'neutral';

const TONES: Record<
  StatusTone,
  {color: string; backgroundColor: string; defaultLabel: string}
> = {
  pending: {
    color: theme.colors.status.warning,
    backgroundColor: theme.colors.status.warningBackground,
    defaultLabel: 'Pendiente',
  },
  approved: {
    color: theme.colors.status.success,
    backgroundColor: theme.colors.status.successBackground,
    defaultLabel: 'Aprobado',
  },
  active: {
    color: theme.colors.status.success,
    backgroundColor: theme.colors.status.successBackground,
    defaultLabel: 'Operativo',
  },
  fault: {
    color: theme.colors.status.error,
    backgroundColor: theme.colors.status.errorBackground,
    defaultLabel: 'Averiado',
  },
  cancelled: {
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.background.neutral,
    defaultLabel: 'Anulado',
  },
  info: {
    color: theme.colors.status.info,
    backgroundColor: theme.colors.status.infoBackground,
    defaultLabel: 'Información',
  },
  registered: {
    color: theme.colors.text.tertiary,
    backgroundColor: theme.colors.background.neutral,
    defaultLabel: 'Registrado',
  },
  entregado: {
    color: theme.colors.action.secondary,
    backgroundColor: theme.colors.status.infoBackground,
    defaultLabel: 'Entregado',
  },
  recibido: {
    color: theme.colors.status.info,
    backgroundColor: theme.colors.status.infoBackground,
    defaultLabel: 'Recibido',
  },
  liberado: {
    color: theme.colors.status.error,
    backgroundColor: theme.colors.status.infoBackground,
    defaultLabel: 'Liberado',
  },
  neutral: {
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.background.neutral,
    defaultLabel: 'Neutral',
  },
};

interface Props {
  tone?: StatusTone;
  label?: string;
}

export default function StatusChip({tone = 'neutral', label}: Props) {
  const config = TONES[tone];
  const text = label ?? config.defaultLabel;
  return (
    <View
      style={[styles.chip, {backgroundColor: config.backgroundColor}]}
      accessibilityRole="text">
      <Text style={[styles.text, {color: config.color}]}>{text}</Text>
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
    fontWeight: '500',
  },
});