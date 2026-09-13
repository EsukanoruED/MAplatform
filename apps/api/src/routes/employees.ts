import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { prisma } from '../lib/prisma';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';

export const employeesRouter = Router();

employeesRouter.use(requireCompanyAuth);

/**
 * GET /api/employees — the tenant's own workers, so the portal can offer a real
 * employee picker when filing a request.
 *
 * TENANT ISOLATION: `companyId` is taken from the authenticated session and
 * applied in the Prisma where clause.
 */
employeesRouter.get(
  '/',
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);

    const employees = await prisma.employee.findMany({
      where: { companyId, active: true },
      // nationalId and dateOfBirth are deliberately NOT selected: the portal's
      // request flow does not need them, and they are the most sensitive columns
      // on the table.
      select: { id: true, fullName: true, role: true, site: true },
      orderBy: { fullName: 'asc' },
    });

    res.status(200).json({ employees });
  }),
);
