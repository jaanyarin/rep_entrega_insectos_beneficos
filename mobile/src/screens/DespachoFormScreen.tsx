/**
 * DespachoFormScreen — Formulario para registrar un despacho (HITO-015 / MOD-06).
 *
 * Campos: cantidad despachada (requerida), papel con postura (opcional),
 * sobre con cascarilla (opcional), observaciones (opcional).
 */

import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';
import type {RootStackParamList} from '../navigation/types';
import {
  crearDespacho,
  extractErrorMessage,
} from '../services/ApiClient';
import {theme} from '../theme';
import {cantidadDesdeTexto} from '../utils/requerimientos';
import {useAuth} from '../context/AuthContext';
import {despachosRepo} from '../db/repositories';

type Route = RouteProp<RootStackParamList, 'DespachoForm'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function DespachoFormScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const isOnline = useOnlineStatus();

  const {requerimientoId} = route.params;

  const [cantidadTexto, setCantidadTexto] = useState('');
  const [papelTexto, setPapelTexto] = useState('');
  const [sobreTexto, setSobreTexto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  const cantidadNum = cantidadDesdeTexto(cantidadTexto);
  const puedeGuardar = cantidadNum > 0;

  const guardar = async () => {
    setSaving(true);
    try {
      const req = {
        cantidadDespachada: cantidadNum,
        papelConPostura: cantidadDesdeTexto(papelTexto) > 0
          ? cantidadDesdeTexto(papelTexto)
          : null,
        sobreConCascarilla: cantidadDesdeTexto(sobreTexto) > 0
          ? cantidadDesdeTexto(sobreTexto)
          : null,
        observaciones: observaciones.trim() || null,
      };
      if (isOnline) {
        await crearDespacho(requerimientoId, req);
      } else {
        await despachosRepo.createLocal(
          req,
          requerimientoId,
          null,
          user?.sub ? parseInt(user.sub) : 0,
        );
      }
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
          title="Registrar Despacho"
          showBack
          onBack={navigation.goBack}
        />
        {!isOnline && <OfflineBanner />}
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
            <AppInput
              label="Cantidad despachada (millares)"
              value={cantidadTexto}
              onChangeText={setCantidadTexto}
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="Cantidad despachada"
            />
            <AppInput
              label="Papel con postura (opcional)"
              value={papelTexto}
              onChangeText={setPapelTexto}
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="Papel con postura"
            />
            <AppInput
              label="Sobre con cascarilla (opcional)"
              value={sobreTexto}
              onChangeText={setSobreTexto}
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="Sobre con cascarilla"
            />
            <AppInput
              label="Observaciones (opcional)"
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Observaciones"
            />
            <AppButton
              label="Guardar"
              icon="content-save-outline"
              loading={saving}
              disabled={!puedeGuardar}
              onPress={guardar}
              accessibilityLabel="Registrar despacho"
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
});
