package pe.sistema.insectosbeneficos.programacion.dto;

import java.time.Instant;
import java.time.LocalDate;

public class CumplimientoProgramacionDto {

    private Long id;
    private Long programacionDetalleId;
    private Long programacionId;
    private int semana;
    private LocalDate fecha;
    private int papelReal;
    private int sobreReal;
    private int totalReal;
    private Long creadoPor;
    private Instant createdAt;
    private Instant updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProgramacionDetalleId() { return programacionDetalleId; }
    public void setProgramacionDetalleId(Long programacionDetalleId) { this.programacionDetalleId = programacionDetalleId; }

    public Long getProgramacionId() { return programacionId; }
    public void setProgramacionId(Long programacionId) { this.programacionId = programacionId; }

    public int getSemana() { return semana; }
    public void setSemana(int semana) { this.semana = semana; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public int getPapelReal() { return papelReal; }
    public void setPapelReal(int papelReal) { this.papelReal = papelReal; }

    public int getSobreReal() { return sobreReal; }
    public void setSobreReal(int sobreReal) { this.sobreReal = sobreReal; }

    public int getTotalReal() { return totalReal; }
    public void setTotalReal(int totalReal) { this.totalReal = totalReal; }

    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
