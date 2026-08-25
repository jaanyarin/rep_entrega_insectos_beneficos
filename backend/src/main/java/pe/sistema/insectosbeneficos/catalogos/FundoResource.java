package pe.sistema.insectosbeneficos.catalogos;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.catalogos.dto.FundoDto;
import java.util.List;

@Path("/api/v1/fundos")
@Produces(MediaType.APPLICATION_JSON)
public class FundoResource {

    @Inject
    FundoService fundoService;

    @GET
    public List<FundoDto> listar() {
        return fundoService.listar();
    }
}
