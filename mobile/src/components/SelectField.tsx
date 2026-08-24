/**
 * SelectField — Desplegable (dropdown) del Sistema de Diseño Mobile Vanguard.
 *
 * El proyecto no usa react-native-picker (ADR-A001: stack RN CLI + componentes
 * propios); este campo materializa el "Desplegable" de los RF-158/173 con un
 * Pressable que abre un Modal con la lista de opciones (patrón LoginScreen de
 * opciones táctiles). Mantiene la estética de `AppInput` (label permanente,
 * caja con borde) y la accesibilidad del sistema:
 *  - El campo expone `accessibilityLabel` (por defecto `label`).
 *  - Cada opción expone `${optionAccessibilityPrefix} ${opcion.label}`.
 */

import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';

export interface SelectOption {
  label: string;
  value: number | string;
}

interface Props {
  label: string;
  /** Texto mostrado (label de la opción seleccionada). */
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onSelect: (value: number | string) => void;
  disabled?: boolean;
  error?: string;
  accessibilityLabel?: string;
  /** Prefijo de accesibilidad de las opciones (para discriminarlas en tests). */
  optionAccessibilityPrefix?: string;
  /** Hook opcional al abrir el modal (p. ej. recargar lotes por fundo). */
  onOpen?: () => void;
}

export default function SelectField({
  label,
  value,
  placeholder = 'Seleccionar…',
  options,
  onSelect,
  disabled = false,
  error,
  accessibilityLabel,
  optionAccessibilityPrefix,
  onOpen,
}: Props) {
  const [open, setOpen] = useState(false);

  const abrir = () => {
    if (disabled) {
      return;
    }
    onOpen?.();
    setOpen(true);
  };

  const seleccionar = (option: SelectOption) => {
    onSelect(option.value);
    setOpen(false);
  };

  const borderColor = error
    ? theme.colors.border.error
    : theme.colors.border.default;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{disabled}}
        onPress={abrir}
        disabled={disabled}
        style={[styles.box, {borderColor}, disabled && styles.boxDisabled]}>
        <Text
          style={[styles.value, !value && styles.placeholder]}
          numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
        />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        accessibilityViewIsModal>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{label}</Text>
            <ScrollView style={styles.list}>
              {options.map(option => {
                const selected = option.label === value;
                return (
                  <Pressable
                    key={String(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      optionAccessibilityPrefix
                        ? `${optionAccessibilityPrefix} ${option.label}`
                        : option.label
                    }
                    accessibilityState={{selected}}
                    onPress={() => seleccionar(option)}
                    style={[styles.option, selected && styles.optionSelected]}>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                    {selected ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colors.action.secondary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: theme.spacing[4],
  },
  boxDisabled: {
    backgroundColor: theme.colors.background.neutral,
    opacity: 0.7,
  },
  value: {
    flex: 1,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.primary,
  },
  placeholder: {
    color: theme.colors.text.tertiary,
  },
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.status.error,
    marginTop: theme.spacing[1],
  },
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.background.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[5],
    ...theme.shadows.modal,
    maxHeight: '70%',
  },
  cardTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  optionSelected: {
    backgroundColor: theme.colors.background.neutral,
  },
  optionText: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontWeight: '600',
  },
});
