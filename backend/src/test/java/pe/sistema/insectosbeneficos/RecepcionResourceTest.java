package pe.sistema.insectosbeneficos;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Tests de los endpoints de recepciones (HITO-015 / MOD-07):
 *   GET  /api/v1/requerimientos/{id}/recepciones
 *   POST /api/v1/requerimientos/{id}/recepciones
 *
 * RBAC: Recepciones admin/usuario.
 * El seed (TestSupport) autentica con el Super Admin id=1.
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class RecepcionResourceTest {

    @Test
    @Order(1)
    void testListarRecepcionesRequerimientoInexistente() {
        given()
            .auth().oauth2(TestSupport.seedToken())
        .when()
            .get("/api/v1/requerimientos/99999/recepciones")
        .then()
            .statusCode(200)
            .body("$", hasSize(0));
    }

    @Test
    @Order(2)
    void testCrearRecepcionSinAuth() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"conforme\":true}")
        .when()
            .post("/api/v1/requerimientos/1/recepciones")
        .then()
            .statusCode(401);
    }

    @Test
    @Order(3)
    void testCrearRecepcionRequerimientoInexistente() {
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body("{\"conforme\":true}")
        .when()
            .post("/api/v1/requerimientos/99999/recepciones")
        .then()
            .statusCode(404)
            .body("codigo", equalTo("REQUERIMIENTO_NO_ENCONTRADO"));
    }

    @Test
    @Order(4)
    void testCrearRecepcionConObservaciones() {
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body("{\"conforme\":false,\"observaciones\":\"Faltan piezas\"}")
        .when()
            .post("/api/v1/requerimientos/99999/recepciones")
        .then()
            .statusCode(404);
    }
}
