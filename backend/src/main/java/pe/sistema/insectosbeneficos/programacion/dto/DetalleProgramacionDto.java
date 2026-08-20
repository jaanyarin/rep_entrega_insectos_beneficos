package pe.sistema.insectosbeneficos.programacion.dto;

import java.time.LocalDate;

public class DetalleProgramacionDto {
    private Long id;
    private Integer semana;
    private LocalDate fecha;
    private Integer stockInicial;
    private Integer papelConPostura;
    private Integer sobreConCascarilla;
    private Integer total;
    private Integer stockFinal;
    private String estado;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
