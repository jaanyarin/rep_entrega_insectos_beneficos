/**
 * Home por perfil (ADR-A002 D-AUTH-2 / ADR-A003 D-AUTH2-1, hallazgo F2):
 *  - Usuario      → 2 botones: Nuevo Requerimiento / Historial de Requerimiento.
 *  - Admin        → 2 botones: Programación / Solicitud de Requerimientos.
 *  - Super Admin  → 2 divs: [Programación + Solicitud] y [Nuevo + Historial]
 *                   (+ "Configurar servidor").
 *  - Logout limpia la sesión (Keychain) y desmonta el Home.
 * Literales exactos con espacios: 'Super Admin' | 'Admin' | 'Usuario'.
 *
 * Approach (react-test-renderer + mocks globales):
 *  - `useNavigation` se mockea (solo navegación declarada en props/a11y);
 *    así el árbol NO incluye headers ni pantallas inactivas del native-stack
 *    (que en Jest duplican textos) y los conteos son exactos.
 *  - Se limpia la cache de token de ApiClient en beforeEach: `getToken()`
 *    cachea en memoria y un test anterior dejaría un rol fijo en los demás.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import * as Keychain from 'react-native-keychain';
import {AuthProvider} from '../src/context/AuthContext';
import HomeScreen from '../src/screens/HomeScreen';
import {clearToken} from '../src/services/ApiClient';
import {contarTexto, findByLabel, flushPromises, makeToken} from '../test-utils/helpers';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({navigate: jest.fn()})),
  };
});

const ROLES: Array<{
  literal: 'Usuario' | 'Admin' | 'Super Admin';
  rolId: number;
}> = [
  {literal: 'Usuario', rolId: 3},
  {literal: 'Admin', rolId: 2},
  {literal: 'Super Admin', rolId: 1},
];

function tokenParaRol(literal: string, rolId: number): string {
  return makeToken({
    sub: '9',
    groups: [literal],
    rolId,
    nombre: 'Persona Test',
    dni: '12345678',
    passwordResetRequired: false,
  });
}

async function renderHome(literal: string, rolId: number) {
  (Keychain.getGenericPassword as jest.Mock).mockImplementation(
    (options?: {service?: string}) =>
      options?.service === 'accessToken'
        ? {password: tokenParaRol(literal, rolId)}
        : null,
  );

  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AuthProvider>
        <HomeScreen />
      </AuthProvider>,
    );
    await flushPromises();
  });
  return tree;
}

/** Contenedores "div" del menú: nodos COMPUESTOS con styles.div. */
function contarDivs(tree: ReactTestRenderer.ReactTestRenderer): number {
  return tree.root.findAll(node => {
    if (typeof node.type !== 'function' && typeof node.type !== 'object') {
      return false;
    }
    const style = node.props && node.props.style;
    return (
      Array.isArray(style) &&
      style.some(
        (s: unknown) =>
          !!s &&
          typeof s === 'object' &&
          (s as {borderRadius?: number}).borderRadius === 12 &&
          (s as {borderWidth?: number}).borderWidth === 1,
      )
    );
  }).length;
}

describe('HomeScreen (menú por perfil)', () => {
  beforeEach(async () => {
    await clearToken(); // cache en memoria de ApiClient (getToken) + Keychain
  });

  test.each(ROLES)('muestra los botones EXACTOS de $literal', async ({literal, rolId}) => {
    const tree = await renderHome(literal, rolId);

    expect(contarTexto(tree, `Bienvenido(a), Persona Test`)).toBeGreaterThan(0);
    expect(contarTexto(tree, `Perfil: ${literal}`)).toBeGreaterThan(0);

    if (literal === 'Usuario') {
      expect(contarTexto(tree, 'Nuevo Requerimiento')).toBe(1);
      expect(contarTexto(tree, 'Historial de Requerimiento')).toBe(1);
      expect(contarTexto(tree, 'Programación')).toBe(0);
      expect(contarTexto(tree, 'Solicitud de Requerimientos')).toBe(0);
      expect(contarTexto(tree, 'Configurar servidor')).toBe(0);
      expect(contarDivs(tree)).toBe(1);
    }

    if (literal === 'Admin') {
      expect(contarTexto(tree, 'Programación')).toBe(1);
      expect(contarTexto(tree, 'Solicitud de Requerimientos')).toBe(1);
      expect(contarTexto(tree, 'Nuevo Requerimiento')).toBe(0);
      expect(contarTexto(tree, 'Historial de Requerimiento')).toBe(0);
      expect(contarTexto(tree, 'Configurar servidor')).toBe(0);
      expect(contarDivs(tree)).toBe(1);
    }

    if (literal === 'Super Admin') {
      // 2 divs: ambos grupos completos.
      expect(contarTexto(tree, 'Programación')).toBe(1);
      expect(contarTexto(tree, 'Solicitud de Requerimientos')).toBe(1);
      expect(contarTexto(tree, 'Nuevo Requerimiento')).toBe(1);
      expect(contarTexto(tree, 'Historial de Requerimiento')).toBe(1);
      expect(contarTexto(tree, 'Configurar servidor')).toBe(1);
      expect(contarDivs(tree)).toBe(2);
    }
  });

  test('logout limpia el token y desmonta el Home', async () => {
    const tree = await renderHome('Usuario', 3);
    expect(contarTexto(tree, 'Bienvenido(a), Persona Test')).toBeGreaterThan(0);

    // HITO-003 delta: el botón "Cerrar sesión" abre el ConfirmDialog
    // (acción destructiva requiere confirmación, §17) en lugar de cerrar
    // sesión directamente (contrato funcional actualizado — Ley 5).
    await act(async () => {
      findByLabel(tree, 'Cerrar sesión').props.onPress();
    });
    expect(contarTexto(tree, '¿Deseas cerrar la sesión actual?')).toBeGreaterThan(0);

    await act(async () => {
      findByLabel(tree, 'Confirmar cierre de sesión').props.onPress();
      await flushPromises();
    });

    // Sesión limpiada: token borrado del Keychain y Home desmontado
    // (el flujo anónimo de ServerCheck/Login se cubre en App.test.tsx).
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'accessToken',
    });
    expect(contarTexto(tree, 'Cerrar sesión')).toBe(0);
    expect(contarTexto(tree, 'Bienvenido(a), Persona Test')).toBe(0);
  });
});