package pe.sistema.insectosbeneficos.programacion.dto;

import java.util.List;

public class UpdateProgramacionRequest {
    private Integer stockInicialBase;
    private List<UpdateDetalleRequest> detalles;

    public Integer getStockInicialBase() { return stockInicialBase; }
    public void setStockInicialBase(Integer stockInicialBase) { this.stockInicialBase = stockInicialBase; }
    public List<UpdateDetalleRequest> getDetalles() { return detalles; }
    public void setDetalles(List<UpdateDetalleRequest> detalles) { this.detalles = detalles; }

    public static class UpdateDetalleRequest {
        private Long id;
        private Integer papelConPostura;
        private Integer sobreConCascarilla;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Integer getPapelConPostura() { return papelConPostura; }
        public void setPapelConPostura(Integer papelConPostura) { this.papelConPostura = papelConPostura; }
        public Integer getSobreConCascarilla() { return sobreConCascarilla; }
        public void setSobreConCascarilla(Integer sobreConCascarilla) { this.sobreConCascarilla = sobreConCascarilla; }
    }
}
