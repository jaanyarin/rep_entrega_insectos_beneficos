/* global jest, require */

// Mock oficial de react-native-safe-area-context para Jest
// (documentado en https://reactnavigation.org/docs/testing/).
jest.mock('react-native-safe-area-context', () => {
  return require('react-native-safe-area-context/jest/mock').default;
});

// Mock de react-native-keychain (SecureStore): evita cargar el módulo
// nativo en Jest. Por defecto no hay token ni URL guardados.
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(null),
  setGenericPassword: jest
    .fn()
    .mockResolvedValue({service: 'unit-test', storage: 'unit-test'}),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

// Mock de axios: ApiClient usa `axios.create()` + interceptores; en Jest se
// sustituye la instancia para que NINGÚN test haga llamadas de red. Por
// defecto GET devuelve `[]` y POST `{}` (ampliable por test con jest.mock
// propio o mockImplementation sobre la instancia devuelta por create).
jest.mock('axios', () => {
  const instance = {
    get: jest.fn().mockResolvedValue({data: []}),
    post: jest.fn().mockResolvedValue({data: {}}),
    interceptors: {
      request: {use: jest.fn()},
      response: {use: jest.fn()},
    },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
    },
    AxiosError: class AxiosError extends Error {},
  };
});