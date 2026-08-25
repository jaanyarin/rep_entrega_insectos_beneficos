package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.catalogos.dto.PlagaDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PlagaService {

    @Inject
    PlagaRepository plagaRepository;

    @Inject
    CatalogoMapper mapper;

    public List<PlagaDto> listar() {
        return plagaRepository.listAll().stream()
                .map(mapper::toPlagaDto)
                .collect(Collectors.toList());
    }
}
