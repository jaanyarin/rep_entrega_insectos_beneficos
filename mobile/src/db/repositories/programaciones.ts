/**
 * db/repositories/programaciones.ts — Repositorio de programaciones (cache-first).
 *
 * Patrón pull: si hay red → fetch del servidor + guardar en SQLite.
 *               si no hay red → leer de SQLite local.
 *
 * Las programaciones son read-only desde la app (solo pull del servidor).
 * Se usan en el Panel de Solicitudes para mostrar la tabla de proyección.
 */

import {and, eq} from 'drizzle-orm';
import {getDatabase} from '../database';
import * as schema from '../schema';
import {
  listarProgramaciones,
  type ProgramacionDto,
  type DetalleProgramacionDto,
} from '../../services/ApiClient';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface ProgramacionLocal {
  id: number;
  serverId: number | null;
  anio: number;
  mes: number;
  especieId: number;
  especie: string;
  stockInicialBase: number;
  totalMes: number;
  estado: string;
  fetchedAt: Date | null;
}

export interface ProgramacionDetalleLocal {
  id: number;
  serverId: number | null;
  programacionId: number;
  semana: number;
  fecha: string;
  stockInicial: number;
  papelConPostura: number;
  sobreConCascarilla: number;
  total: number;
  stockFinal: number;
  estado: string;
}

export interface ProgramacionConDetalle extends ProgramacionLocal {
  detalles: ProgramacionDetalleLocal[];
}

// ─── SYNC (server → SQLite) ───────────────────────────────────────────────

/**
 * Sincroniza programaciones del servidor para un año/mes específico.
 * Guarda en SQLite (reemplaza datos anteriores del mismo año/mes).
 * Retorna las programaciones del servidor.
 */
export async function syncProgramaciones(
  anio: number,
  mes: number,
): Promise<ProgramacionDto[]> {
  const db = getDatabase();
  try {
    const data = await listarProgramaciones(anio, mes);
    const now = new Date();

    // Obtener IDs de programaciones existentes para este año/mes para borrar detalles
    const existingProg = await db
      .select({id: schema.programaciones.id})
      .from(schema.programaciones)
      .where(
        and(
          eq(schema.programaciones.anio, anio),
          eq(schema.programaciones.mes, mes),
        ),
      );

    // Borrar detalles de programaciones existentes
    for (const prog of existingProg) {
      await db
        .delete(schema.programacionDetalles)
        .where(eq(schema.programacionDetalles.programacionId, prog.id));
    }

    // Borrar programaciones existentes del año/mes
    await db
      .delete(schema.programaciones)
      .where(
        and(
          eq(schema.programaciones.anio, anio),
          eq(schema.programaciones.mes, mes),
        ),
      );

    // Insertar programaciones del servidor
    for (const item of data) {
      await db.insert(schema.programaciones).values({
        id: item.id,
        serverId: item.id,
        anio: item.anio,
        mes: item.mes,
        especieId: item.especieId,
        especie: item.especie,
        stockInicialBase: item.stockInicialBase,
        totalMes: item.totalMes,
        estado: item.estado,
        fetchedAt: now,
      });

      // Insertar detalles semanales
      if (item.detalles && item.detalles.length > 0) {
        for (const det of item.detalles) {
          await db.insert(schema.programacionDetalles).values({
            id: det.id,
            serverId: det.id,
            programacionId: item.id,
            semana: det.semana,
            fecha: det.fecha,
            stockInicial: det.stockInicial,
            papelConPostura: det.papelConPostura,
            sobreConCascarilla: det.sobreConCascarilla,
            total: det.total,
            stockFinal: det.stockFinal,
            estado: det.estado,
          });
        }
      }
    }

    return data;
  } catch {
    // Sin red o error → retornar datos locales como DTOs
    return listLocalAsDto(anio, mes);
  }
}

// ─── CONSULTAS LOCALES ────────────────────────────────────────────────────

/**
 * Lista programaciones locales para un año/mes.
 */
export async function listLocal(
  anio: number,
  mes: number,
): Promise<ProgramacionLocal[]> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.programaciones)
    .where(
      and(
        eq(schema.programaciones.anio, anio),
        eq(schema.programaciones.mes, mes),
      ),
    );
  return rows;
}

/**
 * Retorna las programaciones como ProgramacionDto (compatibilidad con UI existente).
 */
export async function listLocalAsDto(
  anio: number,
  mes: number,
): Promise<ProgramacionDto[]> {
  const locals = await listLocal(anio, mes);
  const db = getDatabase();

  const result: ProgramacionDto[] = [];
  for (const prog of locals) {
    const detallesRows = await db
      .select()
      .from(schema.programacionDetalles)
      .where(eq(schema.programacionDetalles.programacionId, prog.id));

    const detalles: DetalleProgramacionDto[] = detallesRows.map(d => ({
      id: d.serverId ?? d.id,
      semana: d.semana,
      fecha: d.fecha,
      stockInicial: d.stockInicial,
      papelConPostura: d.papelConPostura,
      sobreConCascarilla: d.sobreConCascarilla,
      total: d.total,
      stockFinal: d.stockFinal,
      estado: d.estado as ProgramacionDto['estado'],
    }));

    result.push({
      id: prog.serverId ?? prog.id,
      anio: prog.anio,
      mes: prog.mes,
      especieId: prog.especieId,
      especie: prog.especie,
      fechaRegistro: '',
      fechaPublicacion: null,
      estado: prog.estado as ProgramacionDto['estado'],
      stockInicialBase: prog.stockInicialBase,
      totalMes: prog.totalMes,
      detalles,
    });
  }
  return result;
}

/**
 * Obtener una programación con sus detalles por ID local.
 */
export async function getByIdLocal(
  localId: number,
): Promise<ProgramacionConDetalle | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.programaciones)
    .where(eq(schema.programaciones.id, localId));
  if (rows.length === 0) {
    return null;
  }
  const prog = rows[0];

  const detallesRows = await db
    .select()
    .from(schema.programacionDetalles)
    .where(eq(schema.programacionDetalles.programacionId, prog.id));

  return {
    ...prog,
    detalles: detallesRows,
  };
}

/**
 * Verificar si existen programaciones locales para un año/mes.
 */
export async function hasLocalData(
  anio: number,
  mes: number,
): Promise<boolean> {
  const locals = await listLocal(anio, mes);
  return locals.length > 0;
}
