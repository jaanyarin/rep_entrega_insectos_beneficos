/**
 * AppIconButton — Botón de icono del Sistema de Diseño Mobile Vanguard
 * (§9, §11, §27).
 *
 * Solo iconos MaterialCommunityIcons (NUNCA emojis — §9). Área táctil mínima
 * 44x44 dp (§23). Requiere `accessibilityLabel` SIEMPRE que represente una
 * acción (regla §9).
 */

import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';

interface Props {
  name: string;
  /** Obligatorio: el icono representa una acción (§9). */
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  /** Fondo opcional (header oscuro usa el botón sin fondo). */
  backgroundColor?: string;
  testID?: string;
}

export default function AppIconButton({
  name,
  accessibilityLabel,
  onPress,
  size = 24,
  color = theme.colors.text.primary,
  disabled = false,
  backgroundColor = 'transparent',
  testID,
}: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{disabled}}
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      style={({pressed}) => [
        styles.button,
        {backgroundColor},
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      android_ripple={{color: theme.colors.border.subtle}}>
      <MaterialCommunityIcons
        name={name}
        size={size}
        color={color}
        accessibilityLabel={accessibilityLabel}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
});