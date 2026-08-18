package pe.sistema.insectosbeneficos.auth.dto;

import pe.sistema.insectosbeneficos.usuarios.dto.UsuarioDto;

/**
 * Respuesta de POST /api/auth/login: token JWT + datos del usuario (sin hash).
 */
public class LoginResponse {

    public String token;
    public UsuarioDto usuario;

    public LoginResponse() {
    }

    public LoginResponse(String token, UsuarioDto usuario) {
        this.token = token;
        this.usuario = usuario;
    }
}