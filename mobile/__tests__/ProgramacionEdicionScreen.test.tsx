/**
 * ProgramacionEdicionScreen — Screen 5: Edición de Programación (MOD-17).
 *
 * Approach (igual que CatalogosScreen.test.tsx): react-test-renderer +
 * AuthProvider + mock de Keychain (JWT fabricado con makeToken) + mock axios
 * (getMockApi) para listarEspecies (GET /especies), obtenerDetalle
 * (GET /programaciones/{id}), listarProgramaciones (GET /programaciones) y el
 * flujo Enviar stock (PUT + POST /programaciones/{id}/publicar).
 * `useRoute` se mockea con los params de navegación y `esDiaEditable` se
 * fuerza a `true` por defecto (RF-147/148 se cubre con un test dedicado a
 * día no editable, que apaga el mock).
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {AuthProvider} from '../src/context/AuthContext';
import ProgramacionEdicionScreen from '../src/screens/ProgramacionEdicionScreen';
import {clearToken} from '../src/services/ApiClient';
import {esDiaEditable} from '../src/utils/programacion';
import {
  contarTexto,
  findByLabel,
  flushPromises,
  getMockApi,
  makeToken,
} from '../test-utils/helpers';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({goBack: mockGoBack})),
    useRoute: jest.fn(() => ({
      params: {id: 7, anio: 2026, mes: 8},
    })),
  };
});

jest.mock('../src/utils/programacion', () => {
  const actual = jest.requireActual('../src/utils/programacion');
  return {...actual, esDiaEditable: jest.fn(() => true)};
});

const ESPECIES = [
  {id: 1, nombre: 'Chrysopa sp.', estado: 'ACTIVO'},
  {id: 2, nombre: 'Cryptolaemus', estado: 'ACTIVO'},
];

const DETALLE_AGOSTO = {
  id: 7,
  anio: 2026,
  mes: 8,
  especieId: 1,
  especie: 'Chrysopa sp.',
  fechaRegistro: '2026-08-18T10:00:00Z',
  fechaPublicacion: null,
  estado: 'EN_PROCESO',
  stockInicialBase: 5000,
  totalMes: 9000,
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
    {
      id: 12,
      semana: 2,
      fecha: '2026-08-10T00:00:00Z',
      stockInicial: 2000,
      papelConPostura: 1000,
      sobreConCascarilla: 500,
      total: 1500,
      stockFinal: 500,
      estado: 'EN_PROCESO',
    },
  ],
};

const DETALLE_SETIEMBRE = {
  id: 8,
  anio: 2026,
  mes: 9,
  especieId: 1,
  especie: 'Chrysopa sp.',
  fechaRegistro: '2026-09-01T10:00:00Z',
  fechaPublicacion: null,
  estado: 'EN_PROCESO',
  stockInicialBase: 5000,
  totalMes: 0,
  detalles: [],
};

const TOKEN_ADMIN = makeToken({
  sub: '9',
  groups: ['Admin'],
  rolId: 2,
  nombre: 'Ana Admin',
  dni: '87654321',
  passwordResetRequired: false,
});

let api = getMockApi();

async function renderEdicion() {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken' ? {password: TOKEN_ADMIN} : null,
  );

  api.get.mockImplementation((url: string, config?: {params?: {anio?: number; mes?: number}}) => {
    if (url === '/especies') {
      return Promise.resolve({data: ESPECIES});
    }
    if (url === '/programaciones/7') {
      return Promise.resolve({data: DETALLE_AGOSTO});
    }
    if (url === '/programaciones/8') {
      return Promise.resolve({data: DETALLE_SETIEMBRE});
    }
    if (url === '/programaciones') {
      const lista =
        config?.params?.mes === 9 ? [DETALLE_SETIEMBRE] : [DETALLE_AGOSTO];
      return Promise.resolve({data: lista});
    }
    return Promise.resolve({data: []});
  });

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <ProgramacionEdicionScreen />
      </AuthProvider>,
    );
    await flushPromises();
    await flushPromises();
  });
  return tree;
}

describe('ProgramacionEdicionScreen — edición (Admin)', () => {
  beforeEach(async () => {
    await clearToken();
    api.get.mockClear();
    api.put.mockClear();
    api.post.mockClear();
    mockGoBack.mockClear();
    (esDiaEditable as unknown as jest.Mock).mockReturnValue(true);
  });

  test('carga el detalle (GET /programaciones/7) y muestra la tabla semanal', async () => {
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    expect(api.get).toHaveBeenCalledWith('/programaciones/7');
    expect(contarTexto(tree, 'Papel')).toBeGreaterThan(0);
    expect(contarTexto(tree, 'Sobre')).toBeGreaterThan(0);
    expect(findByLabel(tree, 'Papel semana 1')).toBeTruthy();
    expect(findByLabel(tree, 'Papel semana 2')).toBeTruthy();
    expect(findByLabel(tree, 'Sobre semana 2')).toBeTruthy();
    expect(findByLabel(tree, 'Enviar stock')).toBeTruthy();
  });

  test('el filtro de especie muestra el catálogo', async () => {
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    expect(findByLabel(tree, 'Especie Chrysopa sp.')).toBeTruthy();
    expect(findByLabel(tree, 'Especie Cryptolaemus')).toBeTruthy();
  });

  test('precarga papel/sobre desde el detalle', async () => {
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    const papelSemana1 = findByLabel(tree, 'Papel semana 1');
    const sobreSemana2 = findByLabel(tree, 'Sobre semana 2');
    expect(papelSemana1.props.value).toBe('2000');
    expect(sobreSemana2.props.value).toBe('500');
  });

  test('Enviar stock hace PUT + POST /publicar y muestra confirmación', async () => {
    api.put.mockResolvedValue({data: DETALLE_AGOSTO});
    api.post.mockResolvedValue({
      data: {mensaje: 'Programación publicada exitosamente.'},
    });
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      findByLabel(tree, 'Enviar stock').props.onPress();
    });
    await act(async () => {
      await flushPromises();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(api.put).toHaveBeenCalledWith(
      '/programaciones/7',
      expect.objectContaining({
        stockInicialBase: 5000,
        detalles: expect.any(Array),
      }),
    );
    expect(api.post).toHaveBeenCalledWith('/programaciones/7/publicar');
    expect(contarTexto(tree, 'Programación publicada exitosamente.')).toBe(1);
  });

  test('cambiar de mes recarga la programación del periodo', async () => {
    const tree = await renderEdicion();
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
    await act(async () => {
      await flushPromises();
    });

    expect(api.get).toHaveBeenCalledWith('/programaciones', {
      params: {anio: 2026, mes: 9},
    });
    expect(api.get).toHaveBeenCalledWith('/programaciones/8');
  });

  test('día no editable deshabilita el botón Enviar stock', async () => {
    (esDiaEditable as unknown as jest.Mock).mockReturnValue(false);
    const tree = await renderEdicion();
    await act(async () => {
      await flushPromises();
    });

    const boton = findByLabel(tree, 'Enviar stock');
    expect(boton.props.disabled).toBe(true);
    expect(
      contarTexto(
        tree,
        'La edición solo está permitida los lunes y jueves de 00:00 a 23:59.',
      ),
    ).toBe(1);
  });
});