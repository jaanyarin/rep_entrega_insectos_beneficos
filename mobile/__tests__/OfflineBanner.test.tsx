/**
 * Tests de OfflineBanner component.
 */
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import OfflineBanner from '../src/components/OfflineBanner';

describe('OfflineBanner', () => {
  test('renderiza sin errores', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<OfflineBanner />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('contiene texto "Sin conexión"', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<OfflineBanner />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Sin conexión');
  });

  test('contiene texto de reconexión', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<OfflineBanner />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('sincronizarán');
  });
});
