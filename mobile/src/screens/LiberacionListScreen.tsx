/**
 * LiberacionListScreen — Listado de liberaciones de un requerimiento (HITO-015 / MOD-08).
 *
 * Muestra las liberaciones registradas y permite registrar una nueva.
 */

import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/types';
import {
  extractErrorMessage,
  listarLiberaciones,
  type LiberacionDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {formatFecha} from '../utils/programacion';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';
import {liberacionesRepo} from '../db/repositories';

type Route = RouteProp<RootStackParamList, 'LiberacionList'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function LiberacionListScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const isOnline = useOnlineStatus();

  const {requerimientoId} = route.params;

  const [liberaciones, setLiberaciones] = useState<LiberacionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const puedeCrear = user?.rol === 'Admin' || user?.rol === 'Super Admin' || user?.rol === 'Usuario';

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOnline) {
        const data = await listarLiberaciones(requerimientoId);
        setLiberaciones(data);
      } else {
        // Offline path — read from local SQLite
        try {
          const local = await liberacionesRepo.findByRequerimientoLocalId(
            requerimientoId,
          );
          setLiberaciones(
            local.map(l => ({
              id: l.id,
              requerimientoId: l.requerimientoServerId ?? requerimientoId,
              fundoId: l.fundoId ?? 0,
              fundoNombre: '',
              loteId: l.loteId ?? 0,
              loteNombre: '',
              cantidadLiberada: l.cantidadLiberada,
              observaciones: l.observaciones,
              fechaLiberacion: l.fechaLiberacion ?? '',
              horaLiberacion: l.horaLiberacion ?? '',
              creadoPor: l.creadoPor ?? 0,
              creadoPorNombre: `Usuario ${l.creadoPor ?? 0}`,
              createdAt: l.createdAt?.toISOString() ?? '',
            })),
          );
        } catch {
          setLiberaciones([]);
        }
      }
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [requerimientoId, isOnline]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const renderContent = () => {
    if (loading) {
      return <LoadingState message="Cargando liberaciones…" />;
    }
    if (error) {
      return <ErrorState onRetry={cargar} />;
    }
    if (liberaciones.length === 0) {
      return (
        <EmptyState
          title="Sin liberaciones"
          message="No hay liberaciones registradas para este requerimiento."
          icon="bug-outline"
        />
      );
    }
    return (
      <View style={styles.list}>
        {liberaciones.map(l => (
          <AppCard key={l.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitleText}>
                {l.cantidadLiberada} millares
              </Text>
              <Text style={styles.cardDate}>{formatFecha(l.createdAt)}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardDetail}>Fundo: {l.fundoNombre}</Text>
              <Text style={styles.cardDetail}>Lote: {l.loteNombre}</Text>
            </View>
            <Text style={styles.cardDetail}>Hora: {l.horaLiberacion}</Text>
            {l.observaciones ? (
              <Text style={styles.cardObs}>{l.observaciones}</Text>
            ) : null}
            <Text style={styles.cardUser}>Por: {l.creadoPorNombre}</Text>
          </AppCard>
        ))}
      </View>
    );
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudieron cargar las liberaciones"
      fallbackMessage="Reintente nuevamente.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Liberaciones"
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
          {renderContent()}
        </ScrollView>
        {puedeCrear && (
          <View style={styles.fab}>
            <AppButton
              label="Registrar Liberación"
              icon="plus"
              onPress={() =>
                navigation.navigate('LiberacionForm', {requerimientoId})
              }
              accessibilityLabel="Registrar nueva liberación"
            />
          </View>
        )}
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
    gap: theme.spacing[3],
  },
  list: {
    gap: theme.spacing[3],
  },
  card: {
    gap: theme.spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleText: {
    fontFamily: theme.typography.subtitle1.fontFamily,
    fontSize: theme.typography.subtitle1.fontSize,
    lineHeight: theme.typography.subtitle1.lineHeight,
    color: theme.colors.text.primary,
  },
  cardDate: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  cardRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  cardDetail: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
  cardObs: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  cardUser: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  fab: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
});
