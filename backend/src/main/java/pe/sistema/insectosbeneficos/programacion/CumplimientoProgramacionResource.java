package pe.sistema.insectosbeneficos.programacion;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.programacion.dto.CumplimientoProgramacionDto;
import pe.sistema.insectosbeneficos.programacion.dto.GuardarCumplimientoRequest;

import java.util.List;

@Path("/api/v1/programaciones/{programacionId}/cumplimiento")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"Super Admin", "Admin"})
public class CumplimientoProgramacionResource {

    @Inject CumplimientoProgramacionService cumplimientoService;

    @GET
    public List<CumplimientoProgramacionDto> listar(@PathParam("programacionId") Long programacionId) {
        return cumplimientoService.listarPorProgramacion(programacionId);
    }

    @GET
    @Path("/detalle/{detalleId}")
    public CumplimientoProgramacionDto obtenerPorDetalle(@PathParam("detalleId") Long detalleId) {
        return cumplimientoService.obtenerPorDetalle(detalleId);
    }

    @PUT
    public CumplimientoProgramacionDto guardar(
            @PathParam("programacionId") Long programacionId,
            @Valid GuardarCumplimientoRequest request) {
        return cumplimientoService.guardar(request);
    }
}
