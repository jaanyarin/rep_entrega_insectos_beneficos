package pe.sistema.insectosbeneficos.recepciones.dto;

import java.time.Instant;

/**
 * DTO de respuesta para recepciones (HITO-015).
 */
public class RecepcionDto {

    private Long id;
    private Long requerimientoId;
    private Boolean conforme;
    private String observaciones;
    private Instant fechaRecepcion;
    private Long creadoPor;
    private String creadoPorNombre;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequerimientoId() { return requerimientoId; }
    public void setRequerimientoId(Long requerimientoId) { this.requerimientoId = requerimientoId; }

    public Boolean getConforme() { return conforme; }
    public void setConforme(Boolean conforme) { this.conforme = conforme; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Instant getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(Instant fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }

    public String getCreadoPorNombre() { return creadoPorNombre; }
    public void setCreadoPorNombre(String creadoPorNombre) { this.creadoPorNombre = creadoPorNombre; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
