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
  Catalogos: undefined;
  Perfil: undefined;
  NuevoRequerimiento: undefined;
  HistorialRequerimiento: undefined;
  Programacion: undefined;
  ProgramacionEdicion: {id: number; anio: number; mes: number};
  SolicitudRequerimientos: undefined;
};

/**
 * Pantallas navegables desde el menú del Home (sin parámetros). El resto de
 * rutas (p. ej. ProgramacionEdicion) requieren params y se navega con ellos.
 */
export type MenuScreen =
  | 'NuevoRequerimiento'
  | 'HistorialRequerimiento'
  | 'Programacion'
  | 'SolicitudRequerimientos';
