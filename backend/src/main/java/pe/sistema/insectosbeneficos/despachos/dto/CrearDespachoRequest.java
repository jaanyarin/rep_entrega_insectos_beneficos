package pe.sistema.insectosbeneficos.despachos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Request para registrar un despacho (HITO-015 / RF-062..065).
 * Bean Validation para evitar 500 por input inválido (G-VAL).
 */
public class CrearDespachoRequest {

    @NotNull(message = "La cantidad despachada es requerida")
    @DecimalMin(value = "0.01", message = "La cantidad despachada debe ser mayor a cero")
    private BigDecimal cantidadDespachada;

    private BigDecimal papelConPostura;
    private BigDecimal sobreConCascarilla;
    private String observaciones;

    public BigDecimal getCantidadDespachada() { return cantidadDespachada; }
    public void setCantidadDespachada(BigDecimal cantidadDespachada) { this.cantidadDespachada = cantidadDespachada; }

    public BigDecimal getPapelConPostura() { return papelConPostura; }
    public void setPapelConPostura(BigDecimal papelConPostura) { this.papelConPostura = papelConPostura; }

    public BigDecimal getSobreConCascarilla() { return sobreConCascarilla; }
    public void setSobreConCascarilla(BigDecimal sobreConCascarilla) { this.sobreConCascarilla = sobreConCascarilla; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
