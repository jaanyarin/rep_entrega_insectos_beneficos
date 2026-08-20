/**
 * URL base por defecto (fallback) del backend.
 *
 * Contrato HITO-002 (Auth v2): todas las rutas viven bajo `/api/v1` (ADR-A003
 * D-AUTH2-5). La URL real se configura en runtime y se persiste en el
 * SecureStore (Keychain, service `apiUrl`); este valor solo se usa cuando el
 * usuario aún no ha guardado una URL o al "Restablecer" (Settings/ServerCheck).
 * Mantiene el host del HITO-003 (2026-08-19): IP actual de la laptop del
 * responsable — 192.168.18.229:6101 (red LUZ - 5G). Histórico: 10.13.18.97
 * (HITO-001), 10.13.18.93 y 192.168.18.229 (HITO-003).
 */
const API_BASE_URL = 'http://192.168.18.229:6101/api/v1';

export default API_BASE_URL;