/**
 * URL base por defecto (fallback) del backend.
 *
 * Contrato HITO-002 (Auth v2): todas las rutas viven bajo `/api/v1` (ADR-A003
 * D-AUTH2-5). La URL real se configura en runtime y se persiste en el
 * SecureStore (Keychain, service `apiUrl`); este valor solo se usa cuando el
 * usuario aún no ha guardado una URL o al "Restablecer" (Settings/ServerCheck).
 * Mantiene el host de la red activa de la laptop del responsable — IP actual
 * 10.13.18.103:6101 (red 10.13.18.0/23). Histórico: 10.13.18.97 (HITO-001),
 * 10.13.18.93, 192.168.18.229 (red LUZ - 5G) y 10.13.18.103.
 * La IP cambia según la red; la URL es runtime (ServerCheck/Settings) y este
 * valor solo se usa como fallback al no haber URL guardada o al "Restablecer".
 */
const API_BASE_URL = 'http://10.13.18.103:6101/api/v1';

export default API_BASE_URL;