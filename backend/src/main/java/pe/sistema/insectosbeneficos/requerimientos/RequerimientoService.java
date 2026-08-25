package pe.sistema.insectosbeneficos.requerimientos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.catalogos.EtapaFenologica;
import pe.sistema.insectosbeneficos.catalogos.EtapaFenologicaRepository;
import pe.sistema.insectosbeneficos.catalogos.Fundo;
import pe.sistema.insectosbeneficos.catalogos.FundoRepository;
import pe.sistema.insectosbeneficos.catalogos.Lote;
import pe.sistema.insectosbeneficos.catalogos.LoteRepository;
import pe.sistema.insectosbeneficos.catalogos.Plaga;
import pe.sistema.insectosbeneficos.catalogos.PlagaRepository;
import pe.sistema.insectosbeneficos.programacion.Especie;
import pe.sistema.insectosbeneficos.programacion.EspecieRepository;
import pe.sistema.insectosbeneficos.programacion.Programacion;
import pe.sistema.insectosbeneficos.programacion.ProgramacionRepository;
import pe.sistema.insectosbeneficos.requerimientos.dto.ActualizarRequerimientoRequest;
import pe.sistema.insectosbeneficos.requerimientos.dto.CrearRequerimientoRequest;
import pe.sistema.insectosbeneficos.requerimientos.dto.RequerimientoDto;
import pe.sistema.insectosbeneficos.seguridad.ActualUsuario;
import pe.sistema.insectosbeneficos.seguridad.ApiException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de dominio del módulo de requerimientos (HITO-008).
 * Patrón y estilo de errores ({@link ApiException}) idéntico a
 * {@code ProgramacionService}. Las reglas de negocio clave:
 *  - crear: estado inicial REGISTRADO, stockDisponible calculado, creadoPor = usuario actual.
 *  - actualizar: transición hacia adelante en el ciclo (no retroceder, no volver desde LIBERADO);
 *    al pasar a ENTREGADO exige papelConPostura + sobreConCascarilla cuya suma == cantidad.
 */
@ApplicationScoped
public class RequerimientoService {

    /** Ciclo de estados del dominio (orden de avance). */
    private static final List<String> CICLO =
            List.of("REGISTRADO", "PENDIENTE", "APROBADO", "ENTREGADO", "RECIBIDO", "LIBERADO");

    @Inject
    RequerimientoRepository requerimientoRepository;

    @Inject
    ProgramacionRepository programacionRepository;

    @Inject
    EspecieRepository especieRepository;

    @Inject
    FundoRepository fundoRepository;

    @Inject
    LoteRepository loteRepository;

    @Inject
    EtapaFenologicaRepository etapaFenologicaRepository;

    @Inject
    PlagaRepository plagaRepository;

    @Inject
    RequerimientoMapper mapper;

    @Inject
    ActualUsuario actualUsuario;

    // ------------------------------------------------------------------
    // Lectura
    // ------------------------------------------------------------------

