import React, {createContext, useContext, useState, useCallback} from 'react';
import {cambiarPasswordApi, loginApi, Usuario} from '../services/api';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (usuario: string, contrasena: string) => Promise<void>;
  cambiarPassword: (dni: string, contrasenaActual?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<AuthState>({
    token: null,
    usuario: null,
    loading: false,
    error: null,
  });

  const login = useCallback(async (usuario: string, contrasena: string) => {
    setState(prev => ({...prev, loading: true, error: null}));
    try {
      const data = await loginApi(usuario, contrasena);
      setState({
        token: data.token,
        usuario: data.usuario,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Error de conexión',
      }));
    }
  }, []);

  const cambiarPassword = useCallback(
    async (dni: string, contrasenaActual?: string) => {
      if (!state.token) {
        setState(prev => ({...prev, error: 'Sesión no iniciada'}));
        return;
      }
      setState(prev => ({...prev, loading: true, error: null}));
      try {
        await cambiarPasswordApi(state.token, dni, contrasenaActual);
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          usuario: prev.usuario
            ? {...prev.usuario, dni, debeCambiarPassword: false}
            : prev.usuario,
        }));
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Error al cambiar la contraseña',
        }));
      }
    },
    [state.token],
  );

  const logout = useCallback(() => {
    setState({token: null, usuario: null, loading: false, error: null});
  }, []);

  return (
    <AuthContext.Provider value={{...state, login, cambiarPassword, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}