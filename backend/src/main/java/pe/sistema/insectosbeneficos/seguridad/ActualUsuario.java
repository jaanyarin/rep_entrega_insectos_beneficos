package pe.sistema.insectosbeneficos.seguridad;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

import org.eclipse.microprofile.jwt.JsonWebToken;

/**
 * Usuario autenticado de la peticion actual (contexto de request).
 * Lee los claims del JWT: sub (id) y groups (rol literal con espacios).
 * El rol devuelto por getRol() coincide EXACTAMENTE con los literales de la
 * tabla `roles` ("Super Admin" | "Admin" | "Usuario") y con @RolesAllowed.
 */
@RequestScoped
public class ActualUsuario {

    @Inject
    JsonWebToken token;

    public Long getId() {
        String sub = token.getSubject();
        return sub == null ? null : Long.parseLong(sub);
    }

    public String getRol() {
        var groups = token.getGroups();
        if (groups == null || groups.isEmpty()) {
            return null;
        }
        return groups.iterator().next();
    }
}