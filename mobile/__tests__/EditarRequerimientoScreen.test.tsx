/**
 * EditarRequerimientoScreen — Screen 13: Edición de Requerimiento (user)
 * (MOD-18 / RF-182..185 / RN-035..036).
 *
 * Approach (igual que ProgramacionEdicionScreen.test.tsx): react-test-renderer
 * + mock de Keychain (JWT no necesario porque la pantalla no usa useAuth) +
 * mock axios (getMockApi) para el detalle (GET /requerimientos/{id}), el stock
 * (GET /programaciones/{especieId}/stock) y los catálogos (GET /fundos,
 * /especies, /etapas-fenologicas, /plagas).
 *
 * Cubre RN-035: la alerta permanente de 30 h se muestra cuando el estado es
 * RECIBIDO y transcurrieron más de 30 h desde el último cambio de estado.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import EditarRequerimientoScreen from '../src/screens/EditarRequerimientoScreen';
import {clearToken} from '../src/services/ApiClient';
import {
  flushPromises,
  getMockApi,
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

const TOKEN_USUARIO = makeToken({
  sub: '5',
  groups: ['Usuario'],
  rolId: 3,
  nombre: 'Sonia Sanidad',
  dni: '12345678',
  passwordResetRequired: false,
});

const FUNDOS = [{id: 1, nombre: 'Fundo Norte', estado: true}];
const ESPECIES = [{id: 1, nombre: 'Chrysopa sp.', estado: true}];
const ETAPAS = [{id: 1, nombre: 'Emergencia', estado: true}];
const PLAGAS = [{id: 1, nombre: 'Pulga', estado: true}];

/** Requerimiento base con timestamps relativos a `now` (para RN-035). */
function requerimientoBase({updatedAt}: {updatedAt: string}) {
  return {
    id: 4,
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
    estado: 'RECIBIDO',
    stockDisponible: 30,
    fechaLiberacion: '2026-08-10T10:00:00Z',
    horaLiberacion: '10:00',
    observaciones: null,
    papelConPostura: null,
    sobreConCascarilla: null,
    creadoPor: 5,
    createdAt: updatedAt,
    updatedAt,
  };
}

let api = getMockApi();
/** Requerimiento devuelto por GET /requerimientos/4 (mutable por test). */
let requerimientoActual = requerimientoBase({
  updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
});

async function renderEdicion() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_USUARIO} : null,
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
    if (url === '/requerimientos/4') {
      return Promise.resolve({data: requerimientoActual});
    }
    if (url === '/programaciones/1/stock') {
      return Promise.resolve({data: {stock: 30}});
    }
    return Promise.resolve({data: []});
  });

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
    api.get.mockClear();
    api.put.mockClear();
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
