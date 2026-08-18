package pe.sistema.insectosbeneficos;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import java.util.HashMap;
import java.util.Map;

import io.restassured.http.ContentType;
import io.restassured.response.Response;

/**
 * Helpers compartidos por las clases de test (evita duplicacion).
 * Convenciones de datos: nombres de usuario unicos por test; el seed
 * "Admin PowerApps" JAMAS cambia su contrasena en los tests.
 */
public final class TestSupport {

    public static final String SEED_USUARIO = "Admin PowerApps";
    public static final String SEED_PASSWORD = "00000000";

    private TestSupport() {
    }

    public static Response login(String usuario, String contrasena) {
        return given()
                .contentType(ContentType.JSON)
                .body(Map.of("usuario", usuario, "contrasena", contrasena))
                .post("/api/auth/login");
    }

    /** Login y extraccion del token (asume 200). */
    public static String loginToken(String usuario, String contrasena) {
        return login(usuario, contrasena).jsonPath().getString("token");
    }

    public static String seedToken() {
        return loginToken(SEED_USUARIO, SEED_PASSWORD);
    }

    public static Map<String, Object> crearBody(String usuario, String nombre, String perfil) {
        Map<String, Object> body = new HashMap<>();
        body.put("usuario", usuario);
        body.put("nombre", nombre);
        body.put("perfil", perfil);
        return body;
    }

    public static Response crearUsuario(String token, String usuario, String nombre, String perfil) {
        return given().auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body(crearBody(usuario, nombre, perfil))
                .post("/api/usuarios");
    }

    /** Crea un usuario con el super admin (seed) y devuelve su id. */
    public static long crearUsuarioComoSeed(String usuario, String nombre, String perfil) {
        Response r = crearUsuario(seedToken(), usuario, nombre, perfil);
        r.then().statusCode(201);
        return r.jsonPath().getLong("id");
    }

    /** Soft delete via seed. */
    public static Response eliminarComoSeed(long id) {
        return given().auth().oauth2(seedToken()).delete("/api/usuarios/" + id);
    }

    public static Response cambiarPassword(String token, Map<String, Object> body) {
        return given().auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body(body)
                .post("/api/auth/cambiar-password");
    }

    // Asserts compartidos
    public static void assertLoginOk(String usuario, String contrasena) {
        login(usuario, contrasena).then().statusCode(200)
                .body("token", notNullValue())
                .body("usuario.usuario", is(usuario));
    }
}