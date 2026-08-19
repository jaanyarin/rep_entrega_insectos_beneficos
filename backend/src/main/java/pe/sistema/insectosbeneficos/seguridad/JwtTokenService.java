package pe.sistema.insectosbeneficos.seguridad;

import jakarta.enterprise.context.ApplicationScoped;

import io.smallrye.jwt.build.Jwt;
import io.smallrye.jwt.build.JwtClaimsBuilder;
import pe.sistema.insectosbeneficos.usuarios.Usuario;

/**
 * Genera el JWT firmado (HS256, clave dev-jwt-key.jwk, exp 8h por config).
 * Claims emitidos (ADR-A003 D-AUTH2-3):
 *   sub  = id del usuario (lo usa ActualUsuario para trazabilidad),
 *   upn  = campo `usuario` (login unico),
 *   groups = nombre literal del rol CON ESPACIOS ("Super Admin"|"Admin"|"Usuario")
 *            -> RBAC de Quarkus (@RolesAllowed) y lectura de rol en la app,
 *   rolId = id de la tabla roles,
 *   nombre = nombre visible del usuario,
 *   dni  = DNI (si existe),
 *   passwordResetRequired = obliga a cambiar contrasena en el siguiente request.
 * Omision documentada (ADR-A003): correo (descartado) y area (no existe en el
 * modelo de datos actual).
 * issuer y expiracion vienen de application.properties
 * (smallrye.jwt.new-token.*) y son verificados con mp.jwt.verify.*.
 */
@ApplicationScoped
public class JwtTokenService {

    public String generarToken(Usuario u) {
        JwtClaimsBuilder builder = Jwt.subject(String.valueOf(u.id))
                .upn(u.usuario)
                .groups(u.rol.nombre)
                .claim("rolId", u.rol.id)
                .claim("nombre", u.nombre)
                .claim("passwordResetRequired", u.debeCambiarPassword);
        if (u.dni != null && !u.dni.isBlank()) {
            builder.claim("dni", u.dni);
        }
        return builder.sign();
    }
}