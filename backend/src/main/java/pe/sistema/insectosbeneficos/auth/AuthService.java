package pe.sistema.insectosbeneficos.auth;

import java.time.Instant;
import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import pe.sistema.insectosbeneficos.seguridad.ApiException;
import pe.sistema.insectosbeneficos.seguridad.BcryptService;
import pe.sistema.insectosbeneficos.seguridad.JwtTokenService;
import pe.sistema.insectosbeneficos.auth.dto.AuthResponse;
import pe.sistema.insectosbeneficos.auth.dto.ChangePasswordRequest;
import pe.sistema.insectosbeneficos.auth.dto.ChangePasswordResponse;
import pe.sistema.insectosbeneficos.auth.dto.LocalLoginRequest;
import pe.sistema.insectosbeneficos.usuarios.EstadoUsuario;
import pe.sistema.insectosbeneficos.usuarios.Rol;
import pe.sistema.insectosbeneficos.usuarios.Usuario;
import pe.sistema.insectosbeneficos.usuarios.UsuarioMapper;
import pe.sistema.insectosbeneficos.usuarios.UsuarioService;
import pe.sistema.insectosbeneficos.usuarios.dto.RolDto;
import pe.sistema.insectosbeneficos.usuarios.dto.UsuarioResumenDto;

/**
 * Autenticacion local v2 contra tabla usuarios + roles (ADR-A003 D-AUTH2-2).
 *
 * Login 3 pasos:
 *  Paso A: rolesActivos()      -> GET /auth/roles
 *  Paso B: usuariosPorRol()    -> GET /auth/usuarios-by-rol/{rolId}
 *  Paso C: localLogin()        -> POST /auth/local-login  (BCrypt -> JWT)
 *  Paso D: cambiarPassword()   -> POST /auth/change-password (nuevo JWT)
 *
 * change-password (ADR-A002 D-AUTH-4 / ADR-A003 D-AUTH2-2): la NUEVA
 * contrasena es el DNI del usuario (numerico, <= 8 digitos, distinto de
 * 00000000 y de la contrasena vigente). Esquema exacto decidido y documentado:
 *  - Si debe_cambiar_password = true: se cambia con el token (sin contrasena
 *    actual): es el primer ingreso obligado a reset.
 *  - Si debe_cambiar_password = false: se exige contrasenaActual correcta
 *    (verificacion BCrypt); sin ella -> 400, incorrecta -> 401.
 * En ambos casos se emite un JWT FRESCO (sin passwordResetRequired).
 */
@ApplicationScoped
public class AuthService {

    @Inject
    BcryptService bcrypt;

    @Inject
    JwtTokenService jwt;

    @Inject
    UsuarioMapper mapper;

    /** Paso A — roles activos para el selector de perfil. */
    public List<RolDto> rolesActivos() {
        return Rol.<Rol>list("estado = ?1 order by id", EstadoUsuario.ACTIVO).stream()
                .map(r -> new RolDto(r.id, r.nombre, r.estado))
                .toList();
    }

    /** Paso B — usuarios ACTIVOS de un rol (campos minimos para autocompletar). */
    public List<UsuarioResumenDto> usuariosPorRol(Long rolId) {
        Rol rol = Rol.findById(rolId);
        if (rol == null) {
            throw new ApiException(Response.Status.NOT_FOUND, "ROL_NO_ENCONTRADO", "Rol no encontrado");
        }
        return Usuario.<Usuario>list("rol.id = ?1 and estado = ?2 order by id", rolId, EstadoUsuario.ACTIVO).stream()
                .map(mapper::toResumen)
                .toList();
    }

