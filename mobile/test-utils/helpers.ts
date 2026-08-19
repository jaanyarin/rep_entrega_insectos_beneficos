/**
 * Helpers compartidos de los tests mobile (HITO-002).
 *
 * Viven FUERA de `__tests__/` porque el testMatch por defecto de Jest incluye
 * TODOS los archivos de esa carpeta (los trataría como suite sin tests y
 * fallaría "suite must contain at least one test").
 *
 * Siguen el patrón documentado en LoginScreen.test.tsx: axios se mockea de
 * forma global en `jest.setup.js` (instancia autocontenida devuelta por
 * `axios.create`); estos helpers agregan una fábrica de JWT de prueba
 * (payload base64url ASCII, necesario para `parseToken`) y utilidades de
 * renderizado con react-test-renderer.
 */

import ReactTestRenderer from 'react-test-renderer';
import axios from 'axios';

/** Codificación base64url para texto ASCII (claims de prueba). */
/* eslint-disable no-bitwise -- manipulación de bytes base64 (requerida) */
export function asciiBase64UrlEncode(str: string): string {
  const table =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < str.length; i += 3) {
    const b1 = str.charCodeAt(i);
    const hasB2 = i + 1 < str.length;
    const hasB3 = i + 2 < str.length;
    const b2 = hasB2 ? str.charCodeAt(i + 1) : 0;
    const b3 = hasB3 ? str.charCodeAt(i + 2) : 0;
    out += table[b1 >> 2];
    out += table[((b1 & 3) << 4) | (b2 >> 4)];
    out += hasB2 ? table[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    out += hasB3 ? table[b3 & 63] : '=';
  }
  return out
    .split('+')
    .join('-')
    .split('/')
    .join('_')
    .split('=')
    .join('');
}
/* eslint-enable no-bitwise */

/** JWT de prueba con el payload indicado (claims tipados del contrato v2). */
export function makeToken(claims: Record<string, unknown>): string {
  return `header.${asciiBase64UrlEncode(JSON.stringify(claims))}.signature`;
}

/** Espera a que se resuelvan las promesas encadenadas del flujo inicial. */
export const flushPromises = () =>
  new Promise<void>(resolve => setTimeout(() => resolve(), 0));

/** Recupera la instancia axios mockeada usada por el ApiClient. */
export function getMockApi() {
  const createMock = axios.create as jest.Mock;
  const result = createMock.mock.results[0];
  if (!result) {
    throw new Error('axios.create no fue invocado (¿el mock se aplicó?)');
  }
  return result.value as {
    get: jest.Mock;
    post: jest.Mock;
    interceptors: {
      request: {use: jest.Mock};
      response: {use: jest.Mock};
    };
  };
}

/**
 * Texto plano de un nodo (children string o array con interpolación).
 * Solo se consideran nodos COMPUESTOS (type = función/objeto): react-test-
 * renderer también expone el host 'RCTText' con el mismo children, lo que
 * duplicaría los conteos si se incluyera.
 */
function textoDeNodo(node: {
  type?: unknown;
  props: {children?: unknown};
}): string {
  if (typeof node.type !== 'function' && typeof node.type !== 'object') {
    return '';
  }
  const children = node.props.children;
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children
      .filter((c: unknown) => typeof c === 'string')
      .join('');
  }
  return '';
}

/** Cantidad de nodos cuyo texto plano exacto es `text`. */
export function contarTexto(
  tree: ReactTestRenderer.ReactTestRenderer,
  text: string,
): number {
  return tree.root.findAll(node => textoDeNodo(node) === text).length;
}

/** Busca el primer nodo con `accessibilityLabel` igual a `label`. */
export function findByLabel(
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
) {
  const found = tree.root.findAll(
    node => node.props && node.props.accessibilityLabel === label,
  );
  if (found.length === 0) {
    throw new Error(`No se encontró un nodo con accessibilityLabel="${label}"`);
  }
  return found[0];
}