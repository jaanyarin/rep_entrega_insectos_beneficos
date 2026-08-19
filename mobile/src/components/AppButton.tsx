/**
 * AppButton — Botón del Sistema de Diseño Mobile Vanguard (§14, §27).
 *
 * Variantes:
 *  - primary    : fondo greyMain #3C4651, texto blanco (acción principal).
 *  - secondary  : outlined blanco, borde/texto blueMain #558BA5.
 *  - destructive: fondo red #D7594E (siempre requiere confirmación externa).
 *  - text       : sin fondo, texto link #558BA5 (acción de menor jerarquía).
 *
 * Estados: normal / pressed (oscurece) / disabled (fondo #D4DAE0, texto
 * #8A95A3) / loading (bloquea doble toque y muestra ActivityIndicator).
 * Accesibilidad: accessibilityRole="button" + accessibilityLabel por defecto
 * igual al label (override vía prop). Área táctil mínima 48 px de alto.
 */

import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'destructive' | 'text';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  /** Icono MaterialCommunityIcons opcional (nunca emojis — §9). */
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Se usa en placeholders/menús (AppButton row) para el icono inline. */
  testID?: string;
  style?: object;
}

const PRESSED_DARKEN = {opacity: 0.9}; // oscurecer 8-12% (pressed)

function variantColors(
  variant: AppButtonVariant,
  disabled: boolean,
): {bg: string; text: string; border?: string} {
  if (disabled) {
    return {
      bg: theme.colors.action.disabled,
      text: theme.colors.text.disabled,
      border: theme.colors.action.disabled,
    };
  }
  switch (variant) {
    case 'secondary':
      return {
        bg: theme.colors.background.paper,
        text: theme.colors.action.secondary,
        border: theme.colors.action.secondary,
      };
    case 'destructive':
      return {bg: theme.colors.status.error, text: theme.colors.text.inverse};
    case 'text':
      return {bg: 'transparent', text: theme.colors.text.link};
    case 'primary':
    default:
      return {bg: theme.colors.action.primary, text: theme.colors.text.inverse};
  }
}

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
  testID,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const colors = variantColors(variant, isDisabled);

  if (variant === 'text') {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{disabled: isDisabled}}
        onPress={onPress}
        disabled={isDisabled}
        style={({pressed}) => [styles.textButton, pressed && PRESSED_DARKEN]}
        android_ripple={{color: theme.colors.border.subtle}}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <View style={styles.textRow}>
            {icon ? (
              <MaterialCommunityIcons
                name={icon}
                size={20}
                color={colors.text}
                style={styles.textIcon}
              />
            ) : null}
            <Text style={[styles.textLabel, {color: colors.text}]}>{label}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled: isDisabled}}
      onPress={onPress}
      disabled={isDisabled}
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor: colors.bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
          minHeight: variant === 'secondary' ? 48 : 48,
        },
        pressed && PRESSED_DARKEN,
        style,
      ]}
      android_ripple={{color: theme.colors.border.subtle}}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={colors.text}
              style={styles.icon}
            />
          ) : null}
          <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  textButton: {
    minHeight: 44,
    paddingHorizontal: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textIcon: {
    marginRight: theme.spacing[1],
  },
  textLabel: {
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
  },
});