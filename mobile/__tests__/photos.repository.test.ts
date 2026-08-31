/**
 * Tests de photos repository (offline photo management).
 * Mock DB singleton con Drizzle table symbols.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const DRIZZLE_NAME = Symbol.for('drizzle:Name');
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
          then: (resolve: any) => resolve([...chain._rows]),
        };
        return chain;
      },
    }),
    update: (table: any) => {
      const tableName = table?.[DRIZZLE_NAME] ?? 'unknown';
      let setValues: any = {};
      return {
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
      };
    },
    delete: (table: any) => {
      const tableName = table?.[DRIZZLE_NAME] ?? 'unknown';
      return {
        where: (_condition: any) => ({
          then: (resolve: any) => {
            mockStore.set(tableName, []);
            resolve({changes: 1});
          },
        }),
      };
    },
  };
}

jest.mock('../src/db/schema', () => jest.requireActual('../src/db/schema'));
jest.mock('../src/db/database', () => ({
  getDatabase: () => mockGetDb(),
}));

import {validatePhoto, saveLocal, countByRequerimiento, listByRequerimiento, getPendingUpload, getById, markUploaded, markUploadError, remove, removeAllByRequerimiento} from '../src/db/repositories/photos';

beforeEach(() => { mockStore.clear(); });

describe('validatePhoto', () => {
  test('acepta JPG', () => expect(validatePhoto({type: 'image/jpeg', fileSize: 1024}).valid).toBe(true));
  test('acepta PNG', () => expect(validatePhoto({type: 'image/png', fileSize: 2048}).valid).toBe(true));
  test('rechaza GIF', () => { const r = validatePhoto({type: 'image/gif'}); expect(r.valid).toBe(false); expect(r.error).toContain('JPG y PNG'); });
  test('rechaza >5MB', () => { const r = validatePhoto({type: 'image/jpeg', fileSize: 6*1024*1024}); expect(r.valid).toBe(false); expect(r.error).toContain('5 MB'); });
  test('acepta sin fileSize', () => expect(validatePhoto({type: 'image/jpeg'}).valid).toBe(true));
  test('rechaza sin type', () => expect(validatePhoto({fileSize: 1024}).valid).toBe(false));
});

describe('photos repository', () => {
  test('saveLocal guarda y retorna success', async () => {
    const r = await saveLocal(1, 'file:///tmp/foto.jpg', {type: 'image/jpeg', fileSize: 1024, fileName: 'foto.jpg'});
    expect(r.success).toBe(true);
    expect(r.fotoId).toBeDefined();
    const fotos = mockStore.get('fotos_pendientes') ?? [];
    expect(fotos.length).toBe(1);
    expect(fotos[0].syncStatus).toBe('pending');
  });

  test('saveLocal rechaza formato inválido', async () => {
    const r = await saveLocal(1, 'file:///tmp/foto.gif', {type: 'image/gif'});
    expect(r.success).toBe(false);
    expect(r.error).toContain('JPG y PNG');
  });

  test('saveLocal rechaza >2 fotos por requerimiento', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, requerimientoLocalId: 1}, {id: 2, requerimientoLocalId: 1}]);
    const r = await saveLocal(1, 'file:///tmp/foto3.jpg', {type: 'image/jpeg'});
    expect(r.success).toBe(false);
    expect(r.error).toContain('Máximo 2 fotos');
  });

  test('countByRequerimiento retorna cantidad correcta', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, requerimientoLocalId: 1}, {id: 2, requerimientoLocalId: 1}]);
    expect(await countByRequerimiento(1)).toBe(2);
  });

  test('listByRequerimiento retorna fotos', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, requerimientoLocalId: 1}]);
    expect((await listByRequerimiento(1)).length).toBe(1);
  });

  test('getPendingUpload retorna pending', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, syncStatus: 'pending'}]);
    expect((await getPendingUpload()).length).toBe(1);
  });

  test('getById retorna null si no existe', async () => { expect(await getById(999)).toBeNull(); });
  test('getById retorna foto existente', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, uri: 'foto.jpg'}]);
    expect((await getById(1))!.id).toBe(1);
  });

  test('markUploaded actualiza status', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, syncStatus: 'pending'}]);
    await markUploaded(1, 101, 'https://server/foto.jpg');
    expect(mockStore.get('fotos_pendientes')![0].syncStatus).toBe('uploaded');
    expect(mockStore.get('fotos_pendientes')![0].serverFotoId).toBe(101);
  });

  test('markUploadError cambia a error', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, syncStatus: 'pending'}]);
    await markUploadError(1);
    expect(mockStore.get('fotos_pendientes')![0].syncStatus).toBe('error');
  });

  test('remove elimina foto', async () => {
    mockStore.set('fotos_pendientes', [{id: 1}]);
    await remove(1);
    expect(mockStore.get('fotos_pendientes').length).toBe(0);
  });

  test('removeAllByRequerimiento elimina todas', async () => {
    mockStore.set('fotos_pendientes', [{id: 1, requerimientoLocalId: 1}, {id: 2, requerimientoLocalId: 1}, {id: 3, requerimientoLocalId: 2}]);
    await removeAllByRequerimiento(1);
    expect(mockStore.get('fotos_pendientes').length).toBe(0);
  });
});
