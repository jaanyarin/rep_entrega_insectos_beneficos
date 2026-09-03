package pe.sistema.insectosbeneficos.despachos;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.despachos.dto.CrearDespachoRequest;
import pe.sistema.insectosbeneficos.despachos.dto.DespachoDto;

import java.util.List;

/**
 * Endpoints del módulo de Despachos (HITO-015 / MOD-06).
 * Sub-recurso de {@link pe.sistema.insectosbeneficos.requerimientos.RequerimientoResource}.
 *
 * Contrato:
 *   GET  /api/v1/requerimientos/{requerimientoId}/despachos
 *   POST /api/v1/requerimientos/{requerimientoId}/despachos
 *
 * RBAC: solo Admin y Super Admin pueden registrar despachos (I+D).
 */
@Path("/api/v1/requerimientos/{requerimientoId}/despachos")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({"Super Admin", "Admin"})
public class DespachoResource {

    @Inject
    DespachoService despachoService;

    @GET
    public List<DespachoDto> listar(@PathParam("requerimientoId") Long requerimientoId) {
        return despachoService.listarPorRequerimiento(requerimientoId);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response crear(
            @PathParam("requerimientoId") Long requerimientoId,
            @Valid CrearDespachoRequest req) {
        DespachoDto dto = despachoService.crear(requerimientoId, req);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }
}
