package pe.sistema.insectosbeneficos.usuarios;

/**
 * Perfiles autorizados (ADR-A002 D-AUTH-2).
 * El claim "groups" del JWT lleva este valor para el RBAC de Quarkus.
 */
public enum Perfil {
    SUPER_ADMIN,
    ADMIN,
    USUARIO
}