package pe.sistema.insectosbeneficos.despachos;

import jakarta.enterprise.context.ApplicationScoped;
import pe.sistema.insectosbeneficos.despachos.dto.DespachoDto;

@ApplicationScoped
public class DespachoMapper {

    public DespachoDto toDto(Despacho d) {
        DespachoDto dto = new DespachoDto();
        dto.setId(d.getId());
        dto.setRequerimientoId(d.getRequerimiento() != null ? d.getRequerimiento().getId() : null);
        dto.setCantidadDespachada(d.getCantidadDespachada());
        dto.setPapelConPostura(d.getPapelConPostura());
        dto.setSobreConCascarilla(d.getSobreConCascarilla());
        dto.setObservaciones(d.getObservaciones());
        dto.setCreadoPor(d.getCreadoPor());
        dto.setCreatedAt(d.getCreatedAt());
        return dto;
    }
}
