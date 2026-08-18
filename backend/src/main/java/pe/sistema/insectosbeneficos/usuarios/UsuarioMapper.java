package pe.sistema.insectosbeneficos.usuarios;

import jakarta.enterprise.context.ApplicationScoped;

import pe.sistema.insectosbeneficos.usuarios.dto.UsuarioDto;

/**
 * Convierte Usuario -> UsuarioDto (nunca expone contrasenaHash).
 */
@ApplicationScoped
public class UsuarioMapper {

    public UsuarioDto toDto(Usuario u) {
        UsuarioDto d = new UsuarioDto();
        d.id = u.id;
        d.usuario = u.usuario;
        d.nombre = u.nombre;
        d.perfil = u.perfil;
        d.estado = u.estado;
        d.debeCambiarPassword = u.debeCambiarPassword;
        d.dni = u.dni;
        d.creadoPor = u.creadoPor;
        d.createdAt = u.createdAt;
        d.updatedAt = u.updatedAt;
        d.lastLoginAt = u.lastLoginAt;
        return d;
    }
}