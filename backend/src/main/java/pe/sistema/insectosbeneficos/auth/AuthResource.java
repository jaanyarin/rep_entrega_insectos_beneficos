package pe.sistema.insectosbeneficos.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import io.quarkus.security.Authenticated;

import pe.sistema.insectosbeneficos.seguridad.ActualUsuario;
import pe.sistema.insectosbeneficos.seguridad.Validacion;
import pe.sistema.insectosbeneficos.auth.dto.CambiarPasswordRequest;
import pe.sistema.insectosbeneficos.auth.dto.LoginRequest;
import pe.sistema.insectosbeneficos.auth.dto.LoginResponse;

/**
 * Endpoints de autenticacion.
 * - POST /api/auth/login: PUBLICO (200 token | 401 credenciales | 403 inactivo).
 * - POST /api/auth/cambiar-password: autenticado (cualquier perfil logueado).
 * La validacion de los DTOs se hace via Validacion (respuesta {codigo,mensaje}).
 */
@Path("/api/auth")
public class AuthResource {

    @Inject
    AuthService service;

    @Inject
    ActualUsuario actualUsuario;

    @Inject
    Validacion validacion;

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(LoginRequest req) {
        LoginRequest valido = validacion.validar(req);
        LoginResponse resp = service.login(valido);
        return Response.ok(resp).build();
    }

    @POST
    @Path("/cambiar-password")
    @Authenticated
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response cambiarPassword(CambiarPasswordRequest req) {
        CambiarPasswordRequest valido = validacion.validar(req);
        return Response.ok(service.cambiarPassword(valido, actualUsuario.getId())).build();
    }
}