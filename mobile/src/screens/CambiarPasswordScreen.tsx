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
const DEFAULT_PASSWORD = '00000000';

/** Sanitización: solo dígitos (el teclado numérico ayuda, esta es la barrera real). */
const sanitizar = (text: string) => text.replace(/[^0-9]/g, '');

/**
 * Cambio de contraseña OBLIGATORIO (ADR-A003 D-AUTH2-2 / ADR-A002 D-AUTH-4):
 * la nueva contraseña es el DNI del usuario (numérico, MÁXIMO 8 dígitos).
 * POST /auth/change-password → el backend emite un JWT fresco (sin
 * `passwordResetRequired`); AuthContext lo persiste y refresca `user`, por lo
 * que la navegación pasa automáticamente al Home. Sin back (ver RootNavigator:
 * única pantalla del stack con gestureEnabled=false).
 */
export default function CambiarPasswordScreen() {
  const {cambiarPassword, loading, error} = useAuth();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [repetirPassword, setRepetirPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (nuevaPassword.length === 0) {
      setLocalError('La contraseña es obligatoria');
      return;
    }
    if (!/^[0-9]+$/.test(nuevaPassword)) {
      setLocalError('Debe contener solo números');
      return;
    }
    if (nuevaPassword.length > MAX_DNI_LENGTH) {
      setLocalError('Máximo 8 dígitos');
      return;
    }
    if (nuevaPassword === DEFAULT_PASSWORD) {
      setLocalError(
        'La contraseña no puede ser la predeterminada (00000000)',
      );
      return;
    }
    if (repetirPassword !== nuevaPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    setLocalError(null);
    cambiarPassword(nuevaPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Cambio de Contraseña</Text>
        <Text style={styles.subtitle}>
          Por seguridad debe cambiar su contraseña. Use su número de DNI (8
          dígitos) como nueva contraseña.
        </Text>

        {(error || localError) && (
          <Text style={styles.error}>{error || localError}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Contraseña (DNI)"
          placeholderTextColor="#999"
          value={nuevaPassword}
          onChangeText={text => setNuevaPassword(sanitizar(text))}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={MAX_DNI_LENGTH}
          accessibilityLabel="Nueva contraseña (DNI)"
        />

        <TextInput
          style={styles.input}
          placeholder="Repetir contraseña"
          placeholderTextColor="#999"
          value={repetirPassword}
          onChangeText={text => setRepetirPassword(sanitizar(text))}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={MAX_DNI_LENGTH}
          accessibilityLabel="Repetir nueva contraseña"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel="Cambiar contraseña">
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