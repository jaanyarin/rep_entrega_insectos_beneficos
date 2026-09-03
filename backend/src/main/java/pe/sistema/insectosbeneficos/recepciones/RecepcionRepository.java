package pe.sistema.insectosbeneficos.recepciones;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class RecepcionRepository implements PanacheRepository<Recepcion> {

    public List<Recepcion> findByRequerimientoId(Long requerimientoId) {
        return list("requerimiento.id = ?1 order by createdAt desc", requerimientoId);
    }
}
