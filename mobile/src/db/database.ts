/**
 * db/database.ts — Inicialización de SQLite local + Drizzle ORM.
 *
 * Usa @op-engineering/op-sqlite (JSI, 8-9x más rápido que bridge-based).
 * La base de datos se crea una sola vez al arrancar la app y se reutiliza.
 * Las migraciones se ejecutan automáticamente en cada arranque.
 */

import {open} from '@op-engineering/op-sqlite';
import {drizzle} from 'drizzle-orm/op-sqlite';
import * as schema from './schema';
import {seedCatalogosIfEmpty} from './seed/catalogos';

const DB_NAME = 'insectos_beneficos.db';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sqliteDb: ReturnType<typeof open> | null = null;
let _dbReady: Promise<void> | null = null;

/**
 * Inicializa la base de datos SQLite y Drizzle.
 * Seguro de llamar múltiples veces (idempotente).
 */
export function getDatabase() {
  if (_db) {
    return _db;
  }

  _sqliteDb = open({name: DB_NAME});
  _db = drizzle(_sqliteDb, {schema});

  // Ejecutar migraciones + seed al iniciar. El promise se expone vía
  // waitForDatabase() para que los hooks puedan esperar antes de leer.
  _dbReady = runMigrations()
    .then(() => seedCatalogosIfEmpty(_sqliteDb!))
    .catch(() => {});

  return _db;
}

/**
 * Espera a que las migraciones + seed de la DB completen.
 * Seguro de llamar múltiples veces (el mismo promise se reutiliza).
 * Resuelve inmediatamente si la DB ya está inicializada.
 */
export function waitForDatabase(): Promise<void> {
  if (_dbReady) {
    return _dbReady;
  }
  // Si getDatabase() no se ha llamado aún, forzar inicialización.
  getDatabase();
  return _dbReady!;
}

/**
 * Retorna la instancia raw de SQLite (para queries manuales).
 */
export function getSqliteDb() {
  if (!_sqliteDb) {
    getDatabase(); // Asegurar que esté inicializado
  }
  return _sqliteDb!;
}

/**
 * Ejecuta las migraciones SQL directamente sobre la conexión SQLite.
 * Usa la tabla `drizzle_migrations` para tracking (patrón Drizzle).
 */
async function runMigrations() {
  const db = _sqliteDb!;

  // Crear tabla de control de migraciones si no existe
  await db.execute(`
    CREATE TABLE IF NOT EXISTS drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    )
  `);

  // Verificar si la migración inicial ya se ejecutó
  const result = await db.execute(
    `SELECT COUNT(*) as count FROM drizzle_migrations WHERE hash = '0000_initial'`,
  );
  const count = result.rows.length > 0 ? (result.rows[0] as {count: number}).count : 0;

  if (count === 0) {
    // Ejecutar migración inicial
    await db.execute(`
      CREATE TABLE IF NOT EXISTS fundos (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        fetched_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS lotes (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        fundo_id INTEGER NOT NULL,
        variedad_id INTEGER,
        color TEXT,
        area REAL,
        fetched_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS especies (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        fetched_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS etapas_fenologicas (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        fetched_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS plagas (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        fetched_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS requerimientos (
        id INTEGER PRIMARY KEY,
        server_id INTEGER,
        fecha TEXT NOT NULL,
        fundo_id INTEGER NOT NULL,
        lote_id INTEGER NOT NULL,
        especie_id INTEGER NOT NULL,
        etapa_fenologica_id INTEGER,
        plaga_id INTEGER,
        cantidad INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'REGISTRADO',
        stock_disponible INTEGER,
        observaciones TEXT,
        papel_con_postura INTEGER,
        sobre_con_cascarilla INTEGER,
        fecha_liberacion TEXT,
        hora_liberacion TEXT,
        creado_por INTEGER,
        sync_status TEXT NOT NULL DEFAULT 'synced',
        created_at INTEGER,
        updated_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS fotos_pendientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requerimiento_local_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        content_type TEXT,
        metadatos TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        server_foto_id INTEGER,
        created_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS sync_outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        last_error TEXT,
        created_at INTEGER,
        next_retry_at INTEGER
      )
    `);

    // Registrar la migración como ejecutada
    await db.execute(
      `INSERT INTO drizzle_migrations (hash, created_at) VALUES ('0000_initial', ?)`,
      [Date.now()],
    );
  }

  // ─── Migración 0001: Programaciones offline ───────────────────────────────
  const result0001 = await db.execute(
    `SELECT COUNT(*) as count FROM drizzle_migrations WHERE hash = '0001_programaciones'`,
  );
  const count0001 =
    result0001.rows.length > 0
      ? (result0001.rows[0] as {count: number}).count
      : 0;

  if (count0001 === 0) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS programaciones (
        id INTEGER PRIMARY KEY,
        server_id INTEGER,
        anio INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        especie_id INTEGER NOT NULL,
        especie TEXT NOT NULL,
        stock_inicial_base INTEGER NOT NULL,
        total_mes INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'EN_PROCESO',
        fetched_at INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS programacion_detalles (
        id INTEGER PRIMARY KEY,
        server_id INTEGER,
        programacion_id INTEGER NOT NULL,
        semana INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        stock_inicial INTEGER NOT NULL,
        papel_con_postura INTEGER NOT NULL,
        sobre_con_cascarilla INTEGER NOT NULL,
        total INTEGER NOT NULL,
        stock_final INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'EN_PROCESO'
      )
    `);

    await db.execute(
      `INSERT INTO drizzle_migrations (hash, created_at) VALUES ('0001_programaciones', ?)`,
      [Date.now()],
    );
  }

  // ─── Migración 0002: Cumplimiento de producción ──────────────────────────
  const result0002 = await db.execute(
    `SELECT COUNT(*) as count FROM drizzle_migrations WHERE hash = '0002_cumplimiento'`,
  );
  const count0002 =
    result0002.rows.length > 0
      ? (result0002.rows[0] as {count: number}).count
      : 0;

  if (count0002 === 0) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cumplimiento_programacion (
        id INTEGER PRIMARY KEY,
        server_id INTEGER,
        programacion_detalle_id INTEGER NOT NULL,
        programacion_id INTEGER NOT NULL,
        semana INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        papel_real INTEGER NOT NULL DEFAULT 0,
        sobre_real INTEGER NOT NULL DEFAULT 0,
        total_real INTEGER NOT NULL DEFAULT 0,
        creado_por INTEGER,
        created_at INTEGER,
        updated_at INTEGER
      )
    `);

    await db.execute(
      `INSERT INTO drizzle_migrations (hash, created_at) VALUES ('0002_cumplimiento', ?)`,
      [Date.now()],
    );
  }
}

/**
 * Cierra la conexión a la base de datos.
 * Llamar solo al desmontar la app (raramente necesario en mobile).
 */
export function closeDatabase() {
  if (_sqliteDb) {
    _sqliteDb.close();
    _sqliteDb = null;
    _db = null;
  }
}