    /**
     * Paso C — login local. Ante credenciales invalidas (usuario inexistente o
     * password malo) se devuelve SIEMPRE la misma respuesta 401 (RFC anti
     * enumeracion de usuarios). El estado INACTIVO solo se revela con
     * credenciales validas (403).
     */
    @Transactional
    public AuthResponse localLogin(LocalLoginRequest req) {
        Usuario u = Usuario.findById(req.usuarioId);
        if (u == null || !bcrypt.verificar(req.password, u.contrasenaHash)) {
            throw new ApiException(Response.Status.UNAUTHORIZED, "CREDENCIALES_INVALIDAS",
                    "Usuario o contraseña incorrectos");
        }
        if (u.estado == EstadoUsuario.INACTIVO) {
            throw new ApiException(Response.Status.FORBIDDEN, "USUARIO_INACTIVO", "El usuario está inactivo");
        }
        u.lastLoginAt = Instant.now();
        u.updatedAt = Instant.now();
        u.persist();
        return new AuthResponse(jwt.generarToken(u), u.debeCambiarPassword);
    }

    /**
     * Paso D — cambio de contraseña autenticado -> NUEVO JWT.
     * Cuando el usuario ya salió del reset obligatorio (debe_cambiar_password
     * = false) se exige la contrasenaActual (misma politica que la v1).
     */
    @Transactional
    public ChangePasswordResponse cambiarPassword(ChangePasswordRequest req, Long usuarioId) {
        validarNuevaPassword(req.newPassword);
        Usuario u = Usuario.findById(usuarioId);
        if (u == null) {
            throw new ApiException(Response.Status.NOT_FOUND, "USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
        }
        // Un usuario desactivado (soft delete) con token vigente NO puede
        // cambiar la contrasena ni obtener un JWT fresco (misma politica que
        // localLogin; evita reactivar de facto el acceso hasta el proximo login).
        if (u.estado == EstadoUsuario.INACTIVO) {
            throw new ApiException(Response.Status.FORBIDDEN, "USUARIO_INACTIVO", "El usuario está inactivo");
        }

        if (!u.debeCambiarPassword) {
            if (req.contrasenaActual == null || req.contrasenaActual.isBlank()) {
                throw new ApiException(Response.Status.BAD_REQUEST, "CONTRASENA_ACTUAL_REQUERIDA",
                        "Debe indicar la contraseña actual para cambiar su contraseña");
            }
            if (!bcrypt.verificar(req.contrasenaActual, u.contrasenaHash)) {
                throw new ApiException(Response.Status.UNAUTHORIZED, "CONTRASENA_ACTUAL_INCORRECTA",
                        "La contraseña actual es incorrecta");
            }
        }

        // La nueva contrasena no puede ser igual a la vigente (regla del modelo).
        if (bcrypt.verificar(req.newPassword, u.contrasenaHash)) {
            throw new ApiException(Response.Status.BAD_REQUEST, "CONTRASENA_IGUAL_ACTUAL",
                    "La nueva contraseña debe ser diferente de la contraseña actual");
        }

        u.contrasenaHash = bcrypt.hash(req.newPassword);
        u.dni = req.newPassword;
        u.debeCambiarPassword = false;
        u.updatedAt = Instant.now();
        u.persist();
        // JWT fresco: refleja debe_cambiar_password=false -> sin reset en la app.
        return new ChangePasswordResponse(jwt.generarToken(u), "Contraseña actualizada correctamente");
    }

    /**
     * Reglas de negocio de la nueva contrasena (los checks de tipo/longitud ya
     * los hace hibernate-validator en el DTO; aqui lo que no pasa por bean
     * validation: distinta del password por defecto y de la actual en el flujo
     * principal). Se mantiene la regla del ADR-A002: MAXIMO 8 digitos (no se
     * exige exactamente 8).
     */
    private void validarNuevaPassword(String p) {
        if (p == null || p.isBlank()) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS",
                    "La nueva contraseña es obligatoria");
        }
        if (UsuarioService.PASSWORD_DEFAULT.equals(p)) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS",
                    "La nueva contraseña no puede ser la contraseña por defecto (00000000)");
        }
    }
}