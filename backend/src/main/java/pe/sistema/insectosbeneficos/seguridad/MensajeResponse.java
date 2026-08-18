package pe.sistema.insectosbeneficos.seguridad;

/**
 * Respuesta minima {mensaje} para acciones sin DTO propio.
 */
public class MensajeResponse {

    public String mensaje;

    public MensajeResponse() {
    }

    public MensajeResponse(String mensaje) {
        this.mensaje = mensaje;
    }
}