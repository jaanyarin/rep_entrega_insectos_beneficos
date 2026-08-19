/**
 * Regresión de `extractErrorMessage` (hallazgo F1): el backend emite
 * {codigo, mensaje} (ManejadorErrores -> ApiError) y la UI debe mostrar el
 * mensaje real, no el fallback técnico de axios ("Request failed with status
 * code 401"). Se cubre la cascada completa y los fallbacks existentes.
 */

import {extractErrorMessage} from '../src/services/ApiClient';

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