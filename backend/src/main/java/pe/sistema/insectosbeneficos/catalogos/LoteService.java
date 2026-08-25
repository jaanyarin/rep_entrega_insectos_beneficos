package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.catalogos.dto.LoteDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class LoteService {

    @Inject
    LoteRepository loteRepository;

    @Inject
    CatalogoMapper mapper;

    public List<LoteDto> listar(Long fundoId) {
        if (fundoId != null) {
            return loteRepository.findByFundoId(fundoId).stream()
                    .map(mapper::toLoteDto)
                    .collect(Collectors.toList());
        }
        return loteRepository.listAllOrderedByNombre().stream()
                .map(mapper::toLoteDto)
                .collect(Collectors.toList());
    }
}
