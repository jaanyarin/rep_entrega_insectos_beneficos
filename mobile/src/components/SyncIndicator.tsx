/**
 * SyncIndicator — Indicador de estado de sincronización (FASE 3.2).
 *
 * Muestra:
 *  - syncing=true: ActivityIndicator + "Sincronizando..."
 *  - syncing=false, pendingCount > 0: "N pendientes" con warning color
 *  - todo sincronizado + lastSyncTime: "Última sync: HH:MM"
 *
 * Patrón: functional component + StyleSheet, siguiendo StatusChip/ErrorState.
 */

import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';

interface Props {
  syncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function SyncIndicator({
  syncing,
  pendingCount,
  lastSyncTime,
}: Props) {
  if (syncing) {
    return (
      <View style={styles.container} accessibilityRole="text">
        <ActivityIndicator size="small" color={theme.colors.status.info} />
        <Text style={styles.text}>Sincronizando…</Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <View style={styles.container} accessibilityRole="text">
        <MaterialCommunityIcons
          name="cloud-upload-outline"
          size={16}
          color={theme.colors.status.warning}
        />
        <Text style={[styles.text, {color: theme.colors.status.warning}]}>
          {pendingCount} pendiente{pendingCount === 1 ? '' : 's'}
        </Text>
      </View>
    );
  }

  if (lastSyncTime) {
    return (
      <View style={styles.container} accessibilityRole="text">
        <MaterialCommunityIcons
          name="cloud-check-outline"
          size={16}
          color={theme.colors.status.success}
        />
        <Text style={[styles.text, {color: theme.colors.status.success}]}>
          Última sync: {formatTime(lastSyncTime)}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  text: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: 16,
    color: theme.colors.text.secondary,
  },
});
