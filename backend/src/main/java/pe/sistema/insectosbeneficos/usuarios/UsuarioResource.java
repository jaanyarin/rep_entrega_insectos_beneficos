package pe.sistema.insectosbeneficos.usuarios;

import java.util.List;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import pe.sistema.insectosbeneficos.seguridad.MensajeResponse;
import pe.sistema.insectosbeneficos.seguridad.Validacion;
import pe.sistema.insectosbeneficos.usuarios.dto.ActualizarUsuarioRequest;
import pe.sistema.insectosbeneficos.usuarios.dto.CrearUsuarioRequest;
import pe.sistema.insectosbeneficos.usuarios.dto.UsuarioDto;

/**
 * CRUD de usuarios. Solo SUPER_ADMIN y ADMIN (la regla fina por perfil vive
 * en UsuarioService: ADMIN no gestiona SUPER_ADMIN).
 * El soft delete es DELETE -> estado INACTIVO (nunca borrado fisico).
 * La validacion de los DTOs se hace via Validacion (formato {codigo,mensaje}).
 */
@Path("/api/usuarios")
@RolesAllowed({ "SUPER_ADMIN", "ADMIN" })
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioResource {

    @Inject
    UsuarioService service;

    @Inject
    Validacion validacion;

    @GET
    public List<UsuarioDto> listar(@QueryParam("estado") String estado, @QueryParam("perfil") String perfil) {
        return service.listar(estado, perfil);
    }

    @GET
    @Path("/{id}")
    public UsuarioDto obtener(@PathParam("id") Long id) {
        return service.obtenerPorId(id);
    }

    @POST
    public Response crear(CrearUsuarioRequest req) {
        CrearUsuarioRequest valido = validacion.validar(req);
        return Response.status(Response.Status.CREATED).entity(service.crear(valido)).build();
    }

    @PUT
    @Path("/{id}")
    public UsuarioDto actualizar(@PathParam("id") Long id, ActualizarUsuarioRequest req) {
        ActualizarUsuarioRequest valido = validacion.validar(req);
        return service.actualizar(id, valido);
    }

    @DELETE
    @Path("/{id}")
    public MensajeResponse eliminar(@PathParam("id") Long id) {
        return service.eliminar(id);
    }
}