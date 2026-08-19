/**
 * Parametros del Stack Navigator principal (tipado TS).
 * - ServerCheck: primer flujo sin sesión (valida la URL del servidor).
 * - Login: selector perfil → usuario → contraseña (3 pasos).
 * - ConfigurarServidor: URL del servidor en runtime (desde Login y Super Admin).
 * - CambiarPassword: autenticado con passwordResetRequired = true (obligatorio).
 * - Home + placeholders: autenticado normal (home según perfil).
 */
export type RootStackParamList = {
  ServerCheck: undefined;
  Login: undefined;
  ConfigurarServidor: undefined;
  CambiarPassword: undefined;
  Home: undefined;
  NuevoRequerimiento: undefined;
  HistorialRequerimiento: undefined;
  Programacion: undefined;
  SolicitudRequerimientos: undefined;
};