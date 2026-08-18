import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

interface Props {
  label: string;
  screen: keyof RootStackParamList;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

/**
 * Botón de menú del home (reutilizado por los 3 perfiles).
 * Navega a la pantalla destino pasada por prop.
 */
export default function MenuButton({label, screen, navigation}: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate(screen)}
      activeOpacity={0.8}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1a5c2a',
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});