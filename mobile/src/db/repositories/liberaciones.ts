/**
 * db/repositories/liberaciones.ts — CRUD offline de liberaciones (HITO-015).
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
import type {CrearLiberacionRequest} from '../../services/ApiClient';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface LiberacionLocal {
  id: number;
  serverId: number | null;
  requerimientoLocalId: number;
  requerimientoServerId: number | null;
  fundoId: number | null;
  loteId: number | null;
  cantidadLiberada: number;
  observaciones: string | null;
  fechaLiberacion: string | null;
  horaLiberacion: string | null;
  creadoPor: number | null;
  syncStatus: string;
  createdAt: Date | null;
}

// ─── ID GENERATION ──────────────────────────────────────────────────────────

let _nextLocalId = -3000; // Different range from requerimientos (-1), despachos (-1000), recepciones (-2000)

function generateLocalId(): number {
  return _nextLocalId--;
}

// ─── CRUD LOCAL ─────────────────────────────────────────────────────────────

/**
 * Crear liberación offline.
 * Retorna el ID local temporal (negativo).
 */
export async function createLocal(
  data: CrearLiberacionRequest,
  requerimientoLocalId: number,
  requerimientoServerId: number | null,
  creadoPor: number,
): Promise<number> {
  const db = getDatabase();
  const localId = generateLocalId();
  const now = new Date();

  await db.insert(schema.liberacionesOffline).values({
    id: localId,
    serverId: null,
    requerimientoLocalId,
    requerimientoServerId,
    fundoId: data.fundoId,
    loteId: data.loteId,
    cantidadLiberada: data.cantidadLiberada,
    observaciones: data.observaciones ?? null,
    fechaLiberacion: null,
    horaLiberacion: data.horaLiberacion,
    creadoPor,
    syncStatus: 'pending',
    createdAt: now,
  });

  // Agregar a cola de sync
  await db.insert(schema.syncOutbox).values({
    operation: 'INSERT',
    tableName: 'liberaciones_offline',
    recordId: localId,
    payload: JSON.stringify({
      requerimientoId: requerimientoServerId,
      fundoId: data.fundoId,
      loteId: data.loteId,
      cantidadLiberada: data.cantidadLiberada,
      observaciones: data.observaciones ?? null,
      horaLiberacion: data.horaLiberacion,
    }),
    status: 'pending',
    attempts: 0,
    createdAt: now,
  });

  return localId;
}

/**
 * Obtener liberaciones por requerimiento local ID.
 */
export async function findByRequerimientoLocalId(
  requerimientoLocalId: number,
): Promise<LiberacionLocal[]> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.liberacionesOffline)
    .where(
      eq(
        schema.liberacionesOffline.requerimientoLocalId,
        requerimientoLocalId,
      ),
    )
    .orderBy(desc(schema.liberacionesOffline.createdAt));
  return rows;
}

/**
 * Marcar liberación como sincronizada.
 */
export async function markSynced(
  localId: number,
  serverId: number,
): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.liberacionesOffline)
    .set({serverId, syncStatus: 'synced'})
    .where(eq(schema.liberacionesOffline.id, localId));
}
