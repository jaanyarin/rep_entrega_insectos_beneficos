package pe.sistema.insectosbeneficos.sync;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Repositorio Panache de {@link SyncLog}.
 */
@ApplicationScoped
public class SyncLogRepository implements PanacheRepository<SyncLog> {
}
