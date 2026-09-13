import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { AdminUserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireAdminAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { countByStatus } from '../services/requestWorkflow';

export const adminRouter = Router();

// Admin-only. A company session reaching these routes gets 401 from
// requireAdminAuth before any handler or query runs.
adminRouter.use(requireAdminAuth);

/**
 * GET /api/admin/companies — the cross-company register.
 *
 * This is the one endpoint that is deliberately NOT tenant-scoped, which is why
 * it sits behind a separate identity table (AdminUser) and its own middleware.
 */
adminRouter.get(
  '/companies',
  requireRole(AdminUserRole.ADMIN, AdminUserRole.REVIEWER),
  errorHandlerSafe(async (_req: ExpressRequest, res: Response) => {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        legalName: true,
        billingType: true,
        status: true,
        createdAt: true,
        _count: { select: { users: true, employees: true, requests: true } },
      },
      orderBy: { legalName: 'asc' },
    });
    res.status(200).json({ companies });
  }),
);

/** GET /api/admin/requests — the cross-company queue, ADMIN only. */
adminRouter.get(
  '/requests',
  requireRole(AdminUserRole.ADMIN),
  errorHandlerSafe(async (_req: ExpressRequest, res: Response) => {
    const requests = await prisma.request.findMany({
      select: {
        id: true,
        companyId: true,
        type: true,
        status: true,
        createdAt: true,
        company: { select: { id: true, legalName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.status(200).json({
      requests,
      summary: { total: requests.length, byStatus: countByStatus(requests) },
    });
  }),
);
