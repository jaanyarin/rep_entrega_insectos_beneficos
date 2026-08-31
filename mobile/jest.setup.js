/* global jest, require */

// Mock oficial de react-native-safe-area-context para Jest
// (documentado en https://reactnavigation.org/docs/testing/).
jest.mock('react-native-safe-area-context', () => {
  return require('react-native-safe-area-context/jest/mock').default;
});

// Los iconos se renderizan como texto en Jest; el módulo nativo real se usa en Android.
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const {Text} = require('react-native');
  return {__esModule: true, default: Text};
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

// Mock de cámara y galería: las pruebas de UI no disponen de un dispositivo físico.
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn().mockResolvedValue({didCancel: true}),
  launchImageLibrary: jest.fn().mockResolvedValue({didCancel: true}),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock de @op-engineering/op-sqlite: módulo nativo que no puede parsear Jest.
// open() es síncrono en JSI; el mock debe retornar el objeto directamente.
jest.mock('@op-engineering/op-sqlite', () => {
  const mockDb = {
    execute: jest.fn().mockResolvedValue({rows: [], rowsAffected: 0}),
  };
  return {
    __esModule: true,
    open: jest.fn().mockReturnValue(mockDb),
  };
});

// Mock de drizzle-orm/op-sqlite: retorna un db mock con select/insert/update/delete
jest.mock('drizzle-orm/op-sqlite', () => {
  const createChain = () => {
    const chain = {};
    const methods = ['select', 'from', 'insert', 'values', 'update', 'set', 'delete', 'where', 'orderBy'];
    methods.forEach(m => {
      chain[m] = jest.fn().mockReturnValue(chain);
    });
    chain.then = (resolve) => resolve([]);
    chain.catch = (reject) => chain;
    return chain;
  };
  return {
    __esModule: true,
    drizzle: jest.fn(() => createChain()),
  };
});

// Mock de drizzle-orm (core): funciones de filtro
jest.mock('drizzle-orm', () => {
  const op = jest.fn(() => ({}));
  return {
    __esModule: true,
    eq: op,
    gte: op,
    lte: op,
    and: op,
    desc: op,
    like: op,
  };
});

// Mock de @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => {
  const listeners = [];
  return {
    __esModule: true,
    default: {
      fetch: jest.fn().mockResolvedValue({isConnected: true, type: 'wifi'}),
      addEventListener: jest.fn((callback) => {
        listeners.push(callback);
        return () => {
          const idx = listeners.indexOf(callback);
          if (idx >= 0) { listeners.splice(idx, 1); }
        };
      }),
    },
  };
});

// Mock de useOnlineStatus: por defecto online. Tests específicos pueden overridearlo.
jest.mock('./src/db/hooks/useOnlineStatus', () => ({
  __esModule: true,
  useOnlineStatus: jest.fn(() => true),
}));

// Mock de isTokenExpired: por defecto NO expirado (tokens de test no tienen exp).
// Tests que validen el flujo real de expiración pueden overridearlo con
// jest.requireActual para testear la implementación de token.ts.
jest.mock('./src/utils/token', () => ({
  isTokenExpired: jest.fn(() => false),
}));

// Mock de axios: ApiClient usa `axios.create()` + interceptores; en Jest se
// sustituye la instancia para que NINGÚN test haga llamadas de red. Por
// defecto GET devuelve `[]` y POST `{}` (ampliable por test con jest.mock
// propio o mockImplementation sobre la instancia devuelta por create).
jest.mock('axios', () => {
  const instance = {
    get: jest.fn().mockResolvedValue({data: []}),
    post: jest.fn().mockResolvedValue({data: {}}),
    put: jest.fn().mockResolvedValue({data: {}}),
    delete: jest.fn().mockResolvedValue({data: {}}),
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