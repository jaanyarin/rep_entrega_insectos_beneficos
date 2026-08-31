/**
 * Tests del SyncManager (motor de sincronización offline→online).
 * Testea las funciones públicas. Lógica detallada de push/pull ya cubierta
 * por los repository tests y SyncManagerIntegration.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── MOCKS ─────────────────────────────────────────────────────────────────
const mockNetInfoListeners: any[] = [];

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({isConnected: true})),
    addEventListener: jest.fn((cb: any) => {
      mockNetInfoListeners.push(cb);
      return () => {
        const idx = mockNetInfoListeners.indexOf(cb);
        if (idx >= 0) { mockNetInfoListeners.splice(idx, 1); }
      };
    }),
  },
}));

// Mock all dependencies at module level using inline factories
jest.mock('../src/services/ApiClient', () => ({
  api: {post: jest.fn(() => Promise.resolve({data: {id: 101}})), put: jest.fn(() => Promise.resolve({data: {}}))},
  listarRequerimientos: jest.fn(() => Promise.resolve([])),
  listarFotosRequerimiento: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../src/db/repositories/requerimientos', () => ({
  getPendingOutbox: jest.fn(() => Promise.resolve([])),
  getByIdLocal: jest.fn(() => Promise.resolve(null)),
  markSynced: jest.fn(() => Promise.resolve(undefined)),
  markOutboxCompleted: jest.fn(() => Promise.resolve(undefined)),
  markOutboxFailed: jest.fn(() => Promise.resolve(undefined)),
  saveFromServer: jest.fn(() => Promise.resolve(undefined)),
}));

jest.mock('../src/db/repositories/photos', () => ({
  getPendingUpload: jest.fn(() => Promise.resolve([])),
  markUploaded: jest.fn(() => Promise.resolve(undefined)),
  markUploadError: jest.fn(() => Promise.resolve(undefined)),
}));

// ─── IMPORT DESPUÉS DE MOCKS ──────────────────────────────────────────────
import {startSyncListener, onSyncCallbacks, forceSyncNow} from '../src/db/sync/SyncManager';

beforeEach(() => {
  jest.clearAllMocks();
  mockNetInfoListeners.length = 0;
});

describe('SyncManager - startSyncListener', () => {
  test('llama a NetInfo.fetch', () => {
    startSyncListener();
    const NetInfo = require('@react-native-community/netinfo').default;
    expect(NetInfo.fetch).toHaveBeenCalled();
  });

  test('suscribe a cambios de conectividad', () => {
    startSyncListener();
    const NetInfo = require('@react-native-community/netinfo').default;
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });
});

describe('SyncManager - onSyncCallbacks', () => {
  test('retorna función de unsubscribe', () => {
    const unsub = onSyncCallbacks({});
    expect(typeof unsub).toBe('function');
    unsub();
  });
});

describe('SyncManager - forceSyncNow', () => {
  test('retorna resultados cuando no hay outbox pendiente', async () => {
    const result = await forceSyncNow();
    expect(result).not.toBeNull();
    expect(result!.requerimientosSincronizados).toBe(0);
    expect(result!.fotosSubidas).toBe(0);
    expect(result!.errores).toBe(0);
  });

  test('onSyncComplete se ejecuta tras sync exitoso', async () => {
    const onSyncComplete = jest.fn();
    onSyncCallbacks({onSyncComplete});

    await forceSyncNow();
    expect(onSyncComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        requerimientosSincronizados: expect.any(Number),
        fotosSubidas: expect.any(Number),
        errores: expect.any(Number),
      }),
    );
  });

  test('forceSync retorna null si ya está sincronizando', async () => {
    const SyncManager = require('../src/db/sync/SyncManager');
    // Make processPendingSync slow by having getPendingOutbox never resolve
    const requerimientosRepo = require('../src/db/repositories/requerimientos');
    requerimientosRepo.getPendingOutbox.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const p1 = forceSyncNow(); // Starts sync, never finishes
    const result = await forceSyncNow(); // Should return null (already syncing)
    expect(result).toBeNull();

    // Cleanup: restore mock so p1 can complete
    requerimientosRepo.getPendingOutbox.mockResolvedValue([]);
    // Need to let p1 finish or force exit
  });
});
