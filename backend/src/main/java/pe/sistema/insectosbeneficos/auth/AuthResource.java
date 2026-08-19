package pe.sistema.insectosbeneficos.auth;

import java.util.List;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import pe.sistema.insectosbeneficos.seguridad.ActualUsuario;
import pe.sistema.insectosbeneficos.seguridad.Validacion;
import pe.sistema.insectosbeneficos.auth.dto.AuthResponse;
import pe.sistema.insectosbeneficos.auth.dto.ChangePasswordRequest;
import pe.sistema.insectosbeneficos.auth.dto.ChangePasswordResponse;
import pe.sistema.insectosbeneficos.auth.dto.LocalLoginRequest;
import pe.sistema.insectosbeneficos.usuarios.dto.RolDto;
import pe.sistema.insectosbeneficos.usuarios.dto.UsuarioResumenDto;

/**
 * Endpoints de autenticacion v2 (ADR-A003 D-AUTH2-2) bajo /api/v1:
 * - GET  /auth/roles          : PUBLICO — lista roles activos (Perfil).
 * - GET  /auth/usuarios-by-rol/{rolId} : PUBLICO — usuarios activos del rol
 *                                (Paso B: autocompletar 00000000).
 * - POST /auth/local-login    : PUBLICO — {usuarioId, password} -> {token, ...}.
 * - POST /auth/change-password: AUTENTICADO (cualquier rol) -> nuevo JWT.
 * La validacion de los DTOs se hace via Validacion (respuesta {codigo,mensaje}).
 */
@Path("/api/v1/auth")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService service;

    @Inject
    ActualUsuario actualUsuario;

    @Inject
    Validacion validacion;

    @GET
    @Path("/roles")
    public List<RolDto> roles() {
        return service.rolesActivos();
    }

    @GET
    @Path("/usuarios-by-rol/{rolId}")
    public List<UsuarioResumenDto> usuariosPorRol(@PathParam("rolId") Long rolId) {
        return service.usuariosPorRol(rolId);
    }

    @POST
    @Path("/local-login")
    public Response localLogin(LocalLoginRequest req) {
        LocalLoginRequest valido = validacion.validar(req);
        AuthResponse resp = service.localLogin(valido);
        return Response.ok(resp).build();
    }

    @POST
    @Path("/change-password")
    @RolesAllowed({ "Super Admin", "Admin", "Usuario" })
    public Response cambiarPassword(ChangePasswordRequest req) {
        ChangePasswordRequest valido = validacion.validar(req);
        return Response.ok(service.cambiarPassword(valido, actualUsuario.getId())).build();
    }
}