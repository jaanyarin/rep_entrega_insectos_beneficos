/**
 * db/repositories/index.ts — Barrel export para repositories offline.
 *
 * Uso:
 * ```typescript
 * import { catalogosRepo, requerimientosRepo, photosRepo, programacionesRepo, despachosRepo, recepcionesRepo, liberacionesRepo } from '../db/repositories';
 * ```
 */

import * as catalogosRepo from './catalogos';
import * as requerimientosRepo from './requerimientos';
import * as photosRepo from './photos';
import * as programacionesRepo from './programaciones';
import * as cumplimientoRepo from './cumplimiento';
import * as despachosRepo from './despachos';
import * as recepcionesRepo from './recepciones';
import * as liberacionesRepo from './liberaciones';

export {
  catalogosRepo,
  requerimientosRepo,
  photosRepo,
  programacionesRepo,
  cumplimientoRepo,
  despachosRepo,
  recepcionesRepo,
  liberacionesRepo,
};
export type {RequerimientoLocal, FiltrosRequerimiento} from './requerimientos';
export type {FotoLocal, SavePhotoResult} from './photos';
export type {
  ProgramacionLocal,
  ProgramacionDetalleLocal,
  ProgramacionConDetalle,
} from './programaciones';
export type {CumplimientoLocal} from './cumplimiento';
export type {DespachoLocal} from './despachos';
export type {RecepcionLocal} from './recepciones';
export type {LiberacionLocal} from './liberaciones';
