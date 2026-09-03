package pe.sistema.insectosbeneficos.recepciones.dto;

/**
 * Request para confirmar una recepción (HITO-015 / RF-072..075).
 * conforme=true → recepción conforme; conforme=false → con observaciones.
 */
public class ConfirmarRecepcionRequest {

    private Boolean conforme = true;
    private String observaciones;

    public Boolean getConforme() { return conforme; }
    public void setConforme(Boolean conforme) { this.conforme = conforme; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
