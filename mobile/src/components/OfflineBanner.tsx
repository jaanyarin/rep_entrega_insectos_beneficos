/**
 * OfflineBanner — Banner que indica que el dispositivo está offline (FASE 3.2).
 *
 * Se renderiza condicionalmente cuando useOnlineStatus() retorna false.
 * Patrón: functional component + StyleSheet, siguiendo ErrorState/StatusChip.
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';

export default function OfflineBanner() {
  return (
    <View style={styles.container} accessibilityRole="text">
      <MaterialCommunityIcons
        name="wifi-off"
        size={18}
        color={theme.colors.status.error}
        accessibilityLabel="Sin conexión"
      />
      <Text style={styles.text}>
        Sin conexión — Los datos se sincronizarán al reconectar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.status.errorBackground,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    gap: theme.spacing[2],
  },
  text: {
    flex: 1,
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.text.primary,
  },
});
