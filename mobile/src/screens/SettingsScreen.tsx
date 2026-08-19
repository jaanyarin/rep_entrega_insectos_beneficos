import React, {useEffect, useState} from 'react';
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
import {
  BUILT_IN_API_URL,
  loadApiUrl,
  resetApiUrl,
  setApiUrl,
} from '../services/ApiClient';

/**
 * Configuración de la URL del servidor en runtime (modelo reutilizable §7.3).
 * Accesible desde el Login ("Configurar servidor") y desde el Home del
 * Super Admin. La URL se persiste en SecureStore (Keychain, service
 * `apiUrl`) y el interceptor de axios la aplica en la siguiente petición.
 */
export default function SettingsScreen() {
  const navigation = useNavigation();
  const [apiUrl, setApiUrlInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedUrl = await loadApiUrl();
      setApiUrlInput(savedUrl);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setMessage('');
    await setApiUrl(apiUrl);
    setMessage('URL guardada correctamente.');
  };

  const handleReset = async () => {
    await resetApiUrl();
    setApiUrlInput(BUILT_IN_API_URL);
    setMessage('Se restauró la URL por defecto.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Configurar servidor</Text>
        <Text style={styles.subtitle}>
          Ingrese la dirección de la API del sistema. Se aplicará de inmediato
          a todas las conexiones.
        </Text>

        {loading ? (
          <ActivityIndicator color="#1a5c2a" />
        ) : (
          <>
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

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSave}
              accessibilityLabel="Guardar URL del servidor">
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              accessibilityLabel="Restablecer URL por defecto">
              <Text style={styles.resetText}>Restablecer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Volver">
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
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
    marginBottom: 8,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    padding: 12,
    alignItems: 'center',
  },
  resetText: {
    color: '#1a5c2a',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    padding: 10,
    alignItems: 'center',
  },
  backText: {
    color: '#555',
    fontSize: 14,
  },
  message: {
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
});