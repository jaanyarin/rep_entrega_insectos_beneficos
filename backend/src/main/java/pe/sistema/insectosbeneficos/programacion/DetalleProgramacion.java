package pe.sistema.insectosbeneficos.programacion;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "detalle_programaciones")
public class DetalleProgramacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programacion_id", nullable = false)
    private Programacion programacion;

    @Column(nullable = false)
    private Integer semana;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "stock_inicial", nullable = false)
    private Integer stockInicial = 0;

    @Column(name = "papel_con_postura", nullable = false)
    private Integer papelConPostura = 0;

    @Column(name = "sobre_con_cascarilla", nullable = false)
    private Integer sobreConCascarilla = 0;

    @Column(nullable = false)
    private Integer total = 0;

    @Column(name = "stock_final", nullable = false)
    private Integer stockFinal = 0;

    @Column(nullable = false, length = 20)
    private String estado = "EN_PROCESO";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Programacion getProgramacion() { return programacion; }
    public void setProgramacion(Programacion programacion) { this.programacion = programacion; }

    public Integer getSemana() { return semana; }
    public void setSemana(Integer semana) { this.semana = semana; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Integer getStockInicial() { return stockInicial; }
    public void setStockInicial(Integer stockInicial) { this.stockInicial = stockInicial; }

    public Integer getPapelConPostura() { return papelConPostura; }
    public void setPapelConPostura(Integer papelConPostura) { this.papelConPostura = papelConPostura; }

    public Integer getSobreConCascarilla() { return sobreConCascarilla; }
    public void setSobreConCascarilla(Integer sobreConCascarilla) { this.sobreConCascarilla = sobreConCascarilla; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public Integer getStockFinal() { return stockFinal; }
    public void setStockFinal(Integer stockFinal) { this.stockFinal = stockFinal; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
