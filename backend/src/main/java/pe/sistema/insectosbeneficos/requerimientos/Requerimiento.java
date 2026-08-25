package pe.sistema.insectosbeneficos.requerimientos;

import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import pe.sistema.insectosbeneficos.catalogos.EtapaFenologica;
import pe.sistema.insectosbeneficos.catalogos.Fundo;
import pe.sistema.insectosbeneficos.catalogos.Lote;
import pe.sistema.insectosbeneficos.catalogos.Plaga;
import pe.sistema.insectosbeneficos.programacion.Especie;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Requerimiento de insectos benéficos (HITO-008).
 * Patrón idéntico a {@code Programacion}: entidad Plain JPA + Repository Panache.
 *
 * Las relaciones a catálogos (fundo, lote, especie, etapaFenologica, plaga) usan
 * EAGER + {@code @Fetch(FetchMode.JOIN)} para evitar N+1 en listados (G-ORM),
 * igual que {@code Lote} en el paquete catalogos.
 *
 * El estado sigue el ciclo del dominio (V10 CHECK):
 *   REGISTRADO → PENDIENTE → APROBADO → ENTREGADO → RECIBIDO → LIBERADO.
 * papelConPostura / sobreConCascarilla solo se setean cuando estado = ENTREGADO
 * (validado en RequerimientoService).
 */
@Entity
@Table(name = "requerimientos")
public class Requerimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @Fetch(FetchMode.JOIN)
    @JoinColumn(name = "fundo_id", nullable = false)
    private Fundo fundo;

    @ManyToOne(fetch = FetchType.EAGER)
    @Fetch(FetchMode.JOIN)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @ManyToOne(fetch = FetchType.EAGER)
    @Fetch(FetchMode.JOIN)
    @JoinColumn(name = "especie_id", nullable = false)
    private Especie especie;

    @ManyToOne(fetch = FetchType.EAGER)
    @Fetch(FetchMode.JOIN)
    @JoinColumn(name = "etapa_fenologica_id")
    private EtapaFenologica etapaFenologica;

    @Column(nullable = false)
    private BigDecimal cantidad;

    @ManyToOne(fetch = FetchType.EAGER)
    @Fetch(FetchMode.JOIN)
    @JoinColumn(name = "plaga_id")
    private Plaga plaga;

    @Column(nullable = false, length = 20)
    private String estado = "REGISTRADO";

    @Column(name = "stock_disponible")
    private BigDecimal stockDisponible;

    @Column(name = "fecha_liberacion")
    private Instant fechaLiberacion;

    @Column(name = "hora_liberacion", length = 10)
    private String horaLiberacion;

    @Column(columnDefinition = "text")
    private String observaciones;

    @Column(name = "papel_con_postura")
    private BigDecimal papelConPostura;

    @Column(name = "sobre_con_cascarilla")
    private BigDecimal sobreConCascarilla;

    @Column(name = "creado_por")
    private Long creadoPor;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Fundo getFundo() { return fundo; }
    public void setFundo(Fundo fundo) { this.fundo = fundo; }

    public Lote getLote() { return lote; }
    public void setLote(Lote lote) { this.lote = lote; }

    public Especie getEspecie() { return especie; }
    public void setEspecie(Especie especie) { this.especie = especie; }

    public EtapaFenologica getEtapaFenologica() { return etapaFenologica; }
    public void setEtapaFenologica(EtapaFenologica etapaFenologica) { this.etapaFenologica = etapaFenologica; }

    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }

    public Plaga getPlaga() { return plaga; }
    public void setPlaga(Plaga plaga) { this.plaga = plaga; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(BigDecimal stockDisponible) { this.stockDisponible = stockDisponible; }

    public Instant getFechaLiberacion() { return fechaLiberacion; }
    public void setFechaLiberacion(Instant fechaLiberacion) { this.fechaLiberacion = fechaLiberacion; }

    public String getHoraLiberacion() { return horaLiberacion; }
    public void setHoraLiberacion(String horaLiberacion) { this.horaLiberacion = horaLiberacion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public BigDecimal getPapelConPostura() { return papelConPostura; }
    public void setPapelConPostura(BigDecimal papelConPostura) { this.papelConPostura = papelConPostura; }

    public BigDecimal getSobreConCascarilla() { return sobreConCascarilla; }
    public void setSobreConCascarilla(BigDecimal sobreConCascarilla) { this.sobreConCascarilla = sobreConCascarilla; }

    public Long getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Long creadoPor) { this.creadoPor = creadoPor; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
