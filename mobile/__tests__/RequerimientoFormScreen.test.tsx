/**
 * RequerimientoFormScreen — Screen 8: Formulario de Solicitud de Requerimiento
 * (MOD-18 / RF-158..167). Acceso: admin i+d.
 *
 * DIAGNOSTIC VERSION: trace mock invocations to understand dynamic import behavior.
 */

var mockObtenerRequerimientoImpl: ((id: number) => Promise<any>) | null = null;

jest.mock('../src/services/ApiClient', () => {
  const _getToken = jest.fn().mockImplementation(() => {
    try {
      const Keychain = require('react-native-keychain');
      const creds = Keychain.getGenericPassword({service: 'accessToken'});
      return Promise.resolve(creds ? creds.password : null);
    } catch {
      return Promise.resolve(null);
    }
  });
  const _parseToken = jest.fn((token: string | null | undefined) => {
    if (!token) return null;
    return {
      sub: '5',
      rol: 'Admin',
      rolNombre: 'Admin',
      rolId: 1,
      nombre: 'Admin Test',
      dni: '12345678',
      passwordResetRequired: false,
    };
  });

  console.log('[jest.mock] Creating mock for ApiClient — static imports are resolved');
  return {
    __esModule: true,
    changePassword: jest.fn().mockResolvedValue({token: 'new-token', passwordResetRequired: false}),
    clearToken: jest.fn().mockResolvedValue(undefined),
    extractErrorMessage: jest.fn((e: any) => {
      if (e?.response?.data?.mensaje) return e.response.data.mensaje;
      if (e?.message) return e.message;
      return 'Error de conexion.';
    }),
    getToken: _getToken,
    localLogin: jest.fn().mockResolvedValue({token: 'mock-token', passwordResetRequired: false}),
    parseToken: _parseToken,
    setToken: jest.fn().mockResolvedValue(undefined),
    setUnauthorizedHandler: jest.fn(),
    listarFundos: jest.fn().mockResolvedValue([
      {id: 1, nombre: 'Fundo Norte', createdAt: '', updatedAt: ''},
    ]),
    listarEspecies: jest.fn().mockResolvedValue([
      {id: 1, nombre: 'Chrysopa sp.', estado: true},
    ]),
    listarEtapasFenologicas: jest.fn().mockResolvedValue([
      {id: 1, nombre: 'Emergencia', estado: true},
    ]),
    listarPlagas: jest.fn().mockResolvedValue([
      {id: 1, nombre: 'Pulga', estado: true},
    ]),
    listarLotes: jest.fn().mockResolvedValue([]),
    obtenerRequerimiento: jest.fn().mockImplementation(
      (id: number) => {
        console.log('[MOCK] obtenerRequerimiento called with id:', id, 'impl:', !!mockObtenerRequerimientoImpl);
        if (mockObtenerRequerimientoImpl) {
          return mockObtenerRequerimientoImpl(id);
        }
        return Promise.resolve(null);
      },
    ),
    crearRequerimiento: jest.fn().mockResolvedValue({id: 99}),
    actualizarRequerimiento: jest.fn().mockResolvedValue({id: 5}),
  };
});

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {AuthProvider} from '../src/context/AuthContext';
import RequerimientoFormScreen from '../src/screens/RequerimientoFormScreen';
import {clearToken} from '../src/services/ApiClient';
import {
  flushPromises,
  makeToken,
} from '../test-utils/helpers';

const mockGoBack = jest.fn();
let mockRouteParams: Record<string, unknown> = {};

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({goBack: mockGoBack, navigate: jest.fn()})),
    useRoute: jest.fn(() => ({params: mockRouteParams})),
  };
});

jest.mock('../src/db/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));

const REQUERIMIENTO_DTO = {
  id: 5,
  fecha: '2026-08-10',
  fundoId: 1,
  fundo: 'Fundo Norte',
  loteId: 10,
  lote: 'Lote A',
  especieId: 1,
  especie: 'Chrysopa sp.',
  etapaFenologicaId: null,
  etapaFenologica: null,
  cantidad: 20,
  plagaId: 1,
  plaga: 'Pulga',
  estado: 'ENTREGADO' as const,
  stockDisponible: 30,
  observaciones: null,
  papelConPostura: null,
  sobreConCascarilla: null,
  fechaLiberacion: '2026-08-10',
  horaLiberacion: '10:00',
  creadoPor: 9,
  createdAt: '2026-08-10T09:00:00Z',
  updatedAt: '2026-08-10T09:00:00Z',
};

const TOKEN_ADMIN = makeToken({
  sub: '9',
  groups: ['Admin'],
  rolId: 2,
  nombre: 'Ana Admin',
  dni: '87654321',
  passwordResetRequired: false,
});

async function renderForm() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_ADMIN} : null,
  );

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <RequerimientoFormScreen />
      </AuthProvider>,
    );
  });
  for (let i = 0; i < 20; i++) {
    await act(async () => {
      await flushPromises();
    });
  }
  return tree;
}

describe('RequerimientoFormScreen — diagnostic', () => {
  beforeEach(async () => {
    await clearToken();
    mockRouteParams = {};
    mockGoBack.mockClear();
    mockObtenerRequerimientoImpl = null;
  });

  test('modo editar: debug error state', async () => {
    mockRouteParams = {id: 5};
    mockObtenerRequerimientoImpl = jest.fn().mockResolvedValue(REQUERIMIENTO_DTO);

    const tree = await renderForm();

    // Check for error state
    const errorNode = tree.root.findAll(
      (node: any) => node.props?.accessibilityLabel === 'Error de conexión',
    );
    console.log('[TEST] ErrorState nodes found:', errorNode.length);

    // Check for loading state
    const loadingNode = tree.root.findAll(
      (node: any) => typeof node.props?.children === 'string' && node.props.children.includes?.('Cargando'),
    );
    console.log('[TEST] Loading nodes found:', loadingNode.length);

    // Check what labels are present
    const allLabels: string[] = [];
    tree.root.findAll((node: any) => {
      if (node.props?.accessibilityLabel) {
        allLabels.push(node.props.accessibilityLabel);
      }
      return false;
    });
    console.log('[TEST] All accessibilityLabels:', allLabels);

    expect(true).toBe(true);
  });
});
