package pe.sistema.insectosbeneficos.catalogos;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.catalogos.dto.VariedadDto;
import java.util.List;

@Path("/api/v1/variedades")
@Produces(MediaType.APPLICATION_JSON)
public class VariedadResource {

    @Inject
    VariedadService variedadService;

    @GET
    public List<VariedadDto> listar() {
        return variedadService.listar();
    }
}
