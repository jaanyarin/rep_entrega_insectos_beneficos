import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import BottomNavigation from '../components/BottomNavigation';
import ConfirmDialog from '../components/ConfirmDialog';
import {APP_VERSION} from '../constants/appVersion';
import history from '../constants/versionHistory';
import {useAuth} from '../context/AuthContext';
import {theme} from '../theme';

export default function PerfilScreen() {
  const {user, logout} = useAuth(); const [confirm, setConfirm] = useState(false);
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <AppHeader title="Perfil" />
    <ScrollView contentContainerStyle={styles.content}>
      <AppCard><Text style={styles.name}>{user?.nombre ?? 'Usuario'}</Text><Text style={styles.detail}>Perfil: {user?.rol ?? '—'}</Text></AppCard>
      <AppCard><Text style={styles.section}>Información de la aplicación</Text><Text style={styles.detail}>Versión {APP_VERSION}</Text><Text style={styles.detail}>{history[0]?.cambios?.[0] ?? 'Sistema de control de entrega'}</Text></AppCard>
      <AppButton label="Cerrar sesión" variant="destructive" onPress={() => setConfirm(true)} accessibilityLabel="Cerrar sesión" />
    </ScrollView>
    <BottomNavigation active="Perfil" />
    <ConfirmDialog visible={confirm} title="Cerrar sesión" message="¿Deseas cerrar la sesión actual?" confirmLabel="Cerrar sesión" tone="danger" onCancel={() => setConfirm(false)} onConfirm={logout} confirmAccessibilityLabel="Confirmar cierre de sesión" />
  </SafeAreaView>;
}
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:theme.colors.background.default},content:{padding:theme.spacing[4],gap:theme.spacing[4]},name:{fontFamily:theme.typography.h3.fontFamily,fontSize:theme.typography.h3.fontSize,color:theme.colors.text.primary},section:{fontFamily:theme.typography.h4.fontFamily,fontSize:theme.typography.h4.fontSize,color:theme.colors.text.primary,marginBottom:theme.spacing[2]},detail:{fontFamily:theme.typography.body1.fontFamily,fontSize:theme.typography.body1.fontSize,color:theme.colors.text.secondary,marginTop:4}});
