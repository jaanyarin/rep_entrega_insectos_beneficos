import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../context/AuthContext';

/**
 * Pantalla placeholder para destinos de la primera vertical
 * (requerimientos/programación/solicitudes). El título llega vía
 * `options.title` del Stack.Navigator.
 */
export default function PlaceholderScreen() {
  const {loading} = useAuth();

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1a5c2a" />
      ) : (
        <Text style={styles.text}>En construcción</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#555',
  },
});