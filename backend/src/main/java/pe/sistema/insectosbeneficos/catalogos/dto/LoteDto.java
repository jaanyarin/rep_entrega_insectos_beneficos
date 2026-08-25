package pe.sistema.insectosbeneficos.catalogos.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class LoteDto {
    private Long id;
    private Long fundoId;
    private String fundo;
    private Long variedadId;
    private String variedad;
    private String variedadColor;
    private String nombre;
    private BigDecimal area;
    private Instant createdAt;
    private Instant updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getFundoId() { return fundoId; }
    public void setFundoId(Long fundoId) { this.fundoId = fundoId; }
    public String getFundo() { return fundo; }
    public void setFundo(String fundo) { this.fundo = fundo; }
    public Long getVariedadId() { return variedadId; }
    public void setVariedadId(Long variedadId) { this.variedadId = variedadId; }
    public String getVariedad() { return variedad; }
    public void setVariedad(String variedad) { this.variedad = variedad; }
    public String getVariedadColor() { return variedadColor; }
    public void setVariedadColor(String variedadColor) { this.variedadColor = variedadColor; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public BigDecimal getArea() { return area; }
    public void setArea(BigDecimal area) { this.area = area; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
