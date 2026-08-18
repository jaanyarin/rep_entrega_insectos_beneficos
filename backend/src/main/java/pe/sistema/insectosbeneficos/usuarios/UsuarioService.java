package pe.sistema.insectosbeneficos.usuarios;

import java.util.List;
import java.util.Objects;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import pe.sistema.insectosbeneficos.seguridad.ActualUsuario;
import pe.sistema.insectosbeneficos.seguridad.ApiException;
import pe.sistema.insectosbeneficos.seguridad.BcryptService;
import pe.sistema.insectosbeneficos.seguridad.MensajeResponse;
import pe.sistema.insectosbeneficos.usuarios.dto.ActualizarUsuarioRequest;
import pe.sistema.insectosbeneficos.usuarios.dto.CrearUsuarioRequest;
import pe.sistema.insectosbeneficos.usuarios.dto.UsuarioDto;

/**
 * CRUD de usuarios con soft delete y RBAC (ADR-A002 D-AUTH-2/D-AUTH-5):
 * - SUPER_ADMIN: gestiona cualquier perfil (incluido SUPER_ADMIN).
 * - ADMIN: gestiona solo ADMIN y USUARIO (nunca SUPER_ADMIN).
 * - USUARIO: no accede (protegido por @RolesAllowed en el recurso).
 *
 * SOBRE EL DELETE FISICO: aqui NO existe ningun metodo que borre filas.
 * "Eliminar" = estado INACTIVO. Las escrituras requieren @Transactional;
 * nunca se invoca Usuario.delete()/deleteById() (regla de seguridad).
 *
 * Reglas de integridad (task BE-USR-001):
 * - No se puede desactivar el ultimo SUPER_ADMIN activo (400).
 * - No se puede desactivar la propia cuenta (400).
 * - No se puede crear/actualizar a SUPER_ADMIN desde ADMIN (403).
 */
@ApplicationScoped
public class UsuarioService {

    /** Contrasena por defecto al crear usuarios (ADR-A002 D-AUTH-3). */
    public static final String PASSWORD_DEFAULT = "00000000";

    @Inject
    ActualUsuario actual;

    @Inject
    BcryptService bcrypt;

    @Inject
    UsuarioMapper mapper;

    // ------------------------------------------------------------------
    // RBAC
    // ------------------------------------------------------------------

    /** Valida que el actor pueda gestionar al perfil objetivo (403 si no). */
    private void verificarPuedeGestionar(Perfil perfilObjetivo) {
        Perfil actor = actual.getPerfil();
        if (actor == Perfil.SUPER_ADMIN) {
            return;
        }
        if (actor == Perfil.ADMIN && (perfilObjetivo == Perfil.ADMIN || perfilObjetivo == Perfil.USUARIO)) {
            return;
        }
        throw new ApiException(Response.Status.FORBIDDEN, "SIN_PERMISOS",
                "No tiene permisos para gestionar el perfil " + perfilObjetivo);
    }

    /** Regla de integridad: no desactivar el ultimo SUPER_ADMIN activo (400). */
    private void verificarNoEsUltimoSuperAdminActivo(Usuario objetivo) {
        if (objetivo.perfil != Perfil.SUPER_ADMIN) {
            return;
        }
        long activos = Usuario.count("perfil = ?1 and estado = ?2", Perfil.SUPER_ADMIN, EstadoUsuario.ACTIVO);
        if (activos <= 1) {
            throw new ApiException(Response.Status.BAD_REQUEST, "ULTIMO_SUPER_ADMIN",
                    "No se puede desactivar el último SUPER_ADMIN activo");
        }
    }

    /** Regla de integridad: nadie desactiva su propia cuenta (400). */
    private void verificarNoAutoDesactivacion(Usuario objetivo) {
        if (Objects.equals(objetivo.id, actual.getId())) {
            throw new ApiException(Response.Status.BAD_REQUEST, "NO_AUTO_DESACTIVACION",
                    "No puede desactivar su propio usuario");
        }
    }

