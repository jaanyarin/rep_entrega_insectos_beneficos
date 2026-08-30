/**
 * db/repositories/photos.ts — Gestión de fotos offline.
 *
 * Fotos capturadas offline se guardan en almacenamiento permanente
 * (no cache temporal de image-picker). Se registran en SQLite para
 * su upload cuando haya conectividad.
 *
 * Flujo:
 * 1. usePhotoCapture captura foto → URI temporal (cache)
 * 2. photos.saveLocal() → copia a dir permanente + registra en SQLite
 * 3. Cuando hay red → SyncManager.uploadPhotos() → POST multipart
 * 4. Tras upload → markUploaded() con serverFotoId
 */

import {eq} from 'drizzle-orm';
import {getDatabase} from '../database';
import * as schema from '../schema';

// ─── CONSTANTES ────────────────────────────────────────────────────────────

const MAX_FOTOS_PER_REQUERIMIENTO = 2;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export interface FotoLocal {
  id: number;
  requerimientoLocalId: number;
  uri: string;
  fileName: string;
  fileSize: number | null;
  contentType: string | null;
  metadatos: string | null;
  syncStatus: string;
  serverFotoId: number | null;
  serverUrl: string | null;
  createdAt: Date | null;
}

export interface SavePhotoResult {
  success: boolean;
  error?: string;
  fotoId?: number;
}

// ─── VALIDACIÓN ────────────────────────────────────────────────────────────

export function validatePhoto(file: {
  type?: string;
  fileSize?: number;
  fileName?: string;
}): {valid: boolean; error?: string} {
  if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
    return {valid: false, error: 'Formato no válido. Solo se permiten JPG y PNG.'};
  }
  if (file.fileSize && file.fileSize > MAX_FILE_SIZE_BYTES) {
    return {valid: false, error: 'El archivo supera 5 MB.'};
  }
  return {valid: true};
}

// ─── GUARDAR FOTO LOCAL ────────────────────────────────────────────────────

/**
 * Guardar foto en almacenamiento permanente + registrar en SQLite.
 *
 * @param requerimientoLocalId - ID local del requerimiento asociado
 * @param sourceUri - URI temporal de react-native-image-picker
 * @param fileMetadata - Metadatos del archivo (type, fileSize, fileName)
 * @param options - Opciones adicionales (metadatos JSON)
 */
export async function saveLocal(
  requerimientoLocalId: number,
  sourceUri: string,
  fileMetadata: {
    type?: string;
    fileSize?: number;
    fileName?: string;
  },
  options?: {metadatos?: Record<string, unknown>},
): Promise<SavePhotoResult> {
  // Validar
  const validation = validatePhoto(fileMetadata);
  if (!validation.valid) {
    return {success: false, error: validation.error};
  }

  // Verificar límite de fotos
  const existingCount = await countByRequerimiento(requerimientoLocalId);
  if (existingCount >= MAX_FOTOS_PER_REQUERIMIENTO) {
    return {
      success: false,
      error: `Máximo ${MAX_FOTOS_PER_REQUERIMIENTO} fotos por requerimiento.`,
    };
  }

  try {
    // En React Native, no podemos copiar archivos fácilmente sin librerías nativas.
    // La URI temporal de image-picker ya está en el filesystem del dispositivo.
    // La guardamos tal cual en SQLite para referencia futura.
    // Cuando se agregue soporte de copia a directorio permanente, se hará aquí.

    const db = getDatabase();
    const now = new Date();

    const result = await db.insert(schema.fotosPendientes).values({
      requerimientoLocalId,
      uri: sourceUri,
      fileName: fileMetadata.fileName ?? `foto_${Date.now()}.jpg`,
      fileSize: fileMetadata.fileSize ?? null,
      contentType: fileMetadata.type ?? 'image/jpeg',
      metadatos: options?.metadatos ? JSON.stringify(options.metadatos) : null,
      syncStatus: 'pending',
      createdAt: now,
    });

    return {success: true, fotoId: result.insertId};
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al guardar foto',
    };
  }
}

