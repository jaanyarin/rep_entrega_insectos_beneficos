/**
 * useRequerimientosCatalogos — Hook compartido que carga los catálogos del
 * módulo Requerimientos (Screen 8/10/13): fundos, lotes (por fundo), especies,
 * etapas fenológicas y plagas objetivo. Evita duplicar la lógica de carga en
 * cada pantalla (DRY).
 *
 * Al cambiar el Fundo se recargan los Lotes (`cargarLotes(fundoId)`). Si la
 * carga de un catálogo falla, el error lo reporta `errorCatalogo` (las
 * pantallas deciden cómo mostrarlo, normalmente ErrorState) y `lotes` se
 * limpia para evitar opciones huérfanas de un fundo anterior.
 */

import {useCallback, useEffect, useState} from 'react';
import {
  extractErrorMessage,
  listarEspecies,
  listarEtapasFenologicas,
  listarFundos,
  listarLotes,
  listarPlagas,
  type EspecieDto,
  type EtapaFenologicaDto,
  type FundoDto,
  type LoteDto,
  type PlagaDto,
} from '../services/ApiClient';

export function useRequerimientosCatalogos() {
  const [fundos, setFundos] = useState<FundoDto[]>([]);
  const [lotes, setLotes] = useState<LoteDto[]>([]);
  const [especies, setEspecies] = useState<EspecieDto[]>([]);
  const [etapas, setEtapas] = useState<EtapaFenologicaDto[]>([]);
  const [plagas, setPlagas] = useState<PlagaDto[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState<string | null>(null);

  const cargarLotes = useCallback(async (fundoId: number) => {
    try {
      const data = await listarLotes(fundoId);
      setLotes(data);
    } catch {
      setLotes([]);
    }
  }, []);

  const cargarCatalogos = useCallback(async () => {
    setLoadingCatalogo(true);
    setErrorCatalogo(null);
    try {
      const [f, e, et, p] = await Promise.all([
        listarFundos(),
        listarEspecies(),
        listarEtapasFenologicas(),
        listarPlagas(),
      ]);
      setFundos(f);
      setEspecies(e);
      setEtapas(et);
      setPlagas(p);
    } catch (err) {
      setErrorCatalogo(extractErrorMessage(err));
    } finally {
      setLoadingCatalogo(false);
    }
  }, []);

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
