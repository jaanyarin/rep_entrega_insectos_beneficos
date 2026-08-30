package pe.sistema.insectosbeneficos.sync.dto;

import java.util.Map;

/**
 * Una operación individual dentro de un batch push.
 */
public class SyncOperation {

    private String operation; // INSERT | UPDATE
    private String tableName; // requerimientos
    private Long localId;     // ID temporal negativo del mobile
    private Long serverId;    // Solo para UPDATE
    private Map<String, Object> payload; // Datos del registro

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }
    public Long getLocalId() { return localId; }
    public void setLocalId(Long localId) { this.localId = localId; }
    public Long getServerId() { return serverId; }
    public void setServerId(Long serverId) { this.serverId = serverId; }
    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }
}
