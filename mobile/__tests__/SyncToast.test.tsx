/**
 * Tests de SyncToast component.
 */
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';

// Mock SyncManager
let _cb: any = null;
jest.mock('../src/db/sync/SyncManager', () => ({
  onSyncCallbacks: jest.fn((cb: any) => { _cb = cb; return () => { _cb = null; }; }),
}));

import SyncToast from '../src/components/SyncToast';

describe('SyncToast', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  test('renderiza sin errores inicialmente', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<SyncToast />); });
    // Puede ser null (return null cuando no visible)
    expect(tree).toBeTruthy();
  });

  test('aparece cuando sync completa con cambios reales', async () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<SyncToast />); });

    act(() => {
      _cb.onSyncComplete({requerimientosSincronizados: 3, fotosSubidas: 1, errores: 0});
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Sincronizado');
    expect(json).toContain('3');
  });

  test('muestra fotos subidas', async () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<SyncToast />); });

    act(() => {
      _cb.onSyncComplete({requerimientosSincronizados: 0, fotosSubidas: 2, errores: 0});
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('2');
  });

  test('NO aparece cuando sync completa sin cambios', async () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<SyncToast />); });

    act(() => {
      _cb.onSyncComplete({requerimientosSincronizados: 0, fotosSubidas: 0, errores: 0});
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).not.toContain('Sincronizado');
  });
});
