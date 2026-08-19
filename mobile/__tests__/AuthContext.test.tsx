/**
 * AuthContext — limpieza de sesión ante 401 global (ADR-A003 D-AUTH2-4,
 * hallazgo F2): el interceptor de respuesta de axios (registrado por
 * ApiClient) borra el token y notifica vía `setUnauthorizedHandler`, dejando
 * `user = null` (relogin obligatorio).
 *
 * Approach: mock local de axios que CAPTURA el onRejected del interceptor de
 * response (se registra al importar ApiClient) para disparar un 401 artificial
 * sobre el AuthContext montado con una sesión restaurada desde el Keychain.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import * as Keychain from 'react-native-keychain';
import {AuthProvider, useAuth} from '../src/context/AuthContext';
import {flushPromises, getMockApi, makeToken} from '../test-utils/helpers';

jest.mock('axios', () => {
  const instance = {
    get: jest.fn().mockResolvedValue({data: []}),
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

/** Probe: expone el estado de sesión como texto simple para los asserts. */
function Probe() {
  const {user} = useAuth();
  return <Text>{user ? user.nombre : 'sin sesión'}</Text>;
}

/** onRejected capturado por ApiClient en `interceptors.response.use`. */
function getResponseErrorHandler() {
  const useMock = getMockApi().interceptors.response.use as jest.Mock;
  const onRejected = useMock.mock.calls[0]?.[1];
  if (!onRejected) {
    throw new Error('El interceptor de response no registró onRejected');
  }
  return onRejected;
}

describe('AuthContext', () => {
  test('401 global → borra el token y user queda null', async () => {
    const sesionToken = makeToken({
      sub: '4',
      groups: ['Admin'],
      rolId: 2,
      nombre: 'Sesion Activa',
      dni: '12345678',
      passwordResetRequired: false,
    });
    (Keychain.getGenericPassword as jest.Mock).mockImplementation(
      (options?: {service?: string}) =>
        options?.service === 'accessToken' ? {password: sesionToken} : null,
    );

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );
      await flushPromises();
    });

    // Sesión restaurada desde el Keychain.
    expect(
      tree.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children === 'Sesion Activa',
      ).length,
    ).toBeGreaterThan(0);

    // 401 artificial con el shape real del backend {codigo, mensaje}.
    // El handler de axios devuelve Promise.reject: se consume (.catch) para
    // evitar unhandled rejection; sus efectos (clearToken + notificar) son
    // síncronos y ya se ejecutaron al invocarlo.
    const onRejected = getResponseErrorHandler();
    await act(async () => {
      onRejected({
        response: {
          status: 401,
          data: {codigo: 'NO_AUTENTICADO', mensaje: 'Autenticación requerida'},
        },
      }).catch(() => undefined);
      await flushPromises();
    });

    // Token borrado y sesión limpia.
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'accessToken',
    });
    expect(
      tree.root.findAll(
        node =>
          typeof node.props.children === 'string' &&
          node.props.children === 'sin sesión',
      ).length,
    ).toBeGreaterThan(0);
  });
});