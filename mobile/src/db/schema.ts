/**
 * db/schema.ts — Schema Drizzle ORM para SQLite local (offline mode).
 *
 * Define las tablas locales que permiten:
 * - Cache de catálogos (read-only, pull del servidor)
 * - CRUD offline de requerimientos (con sync_status)
 * - Captura offline de fotos (cola de upload)
 * - Cola de sincronización (outbox pattern)
 *
 * Las tablas espejo las del backend PostgreSQL; los IDs locales son
 * temporales (negativos) hasta que se sincronicen con el servidor.
 */

import {sqliteTable, integer, text, real} from 'drizzle-orm/sqlite-core';

// ─── CATÁLOGOS (read-only cache) ───────────────────────────────────────────

export const fundos = sqliteTable('fundos', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  estado: text('estado').default('ACTIVO'),
  fetchedAt: integer('fetched_at', {mode: 'timestamp'}),
});

export const lotes = sqliteTable('lotes', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  fundoId: integer('fundo_id').notNull(),
  variedadId: integer('variedad_id'),
  color: text('color'),
  area: real('area'),
  fetchedAt: integer('fetched_at', {mode: 'timestamp'}),
});

export const especies = sqliteTable('especies', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  fetchedAt: integer('fetched_at', {mode: 'timestamp'}),
});

export const etapasFenologicas = sqliteTable('etapas_fenologicas', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  fetchedAt: integer('fetched_at', {mode: 'timestamp'}),
});

export const plagas = sqliteTable('plagas', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  fetchedAt: integer('fetched_at', {mode: 'timestamp'}),
});

// ─── REQUERIMIENTOS (CRUD offline) ────────────────────────────────────────

export const requerimientos = sqliteTable('requerimientos', {
  /** ID local temporal (negativo hasta sincronizar). */
  id: integer('id').primaryKey(),
  /** ID en el servidor (null = no sincronizado aún). */
  serverId: integer('server_id'),
  fecha: text('fecha').notNull(),
  fundoId: integer('fundo_id').notNull(),
  loteId: integer('lote_id').notNull(),
  especieId: integer('especie_id').notNull(),
  etapaFenologicaId: integer('etapa_fenologica_id'),
  plagaId: integer('plaga_id'),
  cantidad: integer('cantidad').notNull(),
  estado: text('estado').notNull().default('REGISTRADO'),
  stockDisponible: integer('stock_disponible'),
  observaciones: text('observaciones'),
  papelConPostura: integer('papel_con_postura'),
  sobreConCascarilla: integer('sobre_con_cascarilla'),
  fechaLiberacion: text('fecha_liberacion'),
  horaLiberacion: text('hora_liberacion'),
  creadoPor: integer('creado_por'),
  /** Estado de sincronización: synced | pending | syncing | conflict. */
  syncStatus: text('sync_status').notNull().default('synced'),
  createdAt: integer('created_at', {mode: 'timestamp'}),
  updatedAt: integer('updated_at', {mode: 'timestamp'}),
});

// ─── FOTOS (captura offline + upload queue) ────────────────────────────────

export const fotosPendientes = sqliteTable('fotos_pendientes', {
  id: integer('id').primaryKey({autoIncrement: true}),
  /** ID local del requerimiento asociado. */
  requerimientoLocalId: integer('requerimiento_local_id').notNull(),
  /** Ruta local permanente (no cache temporal). */
  uri: text('uri').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  contentType: text('content_type'),
  metadatos: text('metadatos'),
  /** Estado: pending | uploading | uploaded | error. */
  syncStatus: text('sync_status').notNull().default('pending'),
  /** ID de la foto en el servidor tras upload exitoso. */
  serverFotoId: integer('server_foto_id'),
  /** URL del servidor para fotos sincronizadas (para mostrar thumbnails). */
  serverUrl: text('server_url'),
  createdAt: integer('created_at', {mode: 'timestamp'}),
});

// ─── COLA DE SYNC (outbox pattern) ────────────────────────────────────────

export const syncOutbox = sqliteTable('sync_outbox', {
  id: integer('id').primaryKey({autoIncrement: true}),
  /** Operación: INSERT | UPDATE | DELETE. */
  operation: text('operation').notNull(),
  /** Tabla afectada: requerimientos | fotos_pendientes. */
  tableName: text('table_name').notNull(),
  /** ID local del registro afectado. */
  recordId: integer('record_id').notNull(),
  /** Payload serializado como JSON. */
  payload: text('payload').notNull(),
  /** Estado: pending | syncing | completed | failed. */
  status: text('status').notNull().default('pending'),
  attempts: integer('attempts').default(0),
  lastError: text('last_error'),
  createdAt: integer('created_at', {mode: 'timestamp'}),
  nextRetryAt: integer('next_retry_at', {mode: 'timestamp'}),
});

// ─── PROGRAMACIONES (cache-first: pull del servidor) ───────────────────────

export const programaciones = sqliteTable('programaciones', {
  id: integer('id').primaryKey(),
  /** ID en el servidor. */
  serverId: integer('server_id'),
  anio: integer('anio').notNull(),
  mes: integer('mes').notNull(),
  especieId: integer('especie_id').notNull(),
  especie: text('especie').notNull(),
  stockInicialBase: integer('stock_inicial_base').notNull(),
  totalMes: integer('total_mes').notNull(),
  estado: text('estado').notNull().default('EN_PROCESO'),
  fetchedAt: integer('fetched_at', {mode: 'timestamp'}),
});

export const programacionDetalles = sqliteTable('programacion_detalles', {
  id: integer('id').primaryKey(),
  serverId: integer('server_id'),
  programacionId: integer('programacion_id').notNull(),
  semana: integer('semana').notNull(),
  fecha: text('fecha').notNull(),
  stockInicial: integer('stock_inicial').notNull(),
  papelConPostura: integer('papel_con_postura').notNull(),
  sobreConCascarilla: integer('sobre_con_cascarilla').notNull(),
  total: integer('total').notNull(),
  stockFinal: integer('stock_final').notNull(),
  estado: text('estado').notNull().default('EN_PROCESO'),
});

// ─── CUMPLIMIENTO DE PRODUCCIÓN (registro real vs programado) ──────────────

export const cumplimientoProgramacion = sqliteTable('cumplimiento_programacion', {
  id: integer('id').primaryKey(),
  serverId: integer('server_id'),
  programacionDetalleId: integer('programacion_detalle_id').notNull(),
  programacionId: integer('programacion_id').notNull(),
  semana: integer('semana').notNull(),
  fecha: text('fecha').notNull(),
  papelReal: integer('papel_real').notNull().default(0),
  sobreReal: integer('sobre_real').notNull().default(0),
  totalReal: integer('total_real').notNull().default(0),
  creadoPor: integer('creado_por'),
  createdAt: integer('created_at', {mode: 'timestamp'}),
  updatedAt: integer('updated_at', {mode: 'timestamp'}),
});
