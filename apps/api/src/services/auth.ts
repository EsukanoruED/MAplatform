import bcrypt from 'bcryptjs';
import type { AdminUser, CompanyUser } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { AdminPrincipal, CompanyPrincipal } from '../types/principal';

/**
 * bcrypt cost factor. The security plan requires >= 12.
 *
 * NOTE: this project uses `bcryptjs` (a pure-JavaScript bcrypt) rather than the
 * native `bcrypt` addon. Same algorithm and hash format, no node-gyp toolchain
 * needed to install or deploy. Cost 12 is measurably slower in pure JS, so the
 * test environment drops to the bcrypt minimum to keep the suite fast — it never
 * does so outside NODE_ENV=test.
 */
export const BCRYPT_COST = process.env.NODE_ENV === 'test' ? 4 : 12;

export async function hashPassword(plaintext: string): Promise<string> {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('hashPassword requires a non-empty password.');
  }
  return bcrypt.hash(plaintext, BCRYPT_COST);
}

/**
 * Constant-time-ish comparison of a plaintext against a stored bcrypt hash.
 * Returns false rather than throwing for a malformed or empty hash, so a
 * corrupt row can never be treated as a successful login.
 */
export async function verifyPassword(plaintext: string, passwordHash: string): Promise<boolean> {
  if (!plaintext || !passwordHash) return false;
  try {
    return await bcrypt.compare(plaintext, passwordHash);
  } catch {
    return false;
  }
}

/**
 * A bcrypt hash of a value no one holds. Compared against when an email does not
 * exist, so a missing account costs the same wall-clock time as a wrong password
 * and cannot be distinguished by timing.
 */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.7yZ1Z3Q1Vn9pK0kq4kQ0oFqvQ1qGq0y';

export async function findCompanyUserByEmail(email: string): Promise<CompanyUser | null> {
  return prisma.companyUser.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function findAdminUserByEmail(email: string): Promise<AdminUser | null> {
  return prisma.adminUser.findUnique({ where: { email: normalizeEmail(email) } });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Verify a company login. Returns the principal on success and `null` on any
 * failure — unknown email, wrong password, or a deactivated account. The caller
 * must not distinguish between those cases in its response.
 */
export async function verifyCompanyLogin(email: string, password: string): Promise<CompanyPrincipal | null> {
  const user = await findCompanyUserByEmail(email);
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.active) return null;

  return {
    type: 'company',
    id: user.id,
    companyId: user.companyId,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

/** Verify a platform-staff login against the separate AdminUser table. */
export async function verifyAdminLogin(email: string, password: string): Promise<AdminPrincipal | null> {
  const user = await findAdminUserByEmail(email);
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.active) return null;

  return {
    type: 'admin',
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

export async function recordCompanyLogin(id: string): Promise<void> {
  await prisma.companyUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
}

export async function recordAdminLogin(id: string): Promise<void> {
  await prisma.adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
}
