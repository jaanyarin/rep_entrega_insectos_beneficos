package pe.sistema.insectosbeneficos;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Tests de los endpoints de liberaciones (HITO-015 / MOD-08):
 *   GET  /api/v1/requerimientos/{id}/liberaciones
 *   POST /api/v1/requerimientos/{id}/liberaciones
 *
 * RBAC: Liberaciones admin/usuario.
 * El seed (TestSupport) autentica con el Super Admin id=1.
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class LiberacionResourceTest {

    @Test
    @Order(1)
    void testListarLiberacionesRequerimientoInexistente() {
        given()
            .auth().oauth2(TestSupport.seedToken())
        .when()
            .get("/api/v1/requerimientos/99999/liberaciones")
        .then()
            .statusCode(200)
            .body("$", hasSize(0));
    }

    @Test
    @Order(2)
    void testCrearLiberacionSinAuth() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"cantidadLiberada\":100}")
        .when()
            .post("/api/v1/requerimientos/1/liberaciones")
        .then()
            .statusCode(401);
    }

    @Test
    @Order(3)
    void testCrearLiberacionRequerimientoInexistente() {
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body("{\"cantidadLiberada\":100,\"fundoId\":1,\"loteId\":1,\"horaLiberacion\":\"08:00\"}")
        .when()
            .post("/api/v1/requerimientos/99999/liberaciones")
        .then()
            .statusCode(404)
            .body("codigo", equalTo("REQUERIMIENTO_NO_ENCONTRADO"));
    }

    @Test
    @Order(4)
    void testCrearLiberacionBodyVacio() {
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body("{}")
        .when()
            .post("/api/v1/requerimientos/1/liberaciones")
        .then()
            .statusCode(400);
    }
}
