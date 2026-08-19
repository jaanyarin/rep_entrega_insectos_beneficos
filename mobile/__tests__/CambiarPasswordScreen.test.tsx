/**
 * Cambio de contraseña OBLIGATORIO (ADR-A003 D-AUTH2-2 / hallazgo F2):
 *  - validación local: máximo 8 dígitos (defensa del botón, no solo del input).
 *  - submit → POST /auth/change-password con {newPassword} (sin actual durante
 *    el reset) → el AuthContext persiste el JWT fresco → el RootNavigator
 *    cambia automáticamente de CambiarPassword a Home.
 *
 * Approach (igual que LoginScreen.test.tsx): react-test-renderer + mocks
 * globales (keychain en jest.setup.js, axios en helpers.getMockApi). La
 * sesión con `passwordResetRequired: true` se restaura desde el Keychain.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {AuthProvider} from '../src/context/AuthContext';
import RootNavigator from '../src/navigation/RootNavigator';
import {clearToken} from '../src/services/ApiClient';
import {
  contarTexto,
  findByLabel,
  flushPromises,
  getMockApi,
  makeToken,
} from '../test-utils/helpers';

const CLAIMS_RESET = {
  sub: '7',
  groups: ['Usuario'],
  rolId: 3,
  nombre: 'Maria Torres',
  dni: '11112222',
  passwordResetRequired: true,
};

const CLAIMS_OK = {
  sub: '7',
  groups: ['Usuario'],
  rolId: 3,
  nombre: 'Maria Torres',
  dni: '87654321',
  passwordResetRequired: false,
};

const TOKEN_RESET = makeToken(CLAIMS_RESET);
const TOKEN_OK = makeToken(CLAIMS_OK);

async function renderConSesionReset() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_RESET} : null,
  );
  // change-password devuelve el JWT fresco sin reset.
  getMockApi().post.mockImplementation((url: string) => {
    if (url === '/auth/change-password') {
      return Promise.resolve({
        data: {token: TOKEN_OK, passwordResetRequired: false},
      });
    }
    return Promise.resolve({data: {}});
  });

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>,
    );
    await flushPromises();
  });
  return tree;
}

describe('CambiarPasswordScreen (reset obligatorio)', () => {
  beforeEach(async () => {
    await clearToken(); // cache en memoria de ApiClient (getToken)
  });

  test('submit con más de 8 dígitos → error local y NO llama al backend', async () => {
    const tree = await renderConSesionReset();

    // El renderer no aplica maxLength del TextInput: escribimos 9 dígitos
    // para ejercitar la validación defensiva del submit (lógica de la pantalla).
    await act(async () => {
      findByLabel(tree, 'Nueva contraseña (DNI)').props.onChangeText('876543219');
      findByLabel(tree, 'Repetir nueva contraseña').props.onChangeText('876543219');
    });
    await act(async () => {
      findByLabel(tree, 'Cambiar contraseña').props.onPress();
      await flushPromises();
    });

    expect(contarTexto(tree, 'Máximo 8 dígitos')).toBeGreaterThan(0);
    expect(getMockApi().post).not.toHaveBeenCalledWith(
      '/auth/change-password',
      expect.anything(),
    );
  });

  test('submit válido → POST change-password y navegación automática a Home', async () => {
    const tree = await renderConSesionReset();

    await act(async () => {
      findByLabel(tree, 'Nueva contraseña (DNI)').props.onChangeText('87654321');
      findByLabel(tree, 'Repetir nueva contraseña').props.onChangeText('87654321');
    });
    await act(async () => {
      findByLabel(tree, 'Cambiar contraseña').props.onPress();
      await flushPromises();
    });

    // Contrato v2: {newPassword} sin contrasenaActual durante el reset.
    expect(getMockApi().post).toHaveBeenCalledWith('/auth/change-password', {
      newPassword: '87654321',
    });

    // JWT fresco (sin reset) → Home del perfil Usuario. El native-stack en
    // Jest puede duplicar textos (headers de pantallas registradas), por eso
    // la presencia se valida como >= 1 y la salida del reset como 0.
    expect(contarTexto(tree, 'Bienvenido(a), Maria Torres')).toBeGreaterThan(0);
    expect(contarTexto(tree, 'Nuevo Requerimiento')).toBeGreaterThan(0);
    expect(contarTexto(tree, 'Cambio de Contraseña')).toBe(0);
  });
});