/**
 * RequerimientoFormScreen — Screen 8: Formulario de Solicitud de Requerimiento
 * (MOD-18 / RF-158..167). Acceso: admin i+d.
 *
 * Approach (igual que ProgramacionEdicionScreen.test.tsx): react-test-renderer
 * + AuthProvider + mock de Keychain (JWT fabricado con makeToken) + mock axios
 * (getMockApi) para los catálogos (GET /fundos, /especies,
 * /etapas-fenologicas, /plagas, /lotes?fundoId) y el detalle
 * (GET /requerimientos/{id}).
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
  getMockApi,
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

const TOKEN_ADMIN = makeToken({
  sub: '9',
  groups: ['Admin'],
  rolId: 2,
  nombre: 'Ana Admin',
  dni: '87654321',
  passwordResetRequired: false,
});

const FUNDOS = [{id: 1, nombre: 'Fundo Norte', estado: true}];
const ESPECIES = [{id: 1, nombre: 'Chrysopa sp.', estado: true}];
const ETAPAS = [{id: 1, nombre: 'Emergencia', estado: true}];
const PLAGAS = [{id: 1, nombre: 'Pulga', estado: true}];

const REQUERIMIENTO = {
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
  estado: 'ENTREGADO',
  stockDisponible: 30,
  fechaLiberacion: '2026-08-10',
  horaLiberacion: '10:00',
  observaciones: null,
  papelConPostura: null,
  sobreConCascarilla: null,
  creadoPor: 9,
  createdAt: '2026-08-10T09:00:00Z',
  updatedAt: '2026-08-10T09:00:00Z',
};

let api = getMockApi();

async function renderForm() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_ADMIN} : null,
  );

  api.get.mockImplementation((url: string) => {
    if (url === '/fundos') {
      return Promise.resolve({data: FUNDOS});
    }
    if (url === '/especies') {
      return Promise.resolve({data: ESPECIES});
    }
    if (url === '/etapas-fenologicas') {
      return Promise.resolve({data: ETAPAS});
    }
    if (url === '/plagas') {
      return Promise.resolve({data: PLAGAS});
    }
    if (url === '/requerimientos/5') {
      return Promise.resolve({data: REQUERIMIENTO});
    }
    return Promise.resolve({data: []});
  });

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
    api.get.mockClear();
    api.post.mockClear();
    api.put.mockClear();
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
