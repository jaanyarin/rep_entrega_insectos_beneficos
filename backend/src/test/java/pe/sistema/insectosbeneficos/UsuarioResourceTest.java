package pe.sistema.insectosbeneficos;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;

import java.util.HashMap;
import java.util.Map;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import pe.sistema.insectosbeneficos.usuarios.EstadoUsuario;
import pe.sistema.insectosbeneficos.usuarios.Usuario;

/**
 * Tests del CRUD /api/usuarios: RBAC, soft delete, filtros, integridad.
 * La BD (Testcontainer) se comparte entre clases; los fixtures usan nombres
 * unicos por test y el estado de los SUPER_ADMIN se restaura dentro del test.
 */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class UsuarioResourceTest {

    // ------------------------------------------------------------------
    // Listado / RBAC
    // ------------------------------------------------------------------

    @Test
    void listar_conSuperAdminIncluyePerfilSuperAdmin() {
        given().auth().oauth2(TestSupport.seedToken())
                .get("/api/usuarios")
                .then().statusCode(200)
                .body("perfil", hasItem("SUPER_ADMIN"))               // seed visible para SA
                .body("usuario", hasItem(TestSupport.SEED_USUARIO));
    }

    @Test
    void listar_adminNoVePerfilSuperAdmin() {
        long adminId = TestSupport.crearUsuarioComoSeed("admin_vis_lista", "Admin Visor", "ADMIN");
        org.junit.jupiter.api.Assertions.assertTrue(adminId > 0);
        String adminToken = TestSupport.loginToken("admin_vis_lista", TestSupport.SEED_PASSWORD);

        given().auth().oauth2(adminToken)
                .get("/api/usuarios")
                .then().statusCode(200)
                .body("perfil", everyItem(not("SUPER_ADMIN")));

        // Con filtro explicito perfil=SUPER_ADMIN, el ADMIN no ve nada
        given().auth().oauth2(adminToken)
                .queryParam("perfil", "SUPER_ADMIN")
                .get("/api/usuarios")
                .then().statusCode(200)
                .body("size()", is(0));
    }

    @Test
    void listar_filtrosEstadoYPerfil() {
        long id = TestSupport.crearUsuarioComoSeed("filtro_usr_1", "Filtro Uno", "USUARIO");
        String token = TestSupport.seedToken();

        given().auth().oauth2(token).queryParam("estado", "ACTIVO").get("/api/usuarios")
                .then().statusCode(200).body("usuario", hasItem("filtro_usr_1"));

        TestSupport.eliminarComoSeed(id).then().statusCode(200); // -> INACTIVO

        given().auth().oauth2(token).queryParam("estado", "ACTIVO").get("/api/usuarios")
                .then().statusCode(200).body("usuario", not(hasItem("filtro_usr_1")));

        given().auth().oauth2(token).queryParam("estado", "INACTIVO").get("/api/usuarios")
                .then().statusCode(200).body("usuario", hasItem("filtro_usr_1"));

        given().auth().oauth2(token).queryParam("perfil", "USUARIO").get("/api/usuarios")
                .then().statusCode(200).body("perfil", everyItem(is("USUARIO")));

        // valor invalido -> 400
        given().auth().oauth2(token).queryParam("estado", "INVALIDO").get("/api/usuarios")
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
    }

    @Test
    void obtener_sinToken401_y_conTokenUsuarioSinPermiso403() {
        given().get("/api/usuarios").then().statusCode(401);
        given().get("/api/usuarios/1").then().statusCode(401);

        long opId = TestSupport.crearUsuarioComoSeed("oper_sin_permiso", "Oper Sin Permiso", "USUARIO");
        org.junit.jupiter.api.Assertions.assertTrue(opId > 0);
        String opToken = TestSupport.loginToken("oper_sin_permiso", TestSupport.SEED_PASSWORD);

        given().auth().oauth2(opToken).get("/api/usuarios").then().statusCode(403);
        given().auth().oauth2(opToken).get("/api/usuarios/" + opId).then().statusCode(403);
        // POST con Content-Type correcto para que la seguridad se evalue (sin
        // Content-Type RESTEasy responde 415 antes del chequeo de roles)
        given().auth().oauth2(opToken).contentType(ContentType.JSON).body(Map.of()).post("/api/usuarios")
                .then().statusCode(403);
    }

    // ------------------------------------------------------------------
    // Crear
    // ------------------------------------------------------------------

    @Test
    void crear_usuarioNaceConPasswordDefaultYDebeCambiar() {
        Response r = TestSupport.crearUsuario(TestSupport.seedToken(), "nuevo_usr_crud", "Nuevo Usuario", "USUARIO");
        r.then().statusCode(201)
                .body("usuario", is("nuevo_usr_crud"))
                .body("perfil", is("USUARIO"))
                .body("estado", is("ACTIVO"))
                .body("debeCambiarPassword", is(true))
                .body("creadoPor", notNullValue());

        // password SIEMPRE 00000000 hasheado -> login funciona con el default
        TestSupport.assertLoginOk("nuevo_usr_crud", TestSupport.SEED_PASSWORD);
    }

    @Test
    void crear_duplicado_devuelve409() {
        TestSupport.crearUsuarioComoSeed("dup_usr", "Duplicado", "USUARIO");
        TestSupport.crearUsuario(TestSupport.seedToken(), "dup_usr", "Duplicado", "USUARIO")
                .then().statusCode(409).body("codigo", is("USUARIO_YA_EXISTE"));
    }

    @Test
    void crear_sinPerfil_devuelve400() {
        Map<String, Object> body = new HashMap<>();
        body.put("usuario", "sin_perfil_1");
        body.put("nombre", "Sin Perfil");
        given().auth().oauth2(TestSupport.seedToken())
                .contentType(ContentType.JSON).body(body)
                .post("/api/usuarios")
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
    }

    @Test
    void crear_dniInvalido_devuelve400() {
        Map<String, Object> conDniInvalido = TestSupport.crearBody("dni_abc_1", "Dni Abc", "USUARIO");
        conDniInvalido.put("dni", "abc");
        given().auth().oauth2(TestSupport.seedToken())
                .contentType(ContentType.JSON).body(conDniInvalido)
                .post("/api/usuarios")
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));

        Map<String, Object> conDniDefault = TestSupport.crearBody("dni_default_1", "Dni Default", "USUARIO");
        conDniDefault.put("dni", "00000000");
        given().auth().oauth2(TestSupport.seedToken())
                .contentType(ContentType.JSON).body(conDniDefault)
                .post("/api/usuarios")
                .then().statusCode(400).body("codigo", is("DATOS_INVALIDOS"));
    }

    @Test
    void crear_adminPuedeCrearAdminYUsuario_peroNoSuperAdmin() {
        long adminId = TestSupport.crearUsuarioComoSeed("admin_crea", "Admin Creador", "ADMIN");
        org.junit.jupiter.api.Assertions.assertTrue(adminId > 0);
        String adminToken = TestSupport.loginToken("admin_crea", TestSupport.SEED_PASSWORD);

        TestSupport.crearUsuario(adminToken, "admin_hijo", "Admin Hijo", "ADMIN").then().statusCode(201);
        TestSupport.crearUsuario(adminToken, "usr_hijo", "Usr Hijo", "USUARIO").then().statusCode(201);

        TestSupport.crearUsuario(adminToken, "super_no_permitido", "Super No", "SUPER_ADMIN")
                .then().statusCode(403).body("codigo", is("SIN_PERMISOS"));
    }

    // ------------------------------------------------------------------
    // Actualizar
    // ------------------------------------------------------------------

    @Test
    void actualizar_cambiaDatosNoPassword() {
        long id = TestSupport.crearUsuarioComoSeed("actualiza_usr", "Antes", "USUARIO");

        Map<String, Object> body = new HashMap<>();
        body.put("usuario", "actualiza_usr");
        body.put("nombre", "Después");
        body.put("perfil", "ADMIN");
        body.put("estado", "ACTIVO");

        given().auth().oauth2(TestSupport.seedToken())
                .contentType(ContentType.JSON).body(body)
                .put("/api/usuarios/" + id)
                .then().statusCode(200)
                .body("nombre", is("Después"))
                .body("perfil", is("ADMIN"))
                .body("debeCambiarPassword", is(true)); // el password NO se toca

        // Duplicado de usuario por PUT -> 409
        long otroId = TestSupport.crearUsuarioComoSeed("actualiza_otro", "Otro", "USUARIO");
        Map<String, Object> dup = new HashMap<>();
        dup.put("usuario", "actualiza_usr");
        dup.put("nombre", "Otro");
        dup.put("perfil", "USUARIO");
        dup.put("estado", "ACTIVO");
        given().auth().oauth2(TestSupport.seedToken())
                .contentType(ContentType.JSON).body(dup)
                .put("/api/usuarios/" + otroId)
                .then().statusCode(409);
    }

    @Test
    void actualizar_adminNoPuedeTocarSuperAdmin() {
        long adminId = TestSupport.crearUsuarioComoSeed("admin_upd", "Admin Updater", "ADMIN");
        org.junit.jupiter.api.Assertions.assertTrue(adminId > 0);
        String adminToken = TestSupport.loginToken("admin_upd", TestSupport.SEED_PASSWORD);

        long seedId = given().auth().oauth2(TestSupport.seedToken())
                .queryParam("perfil", "SUPER_ADMIN")
                .get("/api/usuarios")
                .jsonPath().getList("id", Long.class).get(0);

        Map<String, Object> body = new HashMap<>();
        body.put("usuario", "Admin PowerApps");
        body.put("nombre", "Admin PowerApps");
        body.put("perfil", "SUPER_ADMIN");
        body.put("estado", "ACTIVO");
        given().auth().oauth2(adminToken).contentType(ContentType.JSON).body(body)
                .put("/api/usuarios/" + seedId)
                .then().statusCode(403).body("codigo", is("SIN_PERMISOS"));

        // Subir a SUPER_ADMIN desde ADMIN -> 403
        Map<String, Object> up = new HashMap<>();
        up.put("usuario", "admin_upd");
        up.put("nombre", "Admin Updater");
        up.put("perfil", "SUPER_ADMIN");
        up.put("estado", "ACTIVO");
        given().auth().oauth2(adminToken).contentType(ContentType.JSON).body(up)
                .put("/api/usuarios/" + adminId)
                .then().statusCode(403);
    }

    @Test
    void actualizar_ultimoSuperAdmin_noPuedeDesactivarse() {
        long seedId = given().auth().oauth2(TestSupport.seedToken())
                .queryParam("perfil", "SUPER_ADMIN")
                .get("/api/usuarios")
                .jsonPath().getList("id", Long.class).get(0);

        Map<String, Object> body = new HashMap<>();
        body.put("usuario", "Admin PowerApps");
        body.put("nombre", "Admin PowerApps");
        body.put("perfil", "SUPER_ADMIN");
        body.put("estado", "INACTIVO");
        given().auth().oauth2(TestSupport.seedToken()).contentType(ContentType.JSON).body(body)
                .put("/api/usuarios/" + seedId)
                .then().statusCode(400).body("codigo", is("ULTIMO_SUPER_ADMIN"));
    }

    // ------------------------------------------------------------------
    // Soft delete e integridad
    // ------------------------------------------------------------------

    @Test
    void eliminar_softDelete_mantieneElRegistroEnBD() {
        long id = TestSupport.crearUsuarioComoSeed("borrar_soft", "Borrar Soft", "USUARIO");

        given().auth().oauth2(TestSupport.seedToken())
                .delete("/api/usuarios/" + id)
                .then().statusCode(200).body("mensaje", notNullValue());

        // Consulta directa a BD: el registro SIGUE existiendo, solo cambio estado
        Usuario persistido = Usuario.findById(id);
        Assertions.assertNotNull(persistido, "El registro no debe borrarse físicamente");
        Assertions.assertEquals(EstadoUsuario.INACTIVO, persistido.estado);

        // eliminar de nuevo -> 400 (ya inactivo)
        given().auth().oauth2(TestSupport.seedToken())
                .delete("/api/usuarios/" + id)
                .then().statusCode(400).body("codigo", is("USUARIO_YA_INACTIVO"));
    }

    @Test
    void eliminar_noExiste_devuelve404() {
        given().auth().oauth2(TestSupport.seedToken())
                .delete("/api/usuarios/999999")
                .then().statusCode(404).body("codigo", is("USUARIO_NO_ENCONTRADO"));
    }

    @Test
    void eliminar_adminPuedeDesactivarAdminYUsuario_peroNoSuperAdmin() {
        long adminId = TestSupport.crearUsuarioComoSeed("admin_borra", "Admin Borrador", "ADMIN");
        long admin2Id = TestSupport.crearUsuarioComoSeed("admin_borra2", "Admin Borrador 2", "ADMIN");
        long victimaId = TestSupport.crearUsuarioComoSeed("victima_borra", "Víctima", "USUARIO");
        String adminToken = TestSupport.loginToken("admin_borra", TestSupport.SEED_PASSWORD);

        given().auth().oauth2(adminToken).delete("/api/usuarios/" + victimaId).then().statusCode(200);
        // a OTRO ADMIN si (self-delete daria NO_AUTO_DESACTIVACION, regla aparte)
        given().auth().oauth2(adminToken).delete("/api/usuarios/" + admin2Id).then().statusCode(200);

        // pero a un SUPER_ADMIN -> 403 SIN_PERMISOS (ADMIN nunca gestiona SUPER_ADMIN)
        long seedId = given().auth().oauth2(TestSupport.seedToken())
                .queryParam("perfil", "SUPER_ADMIN")
                .get("/api/usuarios")
                .jsonPath().getList("id", Long.class).get(0);
        given().auth().oauth2(adminToken).delete("/api/usuarios/" + seedId)
                .then().statusCode(403).body("codigo", is("SIN_PERMISOS"));
    }

    @Test
    void eliminar_noSelfDelete_conMasDeUnSuperAdminActivo() {
        // Seed crea un segundo SUPER_ADMIN (permitido: el creador es SUPER_ADMIN)
        long saExtraId = TestSupport.crearUsuarioComoSeed("sa_extra_self", "SA Extra", "SUPER_ADMIN");
        String saExtraToken = TestSupport.loginToken("sa_extra_self", TestSupport.SEED_PASSWORD);

        // Con 2 SUPER_ADMIN activos, auto-desactivacion -> 400 NO_AUTO_DESACTIVACION
        given().auth().oauth2(saExtraToken).delete("/api/usuarios/" + saExtraId)
                .then().statusCode(400).body("codigo", is("NO_AUTO_DESACTIVACION"));

        // Restaura el estado: el seed desactiva al SA extra (deja solo al seed activo)
        TestSupport.eliminarComoSeed(saExtraId).then().statusCode(200);
    }

    @Test
    void eliminar_ultimoSuperAdminActivo_protegido() {
        // En este punto el unico SUPER_ADMIN activo debe ser el seed (los demas
        // tests restauran el estado). En ese escenario, incluso el seed no puede
        // desactivarse: regla de integridad ULTIMO_SUPER_ADMIN.
        long seedId = given().auth().oauth2(TestSupport.seedToken())
                .queryParam("perfil", "SUPER_ADMIN")
                .get("/api/usuarios")
                .jsonPath().getList("id", Long.class).get(0);

        given().auth().oauth2(TestSupport.seedToken())
                .delete("/api/usuarios/" + seedId)
                .then().statusCode(400).body("codigo", is("ULTIMO_SUPER_ADMIN"));
    }

    @Test
    void eliminar_reglaAutoDesactivacion_adminNoSeDesactivaSiNoEsElUltimoSA() {
        long adminId = TestSupport.crearUsuarioComoSeed("admin_self_del", "Admin Self", "ADMIN");
        String adminToken = TestSupport.loginToken("admin_self_del", TestSupport.SEED_PASSWORD);

        given().auth().oauth2(adminToken).delete("/api/usuarios/" + adminId)
                .then().statusCode(400).body("codigo", is("NO_AUTO_DESACTIVACION"));
    }
}