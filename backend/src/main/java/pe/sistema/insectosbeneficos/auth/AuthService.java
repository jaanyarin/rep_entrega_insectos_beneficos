package pe.sistema.insectosbeneficos.auth;

import java.time.Instant;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import pe.sistema.insectosbeneficos.seguridad.ApiException;
import pe.sistema.insectosbeneficos.seguridad.BcryptService;
import pe.sistema.insectosbeneficos.seguridad.JwtTokenService;
import pe.sistema.insectosbeneficos.seguridad.MensajeResponse;
import pe.sistema.insectosbeneficos.usuarios.EstadoUsuario;
import pe.sistema.insectosbeneficos.usuarios.Usuario;
import pe.sistema.insectosbeneficos.usuarios.UsuarioMapper;
import pe.sistema.insectosbeneficos.auth.dto.CambiarPasswordRequest;
import pe.sistema.insectosbeneficos.auth.dto.LoginRequest;
import pe.sistema.insectosbeneficos.auth.dto.LoginResponse;

/**
 * Autenticacion local contra tabla usuarios (ADR-A002 D-AUTH-1).
 *
 * cambiar-password (ADR-A002 D-AUTH-4): la NUEVA contrasena es el DNI del
 * usuario (numerico, <= 8 digitos, distinto de 00000000).
 * Esquema exacto decidido y documentado:
 *  - Si debe_cambiar_password = true: se cambia con el token (sin contrasena
 *    actual): el usuario llega obligado a cambiar, no tiene otra contrasena.
 *  - Si debe_cambiar_password = false: se exige contrasenaActual correcta
 *    (verificacion BCrypt); sin ella -> 400, incorrecta -> 401.
 */
@ApplicationScoped
public class AuthService {

    @Inject
    BcryptService bcrypt;

    @Inject
    JwtTokenService jwt;

    @Inject
    UsuarioMapper mapper;

    /**
     * Login. Ante credenciales invalidas (usuario inexistente o password malo)
     * se devuelve SIEMPRE la misma respuesta 401 (RFC anti enumeracion de
     * usuarios). El estado INACTIVO solo se revela con credenciales validas.
     */
    @Transactional
    public LoginResponse login(LoginRequest req) {
        Usuario u = Usuario.find("usuario", req.usuario).firstResult();
        if (u == null || !bcrypt.verificar(req.contrasena, u.contrasenaHash)) {
            throw new ApiException(Response.Status.UNAUTHORIZED, "CREDENCIALES_INVALIDAS",
                    "Usuario o contraseña incorrectos");
        }
        if (u.estado == EstadoUsuario.INACTIVO) {
            throw new ApiException(Response.Status.FORBIDDEN, "USUARIO_INACTIVO", "El usuario está inactivo");
        }
        u.lastLoginAt = Instant.now();
        u.persist();
        return new LoginResponse(jwt.generarToken(u), mapper.toDto(u));
    }

    @Transactional
    public MensajeResponse cambiarPassword(CambiarPasswordRequest req, Long usuarioId) {
        validarDniDeNegocio(req.dni);
        Usuario u = Usuario.findById(usuarioId);
        if (u == null) {
            throw new ApiException(Response.Status.NOT_FOUND, "USUARIO_NO_ENCONTRADO", "Usuario no encontrado");
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

        u.contrasenaHash = bcrypt.hash(req.dni);
        u.dni = req.dni;
        u.debeCambiarPassword = false;
        u.updatedAt = Instant.now();
        u.persist();
        return new MensajeResponse("Contraseña actualizada correctamente");
    }

    /**
     * Reglas de negocio del DNI (los checks de tipo/longitud ya los hace
     * hibernate-validator en el DTO; aqui lo que no pasa por bean validation:
     * no vacio, distinto del password por defecto).
     */
    private void validarDniDeNegocio(String dni) {
        if (dni == null || dni.isBlank()) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS", "El DNI es obligatorio");
        }
        if ("00000000".equals(dni)) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS",
                    "El DNI no puede ser la contraseña por defecto (00000000)");
        }
    }
}