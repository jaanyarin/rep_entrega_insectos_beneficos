/**
 * db/repositories/catalogos.ts — Repositorio de catálogos (cache-first).
 *
 * Patrón: si hay red → fetch del servidor + guardar en SQLite.
 *          si no hay red → leer de SQLite local.
 *
 * Los catálogos son read-only (no se crean/editan desde la app).
 * Se actualizan solo cuando hay conectividad.
 */

import {eq} from 'drizzle-orm';
import {getDatabase} from '../database';
import * as schema from '../schema';
import {
  listarFundos,
  listarLotes,
  listarEspecies,
  listarEtapasFenologicas,
  listarPlagas,
  type FundoDto,
  type LoteDto,
  type EspecieDto,
  type EtapaFenologicaDto,
  type PlagaDto,
} from '../../services/ApiClient';

// ─── FUNDOS ────────────────────────────────────────────────────────────────

export async function syncFundos(): Promise<FundoDto[]> {
  const db = getDatabase();
  try {
    const data = await listarFundos();
    const now = Date.now();
    // Limpiar tabla y re-poblar
    await db.delete(schema.fundos);
    for (const item of data) {
      await db.insert(schema.fundos).values({
        id: item.id,
        nombre: item.nombre,
        estado: 'ACTIVO',
        fetchedAt: new Date(now),
      });
    }
    return data;
  } catch {
    // Sin red o error → leer de cache local
    return getFundosLocal();
  }
}

export async function getFundosLocal(): Promise<FundoDto[]> {
  const db = getDatabase();
  const rows = await db.select().from(schema.fundos);
  return rows.map(r => ({
    id: r.id,
    nombre: r.nombre,
    createdAt: '',
    updatedAt: '',
  }));
}

// ─── LOTES ─────────────────────────────────────────────────────────────────

export async function syncLotes(fundoId?: number): Promise<LoteDto[]> {
  const db = getDatabase();
  try {
    const data = await listarLotes(fundoId ?? 0);
    const now = Date.now();
    // Solo limpiar lotes del fundo específico si se pasa el ID
    if (fundoId) {
      const existing = await db
        .select()
        .from(schema.lotes)
        .where(eq(schema.lotes.fundoId, fundoId));
      for (const row of existing) {
        await db.delete(schema.lotes).where(eq(schema.lotes.id, row.id));
      }
    }
    for (const item of data) {
      await db.insert(schema.lotes).values({
        id: item.id,
        nombre: item.nombre,
        fundoId: item.fundoId,
        variedadId: item.variedadId,
        color: item.variedadColor,
        area: item.area,
        fetchedAt: new Date(now),
      });
    }
    return data;
  } catch {
    return getLotesLocal(fundoId);
  }
}

export async function getLotesLocal(fundoId?: number): Promise<LoteDto[]> {
  const db = getDatabase();
  let rows;
  if (fundoId) {
    rows = await db
      .select()
      .from(schema.lotes)
      .where(eq(schema.lotes.fundoId, fundoId));
  } else {
    rows = await db.select().from(schema.lotes);
  }
  return rows.map(r => ({
    id: r.id,
    fundoId: r.fundoId,
    fundo: '',
    variedadId: r.variedadId ?? 0,
    variedad: '',
    variedadColor: r.color ?? '',
    nombre: r.nombre,
    area: r.area,
    createdAt: '',
    updatedAt: '',
  }));
}

// ─── ESPECIES ──────────────────────────────────────────────────────────────

export async function syncEspecies(): Promise<EspecieDto[]> {
  const db = getDatabase();
  try {
    const data = await listarEspecies();
    const now = Date.now();
    await db.delete(schema.especies);
    for (const item of data) {
      await db.insert(schema.especies).values({
        id: item.id,
        nombre: item.nombre,
        fetchedAt: new Date(now),
      });
    }
    return data;
  } catch {
    return getEspeciesLocal();
  }
}

export async function getEspeciesLocal(): Promise<EspecieDto[]> {
  const db = getDatabase();
  const rows = await db.select().from(schema.especies);
  return rows.map(r => ({
    id: r.id,
    nombre: r.nombre,
    estado: 'ACTIVO',
  }));
}

// ─── ETAPAS FENOLÓGICAS ────────────────────────────────────────────────────

export async function syncEtapasFenologicas(): Promise<EtapaFenologicaDto[]> {
  const db = getDatabase();
  try {
    const data = await listarEtapasFenologicas();
    const now = Date.now();
    await db.delete(schema.etapasFenologicas);
    for (const item of data) {
      await db.insert(schema.etapasFenologicas).values({
        id: item.id,
        nombre: item.nombre,
        fetchedAt: new Date(now),
      });
    }
    return data;
  } catch {
    return getEtapasFenologicasLocal();
  }
}

export async function getEtapasFenologicasLocal(): Promise<EtapaFenologicaDto[]> {
  const db = getDatabase();
  const rows = await db.select().from(schema.etapasFenologicas);
  return rows.map(r => ({
    id: r.id,
    nombre: r.nombre,
    estado: 'ACTIVO',
  }));
}

// ─── PLAGAS ────────────────────────────────────────────────────────────────

export async function syncPlagas(): Promise<PlagaDto[]> {
  const db = getDatabase();
  try {
    const data = await listarPlagas();
    const now = Date.now();
    await db.delete(schema.plagas);
    for (const item of data) {
      await db.insert(schema.plagas).values({
        id: item.id,
        nombre: item.nombre,
        fetchedAt: new Date(now),
      });
    }
    return data;
  } catch {
    return getPlagasLocal();
  }
}

export async function getPlagasLocal(): Promise<PlagaDto[]> {
  const db = getDatabase();
  const rows = await db.select().from(schema.plagas);
  return rows.map(r => ({
    id: r.id,
    nombre: r.nombre,
    estado: 'ACTIVO',
  }));
}

// ─── SYNC COMPLETA ─────────────────────────────────────────────────────────

/**
 * Sincroniza todos los catálogos del servidor a SQLite.
 * Llamar cuando se detecta conectividad (online → sync).
 */
export async function syncAllCatalogos(): Promise<{
  fundos: number;
  lotes: number;
  especies: number;
  etapas: number;
  plagas: number;
}> {
  const [fundos, lotes, especies, etapas, plagas] = await Promise.all([
    syncFundos(),
    syncLotes(),
    syncEspecies(),
    syncEtapasFenologicas(),
    syncPlagas(),
  ]);
  return {
    fundos: fundos.length,
    lotes: lotes.length,
    especies: especies.length,
    etapas: etapas.length,
    plagas: plagas.length,
  };
}
