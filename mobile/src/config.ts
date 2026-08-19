/**
 * URL base por defecto (fallback) del backend.
 *
 * Contrato HITO-002 (Auth v2): todas las rutas viven bajo `/api/v1` (ADR-A003
 * D-AUTH2-5). La URL real se configura en runtime y se persiste en el
 * SecureStore (Keychain, service `apiUrl`); este valor solo se usa cuando el
 * usuario aún no ha guardado una URL o al "Restablecer" (Settings/ServerCheck).
 * Mantiene el host del HITO-001 (10.13.18.97:6101).
 */
const API_BASE_URL = 'http://10.13.18.97:6101/api/v1';

export default API_BASE_URL;