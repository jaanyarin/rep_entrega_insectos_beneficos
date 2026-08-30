/**
 * useRequerimientosCatalogos — Hook compartido que carga los catálogos del
 * módulo Requerimientos (Screen 8/10/13): fundos, lotes (por fundo), especies,
 * etapas fenológicas y plagas objetivo. Evita duplicar la lógica de carga en
 * cada pantalla (DRY).
 *
 * Modo SQLite-first (FASE 2 — HITO-013):
 * - Si hay red → fetch del servidor + guardar en SQLite (sync)
 * - Siempre leer de SQLite local (funciona online y offline)
 * - Si no hay red y no hay cache → reportar error
 *
 * Al cambiar el Fundo se recargan los Lotes (`cargarLotes(fundoId)`). Si la
 * carga de un catálogo falla, el error lo reporta `errorCatalogo` (las
 * pantallas deciden cómo mostrarlo, normalmente ErrorState) y `lotes` se
 * limpia para evitar opciones huérfanas de un fundo anterior.
 */

import {useCallback, useEffect, useState} from 'react';
import {
  type EspecieDto,
  type EtapaFenologicaDto,
  type FundoDto,
  type LoteDto,
  type PlagaDto,
} from '../services/ApiClient';
import {catalogosRepo} from '../db/repositories';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';

export function useRequerimientosCatalogos() {
  const isOnline = useOnlineStatus();
  const [fundos, setFundos] = useState<FundoDto[]>([]);
  const [lotes, setLotes] = useState<LoteDto[]>([]);
  const [especies, setEspecies] = useState<EspecieDto[]>([]);
  const [etapas, setEtapas] = useState<EtapaFenologicaDto[]>([]);
  const [plagas, setPlagas] = useState<PlagaDto[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState<string | null>(null);

  const cargarLotes = useCallback(async (fundoId: number) => {
    try {
      // Si hay red, intentar sync; si falla, usar cache local
      if (isOnline) {
        await catalogosRepo.syncLotes(fundoId);
      }
      const data = await catalogosRepo.getLotesLocal(fundoId);
      setLotes(data);
    } catch {
      setLotes([]);
    }
  }, [isOnline]);

  const cargarCatalogos = useCallback(async () => {
    setLoadingCatalogo(true);
    setErrorCatalogo(null);
    try {
      if (isOnline) {
        // Sync completa desde servidor
        await catalogosRepo.syncAllCatalogos();
      }
      // Siempre leer de SQLite (funciona online y offline)
      const [f, e, et, p] = await Promise.all([
        catalogosRepo.getFundosLocal(),
        catalogosRepo.getEspeciesLocal(),
        catalogosRepo.getEtapasFenologicasLocal(),
        catalogosRepo.getPlagasLocal(),
      ]);
      setFundos(f);
      setEspecies(e);
      setEtapas(et);
      setPlagas(p);
      // Si todo vino vacío y estamos offline, reportar error
      if (f.length === 0 && e.length === 0 && !isOnline) {
        setErrorCatalogo(
          'Sin conexión y sin datos locales. Conéctese una vez para descargar catálogos.',
        );
      }
    } catch {
      // Fallback: intentar leer de SQLite directamente
      try {
        const [f, e, et, p] = await Promise.all([
          catalogosRepo.getFundosLocal(),
          catalogosRepo.getEspeciesLocal(),
          catalogosRepo.getEtapasFenologicasLocal(),
          catalogosRepo.getPlagasLocal(),
        ]);
        setFundos(f);
        setEspecies(e);
        setEtapas(et);
        setPlagas(p);
      } catch {
        setErrorCatalogo('Error al cargar catálogos.');
      }
    } finally {
      setLoadingCatalogo(false);
    }
  }, [isOnline]);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  return {
    fundos,
    lotes,
    especies,
    etapas,
    plagas,
    loadingCatalogo,
    errorCatalogo,
    cargarLotes,
    reload: cargarCatalogos,
  };
}
