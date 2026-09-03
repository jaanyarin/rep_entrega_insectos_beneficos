/**
 * LiberacionFormScreen — Formulario para registrar una liberación (HITO-015 / MOD-08).
 *
 * Campos: fundo (selector), lote (selector dependiente), cantidad liberada,
 * hora de liberación (HH:mm), observaciones.
 */

import React, {useCallback, useEffect, useState} from 'react';
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
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SelectField from '../components/SelectField';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';
import type {RootStackParamList} from '../navigation/types';
import {
  crearLiberacion,
  extractErrorMessage,
  listarFundos,
  listarLotes,
  type FundoDto,
  type LoteDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {cantidadDesdeTexto, horaActual} from '../utils/requerimientos';
import {useAuth} from '../context/AuthContext';
import {liberacionesRepo} from '../db/repositories';

type Route = RouteProp<RootStackParamList, 'LiberacionForm'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function LiberacionFormScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const isOnline = useOnlineStatus();

  const {requerimientoId} = route.params;

  const [fundos, setFundos] = useState<FundoDto[]>([]);
  const [lotes, setLotes] = useState<LoteDto[]>([]);
  const [fundoId, setFundoId] = useState<number | null>(null);
  const [loteId, setLoteId] = useState<number | null>(null);
  const [cantidadTexto, setCantidadTexto] = useState('');
  const [hora, setHora] = useState(horaActual());
  const [observaciones, setObservaciones] = useState('');
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cargarCatalogos = useCallback(async () => {
    setLoadingCatalogo(true);
    setError(null);
    try {
      const f = await listarFundos();
      setFundos(f);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoadingCatalogo(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const cargarLotes = useCallback(async (fid: number) => {
    try {
      const l = await listarLotes(fid);
      setLotes(l);
    } catch {
      setLotes([]);
    }
  }, []);

  const cambiarFundo = (value: number | string) => {
    const fid = Number(value);
    setFundoId(fid);
    setLoteId(null);
    cargarLotes(fid);
  };

  const cantidadNum = cantidadDesdeTexto(cantidadTexto);
  const puedeGuardar =
    fundoId != null &&
    loteId != null &&
    cantidadNum > 0 &&
    hora.trim().length > 0;

  const guardar = async () => {
    setSaving(true);
    try {
      const req = {
        fundoId: fundoId!,
        loteId: loteId!,
        cantidadLiberada: cantidadNum,
        horaLiberacion: hora.trim(),
        observaciones: observaciones.trim() || null,
      };
      if (isOnline) {
        await crearLiberacion(requerimientoId, req);
      } else {
        await liberacionesRepo.createLocal(
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

  const opcionesFundo = fundos.map(f => ({label: f.nombre, value: f.id}));
  const opcionesLote = lotes.map(l => ({label: l.nombre, value: l.id}));

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el formulario"
      fallbackMessage="Reintente nuevamente.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Registrar Liberación"
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
            {loadingCatalogo ? (
              <LoadingState message="Cargando catálogos…" />
            ) : error ? (
              <ErrorState onRetry={cargarCatalogos} />
            ) : (
              <>
                <SelectField
                  label="Fundo"
                  accessibilityLabel="Fundo"
                  optionAccessibilityPrefix="Opción Fundo"
                  value={fundos.find(f => f.id === fundoId)?.nombre ?? ''}
                  options={opcionesFundo}
                  onSelect={cambiarFundo}
                  disabled={fundos.length === 0}
                />
                <SelectField
                  label="Lote"
                  accessibilityLabel="Lote"
                  optionAccessibilityPrefix="Opción Lote"
                  value={lotes.find(l => l.id === loteId)?.nombre ?? ''}
                  options={opcionesLote}
                  onSelect={v => setLoteId(Number(v))}
                  disabled={fundoId == null || lotes.length === 0}
                />
                <AppInput
                  label="Cantidad liberada (millares)"
                  value={cantidadTexto}
                  onChangeText={setCantidadTexto}
                  keyboardType="number-pad"
                  maxLength={6}
                  accessibilityLabel="Cantidad liberada"
                />
                <AppInput
                  label="Hora de liberación (HH:mm)"
                  value={hora}
                  onChangeText={setHora}
                  placeholder="HH:mm"
                  maxLength={5}
                  accessibilityLabel="Hora de liberación"
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
                  accessibilityLabel="Registrar liberación"
                />
              </>
            )}
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
