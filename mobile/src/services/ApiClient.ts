/**
 * ApiClient — cliente HTTP central (axios) + almacenamiento seguro (Keychain).
 *
 * Modelo aplicado de `docs_implementacion/LOGIN_MODELO_REUTILIZABLE.md` §7
 * (con criterio adaptativo según ADR-A003):
 *  - URL del backend configurable en runtime, persistida en SecureStore
 *    (react-native-keychain; NUNCA AsyncStorage) bajo el service `apiUrl`.
 *  - JWT persistido en SecureStore bajo el service `accessToken`.
 *  - Interceptor de request: inyecta `baseURL` (URL guardada) y
 *    `Authorization: Bearer <jwt>` en CADA request.
 *  - Interceptor de response: ante 401 borra SOLO el token (la URL se
 *    conserva) y notifica al AuthContext vía `setUnauthorizedHandler`.
 *  - Timeout global: 15 s (ADR-A003 D-AUTH2-4).
 */

import axios, {AxiosInstance, AxiosError} from 'axios';
import * as Keychain from 'react-native-keychain';
import API_BASE_URL from '../config';

export const TOKEN_KEY = 'accessToken';
export const API_URL_KEY = 'apiUrl';

/**
 * Normaliza la URL del backend: acepta IP simple, host o URL completa y
 * completa el resto con puerto 6101 y base path `/api/v1`.
 *
 * Reglas (en orden): trim + quita barras finales; sin esquema → antepone
 * `http://` (soporte https conservado para producción futura); sin puerto
 * explícito en host[:puerto] → añade `:6101`; sin `/api/v1` → lo añade al
 * final. Idempotente: URLs ya completas (`http://host:6101/api/v1`) no se
 * modifican (p. ej. las ya guardadas en el Keychain). Ejemplos:
 *   '10.13.18.93'                    → 'http://10.13.18.93:6101/api/v1'
 *   'localhost'                      → 'http://localhost:6101/api/v1'
 *   'http://miservidor:8080'         → 'http://miservidor:8080/api/v1'
 *   'http://miservidor:8080/api/v1'  → sin cambios
 */
export function normalizeApiUrl(url: string): string {
  let out = String(url || '').trim().replace(/\/+$/, '');
  if (!out) {
    return out;
  }
  if (!/^https?:\/\//i.test(out)) {
    out = `http://${out}`;
  }
  // Separa esquema / host[:puerto] / resto para aplicar las reglas c y d
  // solo sobre la parte correcta (sin romper URLs ya completas).
  const schemeMatch = out.match(/^https?:\/\//i);
  const scheme = schemeMatch ? schemeMatch[0] : '';
  const afterScheme = out.slice(scheme.length);
  const slashIndex = afterScheme.indexOf('/');
  const hostPort = slashIndex === -1 ? afterScheme : afterScheme.slice(0, slashIndex);
  const rest = slashIndex === -1 ? '' : afterScheme.slice(slashIndex);
  if (hostPort && hostPort.indexOf(':') === -1) {
    out = `${scheme}${hostPort}:6101${rest}`;
  }
  if (!/\/api\/v1(\/|$)/.test(out)) {
    out = `${out.replace(/\/+$/, '')}/api/v1`;
  }
  return out;
}

/** URL base embebida (fallback), normalizada. */
export const BUILT_IN_API_URL = normalizeApiUrl(API_BASE_URL);

// Cache en memoria para no leer el Keychain en cada request.
let _cachedApiUrl: string | null = null;
let _cachedToken: string | null = null;

// Callback registrado por AuthContext para forzar logout ante 401.
let _unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  _unauthorizedHandler = handler;
}

/* ------------------------------------------------------------------ */
/* SecureStore (Keychain) — helpers de URL y token                     */
/* ------------------------------------------------------------------ */

export async function loadApiUrl(): Promise<string> {
  if (_cachedApiUrl) {
    return _cachedApiUrl;
  }
  try {
    const creds = await Keychain.getGenericPassword({service: API_URL_KEY});
    if (creds && creds.password) {
      _cachedApiUrl = normalizeApiUrl(creds.password);
      return _cachedApiUrl;
    }
  } catch {
    // Sin URL guardada: se usa el fallback.
  }
  return BUILT_IN_API_URL;
}

export async function setApiUrl(url: string): Promise<void> {
  const normalized = normalizeApiUrl(url);
  if (!normalized) {
    return;
  }
  await Keychain.setGenericPassword('apiUrl', normalized, {
    service: API_URL_KEY,
  });
  _cachedApiUrl = normalized;
}

