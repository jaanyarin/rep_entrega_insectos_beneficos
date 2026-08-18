/* global jest, require */

// Mock oficial de react-native-safe-area-context para Jest
// (documentado en https://reactnavigation.org/docs/testing/).
jest.mock('react-native-safe-area-context', () => {
  return require('react-native-safe-area-context/jest/mock').default;
});