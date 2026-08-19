package pe.sistema.insectosbeneficos.auth.dto;

/**
 * Respuesta de POST /api/v1/auth/local-login:
 * {token, passwordResetRequired}.
 * passwordResetRequired = true obliga a la app a ejecutar el Paso D
 * (POST /api/v1/auth/change-password) antes de usar el sistema.
 */
public class AuthResponse {

    public String token;
    public boolean passwordResetRequired;

    public AuthResponse() {
    }

    public AuthResponse(String token, boolean passwordResetRequired) {
        this.token = token;
        this.passwordResetRequired = passwordResetRequired;
    }
}