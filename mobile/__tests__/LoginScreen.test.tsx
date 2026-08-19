/**
 * Login en 3 pasos (ADR-A003 D-AUTH2-2) con API mockeada.
 *
 * Approach (deuda H6/QA-003): se usa react-test-renderer (ya incluido en el
 * scaffold del HITO-001) en lugar de @testing-library/react-native (no
 * instalada: el alcance INC-2 solo agrega axios y react-native-keychain).
 * Se mockea axios (instancia `create` autocontenida) y react-native-keychain
 * (setup global); las interacciones se disparan vía props (onPress /
 * onChangeText) del árbol renderizado.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {NavigationContainer} from '@react-navigation/native';
import axios from 'axios';
import {AuthProvider} from '../src/context/AuthContext';
import LoginScreen from '../src/screens/LoginScreen';

const ROLES = [
  {id: 1, nombre: 'Super Admin', estado: true},
  {id: 2, nombre: 'Admin', estado: true},
  {id: 3, nombre: 'Usuario', estado: true},
];

const USUARIOS_ADMIN = [
  {
    id: 5,
    usuario: 'jperez',
    nombre: 'Juan Perez',
    rolId: 2,
    passwordResetRequired: true,
  },
];

const PAYLOAD = {
  sub: '5',
  groups: ['Admin'],
  rolId: 2,
  nombre: 'Juan Perez',
  dni: '12345678',
  passwordResetRequired: false,
};

/**
 * Factory autocontenido (obligatorio con hoisting de jest.mock: no puede
 * referenciar variables del scope del test). La instancia se recupera en los
 * tests vía `axios.create` (ya invocado al importar ApiClient).
 */
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
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

/**
 * Codificación base64url para texto ASCII (claims de prueba; sin depender de
 * Buffer/@types/node ni de globals del DOM en los types de React Native).
 */
/* eslint-disable no-bitwise -- manipulación de bytes base64 (requerida) */
function asciiBase64UrlEncode(str: string): string {
  const table =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < str.length; i += 3) {
    const b1 = str.charCodeAt(i);
    const hasB2 = i + 1 < str.length;
    const hasB3 = i + 2 < str.length;
    const b2 = hasB2 ? str.charCodeAt(i + 1) : 0;
    const b3 = hasB3 ? str.charCodeAt(i + 2) : 0;
    out += table[b1 >> 2];
    out += table[((b1 & 3) << 4) | (b2 >> 4)];
    out += hasB2 ? table[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    out += hasB3 ? table[b3 & 63] : '=';
  }
  return out
    .split('+')
    .join('-')
    .split('/')
    .join('_')
    .split('=')
    .join('');
}
/* eslint-enable no-bitwise */

const FAKE_TOKEN = `header.${asciiBase64UrlEncode(
  JSON.stringify(PAYLOAD),
)}.signature`;

const flushPromises = () =>
  new Promise<void>(resolve => setTimeout(() => resolve(), 0));

/** Recupera la instancia axios mockeada usada por el ApiClient. */
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

describe('LoginScreen (3 pasos)', () => {
  beforeEach(() => {
    // mockReset limpia calls e implementaciones sin tocar `create`.
    const inst = getMockApi();
    inst.get.mockReset().mockImplementation((url: string) => {
      if (url === '/auth/roles') {
        return Promise.resolve({data: ROLES});
      }
      if (url.startsWith('/auth/usuarios-by-rol/')) {
        return Promise.resolve({data: USUARIOS_ADMIN});
      }
      return Promise.resolve({data: []});
    });
    inst.post.mockReset().mockImplementation((url: string) => {
      if (url === '/auth/local-login') {
        return Promise.resolve({
          data: {token: FAKE_TOKEN, passwordResetRequired: false},
        });
      }
      return Promise.resolve({data: {}});
    });
  });

  test('rol → usuario → contraseña → local-login con usuarioId y password', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <NavigationContainer>
          <AuthProvider>
            <LoginScreen />
          </AuthProvider>
        </NavigationContainer>,
      );
      await flushPromises();
    });

    // Paso 1: roles cargados y visibles.
    const inst = getMockApi();
    expect(inst.get).toHaveBeenCalledWith('/auth/roles');
    const adminLabel = tree.root.findAll(
      node =>
        typeof node.props.children === 'string' &&
        node.props.children === 'Admin',
    );
    expect(adminLabel.length).toBeGreaterThan(0);

    // Selecciona el perfil Admin.
    await act(async () => {
      findByLabel(tree, 'Perfil Admin').props.onPress();
      await flushPromises();
    });

    // Paso 2: usuarios del rol cargados.
    expect(inst.get).toHaveBeenCalledWith('/auth/usuarios-by-rol/2');
    const juanLabel = tree.root.findAll(
      node =>
        typeof node.props.children === 'string' &&
        node.props.children === 'Juan Perez',
    );
    expect(juanLabel.length).toBeGreaterThan(0);

    // Selecciona "Juan Perez" (passwordResetRequired → autocompleta 00000000).
    await act(async () => {
      findByLabel(tree, 'Usuario Juan Perez').props.onPress();
    });
    expect(findByLabel(tree, 'Contraseña').props.value).toBe('00000000');

    // Paso 3: el filtro del input descarta no-dígitos (máx 8).
    await act(async () => {
      findByLabel(tree, 'Contraseña').props.onChangeText('12345abc');
    });
    expect(findByLabel(tree, 'Contraseña').props.value).toBe('12345');

    await act(async () => {
      findByLabel(tree, 'Contraseña').props.onChangeText('12345678');
    });
    expect(findByLabel(tree, 'Contraseña').props.value).toBe('12345678');

    // Inicia sesión → POST /auth/local-login con usuarioId y password.
    await act(async () => {
      findByLabel(tree, 'Iniciar sesión').props.onPress();
      await flushPromises();
    });
    expect(inst.post).toHaveBeenCalledWith('/auth/local-login', {
      usuarioId: 5,
      password: '12345678',
    });
  });

  test('muestra error del backend si el login falla (401 {codigo, mensaje})', async () => {
    getMockApi().post.mockImplementation((url: string) => {
      if (url === '/auth/local-login') {
        // Contrato backend v2 (ManejadorErrores -> ApiError): {codigo, mensaje}.
        return Promise.reject({
          response: {
            status: 401,
            data: {
              codigo: 'CREDENCIALES_INVALIDAS',
              mensaje: 'Usuario o contraseña incorrectos',
            },
          },
        });
      }
      return Promise.resolve({data: {}});
    });

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <NavigationContainer>
          <AuthProvider>
            <LoginScreen />
          </AuthProvider>
        </NavigationContainer>,
      );
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Perfil Admin').props.onPress();
      await flushPromises();
    });
    await act(async () => {
      findByLabel(tree, 'Usuario Juan Perez').props.onPress();
    });
    await act(async () => {
      findByLabel(tree, 'Contraseña').props.onChangeText('99999999');
    });
    await act(async () => {
      findByLabel(tree, 'Iniciar sesión').props.onPress();
      await flushPromises();
    });

    const errorText = tree.root.findAll(
      node =>
        typeof node.props.children === 'string' &&
        node.props.children === 'Usuario o contraseña incorrectos',
    );
    expect(errorText.length).toBeGreaterThan(0);
  });
});