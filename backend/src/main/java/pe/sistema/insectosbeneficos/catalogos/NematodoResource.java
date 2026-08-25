package pe.sistema.insectosbeneficos.catalogos;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.catalogos.dto.NematodoDto;
import java.util.List;

@Path("/api/v1/nematodos")
@Produces(MediaType.APPLICATION_JSON)
public class NematodoResource {

    @Inject
    NematodoService nematodoService;

    @GET
    public List<NematodoDto> listar() {
        return nematodoService.listar();
    }
}
