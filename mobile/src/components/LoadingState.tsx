/**
 * LoadingState — Carga inicial completa (indicador centrado + texto breve)
 * del Sistema de Diseño Mobile Vanguard (§17, §27).
 */

import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme';

interface Props {
  message?: string;
  color?: string;
}

export default function LoadingState({
  message = 'Cargando…',
  color = theme.colors.action.primary,
}: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
  },
  message: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[3],
  },
});