/**
 * NuevoRequerimientoScreen — Screen 10: Formulario de Nuevo Requerimiento
 * (user). Approach: react-test-renderer + AuthProvider + mock de Keychain +
 * mock repositories (SQLite-first) + mock useOnlineStatus + mock api (stock).
 *
 * Los desplegables (SelectField) abren un Modal: se abre el campo y luego se
 * elige la opción (accessibilityLabel "Opción <Campo> <Nombre>").
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import {AuthProvider} from '../src/context/AuthContext';
import NuevoRequerimientoScreen from '../src/screens/NuevoRequerimientoScreen';
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
    syncFundos: jest.fn().mockResolvedValue([]),
    syncLotes: jest.fn().mockResolvedValue([]),
    syncEspecies: jest.fn().mockResolvedValue([]),
    syncEtapasFenologicas: jest.fn().mockResolvedValue([]),
    syncPlagas: jest.fn().mockResolvedValue([]),
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
const LOTES = [{id: 10, fundoId: 1, fundo: '', variedadId: 0, variedad: '', variedadColor: '', nombre: 'Lote A', area: null, createdAt: '', updatedAt: ''}];
const ESPECIES = [{id: 1, nombre: 'Chrysopa sp.', estado: true}];
const ETAPAS = [{id: 1, nombre: 'Emergencia', estado: true}];
const PLAGAS = [{id: 1, nombre: 'Pulga', estado: true}];

const FOTO_ASSET = {
  uri: 'file:///tmp/foto.jpg',
  type: 'image/jpeg',
  fileName: 'foto1.jpg',
  fileSize: 1024000,
};

let axiosApi = getMockApi();
const mockGoBack = jest.fn();

async function renderForm(stock = 30) {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_USUARIO} : null,
  );
  (useNavigation as unknown as jest.Mock).mockReturnValue({
    goBack: mockGoBack,
    navigate: jest.fn(),
  });

  const {catalogosRepo} = require('../src/db/repositories');
  catalogosRepo.getFundosLocal.mockResolvedValue(FUNDOS);
  catalogosRepo.getLotesLocal.mockResolvedValue(LOTES);
  catalogosRepo.getEspeciesLocal.mockResolvedValue(ESPECIES);
  catalogosRepo.getEtapasFenologicasLocal.mockResolvedValue(ETAPAS);
  catalogosRepo.getPlagasLocal.mockResolvedValue(PLAGAS);

  // Mock stock endpoint via API (server-only fallback)
  axiosApi.get.mockImplementation((url: string) => {
    if (url === '/programaciones/1/stock') {
      return Promise.resolve({data: {stock}});
    }
    return Promise.resolve({data: []});
  });

  // Mock syncFundos/syncLotes etc. (called by useRequerimientosCatalogos when online)
  catalogosRepo.syncFundos.mockResolvedValue(FUNDOS);
  catalogosRepo.syncLotes.mockResolvedValue(LOTES);
  catalogosRepo.syncEspecies.mockResolvedValue(ESPECIES);
  catalogosRepo.syncEtapasFenologicas.mockResolvedValue(ETAPAS);
  catalogosRepo.syncPlagas.mockResolvedValue(PLAGAS);

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <NuevoRequerimientoScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

/** Selecciona un desplegable abriéndolo y eligiendo la opción dada. */
async function elegirOpcion(
  tree: ReactTestRenderer.ReactTestRenderer,
  campo: string,
  opcion: string,
) {
  await act(async () => {
    findByLabel(tree, campo).props.onPress();
  });
  await act(async () => {
    findByLabel(tree, opcion).props.onPress();
  });
  await act(async () => {
    await flushPromises();
  });
}

