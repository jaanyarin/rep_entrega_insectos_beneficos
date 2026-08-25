package pe.sistema.insectosbeneficos.catalogos;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.catalogos.dto.PlagaDto;
import java.util.List;

@Path("/api/v1/plagas")
@Produces(MediaType.APPLICATION_JSON)
public class PlagaResource {

    @Inject
    PlagaService plagaService;

    @GET
    public List<PlagaDto> listar() {
        return plagaService.listar();
    }
}
