package pe.sistema.insectosbeneficos.programacion;

import jakarta.enterprise.context.ApplicationScoped;
import pe.sistema.insectosbeneficos.programacion.dto.DetalleProgramacionDto;
import pe.sistema.insectosbeneficos.programacion.dto.EspecieDto;
import pe.sistema.insectosbeneficos.programacion.dto.ProgramacionDto;

import java.util.stream.Collectors;

@ApplicationScoped
public class ProgramacionMapper {

    public EspecieDto toEspecieDto(Especie especie) {
        EspecieDto dto = new EspecieDto();
        dto.setId(especie.getId());
        dto.setNombre(especie.getNombre());
        dto.setEstado(especie.getEstado());
        return dto;
    }

    public ProgramacionDto toDto(Programacion programacion) {
        ProgramacionDto dto = new ProgramacionDto();
        dto.setId(programacion.getId());
        dto.setAnio(programacion.getAnio());
        dto.setMes(programacion.getMes());
        dto.setEspecieId(programacion.getEspecie().getId());
        dto.setEspecie(programacion.getEspecie().getNombre());
        dto.setEspecieNombre(programacion.getEspecie().getNombre());
        dto.setFechaRegistro(programacion.getFechaRegistro());
        dto.setFechaPublicacion(programacion.getFechaPublicacion());
        dto.setEstado(programacion.getEstado());
        dto.setStockInicialBase(programacion.getStockInicialBase());

        if (programacion.getDetalles() != null) {
            dto.setDetalles(programacion.getDetalles().stream()
                    .sorted((d1, d2) -> d1.getFecha().compareTo(d2.getFecha()))
                    .map(this::toDetalleDto)
                    .collect(Collectors.toList()));
            dto.setTotalMes(programacion.getDetalles().stream()
                    .mapToInt(detalle -> detalle.getTotal() == null ? 0 : detalle.getTotal())
                    .sum());
        } else {
            dto.setTotalMes(0);
        }

        return dto;
    }

    public DetalleProgramacionDto toDetalleDto(DetalleProgramacion detalle) {
        DetalleProgramacionDto dto = new DetalleProgramacionDto();
        dto.setId(detalle.getId());
        dto.setSemana(detalle.getSemana());
        dto.setFecha(detalle.getFecha());
        dto.setStockInicial(detalle.getStockInicial());
        dto.setPapelConPostura(detalle.getPapelConPostura());
        dto.setSobreConCascarilla(detalle.getSobreConCascarilla());
        dto.setTotal(detalle.getTotal());
        dto.setStockFinal(detalle.getStockFinal());
        dto.setEstado(detalle.getEstado());
        return dto;
    }
}
