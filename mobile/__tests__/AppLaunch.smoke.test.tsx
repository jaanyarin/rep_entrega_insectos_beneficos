/**
 * Smoke test de arranque del árbol real de la aplicación.
 *
 * El objetivo es detectar regresiones en la cadena de imports que pueden
 * impedir que AppRegistry.registerComponent llegue a ejecutarse.
 * No se mockea RootNavigator: el test debe cargar la navegación y sus screens
 * reales, igual que el bundle de producción.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(null),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({children}: {children: React.ReactNode}) => children,
  useAuth: () => ({user: null, loading: true, error: null}),
}));

describe('AppLaunch smoke test', () => {
  test('carga App y RootNavigator reales sin excepción fatal', async () => {
    const App = require('../App').default;
    expect(App).toBeDefined();

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(<App />);
    });

    expect(tree!).toBeTruthy();
  });
});
