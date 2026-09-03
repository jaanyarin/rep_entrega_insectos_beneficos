package pe.sistema.insectosbeneficos.programacion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class GuardarCumplimientoRequest {

    @NotNull(message = "El ID del detalle de programación es obligatorio")
    private Long programacionDetalleId;

    @NotNull(message = "La semana es obligatoria")
    private Integer semana;

    @NotNull(message = "La fecha es obligatoria")
    private String fecha;

    @NotNull(message = "El papel real es obligatorio")
    @Min(value = 0, message = "El papel real no puede ser negativo")
    private Integer papelReal;

    @NotNull(message = "El sobre real es obligatorio")
    @Min(value = 0, message = "El sobre real no puede ser negativo")
    private Integer sobreReal;

    public Long getProgramacionDetalleId() { return programacionDetalleId; }
    public void setProgramacionDetalleId(Long programacionDetalleId) { this.programacionDetalleId = programacionDetalleId; }

    public Integer getSemana() { return semana; }
    public void setSemana(Integer semana) { this.semana = semana; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public Integer getPapelReal() { return papelReal; }
    public void setPapelReal(Integer papelReal) { this.papelReal = papelReal; }

    public Integer getSobreReal() { return sobreReal; }
    public void setSobreReal(Integer sobreReal) { this.sobreReal = sobreReal; }
}
