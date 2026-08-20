package pe.sistema.insectosbeneficos.programacion;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.programacion.dto.EspecieDto;
import java.util.List;

@Path("/api/v1/especies")
@Produces(MediaType.APPLICATION_JSON)
public class EspecieResource {

    @Inject
    EspecieService especieService;

    @GET
    public List<EspecieDto> getEspecies() {
        return especieService.getEspecies();
    }
}
