/**
 * AppHeader — Barra superior del Sistema de Diseño Mobile Vanguard (§11, §27).
 *
 * - Altura 56 px, fondo greyMain #3C4651, texto blanco.
 * - Título 18-20 px SemiBold (Poppins), padding horizontal 16 px.
 * - Flecha atrás a la izquierda SI corresponde (showBack).
 * - Máximo 2 acciones a la derecha (AppIconButton blancos 24 px).
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme';
import AppIconButton from './AppIconButton';

interface HeaderAction {
  name: string;
  accessibilityLabel: string;
  onPress?: () => void;
}

interface Props {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: HeaderAction[];
}

export default function AppHeader({title, showBack = false, onBack, actions = []}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showBack ? (
          <AppIconButton
            name="arrow-left"
            size={24}
            color={theme.colors.text.inverse}
            accessibilityLabel="Volver"
            onPress={onBack}
          />
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.actions]}>
        {actions.slice(0, 2).map(action => (
          <AppIconButton
            key={action.accessibilityLabel}
            name={action.name}
            size={24}
            color={theme.colors.text.inverse}
            accessibilityLabel={action.accessibilityLabel}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: theme.colors.action.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.inverse,
  },
});