package pe.sistema.insectosbeneficos.seguridad;

/**
 * Cuerpo JSON estandar de error: {codigo, mensaje}.
 */
public class ApiError {

    public String codigo;
    public String mensaje;

    public ApiError(String codigo, String mensaje) {
        this.codigo = codigo;
        this.mensaje = mensaje;
    }
}