import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthenticatedError } from '../lib/errors';
import type { PrincipalRole } from '../types/principal';

/**
 * Higher-order middleware gating a route on the principal's role.
 * Must be mounted after `requireAuth`. Responds 403 when the role is not allowed.
 *
 * Roles are namespaced by principal type in the schema (COMPANY_* vs ADMIN /
 * REVIEWER), so an allow-list can never accidentally match across the two
 * identity tables.
 */
export function requireRole(...allowed: PrincipalRole[]) {
  const allowedSet = new Set<string>(allowed);
  return function roleGuard(req: Request, _res: Response, next: NextFunction): void {
    const principal = req.principal;
    if (!principal) {
      next(new UnauthenticatedError('You must be signed in to access this resource.'));
      return;
    }
    if (!allowedSet.has(principal.role)) {
      next(new ForbiddenError(`This action requires one of: ${allowed.join(', ')}.`));
      return;
    }
    next();
  };
}
