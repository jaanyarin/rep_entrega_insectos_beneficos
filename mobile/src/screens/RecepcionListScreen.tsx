/**
 * RecepcionListScreen — Listado de recepciones de un requerimiento (HITO-015 / MOD-07).
 *
 * Muestra las recepciones registradas y permite confirmar una nueva (Admin/Usuario).
 */

import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  listarRecepciones,
  type RecepcionDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {formatFecha} from '../utils/programacion';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';
import {recepcionesRepo} from '../db/repositories';

type Route = RouteProp<RootStackParamList, 'RecepcionList'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function RecepcionListScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const isOnline = useOnlineStatus();

  const {requerimientoId} = route.params;

  const [recepciones, setRecepciones] = useState<RecepcionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const puedeCrear = user?.rol === 'Admin' || user?.rol === 'Super Admin' || user?.rol === 'Usuario';

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOnline) {
        const data = await listarRecepciones(requerimientoId);
        setRecepciones(data);
      } else {
        // Offline path — read from local SQLite
        try {
          const local = await recepcionesRepo.findByRequerimientoLocalId(
            requerimientoId,
          );
          setRecepciones(
            local.map(r => ({
              id: r.id,
              requerimientoId: r.requerimientoServerId ?? requerimientoId,
              conforme: r.conforme,
              observaciones: r.observaciones,
              fechaRecepcion: r.fechaRecepcion ?? '',
              creadoPor: r.creadoPor ?? 0,
              creadoPorNombre: `Usuario ${r.creadoPor ?? 0}`,
              createdAt: r.createdAt?.toISOString() ?? '',
            })),
          );
        } catch {
          setRecepciones([]);
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
      return <LoadingState message="Cargando recepciones…" />;
    }
    if (error) {
      return <ErrorState onRetry={cargar} />;
    }
    if (recepciones.length === 0) {
      return (
        <EmptyState
          title="Sin recepciones"
          message="No hay recepciones registradas para este requerimiento."
          icon="package-check"
        />
      );
    }
    return (
      <View style={styles.list}>
        {recepciones.map(r => (
          <AppCard key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardStatus}>
                <MaterialCommunityIcons
                  name={r.conforme ? 'check-circle' : 'close-circle'}
                  size={20}
                  color={
                    r.conforme
                      ? theme.colors.status.success
                      : theme.colors.status.error
                  }
                />
                <Text style={styles.cardTitleText}>
                  {r.conforme ? 'Conforme' : 'No conforme'}
                </Text>
              </View>
              <Text style={styles.cardDate}>{formatFecha(r.createdAt)}</Text>
            </View>
            {r.observaciones ? (
              <Text style={styles.cardObs}>{r.observaciones}</Text>
            ) : null}
            <Text style={styles.cardUser}>Por: {r.creadoPorNombre}</Text>
          </AppCard>
        ))}
      </View>
    );
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudieron cargar las recepciones"
      fallbackMessage="Reintente nuevamente.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Recepciones"
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
              label="Confirmar Recepción"
              icon="plus"
              onPress={() =>
                navigation.navigate('RecepcionForm', {requerimientoId})
              }
              accessibilityLabel="Confirmar nueva recepción"
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
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
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
