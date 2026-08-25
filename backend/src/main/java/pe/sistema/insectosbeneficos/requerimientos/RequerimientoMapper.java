package pe.sistema.insectosbeneficos.requerimientos;

import jakarta.enterprise.context.ApplicationScoped;
import pe.sistema.insectosbeneficos.requerimientos.dto.RequerimientoDto;

/**
 * Mapper entidad → DTO del módulo de requerimientos.
 * Resuelve los nombres de las FKs (fundo/lote/especie/etapaFenologica/plaga)
 * a partir de las relaciones EAGER de {@link Requerimiento}, igual que hace
 * {@code CatalogoMapper.toLoteDto} en catalogos.
 */
@ApplicationScoped
public class RequerimientoMapper {

    public RequerimientoDto toDto(Requerimiento r) {
        RequerimientoDto dto = new RequerimientoDto();
        dto.setId(r.getId());
        dto.setFecha(r.getFecha());

        dto.setFundoId(r.getFundo().getId());
        dto.setFundo(r.getFundo().getNombre());

        dto.setLoteId(r.getLote().getId());
        dto.setLote(r.getLote().getNombre());

        dto.setEspecieId(r.getEspecie().getId());
        dto.setEspecie(r.getEspecie().getNombre());

        if (r.getEtapaFenologica() != null) {
            dto.setEtapaFenologicaId(r.getEtapaFenologica().getId());
            dto.setEtapaFenologica(r.getEtapaFenologica().getNombre());
        }

        dto.setCantidad(r.getCantidad());

        if (r.getPlaga() != null) {
            dto.setPlagaId(r.getPlaga().getId());
            dto.setPlaga(r.getPlaga().getNombre());
        }

        dto.setEstado(r.getEstado());
        dto.setStockDisponible(r.getStockDisponible());
        dto.setFechaLiberacion(r.getFechaLiberacion());
        dto.setHoraLiberacion(r.getHoraLiberacion());
        dto.setObservaciones(r.getObservaciones());
        dto.setPapelConPostura(r.getPapelConPostura());
        dto.setSobreConCascarilla(r.getSobreConCascarilla());
        dto.setCreadoPor(r.getCreadoPor());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}
