import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {
  extractErrorMessage,
  fetchRoles,
  fetchUsuariosByRol,
  type RolDto,
  type UsuarioRolDto,
} from '../services/ApiClient';
import type {RootStackParamList} from '../navigation/types';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppInput from '../components/AppInput';
import {theme} from '../theme';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const MAX_PASSWORD_LENGTH = 8;
const DEFAULT_PASSWORD = '00000000';

/**
 * Login en 3 pasos (ADR-A003 D-AUTH2-2):
 *  (a) selector de perfil (GET /auth/roles);
 *  (b) selector de usuario del rol (GET /auth/usuarios-by-rol/{rolId});
 *      si el usuario trae `passwordResetRequired`, se autocompleta `00000000`;
 *  (c) contraseña numérica (máx 8 dígitos) → POST /auth/local-login.
 * Incluye acceso a "Configurar servidor" (Settings) para primer uso.
 *
 * HITO-003 (delta): SafeArea (bug 1), `keyboardShouldPersistTaps="handled"`
 * (corrige bug 3: doble toque al presionar "Iniciar sesión" — el primer tap
 * solo descartaba el teclado) y tema Vanguard completo (tokens, AppCard,
 * AppInput, AppButton; sin hardcodes de la paleta antigua).
 */
export default function LoginScreen() {
  const navigation = useNavigation<Navigation>();
  const {login, loading, error} = useAuth();

  const [roles, setRoles] = useState<RolDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioRolDto[]>([]);
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | null>(
    null,
  );
  const [password, setPassword] = useState('');
  const [fetching, setFetching] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    setFetching(true);
    setLocalError(null);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (err) {
      setLocalError(extractErrorMessage(err));
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // V6: back físico en la raíz del stack anónimo (tras `replace` de
  // ServerCheck) → interceptar (el back no debe cerrar la app).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const handleSelectRol = async (rolId: number) => {
    setSelectedRolId(rolId);
    setSelectedUsuarioId(null);
    setPassword('');
    setUsuarios([]);
    setLocalError(null);
    setFetching(true);
    try {
      const data = await fetchUsuariosByRol(rolId);
      setUsuarios(data);
    } catch (err) {
      setLocalError(extractErrorMessage(err));
    } finally {
      setFetching(false);
    }
  };

  const handleSelectUsuario = (usuario: UsuarioRolDto) => {
    setSelectedUsuarioId(usuario.id);
    setLocalError(null);
    // Autocompletado de la contraseña predeterminada (modelo §4 Paso B).
    if (usuario.passwordResetRequired) {
      setPassword(DEFAULT_PASSWORD);
    } else {
      setPassword('');
    }
  };

  const handleLogin = () => {
    if (selectedUsuarioId === null) {
      setLocalError('Seleccione un usuario.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Ingrese su contraseña.');
      return;
    }
    setLocalError(null);
    login(selectedUsuarioId, password);
  };

  const backToRoles = () => {
    setSelectedRolId(null);
    setSelectedUsuarioId(null);
    setPassword('');
    setUsuarios([]);
    setLocalError(null);
  };

  const backToUsuarios = () => {
    setSelectedUsuarioId(null);
    setPassword('');
    setLocalError(null);
  };

  const showError = error || localError;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <AppCard style={styles.card}>
            <Text style={styles.title}>Iniciar Sesión</Text>

            {showError && <Text style={styles.error}>{showError}</Text>}

            {fetching ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.action.secondary}
              />
            ) : (
              <>
                {/* Paso (a): selección de perfil */}
                {selectedRolId === null ? (
                  <View>
                    <Text style={styles.stepTitle}>
                      1. Seleccione su perfil
                    </Text>
                    {roles.length === 0 && !fetching ? (
                      <Text style={styles.emptyText}>
                        No hay perfiles disponibles.
                      </Text>
                    ) : null}
                    {roles.map(rol => (
                      <TouchableOpacity
                        key={rol.id}
                        style={styles.optionButton}
                        onPress={() => handleSelectRol(rol.id)}
                        accessibilityLabel={`Perfil ${rol.nombre}`}>
                        <Text style={styles.optionText}>{rol.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <>
                    {/* Paso (b): selección de usuario del rol */}
                    {selectedUsuarioId === null ? (
                      <View>
                        <Text style={styles.stepTitle}>
                          Paso 2 de 3 — Seleccione su usuario
                        </Text>
                        {usuarios.length === 0 && !fetching ? (
                          <Text style={styles.emptyText}>
                            No hay usuarios en este perfil.
                          </Text>
                        ) : null}
                        {usuarios.map(usuario => (
                          <TouchableOpacity
                            key={usuario.id}
                            style={styles.optionButton}
                            onPress={() => handleSelectUsuario(usuario)}
                            accessibilityLabel={`Usuario ${usuario.nombre}`}>
                            <Text style={styles.optionText}>
                              {usuario.nombre}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <AppButton
                          label="← Volver a perfiles"
                          variant="text"
                          onPress={backToRoles}
                          accessibilityLabel="Volver a seleccionar perfil"
                        />
                      </View>
                    ) : (
                      /* Paso (c): contraseña numérica (DNI, máx 8) */
                      <View>
                        <Text style={styles.stepTitle}>
                          Paso 3 de 3 — Ingrese su contraseña
                        </Text>

                        <AppInput
                          placeholder="Contraseña (DNI)"
                          value={password}
                          onChangeText={text =>
                            setPassword(
                              text
                                .replace(/[^0-9]/g, '')
                                .slice(0, MAX_PASSWORD_LENGTH),
                            )
                          }
                          secureTextEntry
                          keyboardType="number-pad"
                          maxLength={MAX_PASSWORD_LENGTH}
                          accessibilityLabel="Contraseña"
                        />

                        <AppButton
                          label="Iniciar sesión"
                          onPress={handleLogin}
                          loading={loading}
                          accessibilityLabel="Iniciar sesión"
                        />

                        <AppButton
                          label="← Volver a usuarios"
                          variant="text"
                          onPress={backToUsuarios}
                          accessibilityLabel="Volver a seleccionar usuario"
                        />
                      </View>
                    )}
                  </>
                )}

                {/* Configuración del servidor (runtime) */}
                <AppButton
                  label="Configurar servidor"
                  variant="text"
                  onPress={() => navigation.navigate('ConfigurarServidor')}
                  accessibilityLabel="Configurar servidor"
                />
              </>
            )}
          </AppCard>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: theme.spacing[5],
  },
  stepTitle: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: theme.colors.background.neutral,
    borderRadius: theme.radius.sm,
    padding: 14,
    marginBottom: theme.spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.action.secondary,
  },
  optionText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: 15,
    lineHeight: theme.typography.subtitle2.lineHeight,
    fontWeight: '600',
  },
  error: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  emptyText: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
});