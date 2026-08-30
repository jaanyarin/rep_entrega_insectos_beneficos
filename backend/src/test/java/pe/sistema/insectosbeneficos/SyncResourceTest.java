package pe.sistema.insectosbeneficos;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Tests de los endpoints de sync offline (HITO-013):
 *   POST /api/v1/sync/push
 *   POST /api/v1/sync/pull
 *   GET  /api/v1/sync/status
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
public class SyncResourceTest {

    // ─── PUSH ────────────────────────────────────────────────────────────────

    @Test
    void push_crear_requerimiento() {
        Map<String, Object> body = Map.of(
            "deviceId", "test-device-001",
            "operaciones", List.of(Map.of(
                "operation", "INSERT",
                "tableName", "requerimientos",
                "localId", -1,
                "payload", Map.of(
                    "fecha", "2026-08-30",
                    "fundoId", 1,
                    "loteId", 1,
                    "especieId", 1,
                    "cantidad", 100,
                    "estado", "REGISTRADO"
                )
            ))
        );

        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/api/v1/sync/push")
        .then()
            .statusCode(200)
            .body("resultados", hasSize(1))
            .body("resultados[0].status", equalTo("CREATED"))
            .body("resultados[0].serverId", notNullValue())
            .body("resultados[0].localId", equalTo(-1))
            .body("timestamp", notNullValue());
    }

    @Test
    void push_actualizar_requerimiento_existente() {
        // Primero crear uno
        Map<String, Object> createBody = Map.of(
            "deviceId", "test-device-002",
            "operaciones", List.of(Map.of(
                "operation", "INSERT",
                "tableName", "requerimientos",
                "localId", -2,
                "payload", Map.of(
                    "fecha", "2026-08-30",
                    "fundoId", 1,
                    "loteId", 1,
                    "especieId", 1,
                    "cantidad", 50,
                    "estado", "REGISTRADO"
                )
            ))
        );

        Long serverId = given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body(createBody)
        .when()
            .post("/api/v1/sync/push")
        .then()
            .statusCode(200)
            .extract().jsonPath().getLong("resultados[0].serverId");

        // Ahora actualizar
        Map<String, Object> updateBody = Map.of(
            "deviceId", "test-device-002",
            "operaciones", List.of(Map.of(
                "operation", "UPDATE",
                "tableName", "requerimientos",
                "localId", -3,
                "serverId", serverId,
                "payload", Map.of(
                    "fecha", "2026-08-30",
                    "fundoId", 1,
                    "loteId", 1,
                    "especieId", 1,
                    "cantidad", 75,
                    "estado", "REGISTRADO"
                )
            ))
        );

        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body(updateBody)
        .when()
            .post("/api/v1/sync/push")
        .then()
            .statusCode(200)
            .body("resultados[0].status", equalTo("UPDATED"))
            .body("resultados[0].serverId", equalTo(serverId.intValue()));
    }

    @Test
    void push_update_no_existente() {
        Map<String, Object> body = Map.of(
            "deviceId", "test-device-003",
            "operaciones", List.of(Map.of(
                "operation", "UPDATE",
                "tableName", "requerimientos",
                "localId", -4,
                "serverId", 999999,
                "payload", Map.of(
                    "fecha", "2026-08-30",
                    "fundoId", 1,
                    "loteId", 1,
                    "especieId", 1,
                    "cantidad", 10,
                    "estado", "REGISTRADO"
                )
            ))
        );

        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/api/v1/sync/push")
        .then()
            .statusCode(200)
            .body("resultados[0].status", equalTo("NOT_FOUND"));
    }

    @Test
    void push_sin_auth() {
        Map<String, Object> body = Map.of(
            "deviceId", "test-device",
            "operaciones", List.of()
        );

        given()
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/api/v1/sync/push")
        .then()
            .statusCode(401);
    }

    // ─── PULL ────────────────────────────────────────────────────────────────

    @Test
    void pull_retorna_requerimientos() {
        // Crear uno primero
        Map<String, Object> createBody = Map.of(
            "deviceId", "test-device-pull",
            "operaciones", List.of(Map.of(
                "operation", "INSERT",
                "tableName", "requerimientos",
                "localId", -10,
                "payload", Map.of(
                    "fecha", "2026-08-30",
                    "fundoId", 1,
                    "loteId", 1,
                    "especieId", 1,
                    "cantidad", 200,
                    "estado", "REGISTRADO"
                )
            ))
        );

        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body(createBody)
        .when()
            .post("/api/v1/sync/push")
        .then().statusCode(200);

        // Pull sin filtro (últimos 100)
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body(Map.of("deviceId", "test-device-pull"))
        .when()
            .post("/api/v1/sync/pull")
        .then()
            .statusCode(200)
            .body("requerimientos", notNullValue())
            .body("timestamp", notNullValue());
    }

    @Test
    void pull_con_since() {
        given()
            .auth().oauth2(TestSupport.seedToken())
            .contentType(ContentType.JSON)
            .body(Map.of(
                "deviceId", "test",
                "since", "2026-01-01T00:00:00Z"
            ))
        .when()
            .post("/api/v1/sync/pull")
        .then()
            .statusCode(200)
            .body("requerimientos", notNullValue());
    }

    // ─── STATUS ──────────────────────────────────────────────────────────────

    @Test
    void status_retorna_estado() {
        given()
            .auth().oauth2(TestSupport.seedToken())
        .when()
            .get("/api/v1/sync/status")
        .then()
            .statusCode(200)
            .body("serverTime", notNullValue())
            .body("requerimientosCount", notNullValue())
            .body("lastSync", anything());
    }
}
