package pe.sistema.insectosbeneficos.usuarios.dto;

import java.time.Instant;

import pe.sistema.insectosbeneficos.usuarios.EstadoUsuario;
import pe.sistema.insectosbeneficos.usuarios.Perfil;

/**
 * Respuesta de usuario. JAMAS incluye contrasenaHash.
 */
public class UsuarioDto {

    public Long id;
    public String usuario;
    public String nombre;
    public Perfil perfil;
    public EstadoUsuario estado;
    public boolean debeCambiarPassword;
    public String dni;
    public Long creadoPor;
    public Instant createdAt;
    public Instant updatedAt;
    public Instant lastLoginAt;
}