package pe.sistema.insectosbeneficos.sync.dto;

import java.time.Instant;
import java.util.List;

/**
 * Response de POST /api/v1/sync/push.
 */
public class SyncPushResponse {

    private List<SyncResult> resultados;
    private Instant timestamp;

    public SyncPushResponse(List<SyncResult> resultados, Instant timestamp) {
        this.resultados = resultados;
        this.timestamp = timestamp;
    }

    public List<SyncResult> getResultados() { return resultados; }
    public Instant getTimestamp() { return timestamp; }
}
