/**
 * RequerimientosPanelScreen — Screen 6: Panel de Solicitudes de Requerimiento
 * (admin). Approach: react-test-renderer + AuthProvider + mock de Keychain
 * (JWT fabricado con makeToken) + mock repositories (SQLite-first) +
 * mock useOnlineStatus.
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
  makeToken,
} from '../test-utils/helpers';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({navigate: jest.fn(), goBack: jest.fn()})),
  };
});

jest.mock('../src/db/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));

jest.mock('../src/db/repositories', () => ({
  requerimientosRepo: {
    listLocal: jest.fn().mockResolvedValue([]),
    createLocal: jest.fn().mockResolvedValue(-1),
    updateLocal: jest.fn().mockResolvedValue(undefined),
    getByServerId: jest.fn().mockResolvedValue(null),
    getByIdLocal: jest.fn().mockResolvedValue(null),
    countPending: jest.fn().mockResolvedValue(0),
  },
  catalogosRepo: {
    syncAllCatalogos: jest.fn().mockResolvedValue(undefined),
    getFundosLocal: jest.fn().mockResolvedValue([]),
    getEspeciesLocal: jest.fn().mockResolvedValue([]),
    getEtapasFenologicasLocal: jest.fn().mockResolvedValue([]),
    getPlagasLocal: jest.fn().mockResolvedValue([]),
    getLotesLocal: jest.fn().mockResolvedValue([]),
  },
  photosRepo: {
    saveLocal: jest.fn().mockResolvedValue({success: true, fotoId: 1}),
    listByRequerimiento: jest.fn().mockResolvedValue([]),
    getPendingUpload: jest.fn().mockResolvedValue([]),
    markUploaded: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    countByRequerimiento: jest.fn().mockResolvedValue(0),
  },
  programacionesRepo: {
    listLocal: jest.fn().mockResolvedValue([]),
    listLocalAsDto: jest.fn().mockResolvedValue([]),
    syncProgramaciones: jest.fn().mockResolvedValue(undefined),
    hasLocalData: jest.fn().mockResolvedValue(false),
  },
}));

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

const REQUERIMIENTOS_LOCALES = [
  {
    id: 1,
    serverId: 1,
    fecha: fechaISO,
    fundoId: 1,
    loteId: 10,
    especieId: 1,
    etapaFenologicaId: null,
    plagaId: null,
    cantidad: 200,
    estado: 'PENDIENTE',
    stockDisponible: 3000,
    observaciones: null,
    papelConPostura: null,
    sobreConCascarilla: null,
    fechaLiberacion: null,
    horaLiberacion: null,
    creadoPor: null,
    syncStatus: 'pending',
    createdAt: new Date('2026-08-18T10:00:00Z'),
    updatedAt: new Date('2026-08-18T10:00:00Z'),
  },
];

const mockNavigate = jest.fn();

async function renderPanel(
  token = TOKEN_ADMIN,
  requerimientos: unknown[] = REQUERIMIENTOS_LOCALES,
) {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: token} : null,
  );
  (useNavigation as unknown as jest.Mock).mockReturnValue({
    navigate: mockNavigate,
    goBack: jest.fn(),
  });

  const {requerimientosRepo, programacionesRepo} = require('../src/db/repositories');
  requerimientosRepo.listLocal.mockResolvedValue(requerimientos);
  programacionesRepo.listLocalAsDto.mockResolvedValue(PROGRAMACIONES);

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <RequerimientosPanelScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

describe('RequerimientosPanelScreen — panel admin', () => {
  beforeEach(async () => {
    await clearToken();
    mockNavigate.mockClear();
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