    public List<RequerimientoDto> listar(LocalDate fechaDesde, LocalDate fechaHasta, String estado, Long creadoPor) {
        return requerimientoRepository.findByFiltros(fechaDesde, fechaHasta, estado, creadoPor).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public RequerimientoDto obtenerPorId(Long id) {
        Requerimiento r = requerimientoRepository.findByIdOptional(id)
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "REQUERIMIENTO_NO_ENCONTRADO", "Requerimiento no encontrado"));
        return mapper.toDto(r);
    }

    /**
     * Stock disponible en tiempo real de una especie (Screen 10 del mobile).
     * Usa la programación más reciente de la especie (anio+mes desc):
     * stockInicialBase - suma de requerimientos de la especie, nunca < 0.
     * Si no hay programación para la especie → 0.
     */
    public BigDecimal getStockDisponible(Long especiaId) {
        List<Programacion> progs = programacionRepository.list(
                "especie.id = ?1 order by anio desc, mes desc", especiaId);
        if (progs.isEmpty()) {
            return BigDecimal.ZERO;
        }
        Programacion ultima = progs.get(0);
        BigDecimal base = BigDecimal.valueOf(ultima.getStockInicialBase());
        BigDecimal requerido = requerimientoRepository.sumCantidadByEspecie(especiaId);
        return base.subtract(requerido).max(BigDecimal.ZERO);
    }

    // ------------------------------------------------------------------
    // Escritura
    // ------------------------------------------------------------------

    @Transactional
    public RequerimientoDto crear(CrearRequerimientoRequest req) {
        validarCantidad(req.getCantidad());

        Fundo fundo = fundoRepository.findByIdOptional(req.getFundoId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "FUNDO_NO_EXISTE", "Fundo no encontrado"));
        Lote lote = loteRepository.findByIdOptional(req.getLoteId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "LOTE_NO_EXISTE", "Lote no encontrado"));
        Especie especie = especieRepository.findByIdOptional(req.getEspecieId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "ESPECIE_NO_EXISTE", "Especie no encontrada"));
        EtapaFenologica etapa = resolverEtapa(req.getEtapaFenologicaId());
        Plaga plaga = resolverPlaga(req.getPlagaId());

        BigDecimal stock = getStockDisponible(especie.getId());
        if (req.getCantidad().compareTo(stock) > 0) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "CANTIDAD_INVALIDA", "La cantidad supera el stock disponible");
        }

        Requerimiento r = new Requerimiento();
        r.setFecha(req.getFecha());
        r.setFundo(fundo);
        r.setLote(lote);
        r.setEspecie(especie);
        r.setEtapaFenologica(etapa);
        r.setCantidad(req.getCantidad());
        r.setPlaga(plaga);
        r.setEstado("REGISTRADO");
        r.setStockDisponible(stock);
        r.setObservaciones(req.getObservaciones());
        r.setCreadoPor(actualUsuario.getId());
        r.setCreatedAt(Instant.now());
        r.setUpdatedAt(Instant.now());
        requerimientoRepository.persist(r);
        return mapper.toDto(r);
    }

    @Transactional
    public RequerimientoDto actualizar(Long id, ActualizarRequerimientoRequest req) {
        Requerimiento r = requerimientoRepository.findByIdOptional(id)
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "REQUERIMIENTO_NO_ENCONTRADO", "Requerimiento no encontrado"));

        validarCantidad(req.getCantidad());

        Fundo fundo = fundoRepository.findByIdOptional(req.getFundoId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "FUNDO_NO_EXISTE", "Fundo no encontrado"));
        Lote lote = loteRepository.findByIdOptional(req.getLoteId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "LOTE_NO_EXISTE", "Lote no encontrado"));
        Especie especie = especieRepository.findByIdOptional(req.getEspecieId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "ESPECIE_NO_EXISTE", "Especie no encontrada"));
        EtapaFenologica etapa = resolverEtapa(req.getEtapaFenologicaId());
        Plaga plaga = resolverPlaga(req.getPlagaId());

        validarTransicion(r.getEstado(), req.getEstado());

        // Aplica campos básicos
        r.setFecha(req.getFecha());
        r.setFundo(fundo);
        r.setLote(lote);
        r.setEspecie(especie);
        r.setEtapaFenologica(etapa);
        r.setCantidad(req.getCantidad());
        r.setPlaga(plaga);
        if (req.getObservaciones() != null) {
            r.setObservaciones(req.getObservaciones());
        }

        if ("ENTREGADO".equals(req.getEstado())) {
            validarEntrega(req);
            r.setPapelConPostura(req.getPapelConPostura());
            r.setSobreConCascarilla(req.getSobreConCascarilla());
            if (req.getFechaLiberacion() != null) {
                r.setFechaLiberacion(req.getFechaLiberacion());
            }
            if (req.getHoraLiberacion() != null) {
                r.setHoraLiberacion(req.getHoraLiberacion());
            }
        }

        r.setEstado(req.getEstado());
        r.setStockDisponible(getStockDisponible(especie.getId()));
        r.setUpdatedAt(Instant.now());
        return mapper.toDto(r);
    }

    // ------------------------------------------------------------------
    // Helpers de validación
    // ------------------------------------------------------------------

    private void validarCantidad(BigDecimal cantidad) {
        if (cantidad == null || cantidad.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "CANTIDAD_INVALIDA", "La cantidad debe ser mayor a cero");
        }
    }

    private void validarTransicion(String estadoActual, String estadoNuevo) {
        int idxNuevo = CICLO.indexOf(estadoNuevo);
        if (idxNuevo == -1) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "ESTADO_NO_VALIDO", "Estado de requerimiento no válido");
        }
        int idxActual = CICLO.indexOf(estadoActual);
        if (idxNuevo < idxActual) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "ESTADO_NO_VALIDO", "No se puede retroceder en el ciclo de estados del requerimiento");
        }
    }

    private void validarEntrega(ActualizarRequerimientoRequest req) {
        if (req.getPapelConPostura() == null || req.getSobreConCascarilla() == null) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "ENTREGADO_PAPEL_SOBRE_INVALIDO",
                    "Debe indicar papel con postura y sobre con cascarilla para entregar");
        }
        BigDecimal suma = req.getPapelConPostura().add(req.getSobreConCascarilla());
        if (suma.compareTo(req.getCantidad()) != 0) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "ENTREGADO_PAPEL_SOBRE_INVALIDO",
                    "La suma de papel con postura y sobre con cascarilla debe igualar la cantidad");
        }
    }

    private EtapaFenologica resolverEtapa(Long id) {
        if (id == null) {
            return null;
        }
        return etapaFenologicaRepository.findByIdOptional(id)
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "ETAPA_NO_EXISTE", "Etapa fenológica no encontrada"));
    }

    private Plaga resolverPlaga(Long id) {
        if (id == null) {
            return null;
        }
        return plagaRepository.findByIdOptional(id)
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "PLAGA_NO_EXISTE", "Plaga no encontrada"));
    }
}
