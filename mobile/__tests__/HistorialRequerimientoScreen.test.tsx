/**
 * HistorialRequerimientoScreen — Screen 12: Historial de Requerimientos
 * (MOD-18 / RF-179..181). Acceso: user sanidad.
 *
 * Approach: react-test-renderer + AuthProvider + mock de Keychain +
 * mock repositories (SQLite-first) + mock useOnlineStatus.
 *
 * Cubre HITO-011: muestra de fotos en el modal de detalle.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {useNavigation} from '@react-navigation/native';
import HistorialRequerimientoScreen from '../src/screens/HistorialRequerimientoScreen';
import {AuthProvider} from '../src/context/AuthContext';
import {clearToken} from '../src/services/ApiClient';
import {
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

const TOKEN_USUARIO = makeToken({
  sub: '5',
  groups: ['Usuario'],
  rolId: 3,
  nombre: 'Sonia Sanidad',
  dni: '12345678',
  passwordResetRequired: false,
});

const REQUERIMIENTOS_LOCALES = [
  {
    id: 1,
    serverId: 1,
    fecha: '2026-08-20',
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
    fechaLiberacion: null,
    horaLiberacion: null,
    creadoPor: 5,
    syncStatus: 'synced',
    createdAt: new Date('2026-08-20T10:00:00Z'),
    updatedAt: new Date('2026-08-20T10:00:00Z'),
  },
];

const FUNDOS = [{id: 1, nombre: 'Fundo Norte', createdAt: '', updatedAt: ''}];
const ESPECIES = [{id: 1, nombre: 'Chrysopa sp.', estado: true}];
const PLAGAS = [{id: 1, nombre: 'Pulga', estado: true}];

const FOTOS_LOCALES = [
  {
    id: 10,
    requerimientoLocalId: 1,
    uri: '/fotos/foto1.jpg',
    fileName: 'foto1.jpg',
    fileSize: 1024000,
    contentType: 'image/jpeg',
    metadatos: '{"tipo":"EVIDENCIA"}',
    syncStatus: 'uploaded',
    serverFotoId: 10,
    serverUrl: '/fotos/foto1.jpg',
    createdAt: new Date('2026-08-20T10:00:00Z'),
  },
  {
    id: 11,
    requerimientoLocalId: 1,
    uri: '/fotos/foto2.jpg',
    fileName: 'foto2.jpg',
    fileSize: 2048000,
    contentType: 'image/jpeg',
    metadatos: '{"tipo":"EVIDENCIA"}',
    syncStatus: 'uploaded',
    serverFotoId: 11,
    serverUrl: '/fotos/foto2.jpg',
    createdAt: new Date('2026-08-20T10:01:00Z'),
  },
];

async function renderHistorial() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_USUARIO} : null,
  );
  (useNavigation as unknown as jest.Mock).mockReturnValue({
    goBack: jest.fn(),
    navigate: jest.fn(),
  });

  const {requerimientosRepo, catalogosRepo, photosRepo} = require('../src/db/repositories');
  requerimientosRepo.listLocal.mockResolvedValue(REQUERIMIENTOS_LOCALES);
  catalogosRepo.getFundosLocal.mockResolvedValue(FUNDOS);
  catalogosRepo.getEspeciesLocal.mockResolvedValue(ESPECIES);
  catalogosRepo.getPlagasLocal.mockResolvedValue(PLAGAS);
  photosRepo.listByRequerimiento.mockResolvedValue(FOTOS_LOCALES);

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <HistorialRequerimientoScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

describe('HistorialRequerimientoScreen — fotos en detalle (HITO-011)', () => {
  beforeEach(async () => {
    await clearToken();
  });

  test('muestra fotos en el modal de detalle', async () => {
    const tree = await renderHistorial();

    // Abrir modal "Ver"
    await act(async () => {
      findByLabel(tree, 'Ver Chrysopa sp.').props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });

    // Verificar que se consultaron las fotos locales
    const {photosRepo} = require('../src/db/repositories');
    expect(photosRepo.listByRequerimiento).toHaveBeenCalled();

    // Verificar que el título de fotos aparece
    const fotosTitle = tree.root.findAll(
      (node: any) => typeof node.props.children === 'string' && node.props.children === 'Evidencia fotográfica',
    );
    expect(fotosTitle.length).toBeGreaterThanOrEqual(1);

    // Verificar que aparecen las fotos (thumbnails con uri correcta)
    const fotoImages = tree.root.findAll(
      (node: any) => node.props.source && node.props.source.uri === '/fotos/foto1.jpg',
    );
    expect(fotoImages.length).toBeGreaterThanOrEqual(1);
    const foto2Images = tree.root.findAll(
      (node: any) => node.props.source && node.props.source.uri === '/fotos/foto2.jpg',
    );
    expect(foto2Images.length).toBeGreaterThanOrEqual(1);
  });

  test('muestra el historial correctamente', async () => {
    const tree = await renderHistorial();

    // Verificar que se muestra la especie en la card
    const especieNodes = tree.root.findAll(
      (node: any) => typeof node.props.children === 'string' && node.props.children === 'Chrysopa sp.',
    );
    expect(especieNodes.length).toBeGreaterThanOrEqual(1);
  });
});
