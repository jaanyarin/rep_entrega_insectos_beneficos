package pe.sistema.insectosbeneficos.auth.dto;

/**
 * Respuesta de POST /api/v1/auth/change-password (CONTRATO v2 INC-1):
 * {token, passwordResetRequired, mensaje}.
 * El token es un JWT FRESCO emitido tras actualizar el password: ya NO lleva
 * passwordResetRequired (el usuario salio del reset obligatorio); el campo
 * explicito del body es siempre false y lo consume INC-2 (mobile) para saltar
 * la pantalla de cambio de contrasena sin depender de decodificar el JWT.
 */
public class ChangePasswordResponse {

    public String token;
    public boolean passwordResetRequired;
    public String mensaje;

    public ChangePasswordResponse() {
    }

    public ChangePasswordResponse(String token, String mensaje) {
        this.token = token;
        this.passwordResetRequired = false;
        this.mensaje = mensaje;
    }
}