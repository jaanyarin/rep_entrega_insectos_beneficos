package pe.sistema.insectosbeneficos;

import java.util.Map;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;

import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Arranca PostgreSQL 16 en Docker para los tests (@QuarkusTest).
 * Se prefirio Testcontainers sobre H2-modopg porque el docker local responde
 * (docker version 29.7.2) y asi los CHECK de la migracion V1 y las
 * caracteristicas reales de PostgreSQL se ejercitan tal cual produccion.
 * La imagen postgres:16 ya esta descargada (docker-compose raiz).
 *
 * El contenedor se comparte entre clases de test (objeto estatico, misma JVM);
 * stop() no lo detiene: lo limpia Ryuk al terminar la JVM.
 */
public class PostgresTestResource implements QuarkusTestResourceLifecycleManager {

    static final PostgreSQLContainer<?> DB = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("insectos_beneficos_test")
            .withUsername("test")
            .withPassword("test");

    @Override
    public Map<String, String> start() {
        DB.start();
        return Map.of(
                "quarkus.datasource.db-kind", "postgresql",
                "quarkus.datasource.jdbc.url", DB.getJdbcUrl(),
                "quarkus.datasource.username", DB.getUsername(),
                "quarkus.datasource.password", DB.getPassword());
    }

    @Override
    public void stop() {
        // Intencionalmente vacio: el contenedor se comparte entre clases.
    }
}