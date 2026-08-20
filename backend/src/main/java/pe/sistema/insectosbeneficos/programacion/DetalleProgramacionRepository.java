package pe.sistema.insectosbeneficos.programacion;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DetalleProgramacionRepository implements PanacheRepository<DetalleProgramacion> {
}
