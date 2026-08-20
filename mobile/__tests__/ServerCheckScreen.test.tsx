/**
 * Botón "Reintentar" del ServerCheck (hallazgo H1 de la auditoría 2026-08-20).
 *
 * Regresión cubierta: `onPress={probe}` pasaba el evento de press como
 * argumento a `probe(urlToTest?)` → `url = <evento truthy>` → `baseURL` =
 * evento → TypeError. El fix `onPress={() => probe()}` reintenta con la URL
 * guardada (Keychain o fallback BUILT_IN_API_URL).
 *
 * Approach (igual que LoginScreen.test.tsx): react-test-renderer + el mock
 * GLOBAL de axios del jest.setup.js (misma convención ApiClient/LoginScreen —
 * DRY). El test fuerza estado 'error' (GET /auth/roles rechazado), presiona
 * "Reintentar" y verifica que el nuevo probe usa `baseURL` STRING.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {NavigationContainer} from '@react-navigation/native';
import axios from 'axios';
import ServerCheckScreen from '../src/screens/ServerCheckScreen';

const flushPromises = () =>
  new Promise<void>(resolve => setTimeout(() => resolve(), 0));

/** Recupera la instancia axios del mock global (setup `jest.setup.js`). */
function getMockApi() {
  const createMock = axios.create as jest.Mock;
  const result = createMock.mock.results[0];
  if (!result) {
    throw new Error('axios.create no fue invocado (¿el mock se aplicó?)');
  }
  return result.value as {get: jest.Mock; post: jest.Mock};
}

const findByLabel = (
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const found = tree.root.findAll(
    node => node.props && node.props.accessibilityLabel === label,
  );
  if (found.length === 0) {
    throw new Error(`No se encontró un nodo con accessibilityLabel="${label}"`);
  }
  return found[0];
};

/** Llamada al GET /auth/roles (probe) más reciente, si existe. */
function lastAuthRolesCall(inst: {get: jest.Mock}) {
  const calls = inst.get.mock.calls.filter(
    (call: unknown[]) => call[0] === '/auth/roles',
  );
  return calls.length > 0 ? calls[calls.length - 1] : undefined;
}

describe('ServerCheckScreen (botón Reintentar — regresión H1)', () => {
  beforeEach(() => {
    // Estado de error: el GET /auth/roles falla (sin backend / red caída).
    getMockApi().get.mockReset().mockRejectedValue({message: 'Network Error'});
  });

  test('Reintentar re-ejecuta el probe con baseURL string (nunca un objeto)', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <NavigationContainer>
          <ServerCheckScreen />
        </NavigationContainer>,
      );
      await flushPromises();
    });

    // Estado 'error': el formulario con el botón Reintentar está visible.
    const retryButton = findByLabel(
      tree,
      'Reintentar verificación del servidor',
    );
    expect(retryButton).toBeTruthy();

    // Proba inicial fallida (montaje): baseURL es STRING (URL del Keychain
    // o fallback), no un objeto evento.
    const inst = getMockApi();
    const firstCall = lastAuthRolesCall(inst);
    expect(firstCall).toBeTruthy();
    expect(firstCall![1]).toEqual(
      expect.objectContaining({baseURL: expect.any(String)}),
    );

    // Presiona "Reintentar" → nuevo probe con la URL ya cargada.
    inst.get.mockClear();
    await act(async () => {
      findByLabel(tree, 'Reintentar verificación del servidor').props.onPress();
      await flushPromises();
    });

    // Regresión H1: `baseURL` debe seguir siendo string tras el reintento.
    const retryCall = lastAuthRolesCall(inst);
    expect(retryCall).toBeTruthy();
    expect(retryCall![1]).toEqual(
      expect.objectContaining({baseURL: expect.any(String)}),
    );
    expect(typeof retryCall![1].baseURL).toBe('string');
  });
});