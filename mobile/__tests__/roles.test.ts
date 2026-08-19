import {
  getRolNombre,
  isAdminOrSuperAdmin,
  isSuperAdmin,
} from '../src/utils/roles';
import type {AuthUser} from '../src/services/ApiClient';

/**
 * Pruebas de `utils/roles.ts` (ADR-A003 D-AUTH2-1): los roles se comparan
 * contra los literales exactos con espacios 'Super Admin' | 'Admin' |
 * 'Usuario' (case-insensitive y tolerante a espacios).
 */

const withRol = (rol: string): AuthUser => ({
  sub: '1',
  rol,
  rolNombre: rol,
  rolId: 1,
  nombre: 'Test',
  dni: '12345678',
  passwordResetRequired: false,
});

describe('isSuperAdmin', () => {
  test('true para el literal exacto "Super Admin"', () => {
    expect(isSuperAdmin(withRol('Super Admin'))).toBe(true);
  });

  test('false para Admin y Usuario', () => {
    expect(isSuperAdmin(withRol('Admin'))).toBe(false);
    expect(isSuperAdmin(withRol('Usuario'))).toBe(false);
  });

  test('tolera mayúsculas/minúsculas y espacios', () => {
    expect(isSuperAdmin(withRol('  SUPER ADMIN '))).toBe(true);
  });

  test('false para user nulo/indefinido', () => {
    expect(isSuperAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
  });
});

describe('isAdminOrSuperAdmin', () => {
  test('true para Admin y Super Admin', () => {
    expect(isAdminOrSuperAdmin(withRol('Admin'))).toBe(true);
    expect(isAdminOrSuperAdmin(withRol('Super Admin'))).toBe(true);
  });

  test('false para Usuario', () => {
    expect(isAdminOrSuperAdmin(withRol('Usuario'))).toBe(false);
  });

  test('tolera mayúsculas/minúsculas y espacios', () => {
    expect(isAdminOrSuperAdmin(withRol(' admin '))).toBe(true);
  });
});

describe('getRolNombre', () => {
  test('devuelve el literal recortado', () => {
    expect(getRolNombre(withRol('  Admin  '))).toBe('Admin');
  });

  test('prefiere rolNombre sobre rol', () => {
    const user = {...withRol('Admin'), rol: 'otro', rolNombre: 'Super Admin'};
    expect(getRolNombre(user)).toBe('Super Admin');
  });

  test('cadena vacía para user nulo', () => {
    expect(getRolNombre(null)).toBe('');
  });
});