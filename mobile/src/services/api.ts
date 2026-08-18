import API_BASE_URL from '../config';

export type Perfil = 'SUPER_ADMIN' | 'ADMIN' | 'USUARIO';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

/** UsuarioDto del backend (usuarios/dto/UsuarioDto.java) — jamás incluye hash. */
export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  perfil: Perfil;
  estado: EstadoUsuario;
  debeCambiarPassword: boolean;
  dni: string | null;
  creadoPor: number | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

/** Respuesta de POST /api/auth/login (auth/dto/LoginResponse.java). */
export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

/** Respuesta mínima {mensaje} (seguridad/MensajeResponse.java). */
export interface MensajeResponse {
  mensaje: string;
}

/** Cuerpo de error estándar del backend: {codigo, mensaje} (seguridad/ApiError.java). */
export interface ApiError {
  codigo: string;
  mensaje: string;
}

/** Extrae el mensaje del backend ({codigo,mensaje}) para mostrarlo al usuario. */
async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    if (body && typeof body.mensaje === 'string' && body.mensaje.length > 0) {
      return body.mensaje;
    }
  } catch {
    // El cuerpo no era JSON; se usa el mensaje genérico.
  }
  return `Error del servidor (HTTP ${response.status})`;
}

/**
 * POST /api/auth/login — público.
 * Body esperado por el backend: {usuario, contrasena} (ADR-A002 D-AUTH-1).
 */
export async function loginApi(
  usuario: string,
  contrasena: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({usuario, contrasena}),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

/**
 * POST /api/auth/cambiar-password — autenticado (Bearer).
 * Body: {dni}. `contrasenaActual` solo se envía cuando el backend la exige
 * (debe_cambiar_password = false — ver AuthService.cambiarPassword).
 */
export async function cambiarPasswordApi(
  token: string,
  dni: string,
  contrasenaActual?: string,
): Promise<MensajeResponse> {
  const body: {dni: string; contrasenaActual?: string} = {dni};
  if (contrasenaActual !== undefined && contrasenaActual.length > 0) {
    body.contrasenaActual = contrasenaActual;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/cambiar-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}