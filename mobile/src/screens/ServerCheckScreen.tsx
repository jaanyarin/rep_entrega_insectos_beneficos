import React, {useCallback, useEffect, useState} from 'react';
import {BackHandler, KeyboardAvoidingView, Platform, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  api,
  BUILT_IN_API_URL,
  getToken,
  loadApiUrl,
  normalizeApiUrl,
  resetApiUrl,
  setApiUrl,
} from '../services/ApiClient';
import {isTokenExpired} from '../utils/token';
import type {RootStackParamList} from '../navigation/types';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import {theme} from '../theme';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type Status = 'checking' | 'error' | 'ready';

/**
 * Pantalla inicial del flujo no autenticado (modelo reutilizable §7.2):
 * prueba `GET /auth/roles` contra la URL guardada (timeout 5 s). Si falla,
 * muestra el formulario para ingresar/guardar la URL de la API y reintentar.
 *
 * Soporte offline (HITO-013): si ya existe un JWT válido en Keychain,
 * esta pantalla se salta automáticamente (AuthContext ya restauró la sesión).
 * Solo se muestra cuando no hay JWT o está expirado (necesita red para login).
 *
 * HITO-003: tema Vanguard (§18 card radius 16/shadow z2, tokens), SafeArea y
 * V6: back físico interceptado (pantalla raíz del stack anónimo → NO cierra
 * la app). El bug 3 (doble toque) se resuelve en LoginScreen: su ScrollView
 * sí lleva `keyboardShouldPersistTaps="handled"`; en esta pantalla no aplica
 * porque no tiene ScrollView.
 */
export default function ServerCheckScreen() {
  const navigation = useNavigation<Navigation>();
  const [status, setStatus] = useState<Status>('checking');
  const [apiUrl, setApiUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const probe = useCallback(
    async (urlToTest?: string) => {
      setStatus('checking');
      setErrorMsg('');
      try {
        const url = urlToTest ?? (await loadApiUrl());
        // Timeout corto (5 s) para no bloquear el primer flujo (ADR-A003).
        await api.get('/auth/roles', {timeout: 5000, baseURL: url});
        setStatus('ready');
        navigation.replace('Login');
      } catch (err) {
        setStatus('error');
        setErrorMsg(describeError(err));
      }
    },
    [navigation],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existingToken = await getToken();
        if (!cancelled && existingToken && !isTokenExpired(existingToken, 60)) {
          return; // JWT válido → AuthContext ya restauró la sesión
        }
      } catch {
        // No-op — continuamos con el probe normal
      }
      if (!cancelled) {
        const savedUrl = await loadApiUrl();
        setApiUrlInput(savedUrl);
        probe(savedUrl);
      }
    })();
    return () => { cancelled = true; };
  }, [probe]);

  // V6: back físico en raíz del stack anónimo → interceptar (no cerrar).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const handleSaveAndProbe = async () => {
    setSaving(true);
    try {
      await setApiUrl(apiUrl);
      await probe(normalizeApiUrl(apiUrl));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    await resetApiUrl();
    setApiUrlInput(BUILT_IN_API_URL);
    await probe(BUILT_IN_API_URL);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Verificando servidor</Text>

          {status === 'checking' ? (
            <>
              <LoadingState message="Comprobando la conexión con el servidor…" />
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                No se pudo conectar con el servidor. Verifique la dirección de
                la API e intente de nuevo.
              </Text>
              {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

              <AppInput
                label="URL de la API"
                placeholder="10.13.18.93 (solo su IP de la laptop)"
                value={apiUrl}
                onChangeText={setApiUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                accessibilityLabel="URL de la API"
              />

              <Text style={styles.hint}>
                Escriba solo la IP (ej. 10.13.18.93). App completa
                http://IP:6101/api/v1 automáticamente.
              </Text>

              <AppButton
                label="Guardar y probar"
                onPress={handleSaveAndProbe}
                loading={saving}
                accessibilityLabel="Guardar y probar servidor"
              />

              <AppButton
                label="Reintentar"
                variant="secondary"
                onPress={() => probe()}
                accessibilityLabel="Reintentar verificación del servidor"
              />

              <AppButton
                label="Restablecer"
                variant="text"
                onPress={handleReset}
                accessibilityLabel="Restablecer URL por defecto"
              />
            </>
          )}
        </AppCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function describeError(err: unknown): string {
  const e = err as {code?: string; message?: string; response?: {status?: number}};
  if (e?.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado. Verifique la dirección del servidor.';
  }
  if (e?.response) {
    return `El servidor respondió con error (HTTP ${e.response.status}).`;
  }
  if (e?.message === 'Network Error') {
    return 'No se pudo conectar. Revise su conexión o la dirección.';
  }
  return e?.message || 'No se pudo conectar con el servidor.';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[5],
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[6],
    marginHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.background.authOverlay,
    ...theme.shadows.z2,
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  subtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  error: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  hint: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
});
