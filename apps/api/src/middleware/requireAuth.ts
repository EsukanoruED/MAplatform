import type { NextFunction, Request, Response } from 'express';
import { UnauthenticatedError } from '../lib/errors';
import type { CompanyPrincipal, Principal } from '../types/principal';

/**
 * Reads the server-side session and attaches a typed `req.principal`.
 * Responds 401 with the standard error shape when there is no valid session.
 *
 * The principal — including `companyId` — comes from the session store, never
 * from anything the client can set.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const principal = req.session?.principal;
  if (!principal || !principal.type || !principal.id) {
    next(new UnauthenticatedError('You must be signed in to access this resource.'));
    return;
  }
  req.principal = principal;
  next();
}

/** `requireAuth` narrowed to company principals — the tenant-scoped routes. */
export function requireCompanyAuth(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.principal?.type !== 'company') {
      return next(new UnauthenticatedError('This endpoint requires a company account.'));
    }
    next();
  });
}

/** `requireAuth` narrowed to platform-staff principals. */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.principal?.type !== 'admin') {
      return next(new UnauthenticatedError('This endpoint requires a Medical Alliance staff account.'));
    }
    next();
  });
}

/**
 * The tenant scope for the current request. Every company-scoped Prisma query
 * must take its `companyId` from here. Throws rather than returning a fallback,
 * so a missing principal can never silently widen a query to all tenants.
 */
export function tenantScope(req: Request): { companyId: string } {
  const principal = req.principal;
  if (!principal || principal.type !== 'company') {
    throw new UnauthenticatedError('No company principal on this request.');
  }
  return { companyId: (principal as CompanyPrincipal).companyId };
}

/** The safe, client-facing projection of a principal. Never includes a password hash. */
export function publicPrincipal(principal: Principal) {
  return principal.type === 'company'
    ? {
        type: principal.type,
        id: principal.id,
        name: principal.name,
        email: principal.email,
        role: principal.role,
        companyId: principal.companyId,
      }
    : {
        type: principal.type,
        id: principal.id,
        name: principal.name,
        email: principal.email,
        role: principal.role,
      };
}
