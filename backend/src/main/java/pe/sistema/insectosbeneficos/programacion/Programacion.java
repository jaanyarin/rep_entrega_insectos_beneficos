package pe.sistema.insectosbeneficos.programacion;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "programaciones")
public class Programacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer anio;

    @Column(nullable = false)
    private Integer mes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especie_id", nullable = false)
    private Especie especie;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private ZonedDateTime fechaRegistro = ZonedDateTime.now();

    @Column(name = "fecha_publicacion")
    private ZonedDateTime fechaPublicacion;

    @Column(nullable = false, length = 20)
    private String estado = "EN_PROCESO";

    @Column(name = "stock_inicial_base", nullable = false)
    private Integer stockInicialBase = 5000;

    @OneToMany(mappedBy = "programacion", cascade = CascadeType.ALL, orphanRemoval = true)
    // Orden cronológico por fecha (cada fila = un Lunes/Jueves real del mes). La semana ya
    // no es única (HITO-012); el orden efectivo lo imponen Service/Mapper por `fecha`.
    @OrderBy("fecha ASC")
    private List<DetalleProgramacion> detalles = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }

    public Especie getEspecie() { return especie; }
    public void setEspecie(Especie especie) { this.especie = especie; }

    public ZonedDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(ZonedDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public ZonedDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(ZonedDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getStockInicialBase() { return stockInicialBase; }
    public void setStockInicialBase(Integer stockInicialBase) { this.stockInicialBase = stockInicialBase; }

    public List<DetalleProgramacion> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleProgramacion> detalles) { this.detalles = detalles; }
}
