package pe.sistema.insectosbeneficos.despachos;

import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import pe.sistema.insectosbeneficos.requerimientos.Requerimiento;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Despacho de insectos benéficos (HITO-015 / MOD-06).
 * Registra la entrega física de productos de I+D a Sanidad.
 * Patrón idéntico a {@code Requerimiento}: entidad Plain JPA.
 *
 * Cada despacho puede ser parcial (RF-064) o total (RF-065).
 * El stock se descuenta automáticamente al registrar (RN-007/069).
 */
@Entity
@Table(name = "despachos")
public class Despacho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @Fetch(FetchMode.JOIN)
    @JoinColumn(name = "requerimiento_id", nullable = false)
    private Requerimiento requerimiento;

    @Column(name = "cantidad_despachada", nullable = false)
    private BigDecimal cantidadDespachada;

    @Column(name = "papel_con_postura")
    private BigDecimal papelConPostura;

    @Column(name = "sobre_con_cascarilla")
    private BigDecimal sobreConCascarilla;

    @Column(columnDefinition = "text")
    private String observaciones;

    @Column(name = "creado_por", nullable = false)
    private Long creadoPor;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Requerimiento getRequerimiento() { return requerimiento; }
    public void setRequerimiento(Requerimiento requerimiento) { this.requerimiento = requerimiento; }

    public BigDecimal getCantidadDespachada() { return cantidadDespachada; }
    public void setCantidadDespachada(BigDecimal cantidadDespachada) { this.cantidadDespachada = cantidadDespachada; }

    public BigDecimal getPapelConPostura() { return papelConPostura; }
    public void setPapelConPostura(BigDecimal papelConPostura) { this.papelConPostura = papelConPostura; }

    public BigDecimal getSobreConCascarilla() { return sobreConCascarilla; }
    public void setSobreConCascarilla(BigDecimal sobreConCascarilla) { this.sobreConCascarilla = sobreConCascarilla; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
