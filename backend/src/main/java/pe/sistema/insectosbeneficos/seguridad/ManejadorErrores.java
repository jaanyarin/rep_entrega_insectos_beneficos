package pe.sistema.insectosbeneficos.seguridad;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import org.jboss.logging.Logger;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

/**
 * Mapa global de errores a JSON {codigo, mensaje} con el status HTTP correcto.
 * - ApiException: errores de negocio (404/409/403/400/401 con codigo propio).
 * - ConstraintViolationException: validaciones de hibernate-validator -> 400.
 * - BadRequestException (JSON malformado, body invalido) -> 400.
 * - NotAuthorized/Forbidden (seguridad RESTEasy) -> 401/403 con mensaje claro.
 * - Cualquier otra cosa -> 500 generico (no filtra detalles tecnicos).
 */
@Provider
public class ManejadorErrores implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(ManejadorErrores.class);

    @Override
    public Response toResponse(Throwable t) {
        if (t instanceof ApiException api) {
            return Response.status(api.getStatus())
                    .entity(new ApiError(api.getCodigo(), api.getMessage()))
                    .build();
        }
        if (t instanceof ConstraintViolationException cve) {
            String msg = cve.getConstraintViolations().stream()
                    .map(ConstraintViolation::getMessage)
                    .distinct()
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Datos inválidos");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ApiError("DATOS_INVALIDOS", msg))
                    .build();
        }
        if (t instanceof BadRequestException) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ApiError("DATOS_INVALIDOS", "Solicitud inválida"))
                    .build();
        }
        if (t instanceof NotAuthorizedException) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ApiError("NO_AUTENTICADO", "Autenticación requerida"))
                    .build();
        }
        if (t instanceof ForbiddenException) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ApiError("SIN_PERMISOS", "Sin permisos para realizar esta operación"))
                    .build();
        }
        if (t instanceof WebApplicationException wae) {
            int status = wae.getResponse().getStatus();
            return Response.status(status)
                    .entity(new ApiError("ERROR_HTTP_" + status, wae.getMessage() != null ? wae.getMessage() : "Error en la solicitud"))
                    .build();
        }
        LOG.error("Error no manejado en la API", t);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ApiError("ERROR_INTERNO", "Error interno del servidor"))
                .build();
    }
}