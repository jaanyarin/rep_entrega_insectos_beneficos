/**
 * utils/token.ts — Utilidades de JWT para soporte offline.
 *
 * Función isTokenExpired: verifica si un JWT ha expirado
 * comparando el claim `exp` con el timestamp actual.
 *
 * Se usa en:
 * - AuthContext: decidir si restaurar sesión offline
 * - ServerCheckScreen: saltar verificación si JWT válido
 */

/**
 * Verifica si un JWT ha expirado.
 *
 * @param token - String del JWT
 * @param bufferSeconds - Segundos de margen antes de la expiración real (default 60s)
 * @returns true si el token expiró o es inválido, false si sigue válido
 *
 * @example
 * ```typescript
 * if (isTokenExpired(token)) {
 *   // JWT expirado → necesita re-login
 *   navigation.replace('Login');
 * } else {
 *   // JWT válido → puede trabajar offline
 *   setUser(parseToken(token));
 * }
 * ```
 */
export function isTokenExpired(
  token: string | null | undefined,
  bufferSeconds: number = 60,
): boolean {
  if (!token) {
    return true; // Sin token → expirado (o inexistente)
  }

  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return true; // Token malformado
    }

    // Decodificar payload del JWT (base64url)
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    if (!payload.exp || typeof payload.exp !== 'number') {
      // Sin claim exp → considerar como no expirado
      // (algunos JWTs de desarrollo podrían no tener exp)
      return false;
    }

    // Comparar exp con tiempo actual (en segundos)
    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds >= payload.exp - bufferSeconds;
  } catch {
    // Error al decodificar → token inválido → tratar como expirado
    return true;
  }
}

/**
 * Decodificador base64url → string UTF-8 simple.
 * Sin dependencia de atob/TextDecoder (no disponible en React Native).
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding === 2) {
    base64 += '==';
  } else if (padding === 3) {
    base64 += '=';
  } else if (padding !== 0) {
    base64 += '===';
  }

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < base64.length; i += 4) {
    const a = chars.indexOf(base64[i]);
    const b = chars.indexOf(base64[i + 1]);
    const c = chars.indexOf(base64[i + 2]);
    const d = chars.indexOf(base64[i + 3]);

    const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
    result += String.fromCharCode((bitmap >> 16) & 255);
    if (c !== 64) {
      result += String.fromCharCode((bitmap >> 8) & 255);
    }
    if (d !== 64) {
      result += String.fromCharCode(bitmap & 255);
    }
  }

  return result;
}
