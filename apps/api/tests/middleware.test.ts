import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { AdminUserRole, CompanyUserRole } from '@prisma/client';
import {
  publicPrincipal,
  requireAdminAuth,
  requireAuth,
  requireCompanyAuth,
  tenantScope,
} from '../src/middleware/requireAuth';
import { requireRole } from '../src/middleware/requireRole';
import { ForbiddenError, UnauthenticatedError } from '../src/lib/errors';
import type { AdminPrincipal, CompanyPrincipal } from '../src/types/principal';

const companyPrincipal: CompanyPrincipal = {
  type: 'company',
  id: 'user-1',
  companyId: 'company-1',
  role: CompanyUserRole.COMPANY_ADMIN,
  email: 'ops@tenant.test',
  name: 'Ops',
};

const adminPrincipal: AdminPrincipal = {
  type: 'admin',
  id: 'admin-1',
  role: AdminUserRole.ADMIN,
  email: 'admin@ma.test',
  name: 'Platform Admin',
};

function mockReq(session?: unknown): Request {
  return { session } as unknown as Request;
}
const mockRes = () => ({}) as Response;

describe('requireAuth', () => {
  it('attaches a typed principal when the session holds one', () => {
    const req = mockReq({ principal: companyPrincipal });
    const next = vi.fn() as unknown as NextFunction;
    requireAuth(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.principal).toEqual(companyPrincipal);
  });

  it('rejects a missing session with UNAUTHENTICATED', () => {
    const next = vi.fn();
    requireAuth(mockReq(undefined), mockRes(), next as unknown as NextFunction);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthenticatedError);
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a session with no principal', () => {
    const next = vi.fn();
    requireAuth(mockReq({}), mockRes(), next as unknown as NextFunction);
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthenticatedError);
  });

  it('rejects a malformed principal rather than trusting it', () => {
    const next = vi.fn();
    requireAuth(mockReq({ principal: { type: 'company' } }), mockRes(), next as unknown as NextFunction);
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthenticatedError);
  });
});

describe('principal-type narrowing', () => {
  it('requireCompanyAuth admits a company principal and rejects an admin one', () => {
    const ok = vi.fn();
    requireCompanyAuth(mockReq({ principal: companyPrincipal }), mockRes(), ok as unknown as NextFunction);
    expect(ok).toHaveBeenCalledWith();

    const bad = vi.fn();
    requireCompanyAuth(mockReq({ principal: adminPrincipal }), mockRes(), bad as unknown as NextFunction);
    expect(bad.mock.calls[0][0]).toBeInstanceOf(UnauthenticatedError);
  });

  it('requireAdminAuth admits an admin principal and rejects a company one', () => {
    const ok = vi.fn();
    requireAdminAuth(mockReq({ principal: adminPrincipal }), mockRes(), ok as unknown as NextFunction);
    expect(ok).toHaveBeenCalledWith();

    const bad = vi.fn();
    requireAdminAuth(mockReq({ principal: companyPrincipal }), mockRes(), bad as unknown as NextFunction);
    expect(bad.mock.calls[0][0]).toBeInstanceOf(UnauthenticatedError);
  });
});

describe('tenantScope', () => {
  it('returns the companyId from the authenticated principal', () => {
    const req = mockReq({ principal: companyPrincipal });
    req.principal = companyPrincipal;
    expect(tenantScope(req)).toEqual({ companyId: 'company-1' });
  });

  it('throws rather than defaulting when there is no company principal', () => {
    expect(() => tenantScope(mockReq(undefined))).toThrow(UnauthenticatedError);

    const adminReq = mockReq({ principal: adminPrincipal });
    adminReq.principal = adminPrincipal;
    expect(() => tenantScope(adminReq)).toThrow(UnauthenticatedError);
  });

  it('ignores anything the client might have put on the request body or query', () => {
    const req = {
      session: { principal: companyPrincipal },
      principal: companyPrincipal,
      body: { companyId: 'attacker-company' },
      query: { companyId: 'attacker-company' },
    } as unknown as Request;

    expect(tenantScope(req).companyId).toBe('company-1');
  });
});

describe('requireRole', () => {
  it('admits an allowed role', () => {
    const req = mockReq({ principal: companyPrincipal });
    req.principal = companyPrincipal;
    const next = vi.fn();
    requireRole(CompanyUserRole.COMPANY_ADMIN)(req, mockRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalledWith();
  });

  it('responds 403 for a role outside the allow-list', () => {
    const req = mockReq({ principal: companyPrincipal });
    req.principal = { ...companyPrincipal, role: CompanyUserRole.COMPANY_REQUESTER };
    const next = vi.fn();
    requireRole(CompanyUserRole.COMPANY_ADMIN)(req, mockRes(), next as unknown as NextFunction);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.status).toBe(403);
  });

  it('never matches an admin role against a company allow-list', () => {
    const req = mockReq({ principal: adminPrincipal });
    req.principal = adminPrincipal;
    const next = vi.fn();
    requireRole(CompanyUserRole.COMPANY_ADMIN, CompanyUserRole.COMPANY_REQUESTER)(
      req,
      mockRes(),
      next as unknown as NextFunction,
    );
    expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
  });

  it('requires authentication before a role can be checked', () => {
    const next = vi.fn();
    requireRole(AdminUserRole.ADMIN)(mockReq(undefined), mockRes(), next as unknown as NextFunction);
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthenticatedError);
  });
});

describe('publicPrincipal', () => {
  it('exposes only safe fields — never a password hash', () => {
    const withHash = { ...companyPrincipal, passwordHash: '$2b$12$nope' } as unknown as CompanyPrincipal;
    const projected = publicPrincipal(withHash);
    expect(JSON.stringify(projected)).not.toContain('passwordHash');
    expect(projected).toEqual({
      type: 'company',
      id: 'user-1',
      name: 'Ops',
      email: 'ops@tenant.test',
      role: CompanyUserRole.COMPANY_ADMIN,
      companyId: 'company-1',
    });
  });

  it('omits companyId for an admin principal', () => {
    expect(publicPrincipal(adminPrincipal)).not.toHaveProperty('companyId');
  });
});
