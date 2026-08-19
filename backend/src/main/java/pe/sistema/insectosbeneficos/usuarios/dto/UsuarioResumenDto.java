package pe.sistema.insectosbeneficos.usuarios.dto;

/**
 * Respuesta de GET /api/v1/auth/usuarios-by-rol/{rolId} (Paso B del login 3 pasos).
 * Solo usuarios ACTIVOS del rol; campos minimos para que la app autocomplete
 * la contrasena por defecto (00000000) cuando passwordResetRequired = true.
 * NUNCA incluye contrasenaHash ni datos sensibles.
 */
public class UsuarioResumenDto {

    public Long id;
    public String usuario;
    public String nombre;
    public Long rolId;
    public boolean passwordResetRequired;

    public UsuarioResumenDto() {
    }

    public UsuarioResumenDto(Long id, String usuario, String nombre, Long rolId, boolean passwordResetRequired) {
        this.id = id;
        this.usuario = usuario;
        this.nombre = nombre;
        this.rolId = rolId;
        this.passwordResetRequired = passwordResetRequired;
    }
}