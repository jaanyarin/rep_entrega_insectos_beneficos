package pe.sistema.insectosbeneficos.liberaciones;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class LiberacionRepository implements PanacheRepository<Liberacion> {

    public List<Liberacion> findByRequerimientoId(Long requerimientoId) {
        return list("requerimiento.id = ?1 order by createdAt desc", requerimientoId);
    }
}
