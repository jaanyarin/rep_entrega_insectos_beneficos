/**
 * HistorialRequerimientoScreen — Screen 12: Historial de Requerimientos
 * (MOD-18 / RF-179..181). Acceso: user sanidad.
 *
 * Estructura:
 *  1. Filtro de rango de fechas (desde-hasta).
 *  2. Galería vertical: fecha, especie y estado con color; botón Ver (popup
 *     detalle) y botón Editar (→ Screen 13).
 */

import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import DateTimePickerField from '../components/DateTimePickerField';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import RequerimientoStatusChip from '../components/RequerimientoStatusChip';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/types';
import {
  extractErrorMessage,
  type FotoRequerimientoDto,
  type RequerimientoDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {formatFecha} from '../utils/programacion';
import {
  esRangoValido,
} from '../utils/requerimientos';
import {requerimientosRepo, photosRepo, catalogosRepo} from '../db/repositories';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';
import SyncIndicator from '../components/SyncIndicator';
import {onSyncCallbacks} from '../db/sync/SyncManager';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function VerModal({
  req,
  onClose,
  requerimientoLocalId,
}: {
  req: RequerimientoDto | null;
  onClose: () => void;
  requerimientoLocalId?: number;
}) {
  const [fotosModal, setFotosModal] = useState<FotoRequerimientoDto[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!req) {
      setFotosModal([]);
      return;
    }
    let activo = true;
    (async () => {
      setLoadingFotos(true);
      try {
        // SQLite-first: buscar fotos locales
        if (requerimientoLocalId) {
          const fotosLocales = await photosRepo.listByRequerimiento(requerimientoLocalId);
          if (activo) {
            const fotosDto: FotoRequerimientoDto[] = fotosLocales.map(f => ({
              id: f.serverFotoId ?? f.id,
              ruta: f.serverUrl ?? f.uri,
              requerimientoId: req.id,
              nombreArchivo: f.fileName,
              tamanoBytes: f.fileSize ?? 0,
              contentType: f.contentType ?? 'image/jpeg',
              metadatos: f.metadatos,
              creadoEn: f.createdAt?.toISOString() ?? '',
            }));
            setFotosModal(fotosDto);
          }
        } else if (isOnline) {
          // Fallback: fotos del servidor
          try {
            const {listarFotosRequerimiento} = await import('../services/ApiClient');
            const fotos = await listarFotosRequerimiento(req.id);
            if (activo) { setFotosModal(fotos); }
          } catch {
            if (activo) { setFotosModal([]); }
          }
        }
      } catch {
        if (activo) { setFotosModal([]); }
      } finally {
        if (activo) { setLoadingFotos(false); }
      }
    })();
    return () => {
      activo = false;
    };
  }, [req, requerimientoLocalId, isOnline]);

  if (!req) {
    return null;
  }
  const filas: Array<[string, string]> = [
    ['Fecha', formatFecha(req.fecha)],
    ['Fundo', req.fundo],
    ['Lote', req.lote],
    ['Especie', req.especie],
    ['Cantidad', `${req.cantidad} millares`],
    ['Plaga objetivo', req.plaga ?? '—'],
    ['Fecha de liberación', formatFecha(req.fechaLiberacion)],
    ['Observaciones', req.observaciones ?? '—'],
  ];
  return (
    <Modal
      visible={req !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalle del requerimiento</Text>
            <RequerimientoStatusChip estado={req.estado} />
          </View>
          <ScrollView>
            {filas.map(([label, valor]) => (
              <View key={label} style={styles.verRow}>
                <Text style={styles.verLabel}>{label}</Text>
                <Text style={styles.verValue}>{valor}</Text>
              </View>
            ))}
            {loadingFotos ? (
              <LoadingState message="Cargando fotos…" />
            ) : fotosModal.length > 0 ? (
              <View style={styles.fotosSection}>
                <Text style={styles.fotosSectionTitle}>Evidencia fotográfica</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {fotosModal.map((foto, idx) => (
                    <View key={String(foto.id)} style={styles.fotoThumbnail}>
                      <Image source={{uri: foto.ruta}} style={styles.fotoImagen} />
                      <Text style={styles.fotoCaption}>Foto {idx + 1}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </ScrollView>
          <View style={styles.modalActions}>
            <View style={styles.modalAction}>
              <AppButton
                label="Cerrar"
                variant="secondary"
                onPress={onClose}
                accessibilityLabel="Cerrar detalle de requerimiento"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HistorialRequerimientoScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const isOnline = useOnlineStatus();

  const [desdeTexto, setDesdeTexto] = useState('');
  const [hastaTexto, setHastaTexto] = useState('');
  const [reqs, setReqs] = useState<RequerimientoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ver, setVer] = useState<RequerimientoDto | null>(null);
  const [verLocalId, setVerLocalId] = useState<number | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const cargar = useCallback(
    async (desdeISO: string | null, hastaISO: string | null) => {
      if (!user) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // SQLite-first: leer de SQLite
        const reqsLocales = await requerimientosRepo.listLocal({
          fechaDesde: desdeISO ?? undefined,
          fechaHasta: hastaISO ?? undefined,
          creadoPor: Number(user?.sub) || 0,
        });

        // Resolver IDs → nombres usando catálogos cache
        const [fundos, especies, plagas] = await Promise.all([
          catalogosRepo.getFundosLocal(),
          catalogosRepo.getEspeciesLocal(),
          catalogosRepo.getPlagasLocal(),
        ]);
        const fundoMap = new Map(fundos.map(f => [f.id, f.nombre]));
        const especieMap = new Map(especies.map(e => [e.id, e.nombre]));
        const plagaMap = new Map(plagas.map(p => [p.id, p.nombre]));

        const reqsDto: RequerimientoDto[] = reqsLocales.map(r => ({
          id: r.serverId ?? r.id,
          fecha: r.fecha,
          fundoId: r.fundoId,
          fundo: fundoMap.get(r.fundoId) ?? '',
          loteId: r.loteId,
          lote: '',
          especieId: r.especieId,
          especie: especieMap.get(r.especieId) ?? '',
          etapaFenologicaId: r.etapaFenologicaId,
          etapaFenologica: null,
          plagaId: r.plagaId,
          plaga: r.plagaId ? (plagaMap.get(r.plagaId) ?? '') : null,
          cantidad: r.cantidad,
          estado: r.estado as never,
          stockDisponible: r.stockDisponible ?? 0,
          observaciones: r.observaciones,
          papelConPostura: r.papelConPostura,
          sobreConCascarilla: r.sobreConCascarilla,
          fechaLiberacion: r.fechaLiberacion,
          horaLiberacion: r.horaLiberacion,
          creadoPor: r.creadoPor,
          createdAt: r.createdAt?.toISOString() ?? '',
          updatedAt: r.updatedAt?.toISOString() ?? '',
          // Guardar el localId para el modal de fotos
          _localId: r.id,
        } as RequerimientoDto & {_localId: number}));
        setReqs(reqsDto);
      } catch (e) {
        setError(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    cargar(null, null);
  }, [cargar]);

  // SyncIndicator: listen for sync events
  useEffect(() => {
    const unsubscribe = onSyncCallbacks({
      onSyncStart: () => setSyncing(true),
      onSyncComplete: res => {
        setSyncing(false);
        if (res.requerimientosSincronizados > 0 || res.fotosSubidas > 0) {
          setLastSyncTime(new Date());
          cargar(null, null);
        }
      },
      onSyncError: () => setSyncing(false),
    });
    return unsubscribe;
  }, [cargar]);

  // SyncIndicator: count pending
  useEffect(() => {
    requerimientosRepo.countPending().then(c => setPendingCount(c)).catch(() => {});
  }, [reqs]);

  const aplicarFiltro = () => {
    const desdeISO = desdeTexto || null;
    const hastaISO = hastaTexto || null;
    if (!esRangoValido(desdeISO, hastaISO)) {
      setError('Rango de fechas inválido. Use dd/mm/aaaa con desde ≤ hasta.');
      return;
    }
    cargar(desdeISO, hastaISO);
  };

  const limpiarFiltro = () => {
    setDesdeTexto('');
    setHastaTexto('');
    cargar(null, null);
  };

  const renderFiltro = (
    <View style={styles.filtro}>
      <DateTimePickerField
        label="Desde"
        value={desdeTexto}
        mode="date"
        onChange={setDesdeTexto}
        onClear={() => setDesdeTexto('')}
        accessibilityLabel="Desde"
      />
      <DateTimePickerField
        label="Hasta"
        value={hastaTexto}
        mode="date"
        onChange={setHastaTexto}
        onClear={() => setHastaTexto('')}
        accessibilityLabel="Hasta"
      />
      <View style={styles.filtroAcciones}>
        <View style={styles.filtroAction}>
          <AppButton
            label="Aplicar filtro"
            icon="filter-outline"
            onPress={aplicarFiltro}
            accessibilityLabel="Aplicar filtro"
          />
        </View>
        <View style={styles.filtroAction}>
          <AppButton
            label="Limpiar"
            variant="text"
            onPress={limpiarFiltro}
            accessibilityLabel="Limpiar filtro"
          />
        </View>
      </View>
    </View>
  );

  const renderContenido = () => {
    if (loading) {
      return <LoadingState message="Cargando historial…" />;
    }
    if (error) {
      return <ErrorState onRetry={() => cargar(null, null)} />;
    }
    if (reqs.length === 0) {
      return (
        <EmptyState
          title="Sin requerimientos en el rango"
          message="No hay requerimientos registrados para este periodo."
          icon="history"
        />
      );
    }
    return (
      <View style={styles.list}>
        {reqs.map(r => (
          <AppCard key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{r.especie}</Text>
                <Text style={styles.cardSub}>
                  {formatFecha(r.fecha)} · {r.fundo}
                </Text>
              </View>
              <RequerimientoStatusChip estado={r.estado} />
            </View>
            <View style={styles.cardActions}>
              <AppButton
                label="Ver"
                variant="text"
                icon="eye-outline"
                onPress={() => {
                  setVer(r);
                  setVerLocalId((r as any)._localId);
                }}
                accessibilityLabel={`Ver ${r.especie}`}
              />
              <AppButton
                label="Editar"
                variant="text"
                icon="pencil-outline"
                onPress={() =>
                  navigation.navigate('EditarRequerimiento', {id: r.id})
                }
                accessibilityLabel={`Editar ${r.especie}`}
              />
            </View>
          </AppCard>
        ))}
      </View>
    );
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el historial"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Historial de Requerimiento"
          showBack
          onBack={navigation.goBack}
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: 32 + insets.bottom},
          ]}>
          {!isOnline && <OfflineBanner />}
          <SyncIndicator syncing={syncing} pendingCount={pendingCount} lastSyncTime={lastSyncTime} />
          {renderFiltro}
          {renderContenido()}
        </ScrollView>
        <VerModal req={ver} onClose={() => { setVer(null); setVerLocalId(undefined); }} requerimientoLocalId={verLocalId} />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  filtro: {
    gap: theme.spacing[1],
  },
  filtroAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  filtroAction: {
    flex: 1,
  },
  list: {
    gap: theme.spacing[3],
  },
  card: {
    gap: theme.spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
  },
  cardTitle: {
    flex: 1,
  },
  cardTitleText: {
    fontFamily: theme.typography.subtitle1.fontFamily,
    fontSize: theme.typography.subtitle1.fontSize,
    lineHeight: theme.typography.subtitle1.lineHeight,
    color: theme.colors.text.primary,
  },
  cardSub: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing[2],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.background.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[6],
    ...theme.shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  modalTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
    flex: 1,
  },
  verRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  verLabel: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    color: theme.colors.text.secondary,
  },
  verValue: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
  },
  modalAction: {
    flex: 1,
  },
  fotosSection: {
    marginTop: theme.spacing[3],
  },
  fotosSectionTitle: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  fotoThumbnail: {
    width: 104,
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  fotoImagen: {
    width: 96,
    height: 72,
    borderRadius: theme.radius.sm,
  },
  fotoCaption: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
});
