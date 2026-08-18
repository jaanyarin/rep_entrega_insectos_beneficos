package pe.sistema.insectosbeneficos.seguridad;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

import org.eclipse.microprofile.jwt.JsonWebToken;

import pe.sistema.insectosbeneficos.usuarios.Perfil;

/**
 * Usuario autenticado de la peticion actual (contexto de request).
 * Lee los claims del JWT: sub (id) y perfil.
 */
@RequestScoped
public class ActualUsuario {

    @Inject
    JsonWebToken token;

    public Long getId() {
        String sub = token.getSubject();
        return sub == null ? null : Long.parseLong(sub);
    }

    public Perfil getPerfil() {
        Object valor = token.getClaim("perfil");
        if (valor == null) {
            return null;
        }
        return Perfil.valueOf(valor.toString());
    }
}