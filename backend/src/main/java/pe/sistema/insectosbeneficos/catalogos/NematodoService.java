package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.catalogos.dto.NematodoDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class NematodoService {

    @Inject
    NematodoRepository nematodoRepository;

    @Inject
    CatalogoMapper mapper;

    public List<NematodoDto> listar() {
        return nematodoRepository.listAll().stream()
                .map(mapper::toNematodoDto)
                .collect(Collectors.toList());
    }
}
