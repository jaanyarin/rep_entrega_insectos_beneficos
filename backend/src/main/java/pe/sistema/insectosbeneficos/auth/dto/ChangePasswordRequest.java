package pe.sistema.insectosbeneficos.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de POST /api/v1/auth/change-password (Paso D del login 3 pasos).
 * La nueva contrasena es el DNI del usuario (ADR-A002 D-AUTH-4 / ADR-A003
 * D-AUTH2-2): numerico, MAXIMO 8 digitos (NO ^\d{8}$ estricto — se mantiene
 * la regla del ADR-A002), distinto de 00000000 y de la contrasena actual
 * (reglas de negocio en AuthService).
 * contrasenaActual es obligatoria SOLO si debe_cambiar_password = false
 * (cuando el usuario NO esta en reset obligatorio se exige conocer la
 * contrasena vigente para cambiarla, igual que en la v1).
 */
public class ChangePasswordRequest {

    /** Obligatoria solo cuando el password no esta en estado "debe cambiar". */
    public String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Pattern(regexp = "[0-9]+", message = "La nueva contraseña debe ser numérica (solo dígitos 0-9)")
    @Size(max = 8, message = "La nueva contraseña no puede superar 8 dígitos")
    public String newPassword;
}