package pe.sistema.insectosbeneficos;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Tests de los endpoints del módulo de requerimientos (HITO-008):
 *   GET  /api/v1/requerimientos?fechaDesde&fechaHasta&estado&creadoPor
 *   GET  /api/v1/requerimientos/{id}
 *   POST /api/v1/requerimientos
 *   PUT  /api/v1/requerimientos/{id}
 *   GET  /api/v1/programaciones/{especieId}/stock
 *
 * El seed (TestSupport) autentica con el Super Admin id=1. Testcontainers aplica
 * V1..V10. Catálogos sembrados: fundo 1 = Challapampa, lote 1 = CH01 (V7),
 * especie 1 = Chrysopa sp. (V4), etapa 1 = BROTACIÓN / plaga 1 = PSEUDOCOCCIDAE (V9).
 * Cada test es autosuficiente (asegura su stock creando una programación única
 * si hace falta) para no depender del orden de ejecución.
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
public class RequerimientoResourceTest {

    private static final long FUNDO_ID = 1L;
    private static final long LOTE_ID = 1L;
    private static final long ESPECIE_ID = 1L;
    private static final long ETAPA_ID = 1L;
    private static final long PLAGA_ID = 1L;
    private static final String FECHA = "2026-08-24";

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /** Crea una programación base para la especie (stock 5000) si no existe ya. */
    private void asegurarStockEspecie() {
        given()
          .auth().oauth2(TestSupport.seedToken())
          .contentType(ContentType.JSON)
          .body(Map.of("anio", 2200, "mes", 1, "especieId", ESPECIE_ID))
          .when().post("/api/v1/programaciones")
          .then().statusCode(anyOf(is(201), is(409)));
    }

    private Map<String, Object> crearBody(BigDecimal cantidad) {
        Map<String, Object> body = new HashMap<>();
        body.put("fecha", FECHA);
        body.put("fundoId", FUNDO_ID);
        body.put("loteId", LOTE_ID);
        body.put("especieId", ESPECIE_ID);
        body.put("etapaFenologicaId", ETAPA_ID);
        body.put("cantidad", cantidad);
        body.put("plagaId", PLAGA_ID);
        body.put("observaciones", "Requerimiento de prueba");
        return body;
    }

    private Map<String, Object> actualizarBody(BigDecimal cantidad, String estado) {
        Map<String, Object> body = crearBody(cantidad);
        body.put("estado", estado);
        return body;
    }

    /** Crea un requerimiento y devuelve su id (asume 201). */
    private long crearRequerimientoId(BigDecimal cantidad) {
        return given()
          .auth().oauth2(TestSupport.seedToken())
          .contentType(ContentType.JSON)
          .body(crearBody(cantidad))
          .when().post("/api/v1/requerimientos")
          .then().statusCode(201)
          .extract().jsonPath().getLong("id");
    }

    // ------------------------------------------------------------------
    // 1. Crear requerimiento -> 201 REGISTRADO
    // ------------------------------------------------------------------

    @Test
    public void testCrearRequerimiento() {
        asegurarStockEspecie();
        given()
          .auth().oauth2(TestSupport.seedToken())
          .contentType(ContentType.JSON)
          .body(crearBody(new BigDecimal("10")))
          .when().post("/api/v1/requerimientos")
          .then()
             .statusCode(201)
             .body("id", notNullValue())
             .body("estado", is("REGISTRADO"))
             .body("fundo", is("Challapampa"))
             .body("lote", is("CH01"))
             .body("especie", is("Chrysopa sp."))
             .body("fundoId", is(1))
             .body("loteId", is(1))
             .body("especieId", is(1))
             .body("cantidad", is(10))
             .body("creadoPor", is(1));
    }

    // ------------------------------------------------------------------
    // 2. Listar requerimientos -> 200 (al menos uno)
    // ------------------------------------------------------------------

    @Test
    public void testListarRequerimientos() {
        asegurarStockEspecie();
        crearRequerimientoId(new BigDecimal("10"));
        given()
          .auth().oauth2(TestSupport.seedToken())
          .when().get("/api/v1/requerimientos")
          .then()
             .statusCode(200)
             .body("size()", greaterThanOrEqualTo(1))
             .body("[0].id", notNullValue());
    }

    // ------------------------------------------------------------------
    // 3. Obtener por id -> 200
    // ------------------------------------------------------------------

    @Test
    public void testObtenerRequerimiento() {
        asegurarStockEspecie();
        long id = crearRequerimientoId(new BigDecimal("10"));
        given()
          .auth().oauth2(TestSupport.seedToken())
          .when().get("/api/v1/requerimientos/" + id)
          .then()
             .statusCode(200)
             .body("id", is((int) id))
             .body("estado", is("REGISTRADO"))
             .body("fundo", is("Challapampa"))
             .body("lote", is("CH01"));
    }

    // ------------------------------------------------------------------
    // 4. Actualizar a ENTREGADO con papel+sobre == cantidad -> 200
    // ------------------------------------------------------------------

    @Test
    public void testActualizarAEntregado_conPapelSobreDevuelve200() {
        asegurarStockEspecie();
        long id = crearRequerimientoId(new BigDecimal("10"));
        Map<String, Object> body = actualizarBody(new BigDecimal("10"), "ENTREGADO");
        body.put("papelConPostura", 5);
        body.put("sobreConCascarilla", 5);

        given()
          .auth().oauth2(TestSupport.seedToken())
          .contentType(ContentType.JSON)
          .body(body)
          .when().put("/api/v1/requerimientos/" + id)
          .then()
             .statusCode(200)
             .body("estado", is("ENTREGADO"))
             .body("papelConPostura", is(5))
             .body("sobreConCascarilla", is(5));
    }

    // ------------------------------------------------------------------
    // 5. Actualizar a ENTREGADO sin papel/sobre -> 400 ENTREGADO_PAPEL_SOBRE_INVALIDO
    // ------------------------------------------------------------------

    @Test
    public void testActualizarAEntregado_sinPapelSobreDevuelve400() {
        asegurarStockEspecie();
        long id = crearRequerimientoId(new BigDecimal("10"));
        Map<String, Object> body = actualizarBody(new BigDecimal("10"), "ENTREGADO");

        given()
          .auth().oauth2(TestSupport.seedToken())
          .contentType(ContentType.JSON)
          .body(body)
          .when().put("/api/v1/requerimientos/" + id)
          .then()
             .statusCode(400)
             .body("codigo", is("ENTREGADO_PAPEL_SOBRE_INVALIDO"));
    }

    // ------------------------------------------------------------------
    // 6. Stock de la especie -> 200 {stock}
    // ------------------------------------------------------------------

    @Test
    public void testObtenerStockEspecie() {
        asegurarStockEspecie();
        given()
          .auth().oauth2(TestSupport.seedToken())
          .when().get("/api/v1/programaciones/" + ESPECIE_ID + "/stock")
          .then()
             .statusCode(200)
             .body("stock", notNullValue());
    }
}
