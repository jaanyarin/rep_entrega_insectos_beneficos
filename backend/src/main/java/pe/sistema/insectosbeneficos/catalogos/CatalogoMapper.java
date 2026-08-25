package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import pe.sistema.insectosbeneficos.catalogos.dto.EtapaFenologicaDto;
import pe.sistema.insectosbeneficos.catalogos.dto.FundoDto;
import pe.sistema.insectosbeneficos.catalogos.dto.LoteDto;
import pe.sistema.insectosbeneficos.catalogos.dto.NematodoDto;
import pe.sistema.insectosbeneficos.catalogos.dto.PatronDto;
import pe.sistema.insectosbeneficos.catalogos.dto.PlagaDto;
import pe.sistema.insectosbeneficos.catalogos.dto.VariedadDto;

@ApplicationScoped
public class CatalogoMapper {

    public FundoDto toFundoDto(Fundo fundo) {
        FundoDto dto = new FundoDto();
        dto.setId(fundo.getId());
        dto.setNombre(fundo.getNombre());
        dto.setCreatedAt(fundo.getCreatedAt());
        dto.setUpdatedAt(fundo.getUpdatedAt());
        return dto;
    }

    public VariedadDto toVariedadDto(Variedad variedad) {
        VariedadDto dto = new VariedadDto();
        dto.setId(variedad.getId());
        dto.setNombre(variedad.getNombre());
        dto.setColor(variedad.getColor());
        dto.setCreatedAt(variedad.getCreatedAt());
        dto.setUpdatedAt(variedad.getUpdatedAt());
        return dto;
    }

    public LoteDto toLoteDto(Lote lote) {
        LoteDto dto = new LoteDto();
        dto.setId(lote.getId());
        dto.setFundoId(lote.getFundo().getId());
        dto.setFundo(lote.getFundo().getNombre());
        dto.setVariedadId(lote.getVariedad().getId());
        dto.setVariedad(lote.getVariedad().getNombre());
        dto.setVariedadColor(lote.getVariedad().getColor());
        dto.setNombre(lote.getNombre());
        dto.setArea(lote.getArea());
        dto.setCreatedAt(lote.getCreatedAt());
        dto.setUpdatedAt(lote.getUpdatedAt());
        return dto;
    }

    public EtapaFenologicaDto toEtapaFenologicaDto(EtapaFenologica etapa) {
        EtapaFenologicaDto dto = new EtapaFenologicaDto();
        dto.setId(etapa.getId());
        dto.setNombre(etapa.getNombre());
        dto.setEstado(etapa.getEstado());
        return dto;
    }

    public PlagaDto toPlagaDto(Plaga plaga) {
        PlagaDto dto = new PlagaDto();
        dto.setId(plaga.getId());
        dto.setNombre(plaga.getNombre());
        dto.setEstado(plaga.getEstado());
        return dto;
    }

    public NematodoDto toNematodoDto(Nematodo nematodo) {
        NematodoDto dto = new NematodoDto();
        dto.setId(nematodo.getId());
        dto.setNombre(nematodo.getNombre());
        dto.setEstado(nematodo.getEstado());
        return dto;
    }

    public PatronDto toPatronDto(Patron patron) {
        PatronDto dto = new PatronDto();
        dto.setId(patron.getId());
        dto.setNombre(patron.getNombre());
        dto.setEstado(patron.getEstado());
        return dto;
    }
}
