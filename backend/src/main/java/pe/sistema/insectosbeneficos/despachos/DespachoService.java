package pe.sistema.insectosbeneficos.despachos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.despachos.dto.CrearDespachoRequest;
import pe.sistema.insectosbeneficos.despachos.dto.DespachoDto;
import pe.sistema.insectosbeneficos.requerimientos.Requerimiento;
import pe.sistema.insectosbeneficos.requerimientos.RequerimientoRepository;
import pe.sistema.insectosbeneficos.requerimientos.RequerimientoService;
import pe.sistema.insectosbeneficos.seguridad.ActualUsuario;
import pe.sistema.insectosbeneficos.seguridad.ApiException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de dominio del módulo de Despachos (HITO-015 / MOD-06).
 * Reglas de negocio:
 *  - Solo se puede despachar un requerimiento en estado APROBADO (RF-066).
 *  - La cantidad despachada no puede superar la cantidad requerida (RN-008).
 *  - El stock disponible se descuenta automáticamente (RN-007/069).
 *  - Soporta despacho parcial (RF-064) y total (RF-065).
 *  - Si el despacho es total → papel/sobre obligatorios y suma == cantidad (RN-065).
 */
@ApplicationScoped
public class DespachoService {

    @Inject
    DespachoRepository despachoRepository;

    @Inject
    RequerimientoRepository requerimientoRepository;

    @Inject
    RequerimientoService requerimientoService;

    @Inject
    DespachoMapper mapper;

    @Inject
    ActualUsuario actualUsuario;

    public List<DespachoDto> listarPorRequerimiento(Long requerimientoId) {
        return despachoRepository.findByRequerimientoId(requerimientoId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DespachoDto crear(Long requerimientoId, CrearDespachoRequest req) {
        Requerimiento r = requerimientoRepository.findByIdOptional(requerimientoId)
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "REQUERIMIENTO_NO_ENCONTRADO", "Requerimiento no encontrado"));

        // RF-066: solo se puede despachar un requerimiento en estado APROBADO
        if (!"APROBADO".equals(r.getEstado())) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "ESTADO_NO_VALIDO",
                    "Solo se pueden despachar requerimientos en estado APROBADO");
        }

        // RN-008: la cantidad despachada no puede superar la requerida
        if (req.getCantidadDespachada().compareTo(r.getCantidad()) > 0) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "CANTIDAD_DESPACHO_INVALIDA",
                    "La cantidad despachada no puede superar la cantidad requerida");
        }

        boolean esDespachoTotal = req.getCantidadDespachada().compareTo(r.getCantidad()) == 0;

        // RF-065: despacho total exige papel/sobre cuya suma == cantidad
        if (esDespachoTotal) {
            if (req.getPapelConPostura() == null || req.getSobreConCascarilla() == null) {
                throw new ApiException(Response.Status.BAD_REQUEST,
                        "DESPACHO_TOTAL_PAPEL_SOBRE",
                        "El despacho total requiere indicar papel con postura y sobre con cascarilla");
            }
            BigDecimal suma = req.getPapelConPostura().add(req.getSobreConCascarilla());
            if (suma.compareTo(r.getCantidad()) != 0) {
                throw new ApiException(Response.Status.BAD_REQUEST,
                        "DESPACHO_TOTAL_PAPEL_SOBRE",
                        "La suma de papel con postura y sobre con cascarilla debe igualar la cantidad despachada");
            }
        }

        // Crear el despacho
        Despacho d = new Despacho();
        d.setRequerimiento(r);
        d.setCantidadDespachada(req.getCantidadDespachada());
        d.setPapelConPostura(req.getPapelConPostura());
        d.setSobreConCascarilla(req.getSobreConCascarilla());
        d.setObservaciones(req.getObservaciones());
        d.setCreadoPor(actualUsuario.getId());
        d.setCreatedAt(Instant.now());
        d.setUpdatedAt(Instant.now());
        despachoRepository.persist(d);

        // RF-066: cambiar estado del requerimiento a ENTREGADO
        // RF-069: el stock se descuenta al cambiar de estado (RequerimientoService recalcula)
        r.setEstado("ENTREGADO");
        if (esDespachoTotal) {
            r.setPapelConPostura(req.getPapelConPostura());
            r.setSobreConCascarilla(req.getSobreConCascarilla());
        }
        r.setUpdatedAt(Instant.now());
        requerimientoRepository.persist(r);

        return mapper.toDto(d);
    }
}
