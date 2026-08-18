package pe.sistema.insectosbeneficos.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Cuerpo de POST /api/auth/login.
 * Login por "usuario" (username), sin email (ADR-A002 D-AUTH-1).
 */
public class LoginRequest {

    @NotBlank(message = "El usuario es obligatorio")
    public String usuario;

    @NotBlank(message = "La contraseña es obligatoria")
    public String contrasena;
}