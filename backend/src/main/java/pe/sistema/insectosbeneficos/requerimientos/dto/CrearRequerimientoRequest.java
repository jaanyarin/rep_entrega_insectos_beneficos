package pe.sistema.insectosbeneficos.requerimientos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

/**
 * Body de POST /api/v1/requerimientos (crear, Screen 10 del mobile).
 * Coincide con {@code CrearRequerimientoRequest} de ApiClient.ts.
 * Validación con Bean Validation (@Valid en el Resource); un body inválido
 * produce 400 DATOS_INVALIDOS (ManejadorErrores).
 */
public class CrearRequerimientoRequest {

    @NotNull
    private LocalDate fecha;

    @NotNull
    @Positive
    private Long fundoId;

    @NotNull
    @Positive
    private Long loteId;

    @NotNull
    @Positive
    private Long especieId;

    private Long etapaFenologicaId;

    @NotNull
    @Positive
    private java.math.BigDecimal cantidad;

    private Long plagaId;

    private String observaciones;

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public Long getFundoId() { return fundoId; }
    public void setFundoId(Long fundoId) { this.fundoId = fundoId; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public Long getEspecieId() { return especieId; }
    public void setEspecieId(Long especiaId) { this.especieId = especiaId; }
    public Long getEtapaFenologicaId() { return etapaFenologicaId; }
    public void setEtapaFenologicaId(Long etapaFenologicaId) { this.etapaFenologicaId = etapaFenologicaId; }
    public java.math.BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(java.math.BigDecimal cantidad) { this.cantidad = cantidad; }
    public Long getPlagaId() { return plagaId; }
    public void setPlagaId(Long plagaId) { this.plagaId = plagaId; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
