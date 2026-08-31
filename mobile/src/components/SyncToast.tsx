/**
 * SyncToast — Toast que aparece brevemente al completar sync (FASE 6.3).
 *
 * Se muestra automáticamente cuando SyncManager completa con cambios reales.
 * Se oculta después de 3 segundos con animación fade.
 */

import React, {useEffect, useState} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';
import {onSyncCallbacks, type SyncResults} from '../db/sync/SyncManager';

export default function SyncToast() {
  const [visible, setVisible] = useState(false);
  const [results, setResults] = useState<SyncResults | null>(null);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const unsubscribe = onSyncCallbacks({
      onSyncComplete: res => {
        if (res.requerimientosSincronizados > 0 || res.fotosSubidas > 0) {
          setResults(res);
          setVisible(true);
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          setTimeout(() => {
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => setVisible(false));
          }, 3000);
        }
      },
    });
    return unsubscribe;
  }, [opacity]);

  if (!visible || !results) {
    return null;
  }

  const parts: string[] = [];
  if (results.requerimientosSincronizados > 0) {
    parts.push(`${results.requerimientosSincronizados} requerimiento(s)`);
  }
  if (results.fotosSubidas > 0) {
    parts.push(`${results.fotosSubidas} foto(s)`);
  }

  return (
    <Animated.View style={[styles.container, {opacity}]} accessibilityRole="text">
      <MaterialCommunityIcons
        name="cloud-check"
        size={18}
        color={theme.colors.status.success}
      />
      <Text style={styles.text}>Sincronizado: {parts.join(', ')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    gap: theme.spacing[2],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 9999,
  },
  text: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.primary,
  },
});
