package pe.sistema.insectosbeneficos.seguridad;

import jakarta.ws.rs.core.Response;

/**
 * Excepcion de negocio/API con status HTTP + codigo maquina + mensaje en espanol.
 * Se convierte en JSON {codigo, mensaje} por ManejadorErrores.
 */
public class ApiException extends RuntimeException {

    private final Response.Status status;
    private final String codigo;

    public ApiException(Response.Status status, String codigo, String mensaje) {
        super(mensaje);
        this.status = status;
        this.codigo = codigo;
    }

    public Response.Status getStatus() {
        return status;
    }

    public String getCodigo() {
        return codigo;
    }
}