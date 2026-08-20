import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppInput from '../components/AppInput';
import {theme} from '../theme';

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
 *
 * HITO-003 (delta): SafeArea (bug 1), tema Vanguard (AppCard/AppInput/
 * AppButton, sin hardcodes) y V6: back físico interceptado (raíz del stack
 * reset → NO cierra la app).
 */
export default function CambiarPasswordScreen() {
  const {cambiarPassword, loading, error} = useAuth();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [repetirPassword, setRepetirPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // V6: back físico en raíz del stack reset → interceptar (no cerrar).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Cambio de Contraseña</Text>
          <Text style={styles.subtitle}>
            Por seguridad debe cambiar su contraseña. Use su número de DNI (8
            dígitos) como nueva contraseña.
          </Text>

          {(error || localError) && (
            <Text style={styles.error}>{error || localError}</Text>
          )}

          <AppInput
            label="Nueva contraseña (DNI)"
            value={nuevaPassword}
            onChangeText={text => setNuevaPassword(sanitizar(text))}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={MAX_DNI_LENGTH}
            accessibilityLabel="Nueva contraseña (DNI)"
          />

          <AppInput
            label="Repetir contraseña"
            value={repetirPassword}
            onChangeText={text => setRepetirPassword(sanitizar(text))}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={MAX_DNI_LENGTH}
            accessibilityLabel="Repetir nueva contraseña"
          />

          <AppButton
            label="Cambiar contraseña"
            onPress={handleSubmit}
            loading={loading}
            accessibilityLabel="Cambiar contraseña"
          />
        </AppCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
    backgroundColor: theme.colors.background.authOverlay,
    ...theme.shadows.z2,
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
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
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
});