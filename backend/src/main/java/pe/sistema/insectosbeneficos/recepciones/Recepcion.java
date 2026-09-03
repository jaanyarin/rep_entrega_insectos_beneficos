package pe.sistema.insectosbeneficos.recepciones;

import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import pe.sistema.insectosbeneficos.requerimientos.Requerimiento;

import java.time.Instant;

/**
 * Recepción de insectos benéficos (HITO-015 / MOD-07).
 * Registra la confirmación de recepción por parte de Sanidad.
 * La fecha/hora de recepción se registra automáticamente (RF-073).
 */
@Entity
@Table(name = "recepciones")
public class Recepcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @Fetch(FetchMode.JOIN)
    @JoinColumn(name = "requerimiento_id", nullable = false)
    private Requerimiento requerimiento;

    @Column(nullable = false)
    private Boolean conforme = true;

    @Column(columnDefinition = "text")
    private String observaciones;

    @Column(name = "fecha_recepcion", nullable = false)
    private Instant fechaRecepcion = Instant.now();

    @Column(name = "creado_por", nullable = false)
    private Long creadoPor;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Requerimiento getRequerimiento() { return requerimiento; }
    public void setRequerimiento(Requerimiento requerimiento) { this.requerimiento = requerimiento; }

    public Boolean getConforme() { return conforme; }
    public void setConforme(Boolean conforme) { this.conforme = conforme; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Instant getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(Instant fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
