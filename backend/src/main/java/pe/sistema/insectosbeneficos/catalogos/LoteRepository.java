package pe.sistema.insectosbeneficos.catalogos;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class LoteRepository implements PanacheRepository<Lote> {

    public List<Lote> listAllOrderedByNombre() {
        return list("ORDER BY nombre");
    }

    public List<Lote> findByFundoId(Long fundoId) {
        return list("fundo.id = ?1", fundoId);
    }
}
