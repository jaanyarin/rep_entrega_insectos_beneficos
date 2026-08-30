package pe.sistema.insectosbeneficos.sync.dto;

import java.util.List;

/**
 * Body de POST /api/v1/sync/push (batch push del mobile offline).
 */
public class SyncPushRequest {

    private String deviceId;
    private List<SyncOperation> operaciones;

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public List<SyncOperation> getOperaciones() { return operaciones; }
    public void setOperaciones(List<SyncOperation> operaciones) { this.operaciones = operaciones; }
}
