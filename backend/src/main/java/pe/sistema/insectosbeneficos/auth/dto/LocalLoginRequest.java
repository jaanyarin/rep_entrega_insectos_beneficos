package pe.sistema.insectosbeneficos.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Cuerpo de POST /api/v1/auth/local-login (Paso C del login 3 pasos).
 * Autentica por id de usuario + contrasena numerica (DNI / default 00000000).
 * Anti-enumeracion: usuario inexistente y password incorrecta devuelven el
 * MISMO error 401 (el detalle del usuario no se filtra).
 */
public class LocalLoginRequest {

    @NotNull(message = "El usuarioId es obligatorio")
    public Long usuarioId;

    @NotBlank(message = "La contraseña es obligatoria")
    public String password;
}