/** Restablece la URL guardada (vuelve al fallback `BUILT_IN_API_URL`). */
export async function resetApiUrl(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({service: API_URL_KEY});
  } catch {
    // No había URL guardada; sin efecto.
  }
  _cachedApiUrl = null;
}

export async function getToken(): Promise<string | null> {
  if (_cachedToken) {
    return _cachedToken;
  }
  try {
    const creds = await Keychain.getGenericPassword({service: TOKEN_KEY});
    if (creds && creds.password) {
      _cachedToken = creds.password;
      return _cachedToken;
    }
  } catch {
    // Sin token almacenado.
  }
  return null;
}

export async function setToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('accessToken', token, {
    service: TOKEN_KEY,
  });
  _cachedToken = token;
}

export async function clearToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({service: TOKEN_KEY});
  } catch {
    // No había token; sin efecto.
  }
  _cachedToken = null;
}

/* ------------------------------------------------------------------ */
/* Tipos del contrato backend v2 (HITO-002, fijado por el Orchestrator)*/
/* ------------------------------------------------------------------ */

export interface RolDto {
  id: number;
  nombre: string;
  estado?: boolean | string;
}

export interface UsuarioRolDto {
  id: number;
  usuario: string;
  nombre: string;
  rolId: number;
  passwordResetRequired: boolean;
}

export interface LocalLoginResponse {
  token: string;
  passwordResetRequired: boolean;
}

export interface ChangePasswordResponse {
  token: string;
  passwordResetRequired: boolean;
  message?: string;
}

/** Claims del JWT emitidos por el backend v2 (ADR-A003 D-AUTH2-3). */
export interface JwtClaims {
  sub: string;
  groups?: string[];
  rolId?: number;
  nombre?: string;
  dni?: string;
  passwordResetRequired?: boolean;
}

/** Usuario de sesión decodificado del JWT en el cliente. */
export interface AuthUser {
  sub: string | null;
  /** Rol literal con espacios: 'Super Admin' | 'Admin' | 'Usuario'. */
  rol: string;
  rolNombre: string;
  rolId: number | null;
  nombre: string;
  dni: string;
  passwordResetRequired: boolean;
}

/* ------------------------------------------------------------------ */
/* parseToken — decodifica los claims sin llamar al backend            */
/* ------------------------------------------------------------------ */

const B64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decodificador base64url → UTF-8 sin depender de `atob`/`Buffer`
 * (portable a Hermes y a Jest con types de React Native).
 */
/* eslint-disable no-bitwise -- manipulación de bytes base64 (requerida) */
function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bytes: number[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    const c1 = B64_CHARS.indexOf(padded[i]);
    const c2 = B64_CHARS.indexOf(padded[i + 1]);
    const c3 = B64_CHARS.indexOf(padded[i + 2]);
    const c4 = B64_CHARS.indexOf(padded[i + 3]);
    const b1 = (c1 << 2) | (c2 >> 4);
    const b2 = ((c2 & 15) << 4) | (c3 >> 2);
    const b3 = ((c3 & 3) << 6) | c4;
    bytes.push(b1);
    if (padded[i + 2] !== '=') {
      bytes.push(b2);
    }
    if (padded[i + 3] !== '=') {
      bytes.push(b3);
    }
  }
  // Bytes UTF-8 → string (claims ASCII + tildes del nombre).
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    if (b < 0x80) {
      out += String.fromCharCode(b);
    } else if (b >= 0xc0 && b < 0xe0 && i + 1 < bytes.length) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1]! & 0x3f));
      i++;
    } else if (b >= 0xe0 && i + 2 < bytes.length) {
      out += String.fromCharCode(
        ((b & 0x0f) << 12) |
          ((bytes[i + 1]! & 0x3f) << 6) |
          (bytes[i + 2]! & 0x3f),
      );
      i += 2;
    }
  }
  return out;
}

