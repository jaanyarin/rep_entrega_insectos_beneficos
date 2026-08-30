package pe.sistema.insectosbeneficos.sync;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pe.sistema.insectosbeneficos.catalogos.*;
import pe.sistema.insectosbeneficos.programacion.Especie;
import pe.sistema.insectosbeneficos.programacion.EspecieRepository;
import pe.sistema.insectosbeneficos.requerimientos.Requerimiento;
import pe.sistema.insectosbeneficos.requerimientos.RequerimientoMapper;
import pe.sistema.insectosbeneficos.requerimientos.RequerimientoRepository;
import pe.sistema.insectosbeneficos.requerimientos.dto.RequerimientoDto;
import pe.sistema.insectosbeneficos.sync.dto.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Servicio de sync offline (HITO-013).
 * Patrón server-wins: el servidor es la fuente de verdad.
 */
@ApplicationScoped
public class SyncService {

    @Inject
    RequerimientoRepository requerimientoRepository;

    @Inject
    RequerimientoMapper requerimientoMapper;

    @Inject
    SyncLogRepository syncLogRepository;

    @Inject
    FundoRepository fundoRepository;

    @Inject
    LoteRepository loteRepository;

    @Inject
    EspecieRepository especieRepository;

    @Inject
    EtapaFenologicaRepository etapaFenologicaRepository;

    @Inject
    PlagaRepository plagaRepository;

    // ─── PUSH ────────────────────────────────────────────────────────────────

    @Transactional
    public SyncPushResponse push(List<SyncOperation> operaciones, String deviceId) {
        List<SyncResult> resultados = new ArrayList<>();

        for (SyncOperation op : operaciones) {
            try {
                SyncResult result = procesarOperacion(op, deviceId);
                resultados.add(result);
            } catch (Exception e) {
                SyncResult error = new SyncResult(op.getLocalId(), null, "ERROR");
                resultados.add(error);

                SyncLog log = new SyncLog();
                log.setOperation("PUSH");
                log.setTableName(op.getTableName());
                log.setRecordId(op.getServerId() != null ? op.getServerId() : 0L);
                log.setDeviceId(deviceId);
                log.setLocalId(op.getLocalId());
                log.setStatus("ERROR");
                log.setDetails(e.getMessage());
                syncLogRepository.persist(log);
            }
        }

        return new SyncPushResponse(resultados, Instant.now());
    }

    private SyncResult procesarOperacion(SyncOperation op, String deviceId) {
        if (!"requerimientos".equals(op.getTableName())) {
            return new SyncResult(op.getLocalId(), null, "ERROR");
        }

        Map<String, Object> payload = op.getPayload();

        if ("INSERT".equals(op.getOperation())) {
            return crearRequerimiento(payload, op.getLocalId(), deviceId);
        } else if ("UPDATE".equals(op.getOperation())) {
            return actualizarRequerimiento(op.getServerId(), payload, op.getLocalId(), deviceId);
        }

        return new SyncResult(op.getLocalId(), null, "ERROR");
    }

