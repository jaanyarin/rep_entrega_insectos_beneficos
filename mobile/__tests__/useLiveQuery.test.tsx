/**
 * Tests de useLiveQuery hook.
 * Usa react-test-renderer + act() (sin @testing-library).
 */
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {useLiveQuery} from '../src/db/hooks/useLiveQuery';
import {getDatabase} from '../src/db/database';

jest.mock('../src/db/database', () => ({
  getDatabase: jest.fn(),
}));

// Helper: componente que usa el hook y expone su estado
function HookTest({queryFn, deps}: {queryFn: any; deps: any[]}) {
  const {data, loading, error} = useLiveQuery(queryFn, deps);
  return (
    <>
      <>{loading ? 'loading-true' : 'loading-false'}</>
      <>{String(data.length)}</>
      <>{error ?? 'no-error'}</>
    </>
  );
}

function makeDb(data: any[], shouldError = false) {
  return {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        if (shouldError) { return Promise.reject(new Error('DB error')); }
        return Promise.resolve(data);
      }),
    }),
  };
}

describe('useLiveQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza sin errores', () => {
    (getDatabase as jest.Mock).mockReturnValue(makeDb([]));
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest queryFn={async (db: any) => { const r = db.select(); return r.from(); }} deps={[]} />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('retorna loading true inicialmente', async () => {
    (getDatabase as jest.Mock).mockReturnValue(makeDb([]));
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest queryFn={async (db: any) => { const r = db.select(); return r.from(); }} deps={[]} />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('loading-true');
  });

  test('retorna data después de ejecutar query', async () => {
    const mockData = [{id: 1, name: 'test'}];
    (getDatabase as jest.Mock).mockReturnValue(makeDb(mockData));
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest queryFn={async (db: any) => { const r = db.select(); return r.from(); }} deps={[]} />); });
    await act(async () => { await new Promise<void>(r => setTimeout(r, 100)); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('loading-false');
    expect(json).toContain('1'); // data.length
  });

  test('captura errores de query', async () => {
    (getDatabase as jest.Mock).mockReturnValue(makeDb([], true));
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest queryFn={async (db: any) => { const r = db.select(); return r.from(); }} deps={[]} />); });
    await act(async () => { await new Promise<void>(r => setTimeout(r, 100)); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('DB error');
  });

  test('retorna data=[] inicialmente', async () => {
    (getDatabase as jest.Mock).mockReturnValue(makeDb([{id: 1}]));
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest queryFn={async (db: any) => { const r = db.select(); return r.from(); }} deps={[]} />); });
    // Primer render: data=[] antes de que se resuelva
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('0'); // data.length = 0
  });
});
