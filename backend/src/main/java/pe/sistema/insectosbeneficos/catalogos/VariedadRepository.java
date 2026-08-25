package pe.sistema.insectosbeneficos.catalogos;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class VariedadRepository implements PanacheRepository<Variedad> {

    public List<Variedad> listAllOrderedByNombre() {
        return list("ORDER BY nombre");
    }
}
