/**
 * ProgramacionScreen — Screen 4: Listado de Programaciones por Mes (MOD-17).
 *
 * Flujo documentado (01_especificacion.md RF-138..140 / transcripcion.md):
 *  1. Selector de periodo (mes/año) navegable con flechas ‹ ›.
 *  2. Galería vertical de registros: fecha de registro, mes al que pertenece,
 *     cantidad total del mes (suma de todas las semanas), estado y especie;
 *     acciones Ver (modal de solo lectura) y Editar (navega a Screen 5).
 *
 * Preview ajustado a móvil respecto al wireframe: el "selector de rango de
 * fechas" del RF-138 se materializa como selectores de mes + año (dato de
 * agrupación real del dominio), navegables con chevrons. La carga se realiza
 * vía listarProgramaciones(anio, mes).
 *
 * Acceso: solo Admin / Super Admin (el menú de Home ya lo restringe).
 */

import React, {useCallback, useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
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
import AppIconButton from '../components/AppIconButton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusChip from '../components/StatusChip';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/types';
import {
  extractErrorMessage,
  listarProgramaciones,
  type ProgramacionDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {isAdminOrSuperAdmin} from '../utils/roles';
import {
  anioActual,
  esDiaEditable,
  etiquetaPeriodo,
  formatFecha,
  mesActual,
} from '../utils/programacion';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Chip de estado de la programación: pendiente mientras se edita, aprobado al publicar. */
function chipEstado(estado: ProgramacionDto['estado']) {
  return estado === 'PUBLICADO'
    ? {tone: 'approved' as const, label: 'Publicado'}
    : {tone: 'pending' as const, label: 'En proceso'};
}

/** Mueve el periodo un mes (dir = ±1) respetando bordes de año/mes. */
function sumarMes(mes: number, anio: number, delta: number): {mes: number; anio: number} {
  const total = mes - 1 + delta;
  const nuevoAnio = anio + Math.floor(total / 12);
  const nuevoMes = ((total % 12) + 12) % 12 + 1;
  return {mes: nuevoMes, anio: nuevoAnio};
}

/** Modal "Ver" (RF-140): solo lectura con las semanas programadas del mes. */
function VerModal({
  programacion,
  onClose,
}: {
  programacion: ProgramacionDto | null;
  onClose: () => void;
}) {
  if (!programacion) {
    return null;
  }
  const chip = chipEstado(programacion.estado);
  return (
    <Modal
      visible={programacion !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            Programación del mes {etiquetaPeriodo(programacion.mes, programacion.anio)}
          </Text>
          <Text style={styles.modalSubtitle}>
            {programacion.especie} · {chip.label} · Total del mes:{' '}
            {programacion.totalMes} millares
          </Text>
          <ScrollView>
            {(programacion.detalles ?? []).map(d => (
              <View key={d.id ?? d.semana} style={styles.verRow}>
                <View style={styles.verCol}>
                  <Text style={styles.verCell}>
                    Semana {d.semana} · {formatFecha(d.fecha)}
                  </Text>
                  <Text style={styles.verSub}>
                    Papel: {d.papelConPostura} · Sobre: {d.sobreConCascarilla}{' '}
                    · Total: {d.total}
                  </Text>
                </View>
                <StatusChip
                  tone={d.estado === 'PUBLICADO' ? 'approved' : 'pending'}
                  label={d.estado === 'PUBLICADO' ? 'Publicado' : 'En proceso'}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalActions}>
            <View style={styles.modalAction}>
              <AppButton
                label="Cerrar"
                variant="secondary"
                onPress={onClose}
                accessibilityLabel="Cerrar detalle de programación"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function ProgramacionScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const puedeGestionar = isAdminOrSuperAdmin(user);

  const [mes, setMes] = useState(mesActual());
  const [anio, setAnio] = useState(anioActual());
  const [programaciones, setProgramaciones] = useState<ProgramacionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ver, setVer] = useState<ProgramacionDto | null>(null);

  /** Carga compartida: en refresco mantiene la lista visible (spinner pull-to-refresh). */
  const fetchProgramaciones = useCallback(
    async (esRefresco: boolean) => {
      if (!puedeGestionar) {
        return;
      }
      if (esRefresco) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const lista = await listarProgramaciones(anio, mes);
        setProgramaciones(lista);
      } catch (e) {
        setError(extractErrorMessage(e));
      } finally {
        if (esRefresco) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [puedeGestionar, anio, mes],
  );

  const loadData = useCallback(
    () => fetchProgramaciones(false),
    [fetchProgramaciones],
  );

  const onRefresh = useCallback(
    () => fetchProgramaciones(true),
    [fetchProgramaciones],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) {
    return null;
  }

  const moverMes = (delta: number) => {
    const next = sumarMes(mes, anio, delta);
    setMes(next.mes);
    setAnio(next.anio);
  };

  const renderPeriodo = (
    <View style={styles.periodRow}>
      <AppIconButton
        name="chevron-left"
        accessibilityLabel="Mes anterior"
        onPress={() => moverMes(-1)}
      />
      <Text style={styles.periodLabel}>{etiquetaPeriodo(mes, anio)}</Text>
      <AppIconButton
        name="chevron-right"
        accessibilityLabel="Mes siguiente"
        onPress={() => moverMes(1)}
      />
    </View>
  );

  const renderBotonNuevo = puedeGestionar ? (
    <AppButton
      label="Nuevo"
      icon="plus"
      onPress={() =>
        navigation.navigate('ProgramacionEdicion', {
          modo: 'crear',
          anio,
          mes,
        })
      }
      accessibilityLabel="Crear nueva programación"
    />
  ) : null;

  const renderContenido = () => {
    if (loading) {
      return <LoadingState message="Cargando programaciones…" />;
    }
    if (error) {
      return <ErrorState onRetry={loadData} />;
    }
    if (programaciones.length === 0) {
      return (
        <EmptyState
          title="Sin programaciones en este mes"
          message="Todavía no hay programaciones registradas para este periodo."
          icon="calendar-blank-outline"
        />
      );
    }
    return (
      <View style={styles.list}>
        {programaciones.map(p => {
          const chip = chipEstado(p.estado);
          return (
            <AppCard key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{p.especie}</Text>
                  <Text style={styles.cardSub}>
                    {etiquetaPeriodo(p.mes, p.anio)} · {formatFecha(p.fechaRegistro)}
                  </Text>
                </View>
                <StatusChip tone={chip.tone} label={chip.label} />
              </View>
              <Text style={styles.totalMes}>
                Total del mes: {String(p.totalMes)} millares
              </Text>
              {!esDiaEditable() ? (
                <Text style={styles.avisoEdicion}>
                  Edición disponible solo los lunes y jueves.
                </Text>
              ) : null}
              <View style={styles.cardActions}>
                <AppButton
                  label="Ver"
                  variant="text"
                  icon="eye-outline"
                  onPress={() => setVer(p)}
                  accessibilityLabel={`Ver ${p.especie}`}
                />
                <AppButton
                  label="Editar"
                  variant="text"
                  icon="pencil-outline"
                  onPress={() =>
                    navigation.navigate('ProgramacionEdicion', {
                      id: p.id,
                      anio: p.anio,
                      mes: p.mes,
                    })
                  }
                  accessibilityLabel={`Editar ${p.especie}`}
                />
              </View>
            </AppCard>
          );
        })}
      </View>
    );
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar programaciones"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader title="Programación" showBack onBack={navigation.goBack} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: 32 + insets.bottom},
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.action.primary]}
              tintColor={theme.colors.action.primary}
            />
          }>
          {puedeGestionar ? (
            <>
              {renderPeriodo}
              {renderBotonNuevo}
              {renderContenido()}
            </>
          ) : (
            <EmptyState
              title="Acceso restringido"
              message="Esta sección solo está disponible para el perfil admin (I+D)."
              icon="shield-lock-outline"
            />
          )}
        </ScrollView>
        <VerModal programacion={ver} onClose={() => setVer(null)} />
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
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.neutral,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  periodLabel: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
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
  totalMes: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
  },
  totalMesBold: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    color: theme.colors.text.primary,
  },
  avisoEdicion: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.status.warning,
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
  modalTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  modalSubtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  verRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  verCol: {
    flex: 1,
  },
  verCell: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.text.primary,
  },
  verSub: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    marginTop: 2,
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
});