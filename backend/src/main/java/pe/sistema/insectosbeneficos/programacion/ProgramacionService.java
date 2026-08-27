package pe.sistema.insectosbeneficos.programacion;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pe.sistema.insectosbeneficos.programacion.dto.ProgramacionDto;
import pe.sistema.insectosbeneficos.programacion.dto.UpdateProgramacionRequest;
import pe.sistema.insectosbeneficos.seguridad.ApiException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProgramacionService {

    @Inject
    ProgramacionRepository programacionRepository;

    @Inject
    EspecieRepository especieRepository;

    @Inject
    DetalleProgramacionRepository detalleRepository;

    @Inject
    ProgramacionMapper mapper;

    public List<ProgramacionDto> getProgramaciones(Integer anio, Integer mes) {
        return programacionRepository.findByAnioAndMes(anio, mes).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Programacion crearProgramacionInicial(Integer anio, Integer mes, Especie especie) {
        Programacion p = new Programacion();
        p.setAnio(anio);
        p.setMes(mes);
        p.setEspecie(especie);
        p.setStockInicialBase(5000);
        p.setEstado("EN_PROCESO");

        List<DetalleProgramacion> detalles = new ArrayList<>();
        LocalDate fechaBase = LocalDate.of(anio, mes, 1);
        for (int i = 1; i <= 4; i++) {
            DetalleProgramacion d = new DetalleProgramacion();
            d.setProgramacion(p);
            d.setSemana(i);
            d.setFecha(fechaBase.plusWeeks(i - 1));
            d.setPapelConPostura(0);
            d.setSobreConCascarilla(0);
            d.setTotal(0);
            if (i == 1) {
                d.setStockInicial(5000);
                d.setStockFinal(5000);
            } else {
                d.setStockInicial(0);
                d.setStockFinal(0);
            }
            d.setEstado("EN_PROCESO");
            detalles.add(d);
        }
        p.setDetalles(detalles);
        programacionRepository.persist(p);
        return p;
    }

    /**
     * Crea una nueva programacion validando que no exista para el mismo mes+año+especie.
     * Solo Admin/Super Admin pueden crear programaciones (validado en Resource).
     */
    @Transactional
    public ProgramacionDto crearProgramacion(Integer anio, Integer mes, Long especieId) {
        // Validar que la especie exista
        Especie especie = especieRepository.findByIdOptional(especieId)
                .orElseThrow(() -> new ApiException(jakarta.ws.rs.core.Response.Status.NOT_FOUND,
                        "ESPECIE_NO_ENCONTRADA", "Especie no encontrada"));

        // Validar que no exista ya una programacion para ese mes+año+especie
        if (programacionRepository.findByAnioAndMesAndEspecieId(anio, mes, especieId).isPresent()) {
            throw new ApiException(jakarta.ws.rs.core.Response.Status.CONFLICT,
                    "PROGRAMACION_YA_EXISTE",
                    "Ya existe una programación para este mes, año y especie");
        }

        // Crear la programacion inicial
        Programacion programacion = crearProgramacionInicial(anio, mes, especie);
        return mapper.toDto(programacion);
    }

    public ProgramacionDto getProgramacion(Long id) {
        Programacion p = programacionRepository.findByIdOptional(id)
                .orElseThrow(() -> new ApiException(jakarta.ws.rs.core.Response.Status.NOT_FOUND, "PROGRAMACION_NO_ENCONTRADA", "Programacion no encontrada"));
        return mapper.toDto(p);
    }

    @Transactional
    public ProgramacionDto updateProgramacion(Long id, UpdateProgramacionRequest request) {
        verificarDiaEdicion();

        Programacion p = programacionRepository.findByIdOptional(id)
                .orElseThrow(() -> new ApiException(jakarta.ws.rs.core.Response.Status.NOT_FOUND, "PROGRAMACION_NO_ENCONTRADA", "Programacion no encontrada"));

        if ("PUBLICADO".equals(p.getEstado())) {
            throw new ApiException(jakarta.ws.rs.core.Response.Status.BAD_REQUEST, "PROGRAMACION_PUBLICADA", "No se puede editar una programación publicada");
        }

        if (request.getStockInicialBase() != null) {
            p.setStockInicialBase(request.getStockInicialBase());
        }

        List<DetalleProgramacion> detalles = p.getDetalles();
        detalles.sort((d1, d2) -> d1.getSemana().compareTo(d2.getSemana()));

        int currentStockInicial = p.getStockInicialBase();

        for (DetalleProgramacion d : detalles) {
            for (UpdateProgramacionRequest.UpdateDetalleRequest req : request.getDetalles()) {
                if (d.getId().equals(req.getId())) {
                    if (req.getPapelConPostura() != null) d.setPapelConPostura(req.getPapelConPostura());
                    if (req.getSobreConCascarilla() != null) d.setSobreConCascarilla(req.getSobreConCascarilla());
                }
            }

            d.setStockInicial(currentStockInicial);
            d.setTotal(d.getPapelConPostura() + d.getSobreConCascarilla());
            d.setStockFinal(d.getStockInicial() - d.getTotal());

            currentStockInicial = d.getStockFinal();
        }

        return mapper.toDto(p);
    }

    @Transactional
    public ProgramacionDto publicarProgramacion(Long id) {
        Programacion p = programacionRepository.findByIdOptional(id)
                .orElseThrow(() -> new ApiException(jakarta.ws.rs.core.Response.Status.NOT_FOUND, "PROGRAMACION_NO_ENCONTRADA", "Programacion no encontrada"));

        p.setEstado("PUBLICADO");
        p.setFechaPublicacion(ZonedDateTime.now());
        for (DetalleProgramacion d : p.getDetalles()) {
            d.setEstado("PUBLICADO");
        }

        System.out.println("Email sent: Programación " + id + " publicada.");
        return mapper.toDto(p);
    }

    private void verificarDiaEdicion() {
        DayOfWeek day = LocalDateTime.now().getDayOfWeek();
        if (day != DayOfWeek.MONDAY && day != DayOfWeek.THURSDAY) {
            throw new ApiException(jakarta.ws.rs.core.Response.Status.BAD_REQUEST, "EDICION_NO_PERMITIDA", "La edición solo está permitida los días lunes y jueves");
        }
    }
}
