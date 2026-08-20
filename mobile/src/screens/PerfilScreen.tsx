import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import BottomNavigation from '../components/BottomNavigation';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorBoundary from '../components/ErrorBoundary';
import {APP_VERSION} from '../constants/appVersion';
import history from '../constants/versionHistory';
import {useAuth} from '../context/AuthContext';
import {theme} from '../theme';

/**
 * Perfil (Sistema de Diseño Mobile Vanguard, §2.3 + blueMain):
 * avatar circular con la inicial del nombre, datos de sesión, versión del
 * app e historial de versiones. Cierre de sesión con ConfirmDialog (acción
 * destructiva). Sin react-native-paper: componentes propios + tokens.
 *
 * paddingBottom del contenido = 32 + insets.bottom + 68 (no tapa la
 * BottomNavigation). HITO-003 (delta): elevado al estándar Vanguard.
 */
export default function PerfilScreen() {
  const {user, logout} = useAuth();
  const insets = useSafeAreaInsets();
  const [confirm, setConfirm] = useState(false);

  const inicial =
    (user?.nombre ?? '').trim().charAt(0).toUpperCase() || 'U';

  return (
    <ErrorBoundary
      fallbackTitle="No se pudo cargar el perfil"
      fallbackMessage="Reintente nuevamente o cierre su sesión.">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <AppHeader title="Perfil" />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {paddingBottom: 32 + insets.bottom + 68},
          ]}>
          <View style={styles.headerBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{inicial}</Text>
            </View>
            <Text style={styles.name}>{user?.nombre ?? 'Usuario'}</Text>
            <Text style={styles.perfil}>Perfil: {user?.rol ?? '—'}</Text>
          </View>

          <AppCard>
            <Text style={styles.section}>Información de la aplicación</Text>
            <Text style={styles.detail}>Versión {APP_VERSION}</Text>
          </AppCard>

          <AppCard>
            <Text style={styles.section}>Historial de versiones</Text>
            {history.map(entry => (
              <View key={entry.version} style={styles.historyEntry}>
                <Text style={styles.historyVersion}>
                  v{entry.version} · {entry.fecha}
                </Text>
                {entry.cambios.map((cambio, index) => (
                  <Text key={index} style={styles.historyChange}>
                    • {cambio}
                  </Text>
                ))}
              </View>
            ))}
          </AppCard>

          <AppButton
            label="Cerrar sesión"
            variant="destructive"
            onPress={() => setConfirm(true)}
            accessibilityLabel="Cerrar sesión"
          />
        </ScrollView>
        <BottomNavigation active="Perfil" />
        <ConfirmDialog
          visible={confirm}
          title="Cerrar sesión"
          message="¿Deseas cerrar la sesión actual?"
          confirmLabel="Cerrar sesión"
          tone="danger"
          onCancel={() => setConfirm(false)}
          onConfirm={logout}
          confirmAccessibilityLabel="Confirmar cierre de sesión"
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.action.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  avatarInitial: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: 32,
    lineHeight: 40,
    color: theme.colors.text.inverse,
  },
  name: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: theme.typography.h3.fontSize,
    lineHeight: theme.typography.h3.lineHeight,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  perfil: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
    textAlign: 'center',
  },
  section: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  detail: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  historyEntry: {
    marginBottom: theme.spacing[3],
  },
  historyVersion: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontSize: theme.typography.subtitle2.fontSize,
    lineHeight: theme.typography.subtitle2.lineHeight,
    color: theme.colors.action.secondary,
    marginBottom: theme.spacing[1],
  },
  historyChange: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
});