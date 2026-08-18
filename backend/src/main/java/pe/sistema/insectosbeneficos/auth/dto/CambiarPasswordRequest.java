package pe.sistema.insectosbeneficos.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de POST /api/auth/cambiar-password.
 * La nueva contrasena es el DNI (ADR-A002 D-AUTH-4): numerico, <= 8 digitos,
 * distinto de 00000000 (regla de negocio en AuthService).
 * contrasenaActual es obligatoria SOLO si debe_cambiar_password = false
 * (decidido y documentado en el resumen de la task).
 */
public class CambiarPasswordRequest {

    /** Obligatoria solo cuando el password no esta en estado "debe cambiar". */
    public String contrasenaActual;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "[0-9]+", message = "El DNI debe ser numérico (solo dígitos 0-9)")
    @Size(max = 8, message = "El DNI no puede superar 8 dígitos")
    public String dni;
}