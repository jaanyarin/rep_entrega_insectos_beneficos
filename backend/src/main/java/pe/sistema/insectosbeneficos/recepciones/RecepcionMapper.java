package pe.sistema.insectosbeneficos.recepciones;

import jakarta.enterprise.context.ApplicationScoped;
import pe.sistema.insectosbeneficos.recepciones.dto.RecepcionDto;

@ApplicationScoped
public class RecepcionMapper {

    public RecepcionDto toDto(Recepcion r) {
        RecepcionDto dto = new RecepcionDto();
        dto.setId(r.getId());
        dto.setRequerimientoId(r.getRequerimiento() != null ? r.getRequerimiento().getId() : null);
        dto.setConforme(r.getConforme());
        dto.setObservaciones(r.getObservaciones());
        dto.setFechaRecepcion(r.getFechaRecepcion());
        dto.setCreadoPor(r.getCreadoPor());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
