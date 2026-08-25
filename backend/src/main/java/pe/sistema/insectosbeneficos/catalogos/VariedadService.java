package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.catalogos.dto.VariedadDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class VariedadService {

    @Inject
    VariedadRepository variedadRepository;

    @Inject
    CatalogoMapper mapper;

    public List<VariedadDto> listar() {
        return variedadRepository.listAllOrderedByNombre().stream()
                .map(mapper::toVariedadDto)
                .collect(Collectors.toList());
    }
}
