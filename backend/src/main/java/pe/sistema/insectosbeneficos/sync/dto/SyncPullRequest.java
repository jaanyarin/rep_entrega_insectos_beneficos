package pe.sistema.insectosbeneficos.sync.dto;

import java.time.Instant;

/**
 * Body de POST /api/v1/sync/pull.
 */
public class SyncPullRequest {

    private String deviceId;
    private Instant since;

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public Instant getSince() { return since; }
    public void setSince(Instant since) { this.since = since; }
}
