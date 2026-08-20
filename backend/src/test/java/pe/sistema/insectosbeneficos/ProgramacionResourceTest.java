package pe.sistema.insectosbeneficos;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import pe.sistema.insectosbeneficos.programacion.dto.UpdateProgramacionRequest;
import java.util.Collections;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import pe.sistema.insectosbeneficos.programacion.ProgramacionService;
import pe.sistema.insectosbeneficos.programacion.dto.ProgramacionDto;
import java.util.List;
import java.util.ArrayList;
import java.time.ZonedDateTime;
import io.quarkus.test.common.QuarkusTestResource;

@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
public class ProgramacionResourceTest {

    @Test
    public void testGetEspecies() {
        given()
          .when().get("/api/v1/especies")
          .then()
             .statusCode(200)
             .body("size()", greaterThanOrEqualTo(2));
    }

    @Test
    public void testListProgramacionesReturnsMobileContractFields() {
        given()
          .when().get("/api/v1/programaciones?anio=2026&mes=8")
          .then()
             .statusCode(200)
             .body("size()", greaterThanOrEqualTo(1))
             .body("[0].especie", notNullValue())
             .body("[0].totalMes", greaterThanOrEqualTo(0));
    }
}