    private SyncResult crearRequerimiento(Map<String, Object> payload, Long localId, String deviceId) {
        Requerimiento r = new Requerimiento();
        r.setFecha(java.time.LocalDate.parse((String) payload.get("fecha")));
        r.setFundo(fundoRepository.findById(((Number) payload.get("fundoId")).longValue()));
        r.setLote(loteRepository.findById(((Number) payload.get("loteId")).longValue()));
        r.setEspecie(especieRepository.findById(((Number) payload.get("especieId")).longValue()));

        if (payload.get("etapaFenologicaId") != null) {
            r.setEtapaFenologica(etapaFenologicaRepository.findById(((Number) payload.get("etapaFenologicaId")).longValue()));
        }
        if (payload.get("plagaId") != null) {
            r.setPlaga(plagaRepository.findById(((Number) payload.get("plagaId")).longValue()));
        }

        r.setCantidad(BigDecimal.valueOf(((Number) payload.get("cantidad")).doubleValue()));
        r.setEstado("REGISTRADO");
        r.setObservaciones((String) payload.get("observaciones"));

        if (payload.get("creadoPor") != null) {
            r.setCreadoPor(((Number) payload.get("creadoPor")).longValue());
        }

        r.setCreatedAt(Instant.now());
        r.setUpdatedAt(Instant.now());
        requerimientoRepository.persist(r);

        // Log
        SyncLog log = new SyncLog();
        log.setOperation("PUSH");
        log.setTableName("requerimientos");
        log.setRecordId(r.getId());
        log.setDeviceId(deviceId);
        log.setLocalId(localId);
        log.setStatus("SUCCESS");
        log.setDetails("{\"dbOperation\":\"INSERT\"}");
        syncLogRepository.persist(log);

        return new SyncResult(localId, r.getId(), "CREATED");
    }

    private SyncResult actualizarRequerimiento(Long serverId, Map<String, Object> payload, Long localId, String deviceId) {
        Requerimiento r = requerimientoRepository.findByIdOptional(serverId).orElse(null);
        if (r == null) {
            return new SyncResult(localId, serverId, "NOT_FOUND");
        }

        r.setFecha(java.time.LocalDate.parse((String) payload.get("fecha")));
        r.setFundo(fundoRepository.findById(((Number) payload.get("fundoId")).longValue()));
        r.setLote(loteRepository.findById(((Number) payload.get("loteId")).longValue()));
        r.setEspecie(especieRepository.findById(((Number) payload.get("especieId")).longValue()));

        if (payload.get("etapaFenologicaId") != null) {
            r.setEtapaFenologica(etapaFenologicaRepository.findById(((Number) payload.get("etapaFenologicaId")).longValue()));
        } else {
            r.setEtapaFenologica(null);
        }
        if (payload.get("plagaId") != null) {
            r.setPlaga(plagaRepository.findById(((Number) payload.get("plagaId")).longValue()));
        } else {
            r.setPlaga(null);
        }

        r.setCantidad(BigDecimal.valueOf(((Number) payload.get("cantidad")).doubleValue()));
        if (payload.get("estado") != null) {
            r.setEstado((String) payload.get("estado"));
        }
        if (payload.get("observaciones") != null) {
            r.setObservaciones((String) payload.get("observaciones"));
        }
        r.setUpdatedAt(Instant.now());

        // Log
        SyncLog log = new SyncLog();
        log.setOperation("PUSH");
        log.setTableName("requerimientos");
        log.setRecordId(serverId);
        log.setDeviceId(deviceId);
        log.setLocalId(localId);
        log.setStatus("SUCCESS");
        log.setDetails("{\"dbOperation\":\"UPDATE\"}");
        syncLogRepository.persist(log);

        return new SyncResult(localId, serverId, "UPDATED");
    }

    // ─── PULL ────────────────────────────────────────────────────────────────

    public List<RequerimientoDto> pull(Instant since) {
        List<Requerimiento> requerimientos;

        if (since != null) {
            requerimientos = requerimientoRepository.list("updatedAt >= ?1 order by updatedAt asc", since);
        } else {
            // Sin filtro: últimos 100
            requerimientos = requerimientoRepository.list("order by updatedAt desc");
            if (requerimientos.size() > 100) {
                requerimientos = requerimientos.subList(0, 100);
            }
        }

        List<RequerimientoDto> result = new ArrayList<>();
        for (Requerimiento r : requerimientos) {
            result.add(requerimientoMapper.toDto(r));
        }
        return result;
    }

    // ─── STATUS ──────────────────────────────────────────────────────────────

    public long countRequerimientos() {
        return requerimientoRepository.count();
    }

    public Instant getLastSyncTime() {
        SyncLog last = syncLogRepository.find("order by createdAt desc").firstResult();
        return last != null ? last.getCreatedAt() : null;
    }
}
