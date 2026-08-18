package pe.sistema.insectosbeneficos.usuarios;

/**
 * Estado del usuario. "INACTIVO" es el soft delete (nunca DELETE fisico).
 */
public enum EstadoUsuario {
    ACTIVO,
    INACTIVO
}