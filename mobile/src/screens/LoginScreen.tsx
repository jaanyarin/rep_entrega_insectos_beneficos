import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar Sesión</Text>

          {showError && <Text style={styles.error}>{showError}</Text>}

          {fetching ? (
            <ActivityIndicator size="large" color="#1a5c2a" />
          ) : (
            <>
              {/* Paso (a): selección de perfil */}
              {selectedRolId === null ? (
                <View>
                  <Text style={styles.stepTitle}>1. Seleccione su perfil</Text>
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
                      <TouchableOpacity
                        style={styles.linkButton}
                        onPress={backToRoles}
                        accessibilityLabel="Volver a seleccionar perfil">
                        <Text style={styles.linkText}>← Volver a perfiles</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* Paso (c): contraseña numérica (DNI, máx 8) */
                    <View>
                      <Text style={styles.stepTitle}>
                        Paso 3 de 3 — Ingrese su contraseña
                      </Text>

                      <TextInput
                        style={styles.input}
                        placeholder="Contraseña (DNI)"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={text =>
                          setPassword(
                            text.replace(/[^0-9]/g, '').slice(0, MAX_PASSWORD_LENGTH),
                          )
                        }
                        secureTextEntry
                        keyboardType="number-pad"
                        maxLength={MAX_PASSWORD_LENGTH}
                        accessibilityLabel="Contraseña"
                      />

                      <TouchableOpacity
                        style={[
                          styles.button,
                          loading && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                        accessibilityLabel="Iniciar sesión">
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>Iniciar sesión</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.linkButton}
                        onPress={backToUsuarios}
                        accessibilityLabel="Volver a seleccionar usuario">
                        <Text style={styles.linkText}>← Volver a usuarios</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* Configuración del servidor (runtime) */}
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('ConfigurarServidor')}
                accessibilityLabel="Configurar servidor">
                <Text style={styles.linkText}>Configurar servidor</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a5c2a',
  },
  scrollContent: {
    flexGrow: 1,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1a5c2a',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#e8f2ea',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a5c2a',
  },
  optionText: {
    color: '#1a5c2a',
    fontSize: 15,
    fontWeight: '600',
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
  linkButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  linkText: {
    color: '#1a5c2a',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
});