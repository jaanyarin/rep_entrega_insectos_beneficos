package pe.sistema.insectosbeneficos.catalogos;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.catalogos.dto.PatronDto;
import java.util.List;

@Path("/api/v1/patrones")
@Produces(MediaType.APPLICATION_JSON)
public class PatronResource {

    @Inject
    PatronService patronService;

    @GET
    public List<PatronDto> listar() {
        return patronService.listar();
    }
}
