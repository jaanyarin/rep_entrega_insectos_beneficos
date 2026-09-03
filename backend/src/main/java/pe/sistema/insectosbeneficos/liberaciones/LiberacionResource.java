package pe.sistema.insectosbeneficos.liberaciones;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.liberaciones.dto.CrearLiberacionRequest;
import pe.sistema.insectosbeneficos.liberaciones.dto.LiberacionDto;

import java.util.List;

/**
 * Endpoints del módulo de Liberaciones (HITO-015 / MOD-08).
 *
 * Contrato:
 *   GET  /api/v1/requerimientos/{requerimientoId}/liberaciones
 *   POST /api/v1/requerimientos/{requerimientoId}/liberaciones
 *
 * RBAC: Admin y Usuario pueden registrar liberaciones (Sanidad en campo).
 */
@Path("/api/v1/requerimientos/{requerimientoId}/liberaciones")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({"Super Admin", "Admin", "Usuario"})
public class LiberacionResource {

    @Inject
    LiberacionService liberacionService;

    @GET
    public List<LiberacionDto> listar(@PathParam("requerimientoId") Long requerimientoId) {
        return liberacionService.listarPorRequerimiento(requerimientoId);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response crear(
            @PathParam("requerimientoId") Long requerimientoId,
            @Valid CrearLiberacionRequest req) {
        LiberacionDto dto = liberacionService.crear(requerimientoId, req);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }
}
