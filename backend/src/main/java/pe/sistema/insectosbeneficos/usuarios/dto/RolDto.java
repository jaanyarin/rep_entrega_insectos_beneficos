package pe.sistema.insectosbeneficos.usuarios.dto;

import pe.sistema.insectosbeneficos.usuarios.EstadoUsuario;

/**
 * Respuesta minima de un rol (GET /api/v1/auth/roles).
 * json: {id, nombre, estado} — nombre literal con espacios
 * ("Super Admin" | "Admin" | "Usuario") y estado ACTIVO/INACTIVO
 * (CONTRATO v2 INC-1: el selector de perfil solo recibe roles ACTIVOS).
 */
public class RolDto {

    public Long id;
    public String nombre;
    public EstadoUsuario estado;

    public RolDto() {
    }

    public RolDto(Long id, String nombre, EstadoUsuario estado) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
    }
}