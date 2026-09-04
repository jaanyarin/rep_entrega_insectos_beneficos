/**
 * RecepcionFormScreen — Formulario para confirmar una recepción (HITO-015 / MOD-07).
 *
 * Campos: conforme (toggle, default true), observaciones (requerido si conforme=false).
 */

import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import ErrorBoundary from '../components/ErrorBoundary';
import type {RootStackParamList} from '../navigation/types';
import {
  confirmarRecepcion,
  extractErrorMessage,
} from '../services/ApiClient';
import {theme} from '../theme';

type Route = RouteProp<RootStackParamList, 'RecepcionForm'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function RecepcionFormScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const {requerimientoId} = route.params;

  const [conforme, setConforme] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  const obsRequerida = !conforme;
  const obsFalta = obsRequerida && observaciones.trim().length === 0;
  const puedeGuardar = !obsFalta;

  const guardar = async () => {
    setSaving(true);
    try {
      const req = {
        conforme,
        observaciones: observaciones.trim() || null,
      };
      await confirmarRecepcion(requerimientoId, req);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el formulario"
      fallbackMessage="Reintente nuevamente.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Confirmar Recepción"
          showBack
          onBack={navigation.goBack}
        />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              {paddingBottom: 32 + insets.bottom},
            ]}
            keyboardShouldPersistTaps="handled">
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Conforme</Text>
              <Switch
                value={conforme}
                onValueChange={setConforme}
                trackColor={{
                  false: theme.colors.border.strong,
                  true: theme.colors.status.success,
                }}
                accessibilityLabel="Recepción conforme"
              />
            </View>
            <AppInput
              label={
                obsRequerida
                  ? 'Observaciones (requeridas si no es conforme)'
                  : 'Observaciones (opcional)'
              }
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              error={obsFalta ? 'Las observaciones son requeridas cuando no es conforme' : undefined}
              accessibilityLabel="Observaciones"
            />
            <AppButton
              label="Guardar"
              icon="content-save-outline"
              loading={saving}
              disabled={!puedeGuardar}
              onPress={guardar}
              accessibilityLabel="Confirmar recepción"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing[4],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
    minHeight: 54,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: theme.spacing[4],
  },
  switchLabel: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.secondary,
  },
});
