package pe.sistema.insectosbeneficos;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import io.restassured.http.ContentType;
import io.restassured.response.Response;

/**
 * Helpers compartidos por las clases de test del contrato v2 (ADR-A003):
 * login 3 pasos (/api/v1/auth/*), CRUD /api/v1/usuarios con rolId.
 * Convenciones: nombres de usuario unicos por test; el seed id=1
 * "Admin PowerApps" JAMAS cambia su contrasena ni se desactiva en los tests.
 * Los ids de rol son deterministas (V3 inserta en orden):
 * 1=Super Admin, 2=Admin, 3=Usuario.
 */
public final class TestSupport {

    public static final long SEED_ID = 1L;
    public static final String SEED_USUARIO = "Admin PowerApps";
    public static final String SEED_PASSWORD = "00000000";

    public static final long ROL_SUPER_ADMIN_ID = 1L;
    public static final long ROL_ADMIN_ID = 2L;
    public static final long ROL_USUARIO_ID = 3L;

    private TestSupport() {
    }

    // ------------------------------------------------------------------
    // Login 3 pasos (Paso C) y cambio de contrasena (Paso D)
    // ------------------------------------------------------------------

    public static Response localLogin(long usuarioId, String password) {
        return given()
                .contentType(ContentType.JSON)
                .body(Map.of("usuarioId", usuarioId, "password", password))
                .post("/api/v1/auth/local-login");
    }

    /** Login y extraccion del token (asume 200). */
    public static String localLoginToken(long usuarioId, String password) {
        return localLogin(usuarioId, password).jsonPath().getString("token");
    }

    public static String seedToken() {
        return localLoginToken(SEED_ID, SEED_PASSWORD);
    }

    public static Response roles() {
        return given().get("/api/v1/auth/roles");
    }

    public static Response usuariosByRol(long rolId) {
        return given().get("/api/v1/auth/usuarios-by-rol/" + rolId);
    }

    public static Response cambiarPassword(String token, Map<String, Object> body) {
        return given().auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body(body)
                .post("/api/v1/auth/change-password");
    }

    /** Decodifica el payload (2do segmento) de un JWT a JSON plano (para asserts de claims). */
    public static String decodeJwtPayload(String token) {
        String payload = token.split("\\.")[1];
        int mod = payload.length() % 4;
        if (mod > 0) {
            payload += "=".repeat(4 - mod);
        }
        byte[] decoded = Base64.getUrlDecoder().decode(payload);
        return new String(decoded, StandardCharsets.UTF_8);
    }

    // ------------------------------------------------------------------
    // CRUD /api/v1/usuarios
    // ------------------------------------------------------------------

    public static Map<String, Object> crearBody(String usuario, String nombre, long rolId) {
        Map<String, Object> body = new HashMap<>();
        body.put("usuario", usuario);
        body.put("nombre", nombre);
        body.put("rolId", rolId);
        return body;
    }

    public static Response crearUsuario(String token, String usuario, String nombre, long rolId) {
        return given().auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body(crearBody(usuario, nombre, rolId))
                .post("/api/v1/usuarios");
    }

    /** Crea un usuario con el super admin (seed) y devuelve su id. */
    public static long crearUsuarioComoSeed(String usuario, String nombre, long rolId) {
        Response r = crearUsuario(seedToken(), usuario, nombre, rolId);
        r.then().statusCode(201);
        return r.jsonPath().getLong("id");
    }

    /** Soft delete via seed. */
    public static Response eliminarComoSeed(long id) {
        return given().auth().oauth2(seedToken()).delete("/api/v1/usuarios/" + id);
    }

    // Asserts compartidos
    public static void assertLoginOk(long usuarioId, String password) {
        localLogin(usuarioId, password).then().statusCode(200)
                .body("token", notNullValue());
    }
}