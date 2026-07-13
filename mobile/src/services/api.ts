import API_BASE_URL from '../config';

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
    perfil: string;
    activo: boolean;
  };
}

export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error al iniciar sesión');
  }

  return response.json();
}