export function parseToken(token: string | null | undefined): AuthUser | null {
  if (!token) {
    return null;
  }
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const payload = JSON.parse(base64UrlDecode(parts[1])) as JwtClaims;
    const groups = Array.isArray(payload.groups) ? payload.groups : [];
    const rol = groups.length > 0 ? String(groups[0]) : '';
    return {
      sub: payload.sub != null ? String(payload.sub) : null,
      rol,
      rolNombre: rol,
      rolId: payload.rolId ?? null,
      nombre: payload.nombre || 'Usuario',
      dni: payload.dni || '',
      // Interpretación segura: si el claim falta, se exige cambiar la
      // contraseña (LOGIN_MODELO_REUTILIZABLE.md §8.2).
      passwordResetRequired: payload.passwordResetRequired !== false,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Instancia axios + interceptores                                     */
/* ------------------------------------------------------------------ */

export const api: AxiosInstance = axios.create({timeout: 15000});

api.interceptors.request.use(async config => {
  const [apiUrl, token] = await Promise.all([loadApiUrl(), getToken()]);
  config.baseURL = apiUrl;
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Sesión caducada/token inválido: se borra SOLO el token (la URL
      // guardada se conserva) y se notifica para forzar relogin.
      clearToken().catch(() => {});
      _unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

/**
 * Extrae el mensaje legible de un error axios/{error} del backend.
 * Contrato backend (ADR-A003 / ManejadorErrores -> ApiError): el cuerpo de
 * error es {codigo, mensaje}; se lee en ese orden con fallbacks de compat
 * (message/error) para no degradar la UX a "Request failed with status code X".
 */
export function extractErrorMessage(error: unknown): string {
  const err = error as {
    response?: {
      data?: {mensaje?: string; message?: string; error?: string};
      status?: number;
    };
    message?: string;
    code?: string;
  };
  const mensajeBackend =
    err?.response?.data?.mensaje ??
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    '';
  if (mensajeBackend) {
    return mensajeBackend;
  }
  if (err?.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado. Verifique su conexión.';
  }
  if (err?.message) {
    return err.message;
  }
  return 'Error de conexión.';
}

/* ------------------------------------------------------------------ */
/* Helpers del contrato auth v2 (rutas relativas a la base `/api/v1`)  */
/* ------------------------------------------------------------------ */

const unwrap = <T>(data: T | {data?: T}): T =>
  Array.isArray(data) ? data : ((data as {data?: T}).data ?? (data as T));

export async function fetchRoles(): Promise<RolDto[]> {
  const res = await api.get('/auth/roles');
  const data = res.data as RolDto[] | {data?: RolDto[]};
  return unwrap(data);
}

export async function fetchUsuariosByRol(rolId: number): Promise<UsuarioRolDto[]> {
  const res = await api.get(`/auth/usuarios-by-rol/${rolId}`);
  const data = res.data as UsuarioRolDto[] | {data?: UsuarioRolDto[]};
  return unwrap(data);
}

export async function localLogin(
  usuarioId: number,
  password: string,
): Promise<LocalLoginResponse> {
  const res = await api.post('/auth/local-login', {usuarioId, password});
  return res.data as LocalLoginResponse;
}

export async function changePassword(
  newPassword: string,
  contrasenaActual?: string,
): Promise<ChangePasswordResponse> {
  const body: {newPassword: string; contrasenaActual?: string} = {
    newPassword,
  };
  if (contrasenaActual !== undefined && contrasenaActual.length > 0) {
    body.contrasenaActual = contrasenaActual;
  }
  const res = await api.post('/auth/change-password', body);
  return res.data as ChangePasswordResponse;
}

/* ------------------------------------------------------------------ */
/* CRUD de usuarios (/api/v1/usuarios — UsuarioResource)               */
/* ------------------------------------------------------------------ */

/** Respuesta del CRUD de usuarios. Nunca incluye contraseña. */
export interface UsuarioDto {
  id: number;
  usuario: string;
  nombre: string;
  rolId: number;
  /** Literal con espacios: 'Super Admin' | 'Admin' | 'Usuario'. */
  rol: string;
  estado: 'ACTIVO' | 'INACTIVO';
  debeCambiarPassword: boolean;
  dni: string | null;
  creadoPor: number | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

/** Cuerpo de POST /api/v1/usuarios (password siempre el default 00000000). */
export interface CrearUsuarioRequest {
  usuario: string;
  nombre: string;
  rolId: number;
  dni?: string;
}

/** Cuerpo de PUT /api/v1/usuarios/{id} (no permite cambiar dni ni password). */
export interface ActualizarUsuarioRequest {
  usuario: string;
  nombre: string;
  rolId: number;
  estado: 'ACTIVO' | 'INACTIVO';
}

export async function listarUsuarios(
  estado?: 'ACTIVO' | 'INACTIVO',
  rolId?: number,
): Promise<UsuarioDto[]> {
  const params: Record<string, string | number> = {};
  if (estado) {
    params.estado = estado;
  }
  if (rolId != null) {
    params.rolId = rolId;
  }
  const res = await api.get('/usuarios', {params});
  const data = res.data as UsuarioDto[] | {data?: UsuarioDto[]};
  return unwrap(data);
}

export async function crearUsuario(
  req: CrearUsuarioRequest,
): Promise<UsuarioDto> {
  const res = await api.post('/usuarios', req);
  return res.data as UsuarioDto;
}

export async function actualizarUsuario(
  id: number,
  req: ActualizarUsuarioRequest,
): Promise<UsuarioDto> {
  const res = await api.put(`/usuarios/${id}`, req);
  return res.data as UsuarioDto;
}

export async function desactivarUsuario(
  id: number,
): Promise<{mensaje: string}> {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data as {mensaje: string};
}

/* ------------------------------------------------------------------ */
/* Programación (/api/v1/programaciones + /api/v1/especies)            */
/* ------------------------------------------------------------------ */

/** Estados de una programación semanal (RF-186 / RN-038). */
export type EstadoProgramacion = 'EN_PROCESO' | 'PUBLICADO';

/** Especie de insecto benéfico (catálogo del módulo Programación). */
export interface EspecieDto {
  id: number;
  nombre: string;
  estado: boolean | string;
}

/** Detalle por semana de una programación (RF-187 / RN-037). */
export interface DetalleProgramacionDto {
  id: number;
  /** Número de semana dentro del mes (1..n). */
  semana: number;
  /** Fecha de la semana (ISO). */
  fecha: string;
  /** Stock inicial de la semana en millares (remanente de la semana anterior). */
  stockInicial: number;
  /** Cantidad en papel con postura (millares). */
  papelConPostura: number;
  /** Cantidad en sobre con cascarilla (millares). */
  sobreConCascarilla: number;
  /** Suma de papel + sobre (RF-134). */
  total: number;
  /** Stock final de la semana en millares. */
  stockFinal: number;
  /** Estado individual de la semana (RF-186). */
  estado: EstadoProgramacion;
}

/** Programación de stock del mes (resumen de listado + detalle al editar). */
export interface ProgramacionDto {
  id: number;
  anio: number;
  mes: number;
  especieId: number;
  especie: string;
  fechaRegistro: string;
  fechaPublicacion: string | null;
  estado: EstadoProgramacion;
  /** Proyección base del mes en millares (RF-187). */
  stockInicialBase: number;
  /** Cantidad total programada en el mes (todas las semanas). */
  totalMes: number;
  /** Detalle semanal (solo cuando el endpoint devuelve el detalle). */
  detalles: DetalleProgramacionDto[];
}

/** Cuerpo de PUT /api/v1/programaciones/{id} (persistir valores editados). */
export interface ActualizarProgramacionRequest {
  stockInicialBase: number;
  detalles: Array<{
    id?: number;
    semana: number;
    fecha: string;
    papelConPostura: number;
    sobreConCascarilla: number;
  }>;
}

/** GET /api/v1/especies — catálogo de especies de insectos benéficos. */
export async function listarEspecies(): Promise<EspecieDto[]> {
  const res = await api.get('/especies');
  return unwrap(res.data as EspecieDto[] | {data?: EspecieDto[]});
}

/**
 * GET /api/v1/programaciones?anio=YYYY&mes=M — programaciones del mes
 * (todas las especies; incluye detalles semanales para la edición).
 */
export async function listarProgramaciones(
  anio: number,
  mes: number,
): Promise<ProgramacionDto[]> {
  const res = await api.get('/programaciones', {params: {anio, mes}});
  return unwrap(res.data as ProgramacionDto[] | {data?: ProgramacionDto[]});
}

/** GET /api/v1/programaciones/{id} — detalle completo de una programación. */
export async function obtenerProgramacion(id: number): Promise<ProgramacionDto> {
  const res = await api.get(`/programaciones/${id}`);
  return res.data as ProgramacionDto;
}

/** PUT /api/v1/programaciones/{id} — persiste los valores editados. */
export async function actualizarProgramacion(
  id: number,
  req: ActualizarProgramacionRequest,
): Promise<ProgramacionDto> {
  const res = await api.put(`/programaciones/${id}`, req);
  return res.data as ProgramacionDto;
}

/** POST /api/v1/programaciones/{id}/publicar — publica y notifica (RF-145/146). */
export async function publicarProgramacion(
  id: number,
): Promise<{mensaje: string}> {
  const res = await api.post(`/programaciones/${id}/publicar`);
  return res.data as {mensaje: string};
}