/**
 * db/repositories/index.ts — Barrel export para repositories offline.
 *
 * Uso:
 * ```typescript
 * import { catalogosRepo, requerimientosRepo, photosRepo, programacionesRepo } from '../db/repositories';
 * ```
 */

import * as catalogosRepo from './catalogos';
import * as requerimientosRepo from './requerimientos';
import * as photosRepo from './photos';
import * as programacionesRepo from './programaciones';

export {catalogosRepo, requerimientosRepo, photosRepo, programacionesRepo};
export type {RequerimientoLocal, FiltrosRequerimiento} from './requerimientos';
export type {FotoLocal, SavePhotoResult} from './photos';
export type {
  ProgramacionLocal,
  ProgramacionDetalleLocal,
  ProgramacionConDetalle,
} from './programaciones';
