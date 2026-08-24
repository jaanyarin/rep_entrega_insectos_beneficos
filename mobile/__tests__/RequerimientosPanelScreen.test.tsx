/**
 * RequerimientosPanelScreen — Screen 6: Panel de Solicitudes de Requerimiento
 * (admin). Approach: react-test-renderer + AuthProvider + mock de Keychain
 * (JWT fabricado con makeToken) + mock axios (getMockApi) para
 * listarProgramaciones (GET /programaciones?anio&mes) y listarRequerimientos
 * (GET /requerimientos).
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {useNavigation} from '@react-navigation/native';
import {AuthProvider} from '../src/context/AuthContext';
import RequerimientosPanelScreen from '../src/screens/RequerimientosPanelScreen';
import {clearToken} from '../src/services/ApiClient';
import {
  contarTexto,
  findByLabel,
  flushPromises,
  getMockApi,
  makeToken,
} from '../test-utils/helpers';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({navigate: jest.fn(), goBack: jest.fn()})),
  };
});

const TOKEN_ADMIN = makeToken({
  sub: '9',
  groups: ['Admin'],
  rolId: 2,
  nombre: 'Ana Admin',
  dni: '87654321',
  passwordResetRequired: false,
});

const PROGRAMACIONES = [
  {
    id: 1,
    anio: 2026,
    mes: 8,
    especieId: 1,
    especie: 'Chrysopa sp.',
    fechaRegistro: '2026-08-18T10:00:00Z',
    fechaPublicacion: null,
    estado: 'PUBLICADO',
    stockInicialBase: 5000,
    totalMes: 3000,
    detalles: [
      {
        id: 11,
        semana: 1,
        fecha: '2026-08-03T00:00:00Z',
        stockInicial: 5000,
        papelConPostura: 2000,
        sobreConCascarilla: 1000,
        total: 3000,
        stockFinal: 2000,
        estado: 'PUBLICADO',
      },
    ],
  },
];

const hoy = new Date();
const fechaISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

const REQUERIMIENTOS = [
  {
    id: 1,
    fecha: fechaISO,
    fundoId: 1,
    fundo: 'Fundo Norte',
    loteId: 10,
    lote: 'Lote A',
    especieId: 1,
    especie: 'Chrysopa sp.',
    etapaFenologicaId: null,
    etapaFenologica: null,
    cantidad: 200,
    plagaId: null,
    plaga: null,
    estado: 'PENDIENTE',
    stockDisponible: 3000,
    fechaLiberacion: null,
    horaLiberacion: null,
    observaciones: null,
    papelConPostura: null,
    sobreConCascarilla: null,
    creadoPor: null,
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
  },
];

let api = getMockApi();
const mockNavigate = jest.fn();

async function renderPanel(
  token = TOKEN_ADMIN,
  requerimientos: unknown[] = REQUERIMIENTOS,
) {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: token} : null,
  );
  (useNavigation as unknown as jest.Mock).mockReturnValue({
    navigate: mockNavigate,
    goBack: jest.fn(),
  });

  api.get.mockImplementation((url: string) => {
    if (url === '/programaciones') {
      return Promise.resolve({data: PROGRAMACIONES});
    }
    if (url === '/requerimientos') {
      return Promise.resolve({data: requerimientos});
    }
    return Promise.resolve({data: []});
  });

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <RequerimientosPanelScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

describe('RequerimientosPanelScreen — panel admin', () => {
  beforeEach(async () => {
    await clearToken();
    mockNavigate.mockClear();
    api.get.mockClear();
  });

  test('muestra la tabla de proyección y el indicador de pendientes', async () => {
    const tree = await renderPanel();
    await act(async () => {
      await flushPromises();
    });

    // Botón principal con el indicador numérico de solicitudes pendientes (RF-151).
    expect(findByLabel(tree, 'Solicitud de Requerimiento')).toBeTruthy();
    expect(findByLabel(tree, 'Solicitudes pendientes')).toBeTruthy();
    // Proyección semanal: total 2000 + 1000 = 3000.
    expect(contarTexto(tree, '3000')).toBeGreaterThan(0);
    // Barra de consumo vs disponibilidad (pie de ProyeccionMesCard).
    expect(contarTexto(tree, 'Consumido: 200 millares')).toBe(1);
  });

  test('sin solicitudes pendientes no muestra el badge', async () => {
    const tree = await renderPanel(TOKEN_ADMIN, []);
    await act(async () => {
      await flushPromises();
    });

    expect(() => findByLabel(tree, 'Solicitudes pendientes')).toThrow();
  });

  test('el botón Solicitud de Requerimiento navega a Screen 7', async () => {
    const tree = await renderPanel();
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Solicitud de Requerimiento').props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('RequerimientosList');
  });
});
