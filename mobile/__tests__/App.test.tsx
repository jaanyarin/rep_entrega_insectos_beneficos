/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import App from '../App';

/**
 * El smoke cubre el arranque sin sesión: AuthProvider restaura sesión
 * (Keychain mock → null) y ServerCheck prueba la URL guardada. Para que el
 * árbol sea estable (sin navegación asíncrona colgada en el act), el probe
 * FALLA (axios mock → Network Error) y ServerCheck queda en el formulario
 * "Guardar y probar" — verifica el arranque completo con contenido real.
 */
jest.mock('axios', () => {
  const instance = {
    get: jest.fn().mockRejectedValue({message: 'Network Error'}),
    post: jest.fn().mockResolvedValue({data: {}}),
    interceptors: {
      request: {use: jest.fn()},
      response: {use: jest.fn()},
    },
  };
  return {
    __esModule: true,
    default: {create: jest.fn(() => instance)},
    AxiosError: class AxiosError extends Error {},
  };
});

/** Espera a que se resuelvan las promesas encadenadas del flujo inicial. */
const flushPromises = () =>
  new Promise<void>(resolve => setTimeout(() => resolve(), 0));

test('renders correctly', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(<App />);
    await flushPromises();
  });
  // El chequeo del servidor falló (offline en Jest) → formulario visible.
  const labels = renderer.root
    .findAllByType(Text)
    .map(t => t.props.children)
    .filter(Boolean);
  expect(labels).toContain('Verificando servidor');
  expect(labels).toContain('Guardar y probar');
});