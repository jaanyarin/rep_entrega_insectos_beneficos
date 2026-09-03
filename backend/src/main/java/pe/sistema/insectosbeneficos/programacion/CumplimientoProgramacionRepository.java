package pe.sistema.insectosbeneficos.programacion;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CumplimientoProgramacionRepository implements PanacheRepository<CumplimientoProgramacion> {

    public List<CumplimientoProgramacion> findByProgramacionId(Long programacionId) {
        return list("programacion.id = ?1 order by semana asc", programacionId);
    }

    public Optional<CumplimientoProgramacion> findByDetalleId(Long detalleId) {
        return find("programacionDetalle.id = ?1", detalleId).firstResultOptional();
    }
}
