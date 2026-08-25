package pe.sistema.insectosbeneficos.requerimientos;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.requerimientos.dto.StockDto;

/**
 * GET /api/v1/programaciones/{especieId}/stock — stock disponible en tiempo real
 * de una especie (Screen 10 del módulo móvil). Shape: {@code { stock: number }}.
 * Se monta sobre la raíz {@code /api/v1/programaciones} para respetar el contrato
 * del cliente; delega el cálculo en {@link RequerimientoService#getStockDisponible}
 * (DRY con el stock que se asigna al crear/actualizar un requerimiento).
 */
@Path("/api/v1/programaciones")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({"Super Admin", "Admin", "Usuario"})
public class StockResource {

    @Inject
    RequerimientoService requerimientoService;

    @GET
    @Path("/{especieId}/stock")
    public StockDto getStock(@PathParam("especieId") Long especiaId) {
        return new StockDto(requerimientoService.getStockDisponible(especiaId));
    }
}
