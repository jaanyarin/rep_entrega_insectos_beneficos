package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.catalogos.dto.EtapaFenologicaDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class EtapaFenologicaService {

    @Inject
    EtapaFenologicaRepository etapaFenologicaRepository;

    @Inject
    CatalogoMapper mapper;

    public List<EtapaFenologicaDto> listar() {
        return etapaFenologicaRepository.listAll().stream()
                .map(mapper::toEtapaFenologicaDto)
                .collect(Collectors.toList());
    }
}
