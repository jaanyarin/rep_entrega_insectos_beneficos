package pe.sistema.insectosbeneficos.liberaciones.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Request para registrar una liberación en campo (HITO-015 / RF-080..086).
 * Bean Validation para evitar 500 por input inválido (G-VAL).
 */
public class CrearLiberacionRequest {

    @NotNull(message = "El fundo es requerido")
    private Long fundoId;

    @NotNull(message = "El lote es requerido")
    private Long loteId;

    @NotNull(message = "La cantidad liberada es requerida")
    @DecimalMin(value = "0.01", message = "La cantidad liberada debe ser mayor a cero")
    private BigDecimal cantidadLiberada;

    private String observaciones;

    @NotBlank(message = "La hora de liberación es requerida")
    private String horaLiberacion;

    public Long getFundoId() { return fundoId; }
    public void setFundoId(Long fundoId) { this.fundoId = fundoId; }

    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }

    public BigDecimal getCantidadLiberada() { return cantidadLiberada; }
    public void setCantidadLiberada(BigDecimal cantidadLiberada) { this.cantidadLiberada = cantidadLiberada; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getHoraLiberacion() { return horaLiberacion; }
    public void setHoraLiberacion(String horaLiberacion) { this.horaLiberacion = horaLiberacion; }
}
