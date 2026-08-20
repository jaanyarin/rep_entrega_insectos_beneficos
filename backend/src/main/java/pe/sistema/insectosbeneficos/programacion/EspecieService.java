package pe.sistema.insectosbeneficos.programacion;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pe.sistema.insectosbeneficos.programacion.dto.EspecieDto;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class EspecieService {

    @Inject
    EspecieRepository especieRepository;

    @Inject
    ProgramacionMapper mapper;

    public List<EspecieDto> getEspecies() {
        return especieRepository.listAll().stream()
                .map(mapper::toEspecieDto)
                .collect(Collectors.toList());
    }
}
