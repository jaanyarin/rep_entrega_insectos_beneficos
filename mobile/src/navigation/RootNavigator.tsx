import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CambiarPasswordScreen from '../screens/CambiarPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Navegación condicional por estado de autenticación (patrón oficial de
 * react-navigation para auth flows):
 * - Sin token        → Login.
 * - Token + debe cambiar password → CambiarPassword (única pantalla del
 *   stack, sin header y sin gesto de retroceso: no se puede saltar).
 * - Token + normal   → Home según perfil + 4 placeholders.
 */
export default function RootNavigator() {
  const {token, usuario} = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        ) : usuario?.debeCambiarPassword ? (
          <Stack.Screen
            name="CambiarPassword"
            component={CambiarPasswordScreen}
            options={{headerShown: false, gestureEnabled: false}}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="NuevoRequerimiento"
              component={PlaceholderScreen}
              options={{title: 'Nuevo Requerimiento'}}
            />
            <Stack.Screen
              name="HistorialRequerimiento"
              component={PlaceholderScreen}
              options={{title: 'Historial de Requerimiento'}}
            />
            <Stack.Screen
              name="Programacion"
              component={PlaceholderScreen}
              options={{title: 'Programación'}}
            />
            <Stack.Screen
              name="SolicitudRequerimientos"
              component={PlaceholderScreen}
              options={{title: 'Solicitud de Requerimientos'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}