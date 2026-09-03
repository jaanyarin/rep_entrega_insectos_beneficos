package pe.sistema.insectosbeneficos.recepciones;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.recepciones.dto.ConfirmarRecepcionRequest;
import pe.sistema.insectosbeneficos.recepciones.dto.RecepcionDto;

import java.util.List;

/**
 * Endpoints del módulo de Recepciones (HITO-015 / MOD-07).
 *
 * Contrato:
 *   GET  /api/v1/requerimientos/{requerimientoId}/recepciones
 *   POST /api/v1/requerimientos/{requerimientoId}/recepciones
 *
 * RBAC: solo Usuario y Admin pueden confirmar recepción (Sanidad).
 */
@Path("/api/v1/requerimientos/{requerimientoId}/recepciones")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({"Super Admin", "Admin", "Usuario"})
public class RecepcionResource {

    @Inject
    RecepcionService recepcionService;

    @GET
    public List<RecepcionDto> listar(@PathParam("requerimientoId") Long requerimientoId) {
        return recepcionService.listarPorRequerimiento(requerimientoId);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response crear(
            @PathParam("requerimientoId") Long requerimientoId,
            ConfirmarRecepcionRequest req) {
        RecepcionDto dto = recepcionService.crear(requerimientoId, req);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }
}
