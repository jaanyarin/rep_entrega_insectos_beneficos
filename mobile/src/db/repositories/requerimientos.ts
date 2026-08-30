/**
 * db/repositories/requerimientos.ts — CRUD offline de requerimientos.
 *
 * Patrón outbox:
 * 1. Guardar en SQLite local (sync_status='pending')
 * 2. Agregar a sync_outbox (operation='INSERT'/'UPDATE')
 * 3. Cuando haya red → SyncManager push al servidor
 *
 * IDs locales son temporales (negativos) hasta sincronizar con el servidor.
 */

import {eq, desc, and, gte, lte} from 'drizzle-orm';
import {getDatabase} from '../database';
import * as schema from '../schema';
import {
  type CrearRequerimientoRequest,
  type ActualizarRequerimientoRequest,
} from '../../services/ApiClient';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface RequerimientoLocal {
  id: number;
  serverId: number | null;
  fecha: string;
  fundoId: number;
  loteId: number;
  especieId: number;
  etapaFenologicaId: number | null;
  plagaId: number | null;
  cantidad: number;
  estado: string;
  stockDisponible: number | null;
  observaciones: string | null;
  papelConPostura: number | null;
  sobreConCascarilla: number | null;
  fechaLiberacion: string | null;
  horaLiberacion: string | null;
  creadoPor: number | null;
  syncStatus: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface FiltrosRequerimiento {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  creadoPor?: number;
}

// ─── GENERACIÓN DE ID TEMPORAL ─────────────────────────────────────────────

let _nextLocalId = -1;

function generateLocalId(): number {
  return _nextLocalId--;
}

// ─── CRUD LOCAL ────────────────────────────────────────────────────────────

/**
 * Crear requerimiento offline.
 * Retorna el ID local temporal (negativo).
 */
export async function createLocal(
  data: CrearRequerimientoRequest,
  creadoPor: number,
  stockDisponible?: number,
): Promise<number> {
  const db = getDatabase();
  const localId = generateLocalId();
  const now = new Date();

  await db.insert(schema.requerimientos).values({
    id: localId,
    serverId: null,
    fecha: data.fecha,
    fundoId: data.fundoId,
    loteId: data.loteId,
    especieId: data.especieId,
    etapaFenologicaId: data.etapaFenologicaId ?? null,
    plagaId: data.plagaId ?? null,
    cantidad: data.cantidad,
    estado: 'REGISTRADO',
    stockDisponible: stockDisponible ?? null,
    observaciones: data.observaciones ?? null,
    papelConPostura: null,
    sobreConCascarilla: null,
    fechaLiberacion: null,
    horaLiberacion: null,
    creadoPor,
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  // Agregar a cola de sync
  await addToOutbox('INSERT', 'requerimientos', localId, {
    ...data,
    estado: 'REGISTRADO',
    creadoPor,
  });

  return localId;
}

/**
 * Actualizar requerimiento offline.
 */
export async function updateLocal(
  localId: number,
  data: ActualizarRequerimientoRequest,
): Promise<void> {
  const db = getDatabase();
  const now = new Date();

  await db
    .update(schema.requerimientos)
    .set({
      fecha: data.fecha,
      fundoId: data.fundoId,
      loteId: data.loteId,
      especieId: data.especieId,
      etapaFenologicaId: data.etapaFenologicaId ?? null,
      plagaId: data.plagaId ?? null,
      cantidad: data.cantidad,
      estado: data.estado,
      papelConPostura: data.papelConPostura ?? null,
      sobreConCascarilla: data.sobreConCascarilla ?? null,
      fechaLiberacion: data.fechaLiberacion ?? null,
      horaLiberacion: data.horaLiberacion ?? null,
      observaciones: data.observaciones ?? null,
      syncStatus: 'pending',
      updatedAt: now,
    })
    .where(eq(schema.requerimientos.id, localId));

  // Agregar a cola de sync
  await addToOutbox('UPDATE', 'requerimientos', localId, data);
}

/**
 * Obtener un requerimiento por ID local.
 */
export async function getByIdLocal(
  localId: number,
): Promise<RequerimientoLocal | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.requerimientos)
    .where(eq(schema.requerimientos.id, localId));
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Obtener un requerimiento por server ID.
 */
export async function getByServerId(
  serverId: number,
): Promise<RequerimientoLocal | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.requerimientos)
    .where(eq(schema.requerimientos.serverId, serverId));
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Listar requerimientos con filtros (offline).
 */
export async function listLocal(
  filtros: FiltrosRequerimiento = {},
): Promise<RequerimientoLocal[]> {
  const db = getDatabase();

  // Construir condiciones de filtro
  const conditions = [];

  if (filtros.fechaDesde) {
    conditions.push(
      gte(schema.requerimientos.fecha, filtros.fechaDesde),
    );
  }
  if (filtros.fechaHasta) {
    conditions.push(
      lte(schema.requerimientos.fecha, filtros.fechaHasta),
    );
  }
  if (filtros.estado) {
    conditions.push(
      eq(schema.requerimientos.estado, filtros.estado),
    );
  }
  if (filtros.creadoPor) {
    conditions.push(
      eq(schema.requerimientos.creadoPor, filtros.creadoPor),
    );
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(schema.requerimientos)
    .where(whereClause)
    .orderBy(desc(schema.requerimientos.createdAt));

  return rows;
}

/**
 * Contar requerimientos pendientes de sync.
 */
export async function countPending(): Promise<number> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.requerimientos)
    .where(eq(schema.requerimientos.syncStatus, 'pending'));
  return rows.length;
}

