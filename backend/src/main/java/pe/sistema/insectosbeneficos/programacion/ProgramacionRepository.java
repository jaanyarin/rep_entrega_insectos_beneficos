package pe.sistema.insectosbeneficos.programacion;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProgramacionRepository implements PanacheRepository<Programacion> {
    public Optional<Programacion> findByAnioAndMesAndEspecieId(Integer anio, Integer mes, Long especieId) {
        return find("anio = ?1 and mes = ?2 and especie.id = ?3", anio, mes, especieId).firstResultOptional();
    }
    
    public List<Programacion> findByAnioAndMes(Integer anio, Integer mes) {
        return list("anio = ?1 and mes = ?2", anio, mes);
    }
}
