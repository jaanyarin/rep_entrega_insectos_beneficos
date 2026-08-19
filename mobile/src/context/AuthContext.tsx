import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  changePassword,
  clearToken,
  extractErrorMessage,
  getToken,
  localLogin,
  parseToken,
  setToken,
  setUnauthorizedHandler,
  type AuthUser,
} from '../services/ApiClient';

interface AuthContextType {
  /** Usuario decodificado del JWT (null = sin sesión). */
  user: AuthUser | null;
  /** `true` mientras se restaura la sesión persistida al arrancar. */
  loading: boolean;
  error: string | null;
  login: (usuarioId: number, password: string) => Promise<void>;
  cambiarPassword: (
    newPassword: string,
    contrasenaActual?: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Estado global de autenticación (HITO-002 / modelo reutilizable §8.1):
 * - Al arrancar restaura la sesión leyendo el token desde el SecureStore.
 * - `login(usuarioId, password)` → POST /auth/local-login → guarda el JWT en
 *   Keychain y decodifica `user` (no depende de una respuesta con datos).
 * - `cambiarPassword(...)` → POST /auth/change-password → guarda el NUEVO
 *   token (ya sin `passwordResetRequired`) y refresca `user`.
 * - Ante cualquier 401 global, `setUnauthorizedHandler` limpia la sesión.
 */
export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restauración de sesión al arrancar + suscripción a 401 global.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        if (mounted && token) {
          setUser(parseToken(token));
        }
      } catch {
        // Sin sesión persistida: flujo normal de login.
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    setUnauthorizedHandler(() => {
      if (mounted) {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = useCallback(async (usuarioId: number, password: string) => {
    setError(null);
    try {
      const data = await localLogin(usuarioId, password);
      await setToken(data.token);
      setUser(parseToken(data.token));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, []);

  const cambiarPassword = useCallback(
    async (newPassword: string, contrasenaActual?: string) => {
      setError(null);
      if (!user) {
        setError('Sesión no iniciada');
        return;
      }
      try {
        const data = await changePassword(newPassword, contrasenaActual);
        // El backend emite un JWT FRESCO (sin passwordResetRequired):
        // se persiste y se refresca el user para salir del flujo de reset.
        await setToken(data.token);
        setUser(parseToken(data.token));
      } catch (err) {
        setError(extractErrorMessage(err));
      }
    },
    [user],
  );

  const logout = useCallback(() => {
    clearToken().catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({user, loading, error, login, cambiarPassword, logout}),
    [user, loading, error, login, cambiarPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}