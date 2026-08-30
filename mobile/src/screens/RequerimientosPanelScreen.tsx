/**
 * RequerimientosPanelScreen — Screen 6: Panel de Solicitudes de Requerimiento
 * (MOD-18 / RF-149..151). Acceso: admin i+d.
 *
 * Misma estructura que Screen 3 (Programación), enfocada exclusivamente en
 * solicitudes:
 *  1. Botón "Solicitud de Requerimiento" con indicador numérico de solicitudes
 *     pendientes (RF-151) → navega a Screen 7.
 *  2. Tabla de proyección del mes (Sem | Papel | Sobre | Total).
 *  3. Barra de progreso de consumo mensual vs disponibilidad.
 */

import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppHeader from '../components/AppHeader';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ProyeccionMesCard from '../components/ProyeccionMesCard';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/types';
import {
  extractErrorMessage,
  type ProgramacionDto,
  type RequerimientoDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {isAdminOrSuperAdmin} from '../utils/roles';
import {
  anioActual,
  mesActual,
} from '../utils/programacion';
import {
  consumoDelMes,
  contarPendientes,
  filasProyeccion,
  totalProyeccion,
} from '../utils/requerimientos';
import {requerimientosRepo, programacionesRepo} from '../db/repositories';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function RequerimientosPanelScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const puedeGestionar = isAdminOrSuperAdmin(user);
  const isOnline = useOnlineStatus();

  const [programaciones, setProgramaciones] = useState<ProgramacionDto[]>([]);
  const [requerimientos, setRequerimientos] = useState<RequerimientoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const anio = anioActual();
  const mes = mesActual();

  const loadData = useCallback(async () => {
    if (!puedeGestionar) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Programaciones: cache-first (local → sync si online)
      let prog: ProgramacionDto[] = [];
      try {
        // Intentar sincronizar del servidor si hay red
        await programacionesRepo.syncProgramaciones(anio, mes);
      } catch {
        // Offline o error → usar cache local
      }
      // Siempre leer de SQLite local (cache-first)
      prog = await programacionesRepo.listLocalAsDto(anio, mes);

      // Siempre leer de SQLite
      const reqsLocales = await requerimientosRepo.listLocal();
      // Mapear a RequerimientoDto para la lógica existente
      const reqsDto: RequerimientoDto[] = reqsLocales.map(r => ({
        id: r.serverId ?? r.id,
        fecha: r.fecha,
        fundoId: r.fundoId,
        fundo: '',
        loteId: r.loteId,
        lote: '',
        especieId: r.especieId,
        especie: '',
        etapaFenologicaId: r.etapaFenologicaId,
        etapaFenologica: null,
        plagaId: r.plagaId,
        plaga: null,
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
      }));

      setProgramaciones(prog);
      setRequerimientos(reqsDto);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [puedeGestionar, anio, mes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) {
    return null;
  }

  const filas = filasProyeccion(programaciones);
  const disponibilidad = totalProyeccion(filas);
  const consumo = consumoDelMes(requerimientos, anio, mes);
  const pendientes = contarPendientes(requerimientos);

  const renderContenido = () => {
    if (loading) {
      return <LoadingState message="Cargando solicitudes…" />;
    }
    if (error) {
      return <ErrorState onRetry={loadData} />;
    }
    return (
      <ProyeccionMesCard
        filas={filas}
        disponibilidad={disponibilidad}
        consumo={consumo}
        titulo={`Proyección ${mes}/${anio}`}
      />
    );
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el panel de solicitudes"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Solicitudes de Requerimiento"
          showBack
          onBack={navigation.goBack}
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: 32 + insets.bottom},
          ]}>
          {puedeGestionar ? (
            <>
              {!isOnline && <OfflineBanner />}
              <View style={styles.accion}>
                <AppButton
                  label="Solicitud de Requerimiento"
                  icon="file-document-outline"
                  onPress={() => navigation.navigate('RequerimientosList')}
                  accessibilityLabel="Solicitud de Requerimiento"
                />
                {pendientes > 0 ? (
                  <View
                    style={styles.badge}
                    accessibilityRole="text"
                    accessibilityLabel="Solicitudes pendientes"
                    testID="badge-pendientes">
                    <Text style={styles.badgeText}>{pendientes}</Text>
                  </View>
                ) : null}
              </View>
              {renderContenido()}
            </>
          ) : (
            <ErrorState
              title="Acceso restringido"
              message="Esta sección solo está disponible para el perfil admin (I+D)."
              onRetry={undefined}
            />
          )}
        </ScrollView>
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
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[2],
  },
  badgeText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
});
