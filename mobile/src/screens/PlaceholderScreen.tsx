import React from 'react';
import {StyleSheet, View} from 'react-native';
import EmptyState from '../components/EmptyState';
import {theme} from '../theme';

/**
 * Pantalla placeholder para destinos de la primera vertical
 * (requerimientos/programación/solicitudes). El título llega vía
 * `options.title` del Stack.Navigator (header nativo del stack).
 *
 * HITO-003 (delta): EmptyState Vanguard con icono MaterialCommunityIcons
 * (nunca emojis, §9); sin hardcodes de la paleta antigua. El `loading` de
 * AuthContext era un falso positivo aquí (solo estaba activo en el arranque
 * de la app; esta pantalla solo se alcanza autenticado) → se eliminó.
 */
export default function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        title="En construcción"
        message="Esta sección estará disponible en una próxima versión."
        icon="wrench-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
    justifyContent: 'center',
    alignItems: 'center',
  },
});