package pe.sistema.insectosbeneficos.usuarios;

import java.time.Instant;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidad "roles" (ADR-A003 D-AUTH2-1). Patron Panache active-record.
 *
 * Los nombres de rol son EXACTAMENTE: "Super Admin", "Admin", "Usuario"
 * (literales con espacios, sin acentos) y deben coincidir con:
 * - los strings de @RolesAllowed en los recursos,
 * - el claim "groups" del JWT (firma del servidor),
 * - la semantica RBAC de UsuarioService (ADMIN gestiona ADMIN+USUARIO).
 *
 * El estado ACTIVO/INACTIVO se reutiliza de EstadoUsuario (misma semantica
 * de soft delete/desactivacion que `usuarios`).
 */
@Entity
@Table(name = "roles")
public class Rol extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    /** Literal con espacios: "Super Admin" | "Admin" | "Usuario". */
    public String nombre;

    @Enumerated(EnumType.STRING)
    public EstadoUsuario estado = EstadoUsuario.ACTIVO;

    public Instant createdAt = Instant.now();

    public Instant updatedAt = Instant.now();
}