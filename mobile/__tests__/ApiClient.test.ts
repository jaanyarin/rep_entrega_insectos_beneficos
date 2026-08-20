/**
 * Regresión de `extractErrorMessage` (hallazgo F1): el backend emite
 * {codigo, mensaje} (ManejadorErrores -> ApiError) y la UI debe mostrar el
 * mensaje real, no el fallback técnico de axios ("Request failed with status
 * code 401"). Se cubre la cascada completa y los fallbacks existentes.
 */

import {extractErrorMessage, normalizeApiUrl} from '../src/services/ApiClient';

describe('extractErrorMessage', () => {
  test('usa {mensaje} del backend — contrato real {codigo, mensaje}', () => {
    const error = {
      response: {
        status: 401,
        data: {codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'Usuario o contraseña incorrectos'},
      },
    };
    expect(extractErrorMessage(error)).toBe('Usuario o contraseña incorrectos');
  });

  test('prefiere {mensaje} sobre message/error cuando hay varios campos', () => {
    const error = {
      response: {data: {mensaje: 'Mensaje oficial', message: 'Otro', error: 'Legacy'}},
    };
    expect(extractErrorMessage(error)).toBe('Mensaje oficial');
  });

  test('fallback de compatibilidad: campo {message}', () => {
    const error = {response: {data: {message: 'Mensaje message'}}};
    expect(extractErrorMessage(error)).toBe('Mensaje message');
  });

  test('fallback legacy: campo {error} (shape antiguo)', () => {
    const error = {response: {data: {error: 'Mensaje error'}}};
    expect(extractErrorMessage(error)).toBe('Mensaje error');
  });

  test('timeout axios (ECONNABORTED) → mensaje de conexión', () => {
    expect(extractErrorMessage({code: 'ECONNABORTED'})).toBe(
      'Tiempo de espera agotado. Verifique su conexión.',
    );
  });

  test('sin cuerpo backend → mensaje raíz de axios', () => {
    expect(extractErrorMessage({message: 'Network Error'})).toBe(
      'Network Error',
    );
  });

  test('sin nada → fallback genérico', () => {
    expect(extractErrorMessage(undefined)).toBe('Error de conexión.');
    expect(extractErrorMessage({})).toBe('Error de conexión.');
  });
});

/**
 * normalizeApiUrl — autocompletado de URL del backend (2026-08-20): el usuario
 * tiene 2 redes Wi-Fi (IP de la laptop cambia: 10.13.18.93 / 192.168.18.229) y
 * digita SOLO la IP; la app completa `http://IP:6101/api/v1`. Los casos cubren
 * la tabla del §32.5 y la idempotencia sobre URLs ya guardadas en el Keychain.
 */
describe('normalizeApiUrl', () => {
  test('IP simple de la red 10.13.18.x → completa puerto y /api/v1', () => {
    expect(normalizeApiUrl('10.13.18.93')).toBe('http://10.13.18.93:6101/api/v1');
  });

  test('IP simple de la red LUZ-5G → completa puerto y /api/v1', () => {
    expect(normalizeApiUrl('192.168.1.10')).toBe('http://192.168.1.10:6101/api/v1');
  });

  test('IP con barra final → se limpia y completa', () => {
    expect(normalizeApiUrl('192.168.1.10/')).toBe('http://192.168.1.10:6101/api/v1');
  });

  test('localhost → host sin puerto recibe :6101 y /api/v1', () => {
    expect(normalizeApiUrl('localhost')).toBe('http://localhost:6101/api/v1');
  });

  test('URL completa con puerto y base path → NO se modifica', () => {
    expect(normalizeApiUrl('http://miservidor:8080/api/v1')).toBe(
      'http://miservidor:8080/api/v1',
    );
  });

  test('URL con puerto pero sin base path → solo añade /api/v1', () => {
    expect(normalizeApiUrl('http://miservidor:8080')).toBe(
      'http://miservidor:8080/api/v1',
    );
  });

  test('URL completa del formato actual → idempotente (Keychain)', () => {
    expect(normalizeApiUrl('http://10.13.18.93:6101/api/v1')).toBe(
      'http://10.13.18.93:6101/api/v1',
    );
  });

  test('string vacío → se conserva vacío (comportamiento actual)', () => {
    expect(normalizeApiUrl('')).toBe('');
  });
});