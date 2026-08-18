package pe.sistema.insectosbeneficos.seguridad;

import at.favre.lib.crypto.bcrypt.BCrypt;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Hash de contrasenas con at.favre.lib:bcrypt (cost 12).
 * Nunca se almacena ni retorna la contrasena en texto plano.
 */
@ApplicationScoped
public class BcryptService {

    public static final int COSTO = 12;

    public String hash(String password) {
        return BCrypt.withDefaults().hashToString(COSTO, password.toCharArray());
    }

    public boolean verificar(String password, String hash) {
        if (hash == null || hash.isBlank()) {
            return false;
        }
        return BCrypt.verifyer().verify(password.toCharArray(), hash.toCharArray()).verified;
    }
}