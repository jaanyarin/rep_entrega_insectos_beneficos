/**
 * ProgramacionScreen — Screen 4: Listado de Programaciones por Mes (MOD-17).
 *
 * Approach (igual que CatalogosScreen.test.tsx): react-test-renderer +
 * AuthProvider + mock de Keychain (JWT fabricado con makeToken) + mock axios
 * (getMockApi) para listarProgramaciones (GET /programaciones?anio&mes).
 * `esDiaEditable` se fuerza a `true` para determinismo (el aviso de edición
 * es solo informativo aquí).
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AuthProvider} from '../src/context/AuthContext';
import ProgramacionScreen from '../src/screens/ProgramacionScreen';
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

// Aviso "solo lunes y jueves" es informativo en el listado: fijo editable.
jest.mock('../src/utils/programacion', () => {
  const actual = jest.requireActual('../src/utils/programacion');
  return {...actual, esDiaEditable: jest.fn(() => true)};
});

const PROGRAMACIONES = [
  {
    id: 1,
    anio: 2026,
    mes: 8,
    especieId: 1,
    especie: 'Chrysopa sp.',
    fechaRegistro: '2026-08-18T10:00:00Z',
    fechaPublicacion: null as string | null,
    estado: 'EN_PROCESO',
    stockInicialBase: 5000,
    totalMes: 12000,
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
        estado: 'EN_PROCESO',
      },
    ],
  },
  {
    id: 2,
    anio: 2026,
    mes: 8,
    especieId: 2,
    especie: 'Cryptolaemus',
    fechaRegistro: '2026-08-18T11:00:00Z',
    fechaPublicacion: '2026-08-18T11:30:00Z' as string | null,
    estado: 'PUBLICADO',
    stockInicialBase: 5000,
    totalMes: 9000,
    detalles: [],
  },
];

const TOKEN_ADMIN = makeToken({
  sub: '9',
  groups: ['Admin'],
  rolId: 2,
  nombre: 'Ana Admin',
  dni: '87654321',
  passwordResetRequired: false,
});

const TOKEN_USUARIO = makeToken({
  sub: '9',
  groups: ['Usuario'],
  rolId: 3,
  nombre: 'Persona Test',
  dni: '12345678',
  passwordResetRequired: false,
});

let api = getMockApi();
const mockNavigate = jest.fn();

async function renderProgramacion(token: string, lista = PROGRAMACIONES) {
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
      return Promise.resolve({data: lista});
    }
    return Promise.resolve({data: []});
  });

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <ProgramacionScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

describe('ProgramacionScreen — listado por mes (Admin)', () => {
  beforeEach(async () => {
    await clearToken();
    mockNavigate.mockClear();
    api.get.mockClear();
  });

  test('muestra el selector de mes/año y la galería con Ver/Editar', async () => {
    const tree = await renderProgramacion(TOKEN_ADMIN);
    await act(async () => {
      await flushPromises();
    });

    expect(findByLabel(tree, 'Mes anterior')).toBeTruthy();
    expect(findByLabel(tree, 'Mes siguiente')).toBeTruthy();
    expect(contarTexto(tree, 'Chrysopa sp.')).toBeGreaterThan(0);
    expect(contarTexto(tree, 'Cryptolaemus')).toBeGreaterThan(0);
    // Total del mes calculado y mostrado en millares.
    expect(contarTexto(tree, 'Total del mes: 12000 millares')).toBe(1);
    // Acciones por registro.
    expect(findByLabel(tree, 'Ver Chrysopa sp.')).toBeTruthy();
    expect(findByLabel(tree, 'Editar Chrysopa sp.')).toBeTruthy();
    expect(findByLabel(tree, 'Editar Cryptolaemus')).toBeTruthy();
  });

  test('cambiar de mes dispara GET /programaciones con el nuevo periodo', async () => {
    const tree = await renderProgramacion(TOKEN_ADMIN);
    await act(async () => {
      await flushPromises();
    });

    api.get.mockClear();
    await act(async () => {
      findByLabel(tree, 'Mes siguiente').props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(api.get).toHaveBeenCalledWith('/programaciones', {params: {anio: 2026, mes: 9}});
  });

  test('Ver abre el modal de solo lectura con las semanas programadas', async () => {
    const tree = await renderProgramacion(TOKEN_ADMIN);
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Ver Chrysopa sp.').props.onPress();
    });

    expect(contarTexto(tree, 'Programación del mes Agosto 2026')).toBe(1);
    expect(findByLabel(tree, 'Cerrar detalle de programación')).toBeTruthy();
  });

  test('Editar navega a ProgramacionEdicion con id/anio/mes', async () => {
    const tree = await renderProgramacion(TOKEN_ADMIN);
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Editar Chrysopa sp.').props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ProgramacionEdicion', {
      id: 1,
      anio: 2026,
      mes: 8,
    });
  });

  test('Nuevo navega a ProgramacionEdicion en modo crear (anio/mes actuales)', async () => {
    const tree = await renderProgramacion(TOKEN_ADMIN);
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Crear nueva programación').props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ProgramacionEdicion', {
      modo: 'crear',
      anio: 2026,
      mes: 8,
    });
  });

  test('sin programaciones muestra EmptyState', async () => {
    const tree = await renderProgramacion(TOKEN_ADMIN, []);
    await act(async () => {
      await flushPromises();
    });

    expect(contarTexto(tree, 'Sin programaciones en este mes')).toBe(1);
  });

  test('pull-to-refresh: RefreshControl presente y onRefresh recarga', async () => {
    const tree = await renderProgramacion(TOKEN_ADMIN);
    await act(async () => {
      await flushPromises();
    });

    const refresh = tree.root.findAllByType(RefreshControl);
    expect(refresh.length).toBe(1);

    api.get.mockClear();
    await act(async () => {
      refresh[0].props.onRefresh();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(api.get).toHaveBeenCalledWith('/programaciones', {
      params: {anio: 2026, mes: 8},
    });
  });
});

describe('ProgramacionScreen — acceso restringido', () => {
  beforeEach(async () => {
    await clearToken();
    api.get.mockClear();
  });

  test('usuario común (no admin) no ve la galería', async () => {
    const tree = await renderProgramacion(TOKEN_USUARIO);
    await act(async () => {
      await flushPromises();
    });

    expect(contarTexto(tree, 'Acceso restringido')).toBe(1);
    expect(() => findByLabel(tree, 'Editar Chrysopa sp.')).toThrow();
  });
});