package pe.sistema.insectosbeneficos.requerimientos;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pe.sistema.insectosbeneficos.requerimientos.dto.ActualizarRequerimientoRequest;
import pe.sistema.insectosbeneficos.requerimientos.dto.CrearRequerimientoRequest;
import pe.sistema.insectosbeneficos.requerimientos.dto.RequerimientoDto;
import pe.sistema.insectosbeneficos.seguridad.ApiException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Endpoints del módulo de requerimientos (HITO-008).
 * Contrato alineado con {@code mobile/src/services/ApiClient.ts}:
 *   GET  /api/v1/requerimientos?fechaDesde&fechaHasta&estado&creadoPor
 *   GET  /api/v1/requerimientos/{id}
 *   POST /api/v1/requerimientos
 *   PUT  /api/v1/requerimientos/{id}
 * El flujo de requerimientos lo usan admin i+d (publica/configura) y
 * user sanidad (operación en campo) → ambos roles tienen acceso.
 */
@Path("/api/v1/requerimientos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"Super Admin", "Admin", "Usuario"})
public class RequerimientoResource {

    @Inject
    RequerimientoService requerimientoService;

    @GET
    public List<RequerimientoDto> listar(
            @QueryParam("fechaDesde") String fechaDesde,
            @QueryParam("fechaHasta") String fechaHasta,
            @QueryParam("estado") String estado,
            @QueryParam("creadoPor") Long creadoPor) {
        return requerimientoService.listar(
                parseFecha(fechaDesde), parseFecha(fechaHasta), estado, creadoPor);
    }

    @GET
    @Path("/{id}")
    public RequerimientoDto obtener(@PathParam("id") Long id) {
        return requerimientoService.obtenerPorId(id);
    }

    @POST
    public Response crear(@Valid CrearRequerimientoRequest request) {
        RequerimientoDto creado = requerimientoService.crear(request);
        return Response.status(Response.Status.CREATED).entity(creado).build();
    }

    @PUT
    @Path("/{id}")
    public RequerimientoDto actualizar(@PathParam("id") Long id, @Valid ActualizarRequerimientoRequest request) {
        return requerimientoService.actualizar(id, request);
    }

    /** Convierte un query param ISO (aaaa-mm-dd) a LocalDate; null si viene vacío. */
    private LocalDate parseFecha(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new ApiException(Response.Status.BAD_REQUEST,
                    "DATOS_INVALIDOS", "Formato de fecha inválido; use aaaa-mm-dd");
        }
    }
}
