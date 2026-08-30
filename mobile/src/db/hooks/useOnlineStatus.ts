/**
 * db/hooks/useOnlineStatus.ts — Hook para detectar conectividad de red.
 *
 * Usa @react-native-community/netinfo para escuchar cambios de conectividad.
 * Retorna true si hay conexión (WiFi o cellular), false si está offline.
 *
 * Se usa en:
 * - Para decidir si cargar datos del servidor o de SQLite local
 * - Para habilitar/deshabilitar funcionalidades offline
 * - Para trigger automático de sync cuando se reconecta
 */

import {useEffect, useState} from 'react';
import NetInfo, {type NetInfoState} from '@react-native-community/netinfo';

/**
 * Retorna true si el dispositivo tiene conectividad de red.
 * Se actualiza automáticamente cuando cambia el estado de la red.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Verificar estado actual al montar
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
    });

    // Escuchar cambios de conectividad
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}
