package pe.sistema.insectosbeneficos.sync.dto;

import pe.sistema.insectosbeneficos.requerimientos.dto.RequerimientoDto;

import java.time.Instant;
import java.util.List;

/**
 * Response de POST /api/v1/sync/pull.
 */
public class SyncPullResponse {

    private List<RequerimientoDto> requerimientos;
    private Instant timestamp;

    public SyncPullResponse(List<RequerimientoDto> requerimientos, Instant timestamp) {
        this.requerimientos = requerimientos;
        this.timestamp = timestamp;
    }

    public List<RequerimientoDto> getRequerimientos() { return requerimientos; }
    public Instant getTimestamp() { return timestamp; }
}
