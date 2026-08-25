package pe.sistema.insectosbeneficos.catalogos;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PlagaRepository implements PanacheRepository<Plaga> {
}
