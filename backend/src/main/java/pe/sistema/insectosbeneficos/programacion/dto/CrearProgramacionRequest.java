package pe.sistema.insectosbeneficos.programacion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request para crear una nueva programacion (POST /api/v1/programaciones).
 * Solo Admin/Super Admin pueden crear programaciones.
 * La validacion de campos se hace con Bean Validation (@Valid en el Resource):
 * un body invalido produce 400 DATOS_INVALIDOS (ManejadorErrores).
 */
public class CrearProgramacionRequest {
    @NotNull
    @Positive
    private Integer anio;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer mes;

    @NotNull
    @Positive
    private Long especieId;

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    public Long getEspecieId() { return especieId; }
    public void setEspecieId(Long especieId) { this.especieId = especieId; }
}