/**
 * Marcar requerimiento como sincronizado.
 */
export async function markSynced(
  localId: number,
  serverId: number,
): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.requerimientos)
    .set({
      serverId,
      syncStatus: 'synced',
      updatedAt: new Date(),
    })
    .where(eq(schema.requerimientos.id, localId));
}

/**
 * Marcar requerimiento con conflicto de sync.
 */
export async function markConflict(localId: number): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.requerimientos)
    .set({
      syncStatus: 'conflict',
      updatedAt: new Date(),
    })
    .where(eq(schema.requerimientos.id, localId));
}

/**
 * Guardar requerimiento del servidor en SQLite (para pull).
 */
export async function saveFromServer(serverData: {
  id: number;
  fecha: string;
  fundoId: number;
  loteId: number;
  especieId: number;
  etapaFenologicaId: number | null;
  plagaId: number | null;
  cantidad: number;
  estado: string;
  stockDisponible: number | null;
  observaciones: string | null;
  papelConPostura: number | null;
  sobreConCascarilla: number | null;
  fechaLiberacion: string | null;
  horaLiberacion: string | null;
  creadoPor: number | null;
}): Promise<void> {
  const db = getDatabase();
  const now = new Date();

  // Verificar si ya existe localmente
  const existing = await getByServerId(serverData.id);

  if (existing) {
    // Actualizar existente
    await db
      .update(schema.requerimientos)
      .set({
        fecha: serverData.fecha,
        fundoId: serverData.fundoId,
        loteId: serverData.loteId,
        especieId: serverData.especieId,
        etapaFenologicaId: serverData.etapaFenologicaId,
        plagaId: serverData.plagaId,
        cantidad: serverData.cantidad,
        estado: serverData.estado,
        stockDisponible: serverData.stockDisponible,
        observaciones: serverData.observaciones,
        papelConPostura: serverData.papelConPostura,
        sobreConCascarilla: serverData.sobreConCascarilla,
        fechaLiberacion: serverData.fechaLiberacion,
        horaLiberacion: serverData.horaLiberacion,
        creadoPor: serverData.creadoPor,
        syncStatus: 'synced',
        updatedAt: now,
      })
      .where(eq(schema.requerimientos.id, existing.id));
  } else {
    // Insertar nuevo (con server ID como ID local)
    await db.insert(schema.requerimientos).values({
      id: serverData.id,
      serverId: serverData.id,
      fecha: serverData.fecha,
      fundoId: serverData.fundoId,
      loteId: serverData.loteId,
      especieId: serverData.especieId,
      etapaFenologicaId: serverData.etapaFenologicaId,
      plagaId: serverData.plagaId,
      cantidad: serverData.cantidad,
      estado: serverData.estado,
      stockDisponible: serverData.stockDisponible,
      observaciones: serverData.observaciones,
      papelConPostura: serverData.papelConPostura,
      sobreConCascarilla: serverData.sobreConCascarilla,
      fechaLiberacion: serverData.fechaLiberacion,
      horaLiberacion: serverData.horaLiberacion,
      creadoPor: serverData.creadoPor,
      syncStatus: 'synced',
      createdAt: now,
      updatedAt: now,
    });
  }
}

// ─── OUTBOX ────────────────────────────────────────────────────────────────

async function addToOutbox(
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  tableName: string,
  recordId: number,
  payload: unknown,
): Promise<void> {
  const db = getDatabase();
  await db.insert(schema.syncOutbox).values({
    operation,
    tableName,
    recordId,
    payload: JSON.stringify(payload),
    status: 'pending',
    attempts: 0,
    createdAt: new Date(),
  });
}

/**
 * Obtener registros pendientes en la cola de sync.
 */
export async function getPendingOutbox(): Promise<
  Array<{
    id: number;
    operation: string;
    tableName: string;
    recordId: number;
    payload: string;
    attempts: number | null;
  }>
> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.syncOutbox)
    .where(eq(schema.syncOutbox.status, 'pending'));
  return rows;
}

/**
 * Marcar outbox entry como completada.
 */
export async function markOutboxCompleted(outboxId: number): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.syncOutbox)
    .set({status: 'completed'})
    .where(eq(schema.syncOutbox.id, outboxId));
}

/**
 * Marcar outbox entry como fallida.
 */
export async function markOutboxFailed(
  outboxId: number,
  error: string,
): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.syncOutbox)
    .set({
      status: 'failed',
      lastError: error,
    })
    .where(eq(schema.syncOutbox.id, outboxId));
}
