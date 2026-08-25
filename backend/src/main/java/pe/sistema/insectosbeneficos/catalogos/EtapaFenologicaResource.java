package pe.sistema.insectosbeneficos.catalogos;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.catalogos.dto.EtapaFenologicaDto;
import java.util.List;

@Path("/api/v1/etapas-fenologicas")
@Produces(MediaType.APPLICATION_JSON)
public class EtapaFenologicaResource {

    @Inject
    EtapaFenologicaService etapaFenologicaService;

    @GET
    public List<EtapaFenologicaDto> listar() {
        return etapaFenologicaService.listar();
    }
}