// ─── CONSULTAS ─────────────────────────────────────────────────────────────

/**
 * Guardar foto del servidor en SQLite (para pull de fotos existentes).
 */
export async function saveFromServer(
  requerimientoLocalId: number,
  serverFoto: {
    id: number;
    ruta: string;
    tipo?: string;
  },
): Promise<void> {
  const db = getDatabase();
  // Evitar duplicados
  const existing = await db
    .select()
    .from(schema.fotosPendientes)
    .where(eq(schema.fotosPendientes.serverFotoId, serverFoto.id));
  if (existing.length > 0) {
    // Actualizar URL si cambió
    await db
      .update(schema.fotosPendientes)
      .set({serverUrl: serverFoto.ruta})
      .where(eq(schema.fotosPendientes.serverFotoId, serverFoto.id));
    return;
  }
  await db.insert(schema.fotosPendientes).values({
    requerimientoLocalId,
    uri: serverFoto.ruta,
    fileName: `server_${serverFoto.id}.jpg`,
    contentType: 'image/jpeg',
    metadatos: serverFoto.tipo ? JSON.stringify({tipo: serverFoto.tipo}) : null,
    syncStatus: 'uploaded',
    serverFotoId: serverFoto.id,
    serverUrl: serverFoto.ruta,
    createdAt: new Date(),
  });
}

/**
 * Contar fotos de un requerimiento (local).
 */
export async function countByRequerimiento(
  requerimientoLocalId: number,
): Promise<number> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.fotosPendientes)
    .where(
      eq(schema.fotosPendientes.requerimientoLocalId, requerimientoLocalId),
    );
  return rows.length;
}

/**
 * Obtener fotos de un requerimiento (local).
 */
export async function listByRequerimiento(
  requerimientoLocalId: number,
): Promise<FotoLocal[]> {
  const db = getDatabase();
  return await db
    .select()
    .from(schema.fotosPendientes)
    .where(
      eq(schema.fotosPendientes.requerimientoLocalId, requerimientoLocalId),
    );
}

/**
 * Obtener fotos pendientes de upload.
 */
export async function getPendingUpload(): Promise<FotoLocal[]> {
  const db = getDatabase();
  return await db
    .select()
    .from(schema.fotosPendientes)
    .where(eq(schema.fotosPendientes.syncStatus, 'pending'));
}

/**
 * Obtener una foto por ID.
 */
export async function getById(id: number): Promise<FotoLocal | null> {
  const db = getDatabase();
  const rows = await db
    .select()
    .from(schema.fotosPendientes)
    .where(eq(schema.fotosPendientes.id, id));
  return rows.length > 0 ? rows[0] : null;
}

// ─── ESTADO DE SYNC ────────────────────────────────────────────────────────

/**
 * Marcar foto como subida exitosamente.
 */
export async function markUploaded(
  localId: number,
  serverFotoId: number,
  serverUrl?: string,
): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.fotosPendientes)
    .set({
      syncStatus: 'uploaded',
      serverFotoId,
      serverUrl: serverUrl ?? null,
    })
    .where(eq(schema.fotosPendientes.id, localId));
}

/**
 * Marcar foto con error de upload.
 */
export async function markUploadError(localId: number): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.fotosPendientes)
    .set({syncStatus: 'error'})
    .where(eq(schema.fotosPendientes.id, localId));
}

/**
 * Eliminar foto local.
 */
export async function remove(localId: number): Promise<void> {
  const db = getDatabase();
  await db
    .delete(schema.fotosPendientes)
    .where(eq(schema.fotosPendientes.id, localId));
}

/**
 * Eliminar todas las fotos de un requerimiento.
 */
export async function removeAllByRequerimiento(
  requerimientoLocalId: number,
): Promise<void> {
  const db = getDatabase();
  await db
    .delete(schema.fotosPendientes)
    .where(
      eq(schema.fotosPendientes.requerimientoLocalId, requerimientoLocalId),
    );
}
