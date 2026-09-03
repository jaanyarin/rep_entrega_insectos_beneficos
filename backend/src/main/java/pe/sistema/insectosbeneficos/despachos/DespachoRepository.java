package pe.sistema.insectosbeneficos.despachos;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class DespachoRepository implements PanacheRepository<Despacho> {

    public List<Despacho> findByRequerimientoId(Long requerimientoId) {
        return list("requerimiento.id = ?1 order by createdAt desc", requerimientoId);
    }
}
