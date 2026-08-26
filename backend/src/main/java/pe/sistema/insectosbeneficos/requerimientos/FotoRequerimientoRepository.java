package pe.sistema.insectosbeneficos.requerimientos;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

/**
 * Repositorio Panache de {@link FotoRequerimiento}.
 * Patrón idéntico a {@code RequerimientoRepository}: solo consultas específicas;
 * el ORM provisiona findById/findByIdOptional/list/persist.
 */
@ApplicationScoped
public class FotoRequerimientoRepository implements PanacheRepository<FotoRequerimiento> {

    /** Lista fotos de un requerimiento ordenadas por fecha de creación. */
    public List<FotoRequerimiento> findByRequerimientoId(Long requerimientoId) {
        return list("requerimiento.id = ?1 order by creadoEn asc", requerimientoId);
    }

    /** Cuenta fotos de un requerimiento (para validar el máximo de 2). */
    public long countByRequerimientoId(Long requerimientoId) {
        return count("requerimiento.id = ?1", requerimientoId);
    }
}
