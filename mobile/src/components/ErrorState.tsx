/**
 * ErrorState — Error de conexión/fallo con reintento del Sistema de Diseño
 * Mobile Vanguard (§17, §27).
 *
 * Texto de referencia: "Sin conexión con el servidor / Verifica tu red o la
 * dirección configurada e inténtalo nuevamente. [Reintentar]".
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';
import AppButton from './AppButton';

interface Props {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Sin conexión con el servidor',
  message = 'Verifica tu red o la dirección configurada e inténtalo nuevamente.',
  retryLabel = 'Reintentar',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="cloud-alert-outline"
        size={56}
        color={theme.colors.status.error}
        accessibilityLabel="Error de conexión"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <AppButton label={retryLabel} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
  },
  title: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing[3],
  },
  message: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing[1],
  },
  action: {
    marginTop: theme.spacing[5],
  },
});