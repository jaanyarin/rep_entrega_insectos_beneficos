/**
 * RequerimientoFormScreen — Screen 8: Formulario de Solicitud de Requerimiento
 * (MOD-18 / RF-158..167). Acceso: admin i+d.
 *
 * Approach: react-test-renderer + AuthProvider + mock de Keychain (JWT) +
 * mock repositories (SQLite-first) + mock useOnlineStatus.
 *
 * Cubre:
 *  - RF-162: en creación Papel/Sobre están deshabilitados.
 *  - RF-165: con Estado = Entregado, Guardar se habilita solo cuando
 *    Papel + Sobre == cantidad plaga.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {AuthProvider} from '../src/context/AuthContext';
import RequerimientoFormScreen from '../src/screens/RequerimientoFormScreen';
import {clearToken} from '../src/services/ApiClient';
import {
  findByLabel,
  flushPromises,
  makeToken,
} from '../test-utils/helpers';

const mockGoBack = jest.fn();
/** Parámetros de ruta mutables ({} = modo crear, {id: 5} = modo editar). */
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

const FUNDOS = [{id: 1, nombre: 'Fundo Norte', createdAt: '', updatedAt: ''}];
const ESPECIES = [{id: 1, nombre: 'Chrysopa sp.', estado: true}];
const ETAPAS = [{id: 1, nombre: 'Emergencia', estado: true}];
const PLAGAS = [{id: 1, nombre: 'Pulga', estado: true}];

const REQUERIMIENTO_LOCAL = {
  id: 5,
  serverId: 5,
  fecha: '2026-08-10',
  fundoId: 1,
  loteId: 10,
  especieId: 1,
  etapaFenologicaId: null,
  plagaId: 1,
  cantidad: 20,
  estado: 'ENTREGADO',
  stockDisponible: 30,
  observaciones: null,
  papelConPostura: null,
  sobreConCascarilla: null,
  fechaLiberacion: '2026-08-10',
  horaLiberacion: '10:00',
  creadoPor: 9,
  syncStatus: 'synced',
  createdAt: new Date('2026-08-10T09:00:00Z'),
  updatedAt: new Date('2026-08-10T09:00:00Z'),
};

jest.mock('../src/db/repositories', () => ({
  requerimientosRepo: {
    listLocal: jest.fn().mockResolvedValue([]),
    createLocal: jest.fn().mockResolvedValue(-1),
    updateLocal: jest.fn().mockResolvedValue(undefined),
    getByServerId: jest.fn().mockResolvedValue(null),
    getByIdLocal: jest.fn().mockResolvedValue(null),
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

async function renderForm() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_ADMIN} : null,
  );

  const {catalogosRepo} = require('../src/db/repositories');
  catalogosRepo.getFundosLocal.mockResolvedValue(FUNDOS);
  catalogosRepo.getEspeciesLocal.mockResolvedValue(ESPECIES);
  catalogosRepo.getEtapasFenologicasLocal.mockResolvedValue(ETAPAS);
  catalogosRepo.getPlagasLocal.mockResolvedValue(PLAGAS);

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <RequerimientoFormScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

describe('RequerimientoFormScreen — formulario admin', () => {
  beforeEach(async () => {
    await clearToken();
    mockRouteParams = {};
    mockGoBack.mockClear();
  });

  test('modo crear: Papel/Sobre deshabilitados (RF-162)', async () => {
    const tree = await renderForm();
    await act(async () => {
      await flushPromises();
    });

    expect(findByLabel(tree, 'Papel con postura').props.editable).toBe(false);
    expect(findByLabel(tree, 'Sobre con cascarilla').props.editable).toBe(false);
  });

  test('modo editar con estado Entregado: Guardar exige papel+sobre=cantidad (RF-165)', async () => {
    mockRouteParams = {id: 5};

    const {requerimientosRepo} = require('../src/db/repositories');
    requerimientosRepo.getByServerId.mockResolvedValue(REQUERIMIENTO_LOCAL);

    const tree = await renderForm();
    await act(async () => {
      await flushPromises();
    });

    // Estado cargado = Entregado → Papel/Sobre editables.
    expect(findByLabel(tree, 'Papel con postura').props.editable).toBe(true);
    expect(findByLabel(tree, 'Sobre con cascarilla').props.editable).toBe(true);

    // Guardar deshabilitado: aún no hay papel/sobre (suma 0 != 20).
    expect(findByLabel(tree, 'Guardar solicitud').props.disabled).toBe(true);

    // Papel 10 + Sobre 5 = 15 != 20 → sigue deshabilitado.
    await act(async () => {
      findByLabel(tree, 'Papel con postura').props.onChangeText('10');
    });
    await act(async () => {
      findByLabel(tree, 'Sobre con cascarilla').props.onChangeText('5');
    });
    await act(async () => {
      await flushPromises();
    });
    expect(findByLabel(tree, 'Guardar solicitud').props.disabled).toBe(true);

    // Papel 10 + Sobre 10 = 20 = cantidad → Guardar habilitado.
    await act(async () => {
      findByLabel(tree, 'Sobre con cascarilla').props.onChangeText('10');
    });
    await act(async () => {
      await flushPromises();
    });
    expect(findByLabel(tree, 'Guardar solicitud').props.disabled).toBe(false);
  });
});
