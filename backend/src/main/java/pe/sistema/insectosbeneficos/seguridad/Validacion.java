package pe.sistema.insectosbeneficos.seguridad;

import java.util.Set;
import java.util.stream.Collectors;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.ws.rs.core.Response;

/**
 * Validacion de DTOs de entrada con hibernate-validator, centralizada para
 * que TODA respuesta de validacion sea {codigo: "DATOS_INVALIDOS", mensaje}
 * (el mapper por defecto de RESTEasy Reactive usa otro formato de error).
 * Los DTO conservan sus anotaciones jakarta.validation; este componente las
 * ejecuta y convierte las violaciones en ApiException 400.
 */
@ApplicationScoped
public class Validacion {

    @Inject
    Validator validator;

    /**
     * Valida el DTO y devuelve el mismo objeto si es valido.
     * Si el body llega null o falla la validacion -> ApiException 400.
     */
    public <T> T validar(T dto) {
        if (dto == null) {
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS",
                    "Cuerpo de solicitud inválido");
        }
        Set<ConstraintViolation<T>> violaciones = validator.validate(dto);
        if (!violaciones.isEmpty()) {
            String mensaje = violaciones.stream()
                    .map(ConstraintViolation::getMessage)
                    .distinct()
                    .collect(Collectors.joining("; "));
            throw new ApiException(Response.Status.BAD_REQUEST, "DATOS_INVALIDOS", mensaje);
        }
        return dto;
    }
}