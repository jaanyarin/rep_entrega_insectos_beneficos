import React, {useState} from 'react';
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
import {useAuth} from '../context/AuthContext';

const MAX_DNI_LENGTH = 8;
const DNI_REGEX = /^[0-9]+$/;

/**
 * Cambio de contraseña OBLIGATORIO (ADR-A002 D-AUTH-4): la nueva contraseña
 * es el DNI del usuario (numérico, máximo 8 dígitos, distinto de 00000000).
 * Solo se muestra cuando debeCambiarPassword = true; sin back (ver
 * RootNavigator: única pantalla del stack con gestureEnabled=false).
 */
export default function CambiarPasswordScreen() {
  const {cambiarPassword, loading, error} = useAuth();
  const [dni, setDni] = useState('');
  const [repetirDni, setRepetirDni] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  /** Sanitización: solo dígitos (el teclado numérico ayuda, esto es la barrera real). */
  const sanitizar = (text: string) => text.replace(/[^0-9]/g, '');

  const handleSubmit = () => {
    if (dni.length === 0) {
      setLocalError('El DNI es obligatorio');
      return;
    }
    if (!DNI_REGEX.test(dni)) {
      setLocalError('Debe contener solo números');
      return;
    }
    if (dni.length > MAX_DNI_LENGTH) {
      setLocalError('Máximo 8 dígitos');
      return;
    }
    if (dni === '00000000') {
      setLocalError('El DNI no puede ser la contraseña por defecto (00000000)');
      return;
    }
    if (repetirDni !== dni) {
      setLocalError('Los DNI no coinciden');
      return;
    }
    setLocalError(null);
    cambiarPassword(dni);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Cambio de Contraseña</Text>
        <Text style={styles.subtitle}>
          Por seguridad debe cambiar su contraseña. La nueva contraseña será su
          DNI (solo números, máximo 8 dígitos).
        </Text>

        {(error || localError) && (
          <Text style={styles.error}>{error || localError}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="DNI (nueva contraseña)"
          placeholderTextColor="#999"
          value={dni}
          onChangeText={text => setDni(sanitizar(text))}
          keyboardType="number-pad"
          maxLength={MAX_DNI_LENGTH}
        />

        <TextInput
          style={styles.input}
          placeholder="Repetir DNI"
          placeholderTextColor="#999"
          value={repetirDni}
          onChangeText={text => setRepetirDni(sanitizar(text))}
          keyboardType="number-pad"
          maxLength={MAX_DNI_LENGTH}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          )}
        </TouchableOpacity>
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
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
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
});