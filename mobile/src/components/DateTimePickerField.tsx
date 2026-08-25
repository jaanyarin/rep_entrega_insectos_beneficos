import React, {useState} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {theme} from '../theme';
import {formatoFechaInput, horaActual} from '../utils/requerimientos';

type PickerMode = 'date' | 'time';

export interface DateTimePickerFieldProps {
  label: string;
  value: string;
  mode: PickerMode;
  onChange: (value: string) => void;
  onClear?: () => void;
  editable?: boolean;
  accessibilityLabel?: string;
}

function parseValue(value: string, mode: PickerMode): Date {
  const now = new Date();
  if (mode === 'time') {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (match) {
      now.setHours(Number(match[1]), Number(match[2]), 0, 0);
    }
    return now;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return now;
}

function displayValue(value: string, mode: PickerMode): string {
  if (!value) {
    return '';
  }
  return mode === 'date' ? formatoFechaInput(value) : value;
}

export default function DateTimePickerField({
  label,
  value,
  mode,
  onChange,
  onClear,
  editable = true,
  accessibilityLabel,
}: DateTimePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const pickerValue = parseValue(value, mode);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (event.type === 'dismissed' || !selected) {
      return;
    }
    onChange(mode === 'date' ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}` : horaActual(selected));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{disabled: !editable}}
          disabled={!editable}
          onPress={() => setOpen(true)}
          style={({pressed}) => [
            styles.field,
            !editable && styles.disabled,
            pressed && editable && styles.pressed,
          ]}>
          <Text style={[styles.value, !value && styles.placeholder]}>
            {displayValue(value, mode) || (mode === 'date' ? 'Seleccionar fecha' : 'Seleccionar hora')}
          </Text>
          <Text style={styles.icon}>{mode === 'date' ? '▣' : '◷'}</Text>
        </Pressable>
        {onClear && value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Limpiar ${label}`}
            onPress={onClear}
            style={styles.clearButton}>
            <Text style={styles.clearText}>Limpiar</Text>
          </Pressable>
        ) : null}
      </View>
      {open ? (
        <DateTimePicker
          value={pickerValue}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[3],
  },
  label: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing[1],
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  field: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: theme.spacing[3],
  },
  pressed: {
    borderColor: theme.colors.border.focus,
  },
  disabled: {
    opacity: 0.55,
  },
  value: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
  },
  placeholder: {
    color: theme.colors.text.tertiary,
  },
  icon: {
    color: theme.colors.action.secondary,
    fontSize: 20,
  },
  clearButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[2],
  },
  clearText: {
    color: theme.colors.action.secondary,
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
  },
});
