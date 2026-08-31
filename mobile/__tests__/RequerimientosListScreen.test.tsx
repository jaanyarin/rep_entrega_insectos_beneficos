/**
 * RequerimientosListScreen — Screen 7: Listado de Solicitudes de Requerimiento
 * (admin). Approach: react-test-renderer + AuthProvider + mock Keychain +
 * mock repositories (SQLite-first) + mock useOnlineStatus.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {useNavigation} from '@react-navigation/native';
import {AuthProvider} from '../src/context/AuthContext';
import RequerimientosListScreen from '../src/screens/RequerimientosListScreen';
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
  },
  programacionesRepo: {
    listLocal: jest.fn().mockResolvedValue([]),
    syncProgramaciones: jest.fn().mockResolvedValue(undefined),
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

const SOLICITUDES_LOCALES = [
  {
    id: 1,
    serverId: 1,
    fecha: '2026-08-05',
    fundoId: 1,
    loteId: 10,
    especieId: 1,
    etapaFenologicaId: null,
    plagaId: null,
    cantidad: 200,
    estado: 'APROBADO',
    stockDisponible: 3000,
    observaciones: null,
    papelConPostura: null,
    sobreConCascarilla: null,
    fechaLiberacion: null,
    horaLiberacion: null,
    creadoPor: null,
    syncStatus: 'synced',
    createdAt: new Date('2026-08-05T10:00:00Z'),
    updatedAt: new Date('2026-08-05T10:00:00Z'),
  },
];

const FUNDOS = [{id: 1, nombre: 'Fundo Norte', createdAt: '', updatedAt: ''}];
const ESPECIES = [{id: 1, nombre: 'Chrysopa sp.', estado: true}];
const PLAGAS = [{id: 1, nombre: 'Pulga', estado: true}];

const mockNavigate = jest.fn();

async function renderLista(token = TOKEN_ADMIN) {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: token} : null,
  );
  (useNavigation as unknown as jest.Mock).mockReturnValue({
    navigate: mockNavigate,
    goBack: jest.fn(),
  });

  const {requerimientosRepo, catalogosRepo} = require('../src/db/repositories');
  requerimientosRepo.listLocal.mockResolvedValue(SOLICITUDES_LOCALES);
  catalogosRepo.getFundosLocal.mockResolvedValue(FUNDOS);
  catalogosRepo.getEspeciesLocal.mockResolvedValue(ESPECIES);
  catalogosRepo.getPlagasLocal.mockResolvedValue(PLAGAS);

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <RequerimientosListScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

describe('RequerimientosListScreen — listado admin', () => {
  beforeEach(async () => {
    await clearToken();
    mockNavigate.mockClear();
  });

  test('muestra la galería con especie y estado con color', async () => {
    const tree = await renderLista();
    await act(async () => {
      await flushPromises();
    });

    expect(contarTexto(tree, 'Chrysopa sp.')).toBeGreaterThan(0);
    // Estado con su etiqueta (RF-154): 'Aprobado'.
    expect(contarTexto(tree, 'Aprobado')).toBeGreaterThan(0);
  });

  test('Nuevo navega a Screen 8 en modo creación', async () => {
    const tree = await renderLista();
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Crear nueva solicitud').props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('RequerimientoForm', {});
  });

  test('Editar por registro navega a Screen 8 con el id', async () => {
    const tree = await renderLista();
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Editar Chrysopa sp.').props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('RequerimientoForm', {id: 1});
  });

  test('Aplicar filtro llama a requerimientosRepo.listLocal con el rango', async () => {
    const tree = await renderLista();
    await act(async () => {
      await flushPromises();
    });

    const {requerimientosRepo} = require('../src/db/repositories');
    requerimientosRepo.listLocal.mockClear();
    requerimientosRepo.listLocal.mockResolvedValue(SOLICITUDES_LOCALES);

    await act(async () => {
      findByLabel(tree, 'Desde').props.onChange('2026-08-01');
    });
    await act(async () => {
      findByLabel(tree, 'Hasta').props.onChange('2026-08-31');
    });
    await act(async () => {
      findByLabel(tree, 'Aplicar filtro').props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(requerimientosRepo.listLocal).toHaveBeenCalledWith({
      fechaDesde: '2026-08-01',
      fechaHasta: '2026-08-31',
    });
  });
});
