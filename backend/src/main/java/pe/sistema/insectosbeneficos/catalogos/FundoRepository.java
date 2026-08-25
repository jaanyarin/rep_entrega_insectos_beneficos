package pe.sistema.insectosbeneficos.catalogos;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class FundoRepository implements PanacheRepository<Fundo> {

    public List<Fundo> listAllOrderedByNombre() {
        return list("ORDER BY nombre");
    }
}
