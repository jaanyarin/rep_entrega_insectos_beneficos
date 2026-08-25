package pe.sistema.insectosbeneficos.catalogos;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.catalogos.dto.FundoDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class FundoService {

    @Inject
    FundoRepository fundoRepository;

    @Inject
    CatalogoMapper mapper;

    public List<FundoDto> listar() {
        return fundoRepository.listAllOrderedByNombre().stream()
                .map(mapper::toFundoDto)
                .collect(Collectors.toList());
    }
}
