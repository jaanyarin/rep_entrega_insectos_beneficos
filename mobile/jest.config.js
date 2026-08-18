module.exports = {
  // Fix pre-existente: el scaffold referenciaba '@react-native/jest-preset'
  // sin tenerlo en devDependencies (RN 0.86 movió el preset a ese paquete,
  // react-native/jest-preset.js lo exige explícitamente). Se instaló
  // @react-native/jest-preset@0.86.0 para alinear con el template oficial.
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // Mocks de librerías nativas y ESM de react-navigation/safe-area-context
  // dentro de node_modules necesitan transformación (patrón RN usual).
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-safe-area-context)/)',
  ],
};
