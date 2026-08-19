import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  api,
  BUILT_IN_API_URL,
  loadApiUrl,
  normalizeApiUrl,
  resetApiUrl,
  setApiUrl,
} from '../services/ApiClient';
import type {RootStackParamList} from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type Status = 'checking' | 'error' | 'ready';

/**
 * Pantalla inicial del flujo no autenticado (modelo reutilizable §7.2):
 * prueba `GET /auth/roles` contra la URL guardada (timeout 5 s). Si falla,
 * muestra el formulario para ingresar/guardar la URL de la API y reintentar.
 * Requiere conectividad (no existe capa offline — AGENTS.md §4).
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
    (async () => {
      const savedUrl = await loadApiUrl();
      setApiUrlInput(savedUrl);
    })();
    probe();
  }, [probe]);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Verificando servidor</Text>

        {status === 'checking' ? (
          <>
            <ActivityIndicator size="large" color="#1a5c2a" />
            <Text style={styles.subtitle}>
              Comprobando la conexión con el servidor…
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              No se pudo conectar con el servidor. Verifique la dirección de
              la API e intente de nuevo.
            </Text>
            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

            <Text style={styles.label}>URL de la API</Text>
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.10:6101/api/v1"
              placeholderTextColor="#999"
              value={apiUrl}
              onChangeText={setApiUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              accessibilityLabel="URL de la API"
            />

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleSaveAndProbe}
              disabled={saving}
              accessibilityLabel="Guardar y probar servidor">
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Guardar y probar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              accessibilityLabel="Restablecer URL por defecto">
              <Text style={styles.resetText}>Restablecer</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    backgroundColor: '#1a5c2a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a5c2a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#1a5c2a',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  resetText: {
    color: '#1a5c2a',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
});