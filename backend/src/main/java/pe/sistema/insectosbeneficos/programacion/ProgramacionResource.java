package pe.sistema.insectosbeneficos.programacion;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.programacion.dto.ProgramacionDto;
import pe.sistema.insectosbeneficos.programacion.dto.UpdateProgramacionRequest;
import java.util.List;

@Path("/api/v1/programaciones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProgramacionResource {

    @Inject
    ProgramacionService programacionService;

    @GET
    public List<ProgramacionDto> getProgramaciones(@QueryParam("anio") Integer anio, @QueryParam("mes") Integer mes) {
        if (anio == null || mes == null) {
            throw new IllegalArgumentException("Anio y mes son requeridos");
        }
        return programacionService.getProgramaciones(anio, mes);
    }

    @GET
    @Path("/{id}")
    public ProgramacionDto getProgramacion(@PathParam("id") Long id) {
        return programacionService.getProgramacion(id);
    }

    @PUT
    @Path("/{id}")
    public ProgramacionDto updateProgramacion(@PathParam("id") Long id, UpdateProgramacionRequest request) {
        return programacionService.updateProgramacion(id, request);
    }

    @POST
    @Path("/{id}/publicar")
    public ProgramacionDto publicarProgramacion(@PathParam("id") Long id) {
        return programacionService.publicarProgramacion(id);
    }
}
