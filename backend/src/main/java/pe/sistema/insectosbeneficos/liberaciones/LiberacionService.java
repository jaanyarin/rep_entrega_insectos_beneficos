package pe.sistema.insectosbeneficos.liberaciones;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.catalogos.Fundo;
import pe.sistema.insectosbeneficos.catalogos.FundoRepository;
import pe.sistema.insectosbeneficos.catalogos.Lote;
import pe.sistema.insectosbeneficos.catalogos.LoteRepository;
import pe.sistema.insectosbeneficos.liberaciones.dto.CrearLiberacionRequest;
import pe.sistema.insectosbeneficos.liberaciones.dto.LiberacionDto;
import pe.sistema.insectosbeneficos.requerimientos.Requerimiento;
import pe.sistema.insectosbeneficos.requerimientos.RequerimientoRepository;
import pe.sistema.insectosbeneficos.seguridad.ActualUsuario;
import pe.sistema.insectosbeneficos.seguridad.ApiException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de dominio del módulo de Liberaciones (HITO-015 / MOD-08).
 * Reglas de negocio:
 *  - Solo se puede liberar un requerimiento en estado RECIBIDO (RF-086).
 *  - La cantidad liberada no puede superar la cantidad recibida (RN-011).
 *  - Se requiere al menos 1 foto como evidencia (RN-009) — validación en mobile.
 *  - La fecha/hora se registra automáticamente (RN-010, RF-083).
 *  - Soporta liberación parcial y múltiples liberaciones (RF-085/089).
 */
@ApplicationScoped
public class LiberacionService {

    @Inject
    LiberacionRepository liberacionRepository;

    @Inject
    RequerimientoRepository requerimientoRepository;

    @Inject
    FundoRepository fundoRepository;

    @Inject
    LoteRepository loteRepository;

    @Inject
    LiberacionMapper mapper;

    @Inject
    ActualUsuario actualUsuario;

    public List<LiberacionDto> listarPorRequerimiento(Long requerimientoId) {
        return liberacionRepository.findByRequerimientoId(requerimientoId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LiberacionDto crear(Long requerimientoId, CrearLiberacionRequest req) {
        Requerimiento r = requerimientoRepository.findByIdOptional(requerimientoId)
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "REQUERIMIENTO_NO_ENCONTRADO", "Requerimiento no encontrado"));

        // RF-086: solo se puede liberar un requerimiento en estado RECIBIDO
        if (!"RECIBIDO".equals(r.getEstado())) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "ESTADO_NO_VALIDO",
                    "Solo se pueden liberar requerimientos en estado RECIBIDO");
        }

        // RN-011: la cantidad liberada no puede superar la cantidad recibida
        if (req.getCantidadLiberada().compareTo(r.getCantidad()) > 0) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "CANTIDAD_LIBERACION_INVALIDA",
                    "La cantidad liberada no puede superar la cantidad del requerimiento");
        }

        Fundo fundo = fundoRepository.findByIdOptional(req.getFundoId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "FUNDO_NO_EXISTE", "Fundo no encontrado"));
        Lote lote = loteRepository.findByIdOptional(req.getLoteId())
                .orElseThrow(() -> new ApiException(Response.Status.NOT_FOUND,
                        "LOTE_NO_EXISTE", "Lote no encontrado"));

        // Crear la liberación (RN-010, RF-083: fecha/hora automática)
        Liberacion lib = new Liberacion();
        lib.setRequerimiento(r);
        lib.setFundo(fundo);
        lib.setLote(lote);
        lib.setCantidadLiberada(req.getCantidadLiberada());
        lib.setObservaciones(req.getObservaciones());
        lib.setFechaLiberacion(Instant.now());
        lib.setHoraLiberacion(req.getHoraLiberacion());
        lib.setCreadoPor(actualUsuario.getId());
        lib.setCreatedAt(Instant.now());
        liberacionRepository.persist(lib);

        // RF-086: cambiar estado del requerimiento a LIBERADO
        r.setEstado("LIBERADO");
        r.setFechaLiberacion(Instant.now());
        r.setHoraLiberacion(req.getHoraLiberacion());
        r.setUpdatedAt(Instant.now());
        requerimientoRepository.persist(r);

        return mapper.toDto(lib);
    }
}
