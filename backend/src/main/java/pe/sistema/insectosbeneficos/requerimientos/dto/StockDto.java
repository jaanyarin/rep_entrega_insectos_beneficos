package pe.sistema.insectosbeneficos.requerimientos.dto;

import java.math.BigDecimal;

/**
 * Respuesta de GET /api/v1/programaciones/{especieId}/stock (Screen 10).
 * Shape del contrato mobile: {@code { stock: number }}.
 */
public class StockDto {

    private BigDecimal stock;

    public StockDto() {
    }

    public StockDto(BigDecimal stock) {
        this.stock = stock;
    }

    public BigDecimal getStock() { return stock; }
    public void setStock(BigDecimal stock) { this.stock = stock; }
}
