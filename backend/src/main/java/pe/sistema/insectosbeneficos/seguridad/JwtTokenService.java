package pe.sistema.insectosbeneficos.seguridad;

import jakarta.enterprise.context.ApplicationScoped;

import io.smallrye.jwt.build.Jwt;
import io.smallrye.jwt.build.JwtClaimsBuilder;
import pe.sistema.insectosbeneficos.usuarios.Usuario;

/**
 * Genera el JWT firmado (HS256, clave dev-jwt-key.jwk, exp 8h por config).
 * Claims: sub=id, upn/usuario, perfil, groups (roles de Quarkus), dni si existe.
 * issuer y expiracion vienen de application.properties
 * (smallrye.jwt.new-token.*) y son verificados con mp.jwt.verify.*.
 */
@ApplicationScoped
public class JwtTokenService {

    public String generarToken(Usuario u) {
        JwtClaimsBuilder builder = Jwt.subject(String.valueOf(u.id))
                .upn(u.usuario)
                .claim("perfil", u.perfil.name())
                .claim("usuario", u.usuario)
                .claim("groups", u.perfil.name());
        if (u.dni != null && !u.dni.isBlank()) {
            builder.claim("dni", u.dni);
        }
        return builder.sign();
    }
}