package pe.sistema.insectosbeneficos.sync.dto;

/**
 * Resultado de una operación individual en el batch push.
 */
public class SyncResult {

    private Long localId;
    private Long serverId;
    private String status; // CREATED | UPDATED | NOT_FOUND | ERROR

    public SyncResult() {}

    public SyncResult(Long localId, Long serverId, String status) {
        this.localId = localId;
        this.serverId = serverId;
        this.status = status;
    }

    public Long getLocalId() { return localId; }
    public void setLocalId(Long localId) { this.localId = localId; }
    public Long getServerId() { return serverId; }
    public void setServerId(Long serverId) { this.serverId = serverId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
