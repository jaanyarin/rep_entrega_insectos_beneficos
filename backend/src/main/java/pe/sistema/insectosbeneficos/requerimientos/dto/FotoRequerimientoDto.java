package pe.sistema.insectosbeneficos.requerimientos.dto;

import java.time.Instant;

/**
 * DTO de respuesta de una foto adjunta a un requerimiento (HITO-010).
 * Los campos respetan el contrato del cliente mobile:
 * id, requerimientoId, ruta, nombreArchivo, tamanoBytes, contentType,
 * metadatos, creadoEn.
 */
public class FotoRequerimientoDto {

    private Long id;
    private Long requerimientoId;
    private String ruta;
    private String nombreArchivo;
    private Long tamanoBytes;
    private String contentType;
    private String metadatos;
    private Instant creadoEn;

    // ------------------------------------------------------------------
    // Getters / Setters
    // ------------------------------------------------------------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequerimientoId() { return requerimientoId; }
    public void setRequerimientoId(Long requerimientoId) { this.requerimientoId = requerimientoId; }

    public String getRuta() { return ruta; }
    public void setRuta(String ruta) { this.ruta = ruta; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public Long getTamanoBytes() { return tamanoBytes; }
    public void setTamanoBytes(Long tamanoBytes) { this.tamanoBytes = tamanoBytes; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getMetadatos() { return metadatos; }
    public void setMetadatos(String metadatos) { this.metadatos = metadatos; }

    public Instant getCreadoEn() { return creadoEn; }
    public void setCreadoEn(Instant creadoEn) { this.creadoEn = creadoEn; }
}
