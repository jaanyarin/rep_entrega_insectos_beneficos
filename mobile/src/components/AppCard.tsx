/**
 * AppCard — Tarjeta del Sistema de Diseño Mobile Vanguard (§13, §27).
 *
 * cardStyle: fondo blanco, radio 12 px, borde #E8EDF2, padding 16 px, sombra
 * z1. Una tarjeta = una sola unidad lógica; sin tarjetas internas.
 */

import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {theme} from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export default function AppCard({children, style, testID}: Props) {
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing[4],
    ...theme.shadows.z1,
  },
});