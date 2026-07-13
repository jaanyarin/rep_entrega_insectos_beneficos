import React, {createContext, useContext, useState, useCallback} from 'react';
import {loginApi, LoginResponse} from '../services/api';

interface AuthState {
  token: string | null;
  usuario: LoginResponse['usuario'] | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
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

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({...prev, loading: true, error: null}));
    try {
      const data = await loginApi(email, password);
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

  const logout = useCallback(() => {
    setState({token: null, usuario: null, loading: false, error: null});
  }, []);

  return (
    <AuthContext.Provider value={{...state, login, logout}}>
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
