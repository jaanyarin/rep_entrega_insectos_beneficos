/**
 * EmptyState — Estado vacío del Sistema de Diseño Mobile Vanguard (§17, §27).
 *
 * Debe incluir: icono ilustrativo (MaterialCommunityIcons 48-64 px), título
 * claro, mensaje de ayuda y acción principal cuando corresponda.
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';
import AppButton from './AppButton';

interface Props {
  title: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  message,
  icon = 'package-variant-closed',
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={56}
        color={theme.colors.border.strong}
        accessibilityLabel="Estado vacío"
      />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <AppButton label={actionLabel} onPress={onAction} />
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