/**
 * ProyeccionMesCard — Tabla de proyección mensual + barra de consumo vs
 * disponibilidad (Screen 6 y Screen 9, RF-149/168/171/172/179).
 *
 * Reutilizable por el panel admin (Screen 6) y el panel user (Screen 9).
 * Muestra por semana: Sem | Papel | Sobre | Total (RN-019) y una barra de
 * progreso que mide visualmente el consumo mensual vs la disponibilidad.
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AppCard from './AppCard';
import {theme} from '../theme';
import type {FilaProyeccion} from '../utils/requerimientos';
import {porcentajeConsumo} from '../utils/requerimientos';

interface Props {
  filas: FilaProyeccion[];
  /** Disponibilidad mensual (total de la proyección) en millares. */
  disponibilidad: number;
  /** Consumo mensual (requerimientos del mes) en millares. */
  consumo: number;
  titulo?: string;
}

export default function ProyeccionMesCard({
  filas,
  disponibilidad,
  consumo,
  titulo,
}: Props) {
  const pct = porcentajeConsumo(consumo, disponibilidad);
  const barWidth = `${Math.min(100, pct)}%` as `${number}%`;

  return (
    <AppCard style={styles.card}>
      {titulo ? <Text style={styles.title}>{titulo}</Text> : null}
      <View style={styles.tablaHeader}>
        <Text style={[styles.colSemana, styles.headerText]}>Sem</Text>
        <Text style={[styles.colProducto, styles.headerText]}>Papel</Text>
        <Text style={[styles.colProducto, styles.headerText]}>Sobre</Text>
        <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
      </View>
      {filas.length === 0 ? (
        <Text style={styles.vacio}>Sin proyección registrada para el mes.</Text>
      ) : (
        filas.map(fila => (
          <View key={fila.semana} style={styles.fila}>
            <Text style={[styles.colSemana, styles.cell]}>{String(fila.semana)}</Text>
            <Text style={[styles.colProducto, styles.cell]}>{String(fila.papel)}</Text>
            <Text style={[styles.colProducto, styles.cell]}>{String(fila.sobre)}</Text>
            <Text style={[styles.colTotal, styles.cell, styles.totalCell]}>
              {String(fila.total)}
            </Text>
          </View>
        ))
      )}
      <View style={styles.pie}>
        <Text style={styles.pieText}>{`Disponible: ${disponibilidad} millares`}</Text>
        <Text style={styles.pieText}>{`Consumido: ${consumo} millares`}</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, {width: barWidth}]} />
      </View>
      <Text style={styles.barLabel}>
        Consumo mensual vs disponibilidad · {pct}%
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing[2],
  },
  title: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.neutral,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
  },
  headerText: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  cell: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.primary,
  },
  totalCell: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontWeight: '600',
  },
  colSemana: {
    width: 44,
  },
  colProducto: {
    flex: 1,
  },
  colTotal: {
    width: 56,
    textAlign: 'right',
  },
  vacio: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.tertiary,
    paddingVertical: theme.spacing[2],
  },
  pie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing[2],
  },
  pieText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  barTrack: {
    height: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.background.neutral,
    overflow: 'hidden',
    marginTop: theme.spacing[2],
  },
  barFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.action.secondary,
  },
  barLabel: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
});
