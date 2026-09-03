/**
 * db/sync/SyncManager.ts — Motor de sincronización offline→online.
 *
 * Patrón outbox:
 * 1. Al reconectar (NetInfo) → processPendingSync()
 * 2. Procesa sync_outbox: INSERT → POST, UPDATE → PUT al servidor
 * 3. Procesa fotos_pendientes pendientes de upload
 * 4. Reporta progreso vía callbacks
 *
 * Singleton: una sola instancia global accesible vía `syncManager`.
 * startSyncListener() inicializa la escucha de conectividad al arrancar.
 */

import NetInfo, {type NetInfoState} from '@react-native-community/netinfo';
import {
  api,
  listarRequerimientos,
  listarFotosRequerimiento,
} from '../../services/ApiClient';
import * as requerimientosRepo from '../repositories/requerimientos';
import * as photosRepo from '../repositories/photos';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface SyncResults {
  requerimientosSincronizados: number;
  despachosSincronizados: number;
  recepcionesSincronizadas: number;
  liberacionesSincronizadas: number;
  fotosSubidas: number;
  errores: number;
}

export interface SyncCallbacks {
  onSyncStart?: () => void;
  onSyncProgress?: (current: number, total: number) => void;
  onSyncComplete?: (results: SyncResults) => void;
  onSyncError?: (error: string) => void;
}

// ─── CONSTANTES ────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 3;

// ─── SINGLETON ─────────────────────────────────────────────────────────────

let _instance: SyncManagerImpl | null = null;

function getInstance(): SyncManagerImpl {
  if (!_instance) {
    _instance = new SyncManagerImpl();
  }
  return _instance;
}

/**
 * Inicializa la escucha de conectividad.
 * Llamar una sola vez al arrancar la app.
 */
export function startSyncListener(): void {
  const instance = getInstance();
  instance.startListening();
}

/**
 * Registra callbacks para escuchar eventos de sync.
 */
export function onSyncCallbacks(callbacks: SyncCallbacks): () => void {
  return getInstance().registerCallbacks(callbacks);
}

/**
 * Fuerza una sincronización manual (si está online).
 */
export async function forceSyncNow(): Promise<SyncResults | null> {
  return getInstance().forceSync();
}

// ─── IMPLEMENTACIÓN ────────────────────────────────────────────────────────

class SyncManagerImpl {
  private _isSyncing = false;
  private _unsubscribe: (() => void) | null = null;
  private _callbacks: SyncCallbacks = {};
  private _previousOnline = true;

  /**
   * Registra callbacks y retorna función para cancelar la suscripción.
   */
  registerCallbacks(callbacks: SyncCallbacks): () => void {
    this._callbacks = {...this._callbacks, ...callbacks};
    return () => {
      this._callbacks = {};
    };
  }

