package pe.sistema.insectosbeneficos.programacion.dto;

import java.time.ZonedDateTime;
import java.util.List;

public class ProgramacionDto {
    private Long id;
    private Integer anio;
    private Integer mes;
    private Long especieId;
    private String especie;
    private String especieNombre;
    private ZonedDateTime fechaRegistro;
    private ZonedDateTime fechaPublicacion;
    private String estado;
    private Integer stockInicialBase;
    private Integer totalMes;
    private List<DetalleProgramacionDto> detalles;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    public Long getEspecieId() { return especieId; }
    public void setEspecieId(Long especieId) { this.especieId = especieId; }
    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }
    public String getEspecieNombre() { return especieNombre; }
    public void setEspecieNombre(String especieNombre) { this.especieNombre = especieNombre; }
    public ZonedDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(ZonedDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public ZonedDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(ZonedDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Integer getStockInicialBase() { return stockInicialBase; }
    public void setStockInicialBase(Integer stockInicialBase) { this.stockInicialBase = stockInicialBase; }
    public Integer getTotalMes() { return totalMes; }
    public void setTotalMes(Integer totalMes) { this.totalMes = totalMes; }
    public List<DetalleProgramacionDto> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleProgramacionDto> detalles) { this.detalles = detalles; }
}
