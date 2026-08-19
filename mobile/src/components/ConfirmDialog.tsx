/**
 * ConfirmDialog — Modal de confirmación del Sistema de Diseño Mobile Vanguard
 * (§17, §27). Obligatorio para acciones destructivas (cerrar sesión, eliminar),
 * descartar cambios y operaciones irreversibles.
 *
 * - Fondo: backdrop rgba(22,28,36,0.48); card blanca radio 16 px, sombra modal.
 * - Botón de confirmación: primario o destructivo (tone).
 * - Accesibilidad: accessibilityViewIsModal + labels explícitos.
 * - El `accessibilityLabel` de los botones es DISTINTO de los textos visuales
 *   para permitir pruebas deterministas y contraste en testeos de árbol.
 */

import React from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme';
import AppButton from './AppButton';

export type ConfirmTone = 'danger' | 'default';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Label de accesibilidad del botón de confirmación (distinto del texto). */
  confirmAccessibilityLabel?: string;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  onConfirm,
  onCancel,
  confirmAccessibilityLabel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <AppButton
                label={cancelLabel}
                variant="secondary"
                onPress={onCancel}
                accessibilityLabel="Cancelar"
              />
            </View>
            <View style={styles.actionButton}>
              <AppButton
                label={confirmLabel}
                variant={tone === 'danger' ? 'destructive' : 'primary'}
                onPress={onConfirm}
                accessibilityLabel={confirmAccessibilityLabel ?? confirmLabel}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    padding: theme.spacing[6],
    ...theme.shadows.modal,
  },
  title: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  message: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[6],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing[2],
  },
  actionButton: {
    flex: 1,
  },
});