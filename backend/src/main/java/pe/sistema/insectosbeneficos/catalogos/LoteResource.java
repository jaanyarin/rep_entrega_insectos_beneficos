package pe.sistema.insectosbeneficos.catalogos;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.catalogos.dto.LoteDto;
import java.util.List;

@Path("/api/v1/lotes")
@Produces(MediaType.APPLICATION_JSON)
public class LoteResource {

    @Inject
    LoteService loteService;

    @GET
    public List<LoteDto> listar(@QueryParam("fundoId") Long fundoId) {
        return loteService.listar(fundoId);
    }
}
