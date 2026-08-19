/**
 * versionHistory.ts — Acceso tipado al historial de versiones para las
 * pantallas (PerfilScreen).
 *
 * Re-exporta la ÚNICA fuente de verdad del historial (`versionHistory.js` en
 * la raíz de mobile/, Ley 3 y AGENTS.md §7). No duplica datos: importa el
 * array y solo agrega el tipo TS.
 */

import versionHistory from '../../versionHistory';

export interface VersionEntry {
  version: string;
  fecha: string;
  cambios: string[];
}

const history: VersionEntry[] = versionHistory as VersionEntry[];

export default history;