    /**
     * Reglas de negocio del DNI (compartidas con crear/cambiar-password).
     * En la creacion el DNI es opcional; si viene, se valida igual.
     */
    void validarDni(String dni) {
        if (dni == null || dni.isBlank()) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS", "El DNI es obligatorio");
        }
        if (!dni.matches("[0-9]+")) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS",
                    "El DNI debe ser numérico (solo dígitos 0-9)");
        }
        if (dni.length() > 8) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS", "El DNI no puede superar 8 dígitos");
        }
        if (PASSWORD_DEFAULT.equals(dni)) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS",
                    "El DNI no puede ser la contraseña por defecto (00000000)");
        }
    }

    // ------------------------------------------------------------------
    // Listado / detalle
    // ------------------------------------------------------------------

    public List<UsuarioDto> listar(String estado, String perfil) {
        List<Usuario> lista = buscar(estado, perfil);
        Perfil actor = actual.getPerfil();
        if (actor == Perfil.ADMIN) {
            // ADMIN solo ve ADMIN/USUARIO (nunca SUPER_ADMIN)
            lista = lista.stream().filter(u -> u.perfil != Perfil.SUPER_ADMIN).toList();
        }
        return lista.stream().map(mapper::toDto).toList();
    }

    private List<Usuario> buscar(String estado, String perfil) {
        EstadoUsuario est = parseEnum(EstadoUsuario.class, estado, "estado");
        Perfil pf = parseEnum(Perfil.class, perfil, "perfil");
        if (est != null && pf != null) {
            return Usuario.list("estado = ?1 and perfil = ?2 order by id", est, pf);
        }
        if (est != null) {
            return Usuario.list("estado = ?1 order by id", est);
        }
        if (pf != null) {
            return Usuario.list("perfil = ?1 order by id", pf);
        }
        return Usuario.list("order by id");
    }

    private <E extends Enum<E>> E parseEnum(Class<E> tipo, String valor, String nombreCampo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(tipo, valor);
        } catch (IllegalArgumentException e) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS",
                    "Valor inválido para " + nombreCampo + ": " + valor);
        }
    }

    public UsuarioDto obtenerPorId(Long id) {
        Usuario u = Usuario.findById(id);
        if (u == null) {
            throw new ApiException(Response.Status.NOT_FOUND, "USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
        }
        verificarPuedeGestionar(u.perfil);
        return mapper.toDto(u);
    }

    // ------------------------------------------------------------------
    // Crear
    // ------------------------------------------------------------------

    @Transactional
    public UsuarioDto crear(CrearUsuarioRequest req) {
        if (req.dni != null && !req.dni.isBlank()) {
            validarDni(req.dni);
        }
        verificarPuedeGestionar(req.perfil);
        Usuario existente = Usuario.find("usuario", req.usuario.trim()).firstResult();
        if (existente != null) {
            throw new ApiException(Response.Status.CONFLICT, "USUARIO_YA_EXISTE",
                    "El usuario '" + req.usuario.trim() + "' ya existe");
        }

        Usuario u = new Usuario();
        u.usuario = req.usuario.trim();
        u.nombre = req.nombre.trim();
        u.perfil = req.perfil;
        // Password SIEMPRE el default 00000000 hasheado (no se acepta otro en creacion)
        u.contrasenaHash = bcrypt.hash(PASSWORD_DEFAULT);
        u.debeCambiarPassword = true;
        u.estado = EstadoUsuario.ACTIVO;
        u.dni = (req.dni == null || req.dni.isBlank()) ? null : req.dni;
        u.creadoPor = actual.getId();
        u.persist();
        return mapper.toDto(u);
    }

    // ------------------------------------------------------------------
    // Actualizar (sin password; no toca dni ni debe_cambiar_password)
    // ------------------------------------------------------------------

    @Transactional
    public UsuarioDto actualizar(Long id, ActualizarUsuarioRequest req) {
        Usuario u = Usuario.findById(id);
        if (u == null) {
            throw new ApiException(Response.Status.NOT_FOUND, "USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
        }
        verificarPuedeGestionar(u.perfil);
        verificarPuedeGestionar(req.perfil);

        if (!u.usuario.equals(req.usuario.trim())) {
            Usuario existente = Usuario.find("usuario", req.usuario.trim()).firstResult();
            if (existente != null) {
                throw new ApiException(Response.Status.CONFLICT, "USUARIO_YA_EXISTE",
                        "El usuario '" + req.usuario.trim() + "' ya existe");
            }
        }

        if (req.estado == EstadoUsuario.INACTIVO) {
            // Mismas reglas de integridad que el soft delete (DELETE): no bypass por PUT
            verificarNoEsUltimoSuperAdminActivo(u);
            verificarNoAutoDesactivacion(u);
        }

        u.usuario = req.usuario.trim();
        u.nombre = req.nombre.trim();
        u.perfil = req.perfil;
        u.estado = req.estado;
        u.updatedAt = java.time.Instant.now();
        u.persist();
        return mapper.toDto(u);
    }

    // ------------------------------------------------------------------
    // Soft delete (NUNCA DELETE fisico)
    // ------------------------------------------------------------------

    @Transactional
    public MensajeResponse eliminar(Long id) {
        Usuario u = Usuario.findById(id);
        if (u == null) {
            throw new ApiException(Response.Status.NOT_FOUND, "USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
        }
        verificarPuedeGestionar(u.perfil);
        if (u.estado == EstadoUsuario.INACTIVO) {
            throw new ApiException(Response.Status.BAD_REQUEST, "USUARIO_YA_INACTIVO", "El usuario ya está inactivo");
        }
        // Integridad primero: ultimo SUPER_ADMIN activo, luego auto-desactivacion.
        verificarNoEsUltimoSuperAdminActivo(u);
        verificarNoAutoDesactivacion(u);

        u.estado = EstadoUsuario.INACTIVO;
        u.updatedAt = java.time.Instant.now();
        u.persist();
        return new MensajeResponse("Usuario desactivado correctamente");
    }
}