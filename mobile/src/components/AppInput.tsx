/**
 * AppInput — Campo de texto del Sistema de Diseño Mobile Vanguard (§15, §27).
 *
 * - Label PERMANENTE (no solo placeholder), altura 52-56 px, radio 8 px.
 * - Borde normal #B5BEC8 · foco #3C4651 · error #D7594E; mensaje de error
 *   debajo del campo.
 * - En contraseña incluye mostrar/ocultar (AppIconButton con ojo).
 * - Reenvía `value`, `onChangeText`, `accessibilityLabel` y demás props de
 *   TextInput al input interno (contrato de interacción de los tests).
 */

import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {theme} from '../theme';
import AppIconButton from './AppIconButton';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Mensaje de error (debajo del campo). */
  error?: string;
  /** Si `true`, muestra toggle mostrar/ocultar (§15). */
  passwordToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export default function AppInput({
  label,
  error,
  passwordToggle = false,
  containerStyle,
  inputStyle,
  secureTextEntry,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = passwordToggle || secureTextEntry === true;

  const borderColor = error
    ? theme.colors.border.error
    : focused
      ? theme.colors.border.focus
      : theme.colors.border.default;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrapper, {borderColor}]}>
        <TextInput
          {...inputProps}
          style={[styles.input, inputStyle]}
          placeholderTextColor={theme.colors.text.tertiary}
          secureTextEntry={isPassword && !visible}
          onFocus={e => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {isPassword ? (
          <AppIconButton
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.text.secondary}
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible(v => !v)}
          />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[3],
  },
  label: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1] + 2,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    backgroundColor: theme.colors.background.paper,
    paddingRight: theme.spacing[2],
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 0,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.primary,
  },
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.status.error,
    marginTop: theme.spacing[1],
  },
});