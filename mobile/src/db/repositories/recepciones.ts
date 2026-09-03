/**
 * db/repositories/recepciones.ts — CRUD offline de recepciones (HITO-015).
 *
 * Patrón outbox:
 * 1. Guardar en SQLite local (sync_status='pending')
 * 2. Agregar a sync_outbox (operation='INSERT')
 * 3. Cuando haya red → SyncManager push al servidor
 *
 * IDs locales son temporales (negativos) hasta sincronizar con el servidor.
 */

import {eq, desc} from 'drizzle-orm';
import {getDatabase} from '../database';
import * as schema from '../schema';
import type {ConfirmarRecepcionRequest} from '../../services/ApiClient';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface RecepcionLocal {
  id: number;
  serverId: number | null;
  requerimientoLocalId: number;
  requerimientoServerId: number | null;
  conforme: boolean;
  observaciones: string | null;
  fechaRecepcion: string | null;
  creadoPor: number | null;
  syncStatus: string;
  createdAt: Date | null;
}

// ─── ID GENERATION ──────────────────────────────────────────────────────────

let _nextLocalId = -2000; // Different range from requerimientos (-1) and despachos (-1000)

function generateLocalId(): number {
  return _nextLocalId--;
}

// ─── CRUD LOCAL ─────────────────────────────────────────────────────────────

/**
 * Crear recepción offline.
 * Retorna el ID local temporal (negativo).
 */
export async function createLocal(
  data: ConfirmarRecepcionRequest,
  requerimientoLocalId: number,
  requerimientoServerId: number | null,
  creadoPor: number,
): Promise<number> {
  const db = getDatabase();
  const localId = generateLocalId();
  const now = new Date();

  await db.insert(schema.recepcionesOffline).values({
    id: localId,
    serverId: null,
    requerimientoLocalId,
    requerimientoServerId,
    conforme: data.conforme,
    observaciones: data.observaciones ?? null,
    fechaRecepcion: null,
    creadoPor,
    syncStatus: 'pending',
    createdAt: now,
  });

  // Agregar a cola de sync
  await db.insert(schema.syncOutbox).values({
    operation: 'INSERT',
    tableName: 'recepciones_offline',
    recordId: localId,
    payload: JSON.stringify({
      requerimientoId: requerimientoServerId,
      conforme: data.conforme,
      observaciones: data.observaciones ?? null,
    }),
    status: 'pending',
    attempts: 0,
    createdAt: now,
  });

  return localId;
}

/**
 * Obtener recepciones por requerimiento local ID.
 */
export async function findByRequerimientoLocalId(
  requerimientoLocalId: number,
): Promise<RecepcionLocal[]> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.recepcionesOffline)
    .where(
      eq(schema.recepcionesOffline.requerimientoLocalId, requerimientoLocalId),
    )
    .orderBy(desc(schema.recepcionesOffline.createdAt));
  return rows;
}

/**
 * Marcar recepción como sincronizada.
 */
export async function markSynced(
  localId: number,
  serverId: number,
): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.recepcionesOffline)
    .set({serverId, syncStatus: 'synced'})
    .where(eq(schema.recepcionesOffline.id, localId));
}
