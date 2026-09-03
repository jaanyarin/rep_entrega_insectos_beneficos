/**
 * DespachoListScreen — Listado de despachos de un requerimiento (HITO-015 / MOD-06).
 *
 * Muestra los despachos registrados y permite registrar uno nuevo (Admin/Super Admin).
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
  listarDespachos,
  type DespachoDto,
} from '../services/ApiClient';
import {theme} from '../theme';
import {formatFecha} from '../utils/programacion';
import {useOnlineStatus} from '../db/hooks/useOnlineStatus';
import OfflineBanner from '../components/OfflineBanner';
import {despachosRepo} from '../db/repositories';

type Route = RouteProp<RootStackParamList, 'DespachoList'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function DespachoListScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const isOnline = useOnlineStatus();

  const {requerimientoId} = route.params;

  const [despachos, setDespachos] = useState<DespachoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const esAdmin =
    user?.rol === 'Admin' || user?.rol === 'Super Admin';

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOnline) {
        const data = await listarDespachos(requerimientoId);
        setDespachos(data);
      } else {
        // Offline path — read from local SQLite
        try {
          const local = await despachosRepo.findByRequerimientoLocalId(
            requerimientoId,
          );
          setDespachos(
            local.map(d => ({
              id: d.id,
              requerimientoId: d.requerimientoServerId ?? requerimientoId,
              cantidadDespachada: d.cantidadDespachada,
              papelConPostura: d.papelConPostura,
              sobreConCascarilla: d.sobreConCascarilla,
              observaciones: d.observaciones,
              creadoPor: d.creadoPor ?? 0,
              creadoPorNombre: `Usuario ${d.creadoPor ?? 0}`,
              createdAt: d.createdAt?.toISOString() ?? '',
            })),
          );
        } catch {
          setDespachos([]);
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
      return <LoadingState message="Cargando despachos…" />;
    }
    if (error) {
      return <ErrorState onRetry={cargar} />;
    }
    if (despachos.length === 0) {
      return (
        <EmptyState
          title="Sin despachos"
          message="No hay despachos registrados para este requerimiento."
          icon="truck-delivery-outline"
        />
      );
    }
    return (
      <View style={styles.list}>
        {despachos.map(d => (
          <AppCard key={d.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitleText}>
                {d.cantidadDespachada} millares
              </Text>
              <Text style={styles.cardDate}>{formatFecha(d.createdAt)}</Text>
            </View>
            {(d.papelConPostura != null || d.sobreConCascarilla != null) && (
              <View style={styles.cardRow}>
                {d.papelConPostura != null && (
                  <Text style={styles.cardDetail}>
                    Papel: {d.papelConPostura}
                  </Text>
                )}
                {d.sobreConCascarilla != null && (
                  <Text style={styles.cardDetail}>
                    Sobre: {d.sobreConCascarilla}
                  </Text>
                )}
              </View>
            )}
            {d.observaciones ? (
              <Text style={styles.cardObs}>{d.observaciones}</Text>
            ) : null}
            <Text style={styles.cardUser}>Por: {d.creadoPorNombre}</Text>
          </AppCard>
        ))}
      </View>
    );
  };

  return (
    <ErrorBoundary
      fallbackTitle="No se pudieron cargar los despachos"
      fallbackMessage="Reintente nuevamente.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader
          title="Despachos"
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
        {esAdmin && (
          <View style={styles.fab}>
            <AppButton
              label="Registrar Despacho"
              icon="plus"
              onPress={() =>
                navigation.navigate('DespachoForm', {requerimientoId})
              }
              accessibilityLabel="Registrar nuevo despacho"
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
