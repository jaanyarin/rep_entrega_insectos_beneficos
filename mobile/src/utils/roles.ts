/**
 * Utilidades de permisos por rol (ADR-A003 D-AUTH2-1).
 *
 * Los roles del HITO-002 son literales CON ESPACIOS en BD, JWT (`groups`) y
 * `@RolesAllowed`: 'Super Admin' | 'Admin' | 'Usuario'. Todas las
 * comparaciones usan estos literales exactos (case-insensitive, con trim).
 */

import type {AuthUser} from '../services/ApiClient';

/** Extrae el literal del rol desde un user decodificado del JWT. */
export function getRolNombre(user: AuthUser | null | undefined): string {
  return String(user?.rolNombre || user?.rol || '').trim();
}

/** `true` solo para el rol literal 'Super Admin'. */
export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return getRolNombre(user).toLowerCase() === 'super admin';
}

/** `true` para 'Admin' o 'Super Admin' (gestión — no usuario operativo). */
export function isAdminOrSuperAdmin(
  user: AuthUser | null | undefined,
): boolean {
  const rol = getRolNombre(user).toLowerCase();
  return rol === 'admin' || rol === 'super admin';
}