import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {isSuperAdmin} from '../utils/roles';
import MenuButton from '../components/MenuButton';
import type {RootStackParamList} from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  label: string;
  screen: keyof RootStackParamList;
}

/**
 * Menú por perfil (ADR-A002 D-AUTH-2, literales ADR-A003 D-AUTH2-1):
 * - Usuario      → 2 botones: Nuevo Requerimiento / Historial de Requerimiento.
 * - Admin        → 2 botones: Programación / Solicitud de Requerimientos.
 * - Super Admin  → 2 divs: [Programación + Solicitud] y [Nuevo + Historial].
 * Los textos de los botones son EXACTOS al ADR.
 */
const MENU_POR_PERFIL: Record<string, MenuItem[][]> = {
  Usuario: [
    [
      {label: 'Nuevo Requerimiento', screen: 'NuevoRequerimiento'},
      {label: 'Historial de Requerimiento', screen: 'HistorialRequerimiento'},
    ],
  ],
  Admin: [
    [
      {label: 'Programación', screen: 'Programacion'},
      {label: 'Solicitud de Requerimientos', screen: 'SolicitudRequerimientos'},
    ],
  ],
  'Super Admin': [
    [
      {label: 'Programación', screen: 'Programacion'},
      {label: 'Solicitud de Requerimientos', screen: 'SolicitudRequerimientos'},
    ],
    [
      {label: 'Nuevo Requerimiento', screen: 'NuevoRequerimiento'},
      {label: 'Historial de Requerimiento', screen: 'HistorialRequerimiento'},
    ],
  ],
};

export default function HomeScreen() {
  const {user, logout} = useAuth();
  const navigation = useNavigation<Navigation>();

  if (!user) {
    return null;
  }

  const grupos = MENU_POR_PERFIL[user.rol] ?? MENU_POR_PERFIL.Usuario;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcome}>Bienvenido(a), {user.nombre}</Text>
      <Text style={styles.perfil}>Perfil: {user.rol}</Text>

      {grupos.map((grupo, index) => (
        <View
          key={index}
          style={[
            styles.div,
            index % 2 === 0 ? styles.divVarianteUno : styles.divVarianteDos,
          ]}>
          {grupo.map(item => (
            <MenuButton
              key={item.screen}
              label={item.label}
              screen={item.screen}
              navigation={navigation}
            />
          ))}
        </View>
      ))}

      {isSuperAdmin(user) ? (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('ConfigurarServidor')}
          accessibilityLabel="Configurar servidor">
          <Text style={styles.settingsText}>Configurar servidor</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        accessibilityLabel="Cerrar sesión">
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a5c2a',
    marginBottom: 4,
  },
  perfil: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  // "dvs" del SUPER_ADMIN: grupos visuales diferenciados por estilo de
  // contenedor (sin texto extra; los textos exactos del ADR son los botones).
  div: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  divVarianteUno: {
    backgroundColor: '#e8f2ea',
    borderColor: '#1a5c2a',
  },
  divVarianteDos: {
    backgroundColor: '#ffffff',
    borderColor: '#ccc',
  },
  settingsButton: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  settingsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#b71c1c',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});