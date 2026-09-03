package pe.sistema.insectosbeneficos.programacion;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "cumplimiento_programacion")
public class CumplimientoProgramacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "programacion_detalle_id", nullable = false)
    private DetalleProgramacion programacionDetalle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "programacion_id", nullable = false)
    private Programacion programacion;

    @Column(nullable = false)
    private int semana;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "papel_real", nullable = false)
    private int papelReal = 0;

    @Column(name = "sobre_real", nullable = false)
    private int sobreReal = 0;

    @Column(name = "total_real", nullable = false)
    private int totalReal = 0;

    @Column(name = "creado_por", nullable = false)
    private Long creadoPor;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DetalleProgramacion getProgramacionDetalle() { return programacionDetalle; }
    public void setProgramacionDetalle(DetalleProgramacion programacionDetalle) { this.programacionDetalle = programacionDetalle; }

    public Programacion getProgramacion() { return programacion; }
    public void setProgramacion(Programacion programacion) { this.programacion = programacion; }

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
