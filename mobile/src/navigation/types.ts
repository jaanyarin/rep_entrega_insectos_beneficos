/**
 * Parametros del Stack Navigator principal (tipado TS).
 * - Login: no autenticado.
 * - CambiarPassword: autenticado con debeCambiarPassword = true (obligatorio).
 * - Home + placeholders: autenticado normal (home según perfil).
 */
export type RootStackParamList = {
  Login: undefined;
  CambiarPassword: undefined;
  Home: undefined;
  NuevoRequerimiento: undefined;
  HistorialRequerimiento: undefined;
  Programacion: undefined;
  SolicitudRequerimientos: undefined;
};