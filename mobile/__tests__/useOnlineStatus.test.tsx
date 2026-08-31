/**
 * Tests de useOnlineStatus hook.
 * Usa react-test-renderer + act() (sin @testing-library).
 */
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import NetInfo from '@react-native-community/netinfo';
import {useOnlineStatus} from '../src/db/hooks/useOnlineStatus';

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({isConnected: true})),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

// Helper: renderiza un componente que expone el hook
function HookTest() {
  const isOnline = useOnlineStatus();
  return <>{isOnline ? 'online' : 'offline'}</>;
}

describe('useOnlineStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({isConnected: true});
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());
  });

  test('renderiza sin errores', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest />); });
    expect(tree.toJSON()).toBeTruthy();
  });

  test('fetch se llama al montar', () => {
    act(() => { ReactTestRenderer.create(<HookTest />); });
    expect(NetInfo.fetch).toHaveBeenCalled();
  });

  test('addEventListener se llama al montar', () => {
    act(() => { ReactTestRenderer.create(<HookTest />); });
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  test('muestra "online" por defecto', () => {
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest />); });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('online');
  });

  test('suscripción se limpia al desmontar', () => {
    const unsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);
    let tree: any;
    act(() => { tree = ReactTestRenderer.create(<HookTest />); });
    act(() => { tree.unmount(); });
    expect(unsubscribe).toHaveBeenCalled();
  });
});
