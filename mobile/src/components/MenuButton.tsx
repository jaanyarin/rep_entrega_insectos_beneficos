/**
 * MenuButton — Opción del menú principal del home (Sistema de Diseño Mobile
 * Vanguard §19, §27): icono lineal + título + flecha de navegación, fondo
 * blanco, acento sutil azul/gris. Reutilizado por los 3 perfiles.
 *
 * Navega a la pantalla destino pasada por prop. Radio sm (8 px) a propósito:
 * conserva el contrato de conteo de "divs" del HomeScreen (los grupos se
 * distinguen por contenedor, no por el botón).
 */

import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {theme} from '../theme';
import type {MenuScreen, RootStackParamList} from '../navigation/types';

interface Props {
  label: string;
  screen: MenuScreen;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const ICONS: Partial<Record<MenuScreen, string>> = {
  NuevoRequerimiento: 'text-box-plus-outline',
  HistorialRequerimiento: 'history',
  Programacion: 'calendar-week-outline',
  SolicitudRequerimientos: 'clipboard-text-outline',
};

export default function MenuButton({label, screen, navigation}: Props) {
  const icon = ICONS[screen] ?? 'arrow-right-circle-outline';
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate(screen)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={theme.colors.action.secondary}
        accessibilityLabel={label}
      />
      <Text style={styles.buttonText}>{label}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.border.strong}
        accessibilityLabel={undefined}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    minHeight: 56,
    marginBottom: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  buttonText: {
    flex: 1,
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text.primary,
  },
});
