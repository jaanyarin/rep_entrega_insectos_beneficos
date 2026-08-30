/**
 * EditarRequerimientoScreen — Screen 13: Edición de Requerimiento (user)
 * (MOD-18 / RF-182..185 / RN-035..036).
 *
 * Approach: react-test-renderer + mock de Keychain + mock repositories
 * (SQLite-first) + mock useOnlineStatus.
 *
 * Cubre RN-035: la alerta permanente de 30 h se muestra cuando el estado es
 * RECIBIDO y transcurrieron más de 30 h desde el último cambio de estado.
 * Cubre HITO-011: carga de fotos existentes del servidor/local.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import EditarRequerimientoScreen from '../src/screens/EditarRequerimientoScreen';
import {clearToken} from '../src/services/ApiClient';
import {
  flushPromises,
  makeToken,
} from '../test-utils/helpers';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({goBack: mockGoBack, navigate: jest.fn()})),
    useRoute: jest.fn(() => ({params: {id: 4}})),
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

const TOKEN_USUARIO = makeToken({
  sub: '5',
  groups: ['Usuario'],
  rolId: 3,
  nombre: 'Sonia Sanidad',
  dni: '12345678',
  passwordResetRequired: false,
});

const FUNDOS = [{id: 1, nombre: 'Fundo Norte', createdAt: '', updatedAt: ''}];
const ESPECIES = [{id: 1, nombre: 'Chrysopa sp.', estado: true}];
const ETAPAS = [{id: 1, nombre: 'Emergencia', estado: true}];
const PLAGAS = [{id: 1, nombre: 'Pulga', estado: true}];

const FOTOS_LOCALES = [
  {
    id: 10,
    requerimientoLocalId: 4,
    uri: '/fotos/foto1.jpg',
    fileName: 'foto1.jpg',
    fileSize: 1024000,
    contentType: 'image/jpeg',
    metadatos: '{"tipo":"LIBERACION"}',
    syncStatus: 'uploaded',
    serverFotoId: 10,
    serverUrl: '/fotos/foto1.jpg',
    createdAt: new Date('2026-08-20T10:00:00Z'),
  },
];

/** Requerimiento base con timestamps relativos a `now` (para RN-035). */
function requerimientoBase({updatedAt}: {updatedAt: string}) {
  return {
    id: 4,
    serverId: 4,
    fecha: '2026-08-10',
    fundoId: 1,
    loteId: 10,
    especieId: 1,
    etapaFenologicaId: null,
    plagaId: 1,
    cantidad: 20,
    estado: 'RECIBIDO',
    stockDisponible: 30,
    observaciones: null,
    papelConPostura: null,
    sobreConCascarilla: null,
    fechaLiberacion: '2026-08-10T10:00:00Z',
    horaLiberacion: '10:00',
    creadoPor: 5,
    syncStatus: 'synced',
    createdAt: new Date(updatedAt),
    updatedAt: new Date(updatedAt),
  };
}

/** Requerimiento devuelto por repositorio (mutable por test). */
let requerimientoActual = requerimientoBase({
  updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
});

async function renderEdicion() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_USUARIO} : null,
  );

  const {requerimientosRepo, catalogosRepo, photosRepo} = require('../src/db/repositories');
  requerimientosRepo.getByServerId.mockResolvedValue(requerimientoActual);
  catalogosRepo.getFundosLocal.mockResolvedValue(FUNDOS);
  catalogosRepo.getEspeciesLocal.mockResolvedValue(ESPECIES);
  catalogosRepo.getEtapasFenologicasLocal.mockResolvedValue(ETAPAS);
  catalogosRepo.getPlagasLocal.mockResolvedValue(PLAGAS);
  photosRepo.listByRequerimiento.mockResolvedValue(FOTOS_LOCALES);

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(<EditarRequerimientoScreen />);
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

/** Cuenta nodos con role="alert" (la alerta permanente de RN-035). */
function contarAlertas(tree: ReactTestRenderer.ReactTestRenderer): number {
  return tree.root.findAll(node => node.props.accessibilityRole === 'alert').length;
}

describe('EditarRequerimientoScreen — alerta de 30 h (RN-035)', () => {
  beforeEach(async () => {
    await clearToken();
    mockGoBack.mockClear();
  });

  test('muestra la alerta cuando RECIBIDO superó 30 h sin foto de liberación', async () => {
    requerimientoActual = requerimientoBase({
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    });
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    expect(contarAlertas(tree)).toBeGreaterThan(0);
  });

  test('NO muestra la alerta cuando RECIBIDO es reciente (menos de 30 h)', async () => {
    requerimientoActual = requerimientoBase({
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    expect(contarAlertas(tree)).toBe(0);
  });
});

describe('EditarRequerimientoScreen — fotos del servidor/local (HITO-011)', () => {
  beforeEach(async () => {
    await clearToken();
    mockGoBack.mockClear();
  });

  test('carga y muestra fotos existentes del repositorio local', async () => {
    requerimientoActual = requerimientoBase({
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    // Verificar que se llamó a listar fotos locales
    const {photosRepo} = require('../src/db/repositories');
    expect(photosRepo.listByRequerimiento).toHaveBeenCalled();

    // Buscar el label de la foto del servidor
    const servidorLabels = tree.root.findAll(
      (node: any) =>
        node.props.accessibilityLabel === 'Quitar foto del servidor 1',
    );
    expect(servidorLabels.length).toBeGreaterThanOrEqual(1);
  });

  test('elimina foto del servidor al pulsar Quitar', async () => {
    requerimientoActual = requerimientoBase({
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    // Pulsar Quitar en la foto del servidor
    await act(async () => {
      const btns = tree.root.findAll(
        (node: any) =>
          node.props.accessibilityLabel === 'Quitar foto del servidor 1',
      );
      btns[0].props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });

    const {photosRepo} = require('../src/db/repositories');
    expect(photosRepo.remove).toHaveBeenCalled();
  });
});
