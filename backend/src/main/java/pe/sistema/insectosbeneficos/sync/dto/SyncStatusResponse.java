package pe.sistema.insectosbeneficos.sync.dto;

import java.time.Instant;

/**
 * Response de GET /api/v1/sync/status.
 */
public class SyncStatusResponse {

    private Instant serverTime;
    private long requerimientosCount;
    private Instant lastSync;

    public SyncStatusResponse(Instant serverTime, long requerimientosCount, Instant lastSync) {
        this.serverTime = serverTime;
        this.requerimientosCount = requerimientosCount;
        this.lastSync = lastSync;
    }

    public Instant getServerTime() { return serverTime; }
    public long getRequerimientosCount() { return requerimientosCount; }
    public Instant getLastSync() { return lastSync; }
}
