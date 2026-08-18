package pe.sistema.insectosbeneficos.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import pe.sistema.insectosbeneficos.usuarios.Perfil;

/**
 * Cuerpo de POST /api/usuarios.
 * La contrasena SIEMPRE nace como 00000000 hasheada (ADR-A002 D-AUTH-3):
 * no se acepta contrasena en la creacion.
 */
public class CrearUsuarioRequest {

    @NotBlank(message = "El usuario es obligatorio")
    @Size(max = 150, message = "El usuario no puede superar 150 caracteres")
    public String usuario;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
    public String nombre;

    @NotNull(message = "El perfil es obligatorio")
    public Perfil perfil;

    /** DNI opcional; si se indica debe ser numerico (0-9) y de hasta 8 digitos. */
    @Pattern(regexp = "[0-9]+", message = "El DNI debe ser numérico (solo dígitos 0-9)")
    @Size(max = 8, message = "El DNI no puede superar 8 dígitos")
    public String dni;
}