describe('NuevoRequerimientoScreen — formulario user', () => {
  beforeEach(async () => {
    await clearToken();
    mockGoBack.mockClear();
    axiosApi.get.mockClear();
    (launchImageLibrary as jest.Mock).mockReset();
    (launchImageLibrary as jest.Mock).mockResolvedValue({didCancel: true});
  });

  test('muestra el formulario y actualiza el stock al elegir especie', async () => {
    const tree = await renderForm();
    await act(async () => {
      await flushPromises();
    });

    // El botón Enviar está deshabilitado mientras falten obligatorios.
    expect(findByLabel(tree, 'Enviar Solicitud').props.disabled).toBe(true);

    // Al elegir la especie se consulta el stock (RN-029/RN-176).
    await elegirOpcion(tree, 'Especie', 'Opción Especie Chrysopa sp.');
    expect(contarTexto(tree, '30 millares')).toBe(1);
  });

  test('selecciona todos los campos obligatorios y crea el requerimiento', async () => {
    const {requerimientosRepo} = require('../src/db/repositories');
    requerimientosRepo.createLocal.mockResolvedValue(-1);

    const tree = await renderForm();
    await act(async () => {
      await flushPromises();
    });

    await elegirOpcion(tree, 'Fundo', 'Opción Fundo Fundo Norte');
    await elegirOpcion(tree, 'Lote', 'Opción Lote Lote A');
    await elegirOpcion(tree, 'Especie', 'Opción Especie Chrysopa sp.');
    await elegirOpcion(tree, 'Etapa fenológica', 'Opción Etapa Emergencia');
    await elegirOpcion(tree, 'Plaga objetivo', 'Opción Plaga Pulga');

    await act(async () => {
      findByLabel(tree, 'Cantidad').props.onChangeText('20');
    });
    await act(async () => {
      await flushPromises();
    });

    expect(findByLabel(tree, 'Enviar Solicitud').props.disabled).toBe(false);

    await act(async () => {
      findByLabel(tree, 'Enviar Solicitud').props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(requerimientosRepo.createLocal).toHaveBeenCalledWith(
      expect.objectContaining({
        fundoId: 1,
        loteId: 10,
        especieId: 1,
        etapaFenologicaId: 1,
        cantidad: 20,
        plagaId: 1,
      }),
      5, // user.sub
      30, // stock
    );
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('bloquea el envío cuando la cantidad supera el stock', async () => {
    const tree = await renderForm(5);
    await act(async () => {
      await flushPromises();
    });

    await elegirOpcion(tree, 'Especie', 'Opción Especie Chrysopa sp.');
    await act(async () => {
      findByLabel(tree, 'Cantidad').props.onChangeText('20');
    });
    await act(async () => {
      await flushPromises();
    });

    expect(contarTexto(tree, 'La cantidad supera el stock disponible')).toBe(1);
    expect(findByLabel(tree, 'Enviar Solicitud').props.disabled).toBe(true);
  });

  test('sube fotos después de crear el requerimiento', async () => {
    const {requerimientosRepo, photosRepo} = require('../src/db/repositories');
    requerimientosRepo.createLocal.mockResolvedValue(-1);
    photosRepo.saveLocal.mockResolvedValue({success: true, fotoId: 1});

    const tree = await renderForm();
    await act(async () => {
      await flushPromises();
    });

    // Simular selección de foto desde galería
    (launchImageLibrary as jest.Mock).mockResolvedValue({
      didCancel: false,
      assets: [FOTO_ASSET],
    });

    await elegirOpcion(tree, 'Fundo', 'Opción Fundo Fundo Norte');
    await elegirOpcion(tree, 'Lote', 'Opción Lote Lote A');
    await elegirOpcion(tree, 'Especie', 'Opción Especie Chrysopa sp.');
    await elegirOpcion(tree, 'Etapa fenológica', 'Opción Etapa Emergencia');
    await elegirOpcion(tree, 'Plaga objetivo', 'Opción Plaga Pulga');

    await act(async () => {
      findByLabel(tree, 'Cantidad').props.onChangeText('20');
    });
    await act(async () => {
      await flushPromises();
    });

    // Seleccionar foto
    await act(async () => {
      findByLabel(tree, 'Seleccionar foto de la galería').props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });

    // Verificar que la foto aparece en la UI (botón Quitar visible)
    const quitarBtns = tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Quitar foto 1',
    );
    expect(quitarBtns.length).toBeGreaterThanOrEqual(1);

    // Enviar
    await act(async () => {
      findByLabel(tree, 'Enviar Solicitud').props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });

    // Verificar que se llamó a crear requerimiento Y a subir foto local
    expect(requerimientosRepo.createLocal).toHaveBeenCalledWith(
      expect.objectContaining({fundoId: 1}),
      5,
      expect.any(Number),
    );
    expect(photosRepo.saveLocal).toHaveBeenCalledWith(
      -1, // localId del createLocal
      'file:///tmp/foto.jpg',
      expect.objectContaining({type: 'image/jpeg'}),
      expect.objectContaining({metadatos: {tipo: 'EVIDENCIA'}}),
    );
    expect(mockGoBack).toHaveBeenCalled();
  });
});
