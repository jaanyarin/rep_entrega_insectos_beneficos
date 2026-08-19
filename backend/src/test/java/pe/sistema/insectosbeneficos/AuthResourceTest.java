package pe.sistema.insectosbeneficos;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;

import java.util.Map;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Tests del login 3 pasos v2 (ADR-A003 D-AUTH2-2) bajo /api/v1/auth:
 * roles, usuarios-by-rol, local-login y change-password -> nuevo JWT.
 * Tambien valida los claims del JWT (D-AUTH2-3): groups/rolId/nombre/dni/
 * passwordResetRequired.
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class AuthResourceTest {

    // ------------------------------------------------------------------
    // Paso A — roles
    // ------------------------------------------------------------------

    @Test
    void roles_listaTresRolesActivosConLiteralesConEspacios() {
        given().get("/api/v1/auth/roles")
                .then().statusCode(200)
                .body("size()", is(3))
                .body("id", hasItems(1, 2, 3))
                .body("nombre", hasItems("Super Admin", "Admin", "Usuario"))
                // CONTRATO v2: {id, nombre, estado} — el selector solo recibe ACTIVOS
                .body("estado", everyItem(is("ACTIVO")));
    }

    // ------------------------------------------------------------------
    // Paso B — usuarios-by-rol
    // ------------------------------------------------------------------

    @Test
    void usuariosPorRol_soloUsuariosActivosConCamposDeAutocompletado() {
        long activo = TestSupport.crearUsuarioComoSeed("byrol_activo", "Activo Rol", TestSupport.ROL_USUARIO_ID);
        long inactivo = TestSupport.crearUsuarioComoSeed("byrol_inactivo", "Inactivo Rol", TestSupport.ROL_USUARIO_ID);
        TestSupport.eliminarComoSeed(inactivo).then().statusCode(200); // soft delete

        // Asserts dirigidos a los fixtures del propio test (INDEPENDIENTES del
        // orden de ejecucion / BD compartida: otros tests dejan usuarios ACTIVOS
        // del mismo rol, por eso NO se asume size()==1).
        given().get("/api/v1/auth/usuarios-by-rol/" + TestSupport.ROL_USUARIO_ID)
                .then().statusCode(200)
                .body("usuario", hasItems("byrol_activo"))
                .body("usuario", not(hasItems("byrol_inactivo")))
                .body("find { it.usuario == 'byrol_activo' }.id", is((int) activo))
                .body("find { it.usuario == 'byrol_activo' }.nombre", is("Activo Rol"))
                .body("find { it.usuario == 'byrol_activo' }.rolId", is((int) TestSupport.ROL_USUARIO_ID))
                .body("find { it.usuario == 'byrol_activo' }.passwordResetRequired", is(true));
    }

    @Test
    void usuariosPorRol_rolInexistente_devuelve404() {
        given().get("/api/v1/auth/usuarios-by-rol/999999")
                .then().statusCode(404).body("codigo", is("ROL_NO_ENCONTRADO"));
    }

    // ------------------------------------------------------------------
    // Paso C — local-login
    // ------------------------------------------------------------------

    @Test
    void localLogin_ok_devuelveTokenConClaimsV2() {
        Response r = TestSupport.localLogin(TestSupport.SEED_ID, TestSupport.SEED_PASSWORD);
        r.then()
                .statusCode(200)
                .body("token", notNullValue())
                .body("passwordResetRequired", is(true));

        // Claims ADR-A003 D-AUTH2-3: groups/rolId/nombre/dni/passwordResetRequired
        String payload = TestSupport.decodeJwtPayload(r.jsonPath().getString("token"));
        Assertions.assertTrue(payload.contains("Super Admin"), "groups debe llevar el literal del rol");
        Assertions.assertTrue(payload.contains("\"rolId\":1"), "rolId debe viajar en el JWT");
        Assertions.assertTrue(payload.contains("\"sub\":\"1\""), "sub debe ser el id del usuario");
        Assertions.assertTrue(payload.contains("Admin PowerApps"), "nombre debe viajar en el JWT");
        Assertions.assertTrue(payload.contains("\"passwordResetRequired\":true"), "flag de reset obligatorio");
    }

    @Test
    void localLogin_antiEnumeracion_mismoError401() {
        Response malaPass = TestSupport.localLogin(TestSupport.SEED_ID, "password-equivocada");
        Response inexistente = TestSupport.localLogin(999999L, TestSupport.SEED_PASSWORD);

        malaPass.then().statusCode(401).body("codigo", is("CREDENCIALES_INVALIDAS"));
        inexistente.then().statusCode(401).body("codigo", is("CREDENCIALES_INVALIDAS"));

        // RFC anti enumeracion: mismo mensaje en ambos casos
        Assertions.assertEquals(
                malaPass.jsonPath().getString("mensaje"),
                inexistente.jsonPath().getString("mensaje"));
    }

    @Test
    void localLogin_usuarioInactivo_devuelve403() {
        long id = TestSupport.crearUsuarioComoSeed("inactivo_v2", "Inactivo V2", TestSupport.ROL_USUARIO_ID);
        TestSupport.eliminarComoSeed(id).then().statusCode(200); // soft delete

        TestSupport.localLogin(id, TestSupport.SEED_PASSWORD)
                .then().statusCode(403)
                .body("codigo", is("USUARIO_INACTIVO"));
    }

    @Test
    void localLogin_camposRequeridos_devuelve400() {
        given().contentType(ContentType.JSON).body(Map.of("usuarioId", TestSupport.SEED_ID))
                .post("/api/v1/auth/local-login")
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));

        given().contentType(ContentType.JSON).body(Map.of("password", TestSupport.SEED_PASSWORD))
                .post("/api/v1/auth/local-login")
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
    }

    // ------------------------------------------------------------------
    // Paso D — change-password -> nuevo JWT
    // ------------------------------------------------------------------

    @Test
    void changePassword_primerLogin_sinActual_devuelveNuevoJwtSinReset() {
        long id = TestSupport.crearUsuarioComoSeed("cambia_v2_ok", "Cambia V2 Ok", TestSupport.ROL_USUARIO_ID);

        String token = TestSupport.localLoginToken(id, TestSupport.SEED_PASSWORD);

        // Primer cambio: no se pide contrasena actual (reset obligatorio)
        Response r = TestSupport.cambiarPassword(token, Map.of("newPassword", "87654321"));
        r.then().statusCode(200)
                .body("token", notNullValue())
                .body("passwordResetRequired", is(false)) // CONTRATO v2: campo explicito
                .body("mensaje", notNullValue());

        // El NUEVO JWT ya no trae el flag de reset
        String payload = TestSupport.decodeJwtPayload(r.jsonPath().getString("token"));
        Assertions.assertTrue(payload.contains("\"passwordResetRequired\":false"),
                "El JWT fresco no debe llevar passwordResetRequired");
        Assertions.assertTrue(payload.contains("Usuario"), "groups debe seguir con el rol literal");

        // El login ahora usa el nuevo DNI y ya no pide reset
        Response login = TestSupport.localLogin(id, "87654321");
        login.then().statusCode(200).body("passwordResetRequired", is(false));

        // El password por defecto ya no funciona
        TestSupport.localLogin(id, TestSupport.SEED_PASSWORD).then().statusCode(401);
    }

    @Test
    void changePassword_cuandoNoReset_exigeContrasenaActual() {
        long id = TestSupport.crearUsuarioComoSeed("cambia_exigente_v2", "Cambia Exigente V2", TestSupport.ROL_USUARIO_ID);

        String token = TestSupport.localLoginToken(id, TestSupport.SEED_PASSWORD);
        // Primer cambio -> sale del reset obligatorio
        TestSupport.cambiarPassword(token, Map.of("newPassword", "99998888")).then().statusCode(200);

        // De ahora en adelante se exige contrasenaActual
        TestSupport.cambiarPassword(token, Map.of("newPassword", "55556666"))
                .then().statusCode(400).body("codigo", is("CONTRASENA_ACTUAL_REQUERIDA"));

        TestSupport.cambiarPassword(token, Map.of("newPassword", "55556666", "contrasenaActual", "incorrecta"))
                .then().statusCode(401).body("codigo", is("CONTRASENA_ACTUAL_INCORRECTA"));

        Response ok = TestSupport.cambiarPassword(token,
                Map.of("newPassword", "55556666", "contrasenaActual", "99998888"));
        ok.then().statusCode(200).body("token", notNullValue());

        // Verifica que el login con el nuevo DNI funciona
        TestSupport.localLogin(id, "55556666").then().statusCode(200);
    }

    @Test
    void changePassword_igualALaActual_devuelve400() {
        long id = TestSupport.crearUsuarioComoSeed("cambia_igual_v2", "Cambia Igual", TestSupport.ROL_USUARIO_ID);
        String token = TestSupport.localLoginToken(id, TestSupport.SEED_PASSWORD);
        // Primer cambio: password vigente = 11112222, sale del reset
        TestSupport.cambiarPassword(token, Map.of("newPassword", "11112222")).then().statusCode(200);

        // Intentar poner la misma contrasena vigente -> 400
        TestSupport.cambiarPassword(token,
                Map.of("newPassword", "11112222", "contrasenaActual", "11112222"))
                .then().statusCode(400).body("codigo", is("CONTRASENA_IGUAL_ACTUAL"));
    }

    @Test
    void changePassword_validaciones_devuelve400() {
        String token = TestSupport.seedToken();

        // no numerico
        TestSupport.cambiarPassword(token, Map.of("newPassword", "abcdefgh"))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // mas de 8 digitos
        TestSupport.cambiarPassword(token, Map.of("newPassword", "123456789"))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // default 00000000 (regla de negocio: nunca password por defecto)
        TestSupport.cambiarPassword(token, Map.of("newPassword", "00000000"))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // vacio
        TestSupport.cambiarPassword(token, Map.of("newPassword", ""))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
        // sin newPassword
        TestSupport.cambiarPassword(token, Map.of("contrasenaActual", "12345678"))
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
    }

    @Test
    void changePassword_usuarioInactivoConTokenVigente_devuelve403() {
        long id = TestSupport.crearUsuarioComoSeed("cambia_inactivo_v2", "Cambia Inactivo V2", TestSupport.ROL_USUARIO_ID);

        // JWT emitido ANTES de la desactivacion (vigencia 8h).
        String token = TestSupport.localLoginToken(id, TestSupport.SEED_PASSWORD);
        TestSupport.eliminarComoSeed(id).then().statusCode(200); // soft delete -> INACTIVO

        // Ese token vigente NO puede cambiar la contrasena ni obtener JWT fresco.
        TestSupport.cambiarPassword(token, Map.of("newPassword", "87654321"))
                .then().statusCode(403)
                .body("codigo", is("USUARIO_INACTIVO"));

        // El usuario sigue desactivado para login (refuerza que no se reactivo).
        TestSupport.localLogin(id, TestSupport.SEED_PASSWORD).then().statusCode(403);
    }

    @Test
    void changePassword_sinToken_devuelve401() {
        given().contentType(ContentType.JSON).body(Map.of("newPassword", "12345678"))
                .post("/api/v1/auth/change-password")
                .then().statusCode(401);
    }
}