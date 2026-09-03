/**
 * db/repositories/cumplimiento.ts — Repositorio offline de cumplimiento de producción.
 *
 * Permite registrar la producción real (papel/sobre) por semana de programación.
 * Patrón: offline-first con sync via outbox.
 */

import {eq} from 'drizzle-orm';
import {getDatabase} from '../database';
import * as schema from '../schema';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface CumplimientoLocal {
  id: number;
  serverId: number | null;
  programacionDetalleId: number;
  programacionId: number;
  semana: number;
  fecha: string;
  papelReal: number;
  sobreReal: number;
  totalReal: number;
  creadoPor: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GuardarCumplimientoLocal {
  programacionDetalleId: number;
  programacionId: number;
  semana: number;
  fecha: string;
  papelReal: number;
  sobreReal: number;
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

/**
 * Guardar o actualizar cumplimiento de producción (upsert por programacionDetalleId).
 */
export async function guardarCumplimiento(
  data: GuardarCumplimientoLocal,
  userId: number,
): Promise<number> {
  const db = getDatabase();
  const now = new Date();
  const totalReal = data.papelReal + data.sobreReal;

  // Buscar existente
  const existente = await db
    .select()
    .from(schema.cumplimientoProgramacion)
    .where(eq(schema.cumplimientoProgramacion.programacionDetalleId, data.programacionDetalleId))
    .limit(1);

  if (existente.length > 0) {
    // Actualizar
    await db
      .update(schema.cumplimientoProgramacion)
      .set({
        papelReal: data.papelReal,
        sobreReal: data.sobreReal,
        totalReal,
        updatedAt: now,
      })
      .where(eq(schema.cumplimientoProgramacion.id, existente[0].id));
    return existente[0].id;
  } else {
    // Crear nuevo
    const localId = -(Date.now());
    await db.insert(schema.cumplimientoProgramacion).values({
      id: localId,
      serverId: null,
      programacionDetalleId: data.programacionDetalleId,
      programacionId: data.programacionId,
      semana: data.semana,
      fecha: data.fecha,
      papelReal: data.papelReal,
      sobreReal: data.sobreReal,
      totalReal,
      creadoPor: userId,
      createdAt: now,
      updatedAt: now,
    });
    return localId;
  }
}

/**
 * Obtener cumplimiento por detalle de programación.
 */
export async function getCumplimientoPorDetalle(
  detalleId: number,
): Promise<CumplimientoLocal | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.cumplimientoProgramacion)
    .where(eq(schema.cumplimientoProgramacion.programacionDetalleId, detalleId))
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Obtener todos los cumplimientos de una programación.
 */
export async function getCumplimientosPorProgramacion(
  programacionId: number,
): Promise<CumplimientoLocal[]> {
  const db = getDatabase();
  return db
    .select()
    .from(schema.cumplimientoProgramacion)
    .where(eq(schema.cumplimientoProgramacion.programacionId, programacionId));
}

/**
 * Guardar cumplimiento desde datos del servidor (sync pull).
 */
export async function saveCumplimientoFromServer(data: {
  id: number;
  programacionDetalleId: number;
  programacionId: number;
  semana: number;
  fecha: string;
  papelReal: number;
  sobreReal: number;
  totalReal: number;
  creadoPor: number;
}): Promise<void> {
  const db = getDatabase();
  const now = new Date();

  const existente = await db
    .select()
    .from(schema.cumplimientoProgramacion)
    .where(eq(schema.cumplimientoProgramacion.programacionDetalleId, data.programacionDetalleId))
    .limit(1);

  if (existente.length > 0) {
    await db
      .update(schema.cumplimientoProgramacion)
      .set({
        serverId: data.id,
        papelReal: data.papelReal,
        sobreReal: data.sobreReal,
        totalReal: data.totalReal,
        updatedAt: now,
      })
      .where(eq(schema.cumplimientoProgramacion.id, existente[0].id));
  } else {
    await db.insert(schema.cumplimientoProgramacion).values({
      id: data.programacionDetalleId,
      serverId: data.id,
      programacionDetalleId: data.programacionDetalleId,
      programacionId: data.programacionId,
      semana: data.semana,
      fecha: data.fecha,
      papelReal: data.papelReal,
      sobreReal: data.sobreReal,
      totalReal: data.totalReal,
      creadoPor: data.creadoPor,
      createdAt: now,
      updatedAt: now,
    });
  }
}
