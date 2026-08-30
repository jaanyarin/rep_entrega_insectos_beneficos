package pe.sistema.insectosbeneficos.sync;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import pe.sistema.insectosbeneficos.requerimientos.dto.RequerimientoDto;
import pe.sistema.insectosbeneficos.sync.dto.*;

import java.time.Instant;
import java.util.List;

/**
 * Endpoints batch de sincronización offline (HITO-013).
 * Patrón server-wins: el servidor es la fuente de verdad.
 *
 * Contrato:
 *   POST /api/v1/sync/push   — Push de cambios locales (batch)
 *   POST /api/v1/sync/pull   — Pull de datos del servidor
 *   GET  /api/v1/sync/status  — Estado de sync
 */
@Path("/api/v1/sync")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"Super Admin", "Admin", "Usuario"})
public class SyncResource {

    @Inject
    SyncService syncService;

    /**
     * Push batch de cambios locales al servidor.
     * Cada operación puede ser INSERT o UPDATE.
     * Server-wins: si hay conflicto, el servidor sobreescribe.
     */
    @POST
    @Path("/push")
    public SyncPushResponse push(@Valid SyncPushRequest request) {
        return syncService.push(
            request.getOperaciones() != null ? request.getOperaciones() : List.of(),
            request.getDeviceId()
        );
    }

    /**
     * Pull de datos del servidor desde un timestamp.
     * Retorna requerimientos modificados desde `since`.
     * Si `since` es null, retorna los últimos 100 registros.
     */
    @POST
    @Path("/pull")
    public SyncPullResponse pull(@Valid SyncPullRequest request) {
        List<RequerimientoDto> requerimientos = syncService.pull(request.getSince());
        return new SyncPullResponse(requerimientos, Instant.now());
    }

    /**
     * Estado de sincronización del servidor.
     */
    @GET
    @Path("/status")
    public SyncStatusResponse status() {
        return new SyncStatusResponse(
            Instant.now(),
            syncService.countRequerimientos(),
            syncService.getLastSyncTime()
        );
    }
}
