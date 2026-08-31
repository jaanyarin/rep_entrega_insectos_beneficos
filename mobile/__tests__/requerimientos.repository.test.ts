/**
 * Tests de requerimientos repository (offline CRUD + outbox).
 * Mock DB singleton con Drizzle table symbols para extraer nombres.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const DRIZZLE_NAME = Symbol.for('drizzle:Name');

// Store compartido entre todas las llamadas a getDatabase()
const mockStore = new Map<string, any[]>();

function mockGetDb() {
  return {
    insert: (table: any) => {
      const tableName = table?.[DRIZZLE_NAME] ?? 'unknown';
      return {
        values: (vals: any) => ({
          then: (resolve: any) => {
            if (!mockStore.has(tableName)) { mockStore.set(tableName, []); }
            mockStore.get(tableName)!.push({...vals});
            resolve({insertId: vals.id ?? Date.now()});
          },
        }),
      };
    },
    select: () => ({
      from: (table: any) => {
        const tableName = table?.[DRIZZLE_NAME] ?? 'unknown';
        const chain = {
          _rows: [...(mockStore.get(tableName) ?? [])],
          where: (_condition: any) => chain,
          orderBy: () => chain,
          then: (resolve: any) => resolve([...chain._rows]),
        };
        return chain;
      },
    }),
    update: (table: any) => {
      const tableName = table?.[DRIZZLE_NAME] ?? 'unknown';
      let setValues: any = {};
      const updateChain = {
        set: (vals: any) => {
          setValues = vals;
          return {
            where: (_condition: any) => ({
              then: (resolve: any) => {
                const rows = mockStore.get(tableName) ?? [];
                for (const r of rows) { Object.assign(r, setValues); }
                resolve({changes: rows.length});
              },
            }),
          };
        },
        then: (resolve: any) => {
          const rows = mockStore.get(tableName) ?? [];
          for (const r of rows) { Object.assign(r, setValues); }
          resolve({changes: rows.length});
        },
      };
      return updateChain;
    },
  };
}

jest.mock('../src/db/schema', () => jest.requireActual('../src/db/schema'));
jest.mock('../src/db/database', () => ({
  getDatabase: () => mockGetDb(),
}));

import {createLocal, updateLocal, getByIdLocal, getByServerId, listLocal, countPending, markSynced, markConflict, getPendingOutbox, markOutboxCompleted, markOutboxFailed, saveFromServer} from '../src/db/repositories/requerimientos';

beforeEach(() => {
  mockStore.clear();
});

describe('requerimientos repository', () => {
  test('createLocal retorna ID negativo y crea outbox entry', async () => {
    const id = await createLocal({fecha: '2026-08-30', fundoId: 1, loteId: 10, especieId: 1, cantidad: 100}, 5);
    expect(id).toBeLessThan(0);

    const reqs = mockStore.get('requerimientos') ?? [];
    expect(reqs.length).toBe(1);
    expect(reqs[0].syncStatus).toBe('pending');

    const outbox = mockStore.get('sync_outbox') ?? [];
    expect(outbox.length).toBe(1);
    expect(outbox[0].operation).toBe('INSERT');
  });

  test('getByIdLocal retorna null si no existe', async () => {
    expect(await getByIdLocal(999)).toBeNull();
  });

  test('getByIdLocal retorna registro existente', async () => {
    mockStore.set('requerimientos', [{id: -1, serverId: null, fecha: '2026-08-30', fundoId: 1, syncStatus: 'pending'}]);
    const r = await getByIdLocal(-1);
    expect(r).not.toBeNull();
    expect(r!.id).toBe(-1);
  });

  test('getByServerId retorna null si no existe', async () => {
    expect(await getByServerId(999)).toBeNull();
  });

  test('getByServerId retorna registro existente', async () => {
    mockStore.set('requerimientos', [{id: 101, serverId: 101, syncStatus: 'synced'}]);
    const r = await getByServerId(101);
    expect(r).not.toBeNull();
    expect(r!.serverId).toBe(101);
  });

  test('listLocal retorna registros', async () => {
    mockStore.set('requerimientos', [{id: 1, syncStatus: 'synced'}, {id: 2, syncStatus: 'pending'}]);
    expect((await listLocal()).length).toBe(2);
  });

  test('countPending retorna cantidad correcta', async () => {
    mockStore.set('requerimientos', [{id: 2, syncStatus: 'pending'}, {id: 3, syncStatus: 'pending'}]);
    expect(await countPending()).toBe(2);
  });

  test('markSynced actualiza serverId y syncStatus', async () => {
    mockStore.set('requerimientos', [{id: -1, serverId: null, syncStatus: 'pending'}]);
    await markSynced(-1, 101);
    expect(mockStore.get('requerimientos')![0].serverId).toBe(101);
    expect(mockStore.get('requerimientos')![0].syncStatus).toBe('synced');
  });

  test('markConflict cambia syncStatus a conflict', async () => {
    mockStore.set('requerimientos', [{id: -1, syncStatus: 'pending'}]);
    await markConflict(-1);
    expect(mockStore.get('requerimientos')![0].syncStatus).toBe('conflict');
  });

  test('saveFromServer inserta nuevo registro', async () => {
    await saveFromServer({id: 101, fecha: '2026-08-30', fundoId: 1, loteId: 10, especieId: 1, etapaFenologicaId: null, plagaId: null, cantidad: 100, estado: 'REGISTRADO', stockDisponible: 500, observaciones: null, papelConPostura: null, sobreConCascarilla: null, fechaLiberacion: null, horaLiberacion: null, creadoPor: 5});
    const reqs = mockStore.get('requerimientos') ?? [];
    expect(reqs.length).toBe(1);
    expect(reqs[0].id).toBe(101);
    expect(reqs[0].syncStatus).toBe('synced');
  });

  test('saveFromServer actualiza existente (server-wins)', async () => {
    mockStore.set('requerimientos', [{id: 101, serverId: 101, fecha: '2026-08-29', syncStatus: 'pending'}]);
    await saveFromServer({id: 101, fecha: '2026-08-30', fundoId: 2, loteId: 20, especieId: 2, etapaFenologicaId: null, plagaId: null, cantidad: 200, estado: 'APROBADO', stockDisponible: 300, observaciones: null, papelConPostura: null, sobreConCascarilla: null, fechaLiberacion: null, horaLiberacion: null, creadoPor: 5});
    const reqs = mockStore.get('requerimientos') ?? [];
    expect(reqs.length).toBe(1);
    expect(reqs[0].fecha).toBe('2026-08-30');
    expect(reqs[0].syncStatus).toBe('synced');
  });

  test('getPendingOutbox retorna solo pending', async () => {
    mockStore.set('sync_outbox', [{id: 1, status: 'pending'}]);
    const pending = await getPendingOutbox();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe(1);
  });

  test('markOutboxCompleted cambia status', async () => {
    mockStore.set('sync_outbox', [{id: 1, status: 'pending'}]);
    await markOutboxCompleted(1);
    expect(mockStore.get('sync_outbox')![0].status).toBe('completed');
  });

  test('markOutboxFailed cambia status y guarda error', async () => {
    mockStore.set('sync_outbox', [{id: 1, status: 'pending'}]);
    await markOutboxFailed(1, 'Network error');
    expect(mockStore.get('sync_outbox')![0].status).toBe('failed');
    expect(mockStore.get('sync_outbox')![0].lastError).toBe('Network error');
  });

  test('updateLocal crea outbox entry UPDATE', async () => {
    mockStore.set('requerimientos', [{id: -1, syncStatus: 'synced'}]);
    await updateLocal(-1, {fecha: '2026-08-31', fundoId: 2, loteId: 20, especieId: 2, cantidad: 200, estado: 'PENDIENTE'});
    expect(mockStore.get('requerimientos')![0].syncStatus).toBe('pending');
    const outbox = mockStore.get('sync_outbox') ?? [];
    expect(outbox.length).toBe(1);
    expect(outbox[0].operation).toBe('UPDATE');
  });
});
