package pe.sistema.insectosbeneficos;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;
import pe.sistema.insectosbeneficos.requerimientos.RequerimientoRepository;

import jakarta.inject.Inject;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Tests de los endpoints de despachos (HITO-015 / MOD-06):
 *   GET  /api/v1/requerimientos/{id}/despachos
 *   POST /api/v1/requerimientos/{id}/despachos
 *
 * RBAC: Despachos solo admin/super admin.
 * El seed (TestSupport) autentica con el Super Admin id=1.
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class DespachoResourceTest {

    @Test
    @Order(1)
    void testListarDespachosRequerimientoInexistente() {
        given()
            .auth().oauth2(TestSupport.seedToken())
        .when()
            .get("/api/v1/requerimientos/99999/despachos")
        .then()
            .statusCode(200)
            .body("$", hasSize(0));
    }

    @Test
    @Order(2)
    void testCrearDespachoSinAuth() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"cantidadDespachada\":100}")
        .when()
            .post("/api/v1/requerimientos/1/despachos")
        .then()
            .statusCode(401);
    }

    @Test
    @Order(3)
    void testCrearDespachoRequerimientoInexistente() {
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body("{\"cantidadDespachada\":100}")
        .when()
            .post("/api/v1/requerimientos/99999/despachos")
        .then()
            .statusCode(404)
            .body("codigo", equalTo("REQUERIMIENTO_NO_ENCONTRADO"));
    }

    @Test
    @Order(4)
    void testCrearDespachoBodyVacio() {
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body("{}")
        .when()
            .post("/api/v1/requerimientos/1/despachos")
        .then()
            .statusCode(400);
    }
}
