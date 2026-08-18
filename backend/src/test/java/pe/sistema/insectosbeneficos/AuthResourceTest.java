package pe.sistema.insectosbeneficos;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;

import java.util.Map;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import org.junit.jupiter.api.Test;

/**
 * Tests de autenticacion: /api/auth/login y /api/auth/cambiar-password.
 * Cobertura minima de la task BE-USR-001.
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class AuthResourceTest {

    // ------------------------------------------------------------------
    // Login
    // ------------------------------------------------------------------

    @Test
    void loginSeedOk_devuelveTokenYDebeCambiarPassword() {
        Response r = TestSupport.login(TestSupport.SEED_USUARIO, TestSupport.SEED_PASSWORD);
        r.then()
                .statusCode(200)
                .body("token", notNullValue())
                .body("usuario.id", notNullValue())
                .body("usuario.usuario", is(TestSupport.SEED_USUARIO))
                .body("usuario.nombre", is("Admin PowerApps"))
                .body("usuario.perfil", is("SUPER_ADMIN"))
                .body("usuario.estado", is("ACTIVO"))
                .body("usuario.debeCambiarPassword", is(true));

        // El hash nunca debe aparecer en ninguna respuesta
        String body = r.body().asString();
        org.junit.jupiter.api.Assertions.assertFalse(body.contains("contrasenaHash"));
        org.junit.jupiter.api.Assertions.assertFalse(body.contains("contrasena_hash"));
    }

    @Test
    void loginPasswordIncorrectaYUsuarioInexistente_devuelvenMismoError401() {
        Response malaPass = TestSupport.login(TestSupport.SEED_USUARIO, "password-equivocada");
        Response inexistente = TestSupport.login("usuario_que_no_existe_xyz", TestSupport.SEED_PASSWORD);

        malaPass.then().statusCode(401).body("codigo", is("CREDENCIALES_INVALIDAS"));
        inexistente.then().statusCode(401).body("codigo", is("CREDENCIALES_INVALIDAS"));

        // RFC anti enumeracion: mismo mensaje en ambos casos
        org.junit.jupiter.api.Assertions.assertEquals(
                malaPass.jsonPath().getString("mensaje"),
                inexistente.jsonPath().getString("mensaje"));
    }

    @Test
    void loginUsuarioInactivo_devuelve403() {
        long id = TestSupport.crearUsuarioComoSeed("inactivo_logintest", "Inactivo Login", "USUARIO");
        TestSupport.eliminarComoSeed(id).then().statusCode(200); // soft delete

        TestSupport.login("inactivo_logintest", TestSupport.SEED_PASSWORD)
                .then().statusCode(403)
                .body("codigo", is("USUARIO_INACTIVO"));
    }

    // ------------------------------------------------------------------
    // Cambiar password
    // ------------------------------------------------------------------

    @Test
    void cambiarPasswordPrimerLogin_actualizaConElDni() {
        // Usuario dedicado (el seed nunca cambia su password en los tests)
        long id = TestSupport.crearUsuarioComoSeed("cambia_ok_1", "Cambia Ok", "USUARIO");
        org.junit.jupiter.api.Assertions.assertTrue(id > 0);

        String token = TestSupport.loginToken("cambia_ok_1", TestSupport.SEED_PASSWORD);

        // cambiar-password sin contrasenaActual: permitido porque debe_cambiar_password = true
        TestSupport.cambiarPassword(token, Map.of("dni", "87654321"))
                .then().statusCode(200).body("mensaje", notNullValue());

        // El login ahora usa el DNI como password y debe_cambiar_password = false
        Response r = TestSupport.login("cambia_ok_1", "87654321");
        r.then().statusCode(200).body("usuario.debeCambiarPassword", is(false)).body("usuario.dni", is("87654321"));

        // El password por defecto ya no funciona
        TestSupport.login("cambia_ok_1", TestSupport.SEED_PASSWORD).then().statusCode(401);
    }

    @Test
    void cambiarPassword_validaciones400() {
        String token = TestSupport.seedToken();

        // no numerico
        TestSupport.cambiarPassword(token, Map.of("dni", "abcdefgh"))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // mas de 8 digitos
        TestSupport.cambiarPassword(token, Map.of("dni", "123456789"))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // default 00000000 (regla de negocio: nunca password por defecto)
        TestSupport.cambiarPassword(token, Map.of("dni", "00000000"))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // vacio
        TestSupport.cambiarPassword(token, Map.of("dni", ""))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // sin dni
        TestSupport.cambiarPassword(token, Map.of())
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
    }

    @Test
    void cambiarPassword_sinToken_devuelve401() {
        given().contentType(ContentType.JSON).body(Map.of("dni", "12345678"))
                .post("/api/auth/cambiar-password")
                .then().statusCode(401);
    }

    @Test
    void cambiarPassword_cuandoNoObligatorio_exigeContrasenaActual() {
        long id = TestSupport.crearUsuarioComoSeed("cambia_exigente", "Cambia Exigente", "USUARIO");
        org.junit.jupiter.api.Assertions.assertTrue(id > 0);

        String token = TestSupport.loginToken("cambia_exigente", TestSupport.SEED_PASSWORD);
        // Primer cambio -> debe_cambiar_password pasa a false
        TestSupport.cambiarPassword(token, Map.of("dni", "99998888")).then().statusCode(200);

        // De ahora en adelante se exige contrasenaActual
        TestSupport.cambiarPassword(token, Map.of("dni", "55556666"))
                .then().statusCode(400).body("codigo", is("CONTRASENA_ACTUAL_REQUERIDA"));

        TestSupport.cambiarPassword(token, Map.of("dni", "55556666", "contrasenaActual", "incorrecta"))
                .then().statusCode(401).body("codigo", is("CONTRASENA_ACTUAL_INCORRECTA"));

        TestSupport.cambiarPassword(token, Map.of("dni", "55556666", "contrasenaActual", "99998888"))
                .then().statusCode(200);

        // Verifica que el login con el nuevo DNI funciona
        Response r = TestSupport.login("cambia_exigente", "55556666");
        r.then().statusCode(200).body("usuario.dni", is("55556666"));
        org.junit.jupiter.api.Assertions.assertNotNull(r.jsonPath().get("token"));
    }

    @Test
    void login_actualizaLastLoginAt() {
        TestSupport.login(TestSupport.SEED_USUARIO, TestSupport.SEED_PASSWORD).then().statusCode(200);
        // Verifica que el campo se expone (lastLoginAt != null tras login)
        long id = TestSupport.crearUsuarioComoSeed("last_login_check", "Last Login", "USUARIO");
        TestSupport.loginToken("last_login_check", TestSupport.SEED_PASSWORD); // login actualiza lastLoginAt
        // La consulta usa token seed (un USUARIO no puede leer /api/usuarios)
        given().auth().oauth2(TestSupport.seedToken()).get("/api/usuarios/" + id)
                .then().statusCode(200)
                .body("lastLoginAt", notNullValue());
    }
}