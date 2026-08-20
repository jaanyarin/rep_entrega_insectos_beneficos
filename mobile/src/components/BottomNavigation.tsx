/**
 * BottomNavigation — Navegación inferior del Sistema de Diseño Mobile
 * Vanguard (§12, §27). Solo en stack autenticado.
 *
 * 4 slots de ancho igual (flex 1):
 *  1. Home      → navega a 'Home' (menú por perfil).
 *  2. VACÍO     → sin icono ni label, ocupa su 1/4, NO navega (V4).
 *  3. Catálogos → navega a 'Catalogos' (placeholder).
 *  4. Perfil    → navega a 'Perfil' (PerfilScreen).
 *
 * Diseño: altura 64 px, fondo blanco, borde superior #E8EDF2, icono activo
 * #558BA5 / inactivo #8A95A3, icono 22-24, label 11-12. Áreas táctiles
 * mínimas 44x44 dp (§23). Usa `useNavigation` (mockeable en tests).
 */

import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';

export type BottomTab = 'Home' | 'Catalogos' | 'Perfil';

interface Props {
  active: BottomTab;
}

type Nav = {
  navigate: (screen: string) => void;
};

export default function BottomNavigation({active}: Props) {
  const navigation = useNavigation<Nav>();

  const tabs: Array<{
    key: BottomTab;
    label: string;
    iconInactive: string;
    iconActive: string;
  }> = [
    {
      key: 'Home',
      label: 'Home',
      iconInactive: 'home-variant-outline',
      iconActive: 'home-variant',
    },
    {
      key: 'Catalogos',
      label: 'Catálogos',
      iconInactive: 'view-grid-outline',
      iconActive: 'view-grid',
    },
    {
      key: 'Perfil',
      label: 'Perfil',
      iconInactive: 'account-circle-outline',
      iconActive: 'account-circle',
    },
  ];

  const isActive = (key: BottomTab) => active === key;

  return (
    <View style={styles.bar}>
      {tabs.map(tab => {
        const selected = isActive(tab.key);
        return (
          <React.Fragment key={tab.key}>
            <TouchableOpacity
              style={styles.slot}
              onPress={() => navigation.navigate(tab.key)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{selected}}
              testID={`bottom-tab-${tab.key}`}>
              <MaterialCommunityIcons
                name={selected ? tab.iconActive : tab.iconInactive}
                size={24}
                color={
                  selected
                    ? theme.colors.action.secondary
                    : theme.colors.text.tertiary
                }
                accessibilityLabel={tab.label}
              />
              <Text
                style={[
                  styles.label,
                  {color: selected ? theme.colors.action.secondary : theme.colors.text.tertiary},
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
            {/* Slot 2 VACÍO (V4): tras Home, ocupa su 1/4 sin icono, sin
                label y sin navegación. */}
            {tab.key === 'Home' ? (
              <View style={styles.slot} testID="bottom-tab-vacio" />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    minHeight: 64,
    paddingBottom: theme.spacing[1] * 2,
    paddingTop: theme.spacing[1],
  },
  slot: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});