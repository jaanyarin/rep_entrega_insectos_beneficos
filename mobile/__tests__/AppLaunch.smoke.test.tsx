/**
 * Smoke test: verificación de que la app puede arrancar sin crash fatal.
 *
 * Cubre el hallazgo crítico del diagnóstico 2026-09-03:
 * "InsectosBeneficios has not been registered" → import chain failure.
 *
 * Verifica que la cadena de imports (App → SyncManager → repositories → database)
 * no lanza excepciones fatales y que el componente App se puede renderizar.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(null),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({isConnected: true}),
    addEventListener: jest.fn().mockReturnValue(() => {}),
  },
}));

jest.mock('../src/db/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));

jest.mock('../src/components/SyncToast', () => {
  const {View} = require('react-native');
  return {__esModule: true, default: () => <View testID="sync-toast" />};
});

jest.mock('../src/navigation/RootNavigator', () => {
  const {View} = require('react-native');
  return {__esModule: true, default: () => <View testID="root-nav" />};
});

jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({children}: {children: React.ReactNode}) => children,
  useAuth: () => ({user: null, loading: false}),
}));

describe('AppLaunch smoke test', () => {
  test('App component can be imported and rendered without fatal exceptions', async () => {
    const App = require('../App').default;
    expect(App).toBeDefined();

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(<App />);
    });
    expect(tree!).toBeTruthy();
  });
});
