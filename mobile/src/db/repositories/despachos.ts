/**
 * db/repositories/despachos.ts — CRUD offline de despachos (HITO-015).
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
import type {CrearDespachoRequest} from '../../services/ApiClient';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface DespachoLocal {
  id: number;
  serverId: number | null;
  requerimientoLocalId: number;
  requerimientoServerId: number | null;
  cantidadDespachada: number;
  papelConPostura: number | null;
  sobreConCascarilla: number | null;
  observaciones: string | null;
  creadoPor: number | null;
  syncStatus: string;
  createdAt: Date | null;
}

// ─── ID GENERATION ──────────────────────────────────────────────────────────

let _nextLocalId = -1000; // Different range from requerimientos (-1)

function generateLocalId(): number {
  return _nextLocalId--;
}

// ─── CRUD LOCAL ─────────────────────────────────────────────────────────────

/**
 * Crear despacho offline.
 * Retorna el ID local temporal (negativo).
 */
export async function createLocal(
  data: CrearDespachoRequest,
  requerimientoLocalId: number,
  requerimientoServerId: number | null,
  creadoPor: number,
): Promise<number> {
  const db = getDatabase();
  const localId = generateLocalId();
  const now = new Date();

  await db.insert(schema.despachosOffline).values({
    id: localId,
    serverId: null,
    requerimientoLocalId,
    requerimientoServerId,
    cantidadDespachada: data.cantidadDespachada,
    papelConPostura: data.papelConPostura ?? null,
    sobreConCascarilla: data.sobreConCascarilla ?? null,
    observaciones: data.observaciones ?? null,
    creadoPor,
    syncStatus: 'pending',
    createdAt: now,
  });

  // Agregar a cola de sync
  await db.insert(schema.syncOutbox).values({
    operation: 'INSERT',
    tableName: 'despachos_offline',
    recordId: localId,
    payload: JSON.stringify({
      requerimientoId: requerimientoServerId,
      cantidadDespachada: data.cantidadDespachada,
      papelConPostura: data.papelConPostura ?? null,
      sobreConCascarilla: data.sobreConCascarilla ?? null,
      observaciones: data.observaciones ?? null,
    }),
    status: 'pending',
    attempts: 0,
    createdAt: now,
  });

  return localId;
}

/**
 * Obtener despachos por requerimiento local ID.
 */
export async function findByRequerimientoLocalId(
  requerimientoLocalId: number,
): Promise<DespachoLocal[]> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.despachosOffline)
    .where(
      eq(schema.despachosOffline.requerimientoLocalId, requerimientoLocalId),
    )
    .orderBy(desc(schema.despachosOffline.createdAt));
  return rows;
}

/**
 * Marcar despacho como sincronizado.
 */
export async function markSynced(
  localId: number,
  serverId: number,
): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.despachosOffline)
    .set({serverId, syncStatus: 'synced'})
    .where(eq(schema.despachosOffline.id, localId));
}
