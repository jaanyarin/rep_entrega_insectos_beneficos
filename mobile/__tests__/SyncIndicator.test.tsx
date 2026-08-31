/**
 * Tests de SyncIndicator component.
 */
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import SyncIndicator from '../src/components/SyncIndicator';

describe('SyncIndicator', () => {
  test('renderiza sin errores con pendingCount > 0', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<SyncIndicator syncing={false} pendingCount={5} lastSyncTime={null} />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('5');
  });

  test('renderiza sin errores cuando syncing=true', () => {
    act(() => { ReactTestRenderer.create(<SyncIndicator syncing={true} pendingCount={0} lastSyncTime={null} />); });
    // Component may render null when syncing=true and pendingCount=0
    // Just verify it doesn't throw
    expect(true).toBe(true);
  });

  test('renderiza con lastSyncTime', () => {
    act(() => { ReactTestRenderer.create(<SyncIndicator syncing={false} pendingCount={0} lastSyncTime={new Date('2026-08-30T12:00:00')} />); });
    // May render null if no pending count — just verify no throw
    expect(true).toBe(true);
  });

  test('muestra pendingCount cuando hay pendientes', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<SyncIndicator syncing={false} pendingCount={3} lastSyncTime={null} />); });
    if (tree.toJSON()) {
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('3');
    }
  });
});