  /**
   * Inicia la escucha de cambios de conectividad via NetInfo.
   */
  startListening(): void {
    // Verificar estado actual
    NetInfo.fetch().then((state: NetInfoState) => {
      this._previousOnline = state.isConnected ?? false;
    });

    // Escuchar cambios
    this._unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = state.isConnected ?? false;
      const wasOffline = !this._previousOnline;
      this._previousOnline = isOnline;

      // Al reconectar (offline → online): lanzar sync
      if (isOnline && wasOffline) {
        this.processPendingSync().catch(() => {
          // Error ya manejado internamente
        });
      }
    });
  }

  /**
   * Detiene la escucha de conectividad.
   */
  stopListening(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  /**
   * Fuerza una sincronización inmediata (solo si no está corriendo).
   */
  async forceSync(): Promise<SyncResults | null> {
    if (this._isSyncing) {
      return null;
    }
    return this.processPendingSync();
  }

  /**
   * Procesa toda la cola pendiente: outbox + fotos.
   * Core del motor de sincronización.
   */
  async processPendingSync(): Promise<SyncResults> {
    // Debounce: no lanzar sync si ya está corriendo
    if (this._isSyncing) {
      return {
        requerimientosSincronizados: 0,
        despachosSincronizados: 0,
        recepcionesSincronizadas: 0,
        liberacionesSincronizadas: 0,
        fotosSubidas: 0,
        errores: 0,
      };
    }

    this._isSyncing = true;
    this._callbacks.onSyncStart?.();

    const results: SyncResults = {
      requerimientosSincronizados: 0,
      despachosSincronizados: 0,
      recepcionesSincronizadas: 0,
      liberacionesSincronizadas: 0,
      fotosSubidas: 0,
      errores: 0,
    };

    try {
      // 1. Procesar outbox (requerimientos: INSERT/UPDATE)
      await this.processOutbox(results);

      // 2. Procesar fotos pendientes de upload
      await this.processPendingPhotos(results);

      // 3. Pull del servidor (server-wins: datos remotos sobreescriben locales)
      await this.pullFromServer();

      this._callbacks.onSyncComplete?.(results);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Error desconocido en sync';
      this._callbacks.onSyncError?.(msg);
    } finally {
      this._isSyncing = false;
    }

    return results;
  }

  // ─── OUTBOX ──────────────────────────────────────────────────────────────

  private async processOutbox(results: SyncResults): Promise<void> {
    const pending = await requerimientosRepo.getPendingOutbox();
    if (pending.length === 0) {
      return;
    }

    const total = pending.length;
    let current = 0;

    for (const entry of pending) {
      current++;
      this._callbacks.onSyncProgress?.(current, total);

      const attempts = entry.attempts ?? 0;

      // Max 3 intentos → marcar failed
      if (attempts >= MAX_ATTEMPTS) {
        await requerimientosRepo.markOutboxFailed(
          entry.id,
          'Max retry attempts exceeded',
        );
        results.errores++;
        continue;
      }

      try {
        const payload = JSON.parse(entry.payload);

        // ── Despachos, recepciones, liberaciones (tablas separadas) ──
        if (
          entry.tableName === 'despachos_offline' ||
          entry.tableName === 'recepciones_offline' ||
          entry.tableName === 'liberaciones_offline'
        ) {
          const endpoint =
            entry.tableName === 'despachos_offline'
              ? 'despachos'
              : entry.tableName === 'recepciones_offline'
                ? 'recepciones'
                : 'liberaciones';

          // requerimientoServerId must exist in payload
          if (!payload.requerimientoId) {
            // Skip silently — retries on next sync when parent may be synced
            continue;
          }

          try {
            await api.post(
              `/requerimientos/${payload.requerimientoId}/${endpoint}`,
              payload,
            );
            await requerimientosRepo.markOutboxCompleted(entry.id);
            if (entry.tableName === 'despachos_offline') {
              results.despachosSincronizados++;
            } else if (entry.tableName === 'recepciones_offline') {
              results.recepcionesSincronizadas++;
            } else {
              results.liberacionesSincronizadas++;
            }
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : 'Request failed';
            await requerimientosRepo.markOutboxFailed(entry.id, errorMsg);
            results.errores++;
          }
          continue;
        }

        // ── Requerimientos (tabla principal) ──
        if (entry.operation === 'INSERT') {
          // POST al servidor
          const serverResponse = await api.post('/requerimientos', payload);
          const serverData = serverResponse.data as {
            id: number;
            [key: string]: unknown;
          };
          const serverId = serverData.id;

          // Marcar requerimiento como sincronizado
          await requerimientosRepo.markSynced(entry.recordId, serverId);
          // Marcar outbox como completada
          await requerimientosRepo.markOutboxCompleted(entry.id);

          results.requerimientosSincronizados++;
        } else if (entry.operation === 'UPDATE') {
          // Obtener el serverId del requerimiento local
          const local = await requerimientosRepo.getByIdLocal(entry.recordId);
          if (!local || !local.serverId) {
            // No tiene serverId → no se puede actualizar en servidor
            await requerimientosRepo.markOutboxFailed(
              entry.id,
              'No serverId found for local record',
            );
            results.errores++;
            continue;
          }

          // PUT al servidor
          await api.put(`/requerimientos/${local.serverId}`, payload);
          // Marcar outbox como completada
          await requerimientosRepo.markOutboxCompleted(entry.id);

          results.requerimientosSincronizados++;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Request failed';
        await requerimientosRepo.markOutboxFailed(entry.id, errorMsg);
        results.errores++;
      }
    }
  }

  // ─── FOTOS ───────────────────────────────────────────────────────────────

  private async processPendingPhotos(results: SyncResults): Promise<void> {
    const pendingPhotos = await photosRepo.getPendingUpload();
    if (pendingPhotos.length === 0) {
      return;
    }

    const total = pendingPhotos.length;
    let current = 0;

    for (const foto of pendingPhotos) {
      current++;
      this._callbacks.onSyncProgress?.(current, total);

      try {
        // Obtener el serverId del requerimiento asociado
        const local = await requerimientosRepo.getByIdLocal(
          foto.requerimientoLocalId,
        );
        if (!local || !local.serverId) {
          // Requerimiento aún no sincronizado → skip, se intentará después
          continue;
        }

        // Crear FormData para upload multipart
        const formData = new FormData();
        formData.append('archivo', {
          uri: foto.uri,
          type: foto.contentType ?? 'image/jpeg',
          name: foto.fileName,
        } as unknown as Blob);
        if (foto.metadatos) {
          formData.append('metadatos', foto.metadatos);
        }

        // POST multipart al servidor
        const response = await api.post(
          `/requerimientos/${local.serverId}/fotos`,
          formData,
          {
            headers: {'Content-Type': 'multipart/form-data'},
            timeout: 30000,
          },
        );

        const serverFoto = response.data as {
          id: number;
          ruta?: string;
          [key: string]: unknown;
        };

        await photosRepo.markUploaded(
          foto.id,
          serverFoto.id,
          serverFoto.ruta,
        );

        results.fotosSubidas++;
      } catch {
        await photosRepo.markUploadError(foto.id);
        results.errores++;
      }
    }
  }

  // ─── PULL (server → local) ───────────────────────────────────────────────

  /**
   * Pull de datos del servidor a SQLite local (server-wins).
   * Se ejecuta DESPUÉS del push para que los cambios locales se suban primero.
   * Si el servidor tiene una versión más reciente, sobreescribe el registro local
   * y descarta silenciosamente cualquier outbox entry pendiente para ese registro.
   *
   * Resiliente: falla silenciosamente si hay errores de red o auth.
   */
  private async pullFromServer(): Promise<void> {
    try {
      // 1. Pull requerimientos
      const serverReqs = await listarRequerimientos({});
      for (const req of serverReqs) {
        // saveFromServer actualiza si existe (server-wins) o inserta si es nuevo
        await requerimientosRepo.saveFromServer({
          id: req.id,
          fecha: req.fecha,
          fundoId: req.fundoId,
          loteId: req.loteId,
          especieId: req.especieId,
          etapaFenologicaId: req.etapaFenologicaId,
          plagaId: req.plagaId,
          cantidad: req.cantidad,
          estado: req.estado,
          stockDisponible: req.stockDisponible,
          observaciones: req.observaciones,
          papelConPostura: req.papelConPostura,
          sobreConCascarilla: req.sobreConCascarilla,
          fechaLiberacion: req.fechaLiberacion,
          horaLiberacion: req.horaLiberacion,
          creadoPor: req.creadoPor,
        });

        // 2. Pull fotos para cada requerimiento con serverId
        try {
          const fotos = await listarFotosRequerimiento(req.id);
          const local = await requerimientosRepo.getByServerId(req.id);
          if (local) {
            for (const foto of fotos) {
              await photosRepo.saveFromServer(local.id, {
                id: foto.id,
                ruta: foto.ruta,
                tipo: foto.contentType,
              });
            }
          }
        } catch {
          // Fotos pull falla silenciosamente — no bloquea el resto
        }
      }

      // 3. Descartar outbox entries pendientes para registros que ya están synced
      //    (server-wins: el cambio del servidor ya está reflejado localmente)
      const pendingOutbox = await requerimientosRepo.getPendingOutbox();
      for (const entry of pendingOutbox) {
        if (entry.tableName === 'requerimientos') {
          const local = await requerimientosRepo.getByIdLocal(entry.recordId);
          if (local && local.syncStatus === 'synced') {
            await requerimientosRepo.markOutboxCompleted(entry.id);
          }
        }
      }
    } catch {
      // Pull falla silenciosamente — no bloquea el push
    }
  }
}

// ─── EXPORTS ───────────────────────────────────────────────────────────────

/** Instancia singleton del SyncManager (para acceso externo directo). */
export const syncManager = getInstance();
