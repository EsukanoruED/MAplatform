import type { AdminUserRole, CompanyUserRole } from '@prisma/client';

/**
 * The authenticated actor, reconstructed from the server-side session on every
 * request. A company principal always carries the `companyId` the session was
 * issued for; that field is the ONLY source of tenant scope in the API and is
 * never read from a request body, query string or header.
 */
export type CompanyPrincipal = {
  type: 'company';
  id: string;
  companyId: string;
  role: CompanyUserRole;
  email: string;
  name: string;
};

export type AdminPrincipal = {
  type: 'admin';
  id: string;
  /** Admin users are not tenant-scoped. Present and always undefined for symmetry. */
  companyId?: undefined;
  role: AdminUserRole;
  email: string;
  name: string;
};

export type Principal = CompanyPrincipal | AdminPrincipal;

export type PrincipalRole = CompanyUserRole | AdminUserRole;

export function isCompanyPrincipal(p: Principal): p is CompanyPrincipal {
  return p.type === 'company';
}

export function isAdminPrincipal(p: Principal): p is AdminPrincipal {
  return p.type === 'admin';
}
