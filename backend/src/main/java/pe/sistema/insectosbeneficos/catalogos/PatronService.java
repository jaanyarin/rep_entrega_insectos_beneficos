package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.catalogos.dto.PatronDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PatronService {

    @Inject
    PatronRepository patronRepository;

    @Inject
    CatalogoMapper mapper;

    public List<PatronDto> listar() {
        return patronRepository.listAll().stream()
                .map(mapper::toPatronDto)
                .collect(Collectors.toList());
    }
}
