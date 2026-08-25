package pe.sistema.insectosbeneficos.requerimientos;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Repositorio Panache de {@link Requerimiento}.
 * Patrón idéntico a {@code ProgramacionRepository}: solo consultas específicas;
 * el ORM provisiona findById/findByIdOptional/list/persist.
 */
@ApplicationScoped
public class RequerimientoRepository implements PanacheRepository<Requerimiento> {

    /**
     * Lista de requerimientos aplicando filtros opcionales (todos combinables).
     * Cada parámetro null se omite de la query.
     */
    public List<Requerimiento> findByFiltros(LocalDate fechaDesde, LocalDate fechaHasta, String estado, Long creadoPor) {
        StringBuilder query = new StringBuilder("1=1");
        Map<String, Object> params = new HashMap<>();

        if (fechaDesde != null) {
            query.append(" and fecha >= :fechaDesde");
            params.put("fechaDesde", fechaDesde);
        }
        if (fechaHasta != null) {
            query.append(" and fecha <= :fechaHasta");
            params.put("fechaHasta", fechaHasta);
        }
        if (estado != null) {
            query.append(" and estado = :estado");
            params.put("estado", estado);
        }
        if (creadoPor != null) {
            query.append(" and creadoPor = :creadoPor");
            params.put("creadoPor", creadoPor);
        }
        query.append(" order by id desc");

        return find(query.toString(), params).list();
    }

    /** Suma de cantidad de requerimientos de una especie (para el stock disponible). */
    public BigDecimal sumCantidadByEspecie(Long especiaId) {
        return list("especie.id = ?1", especiaId).stream()
                .map(Requerimiento::getCantidad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
