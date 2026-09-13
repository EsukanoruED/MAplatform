import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { CompanyUserRole, RequestStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { ForbiddenTenantAccessError, NotFoundError } from '../lib/errors';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { actorTypeFor, countByStatus } from '../services/requestWorkflow';
import {
  createRequestSchema,
  listRequestsQuerySchema,
  requestIdParamsSchema,
} from '../validation/requests';
import type { CreateRequestInput, ListRequestsQuery, RequestIdParams } from '../validation/requests';

export const requestsRouter = Router();

/**
 * The projection returned to clients. Explicit, so adding a column to the schema
 * never silently widens the API surface.
 */
const requestSelect = {
  id: true,
  companyId: true,
  employeeId: true,
  type: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  assignedLabId: true,
  createdByUserId: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  employee: { select: { id: true, fullName: true, site: true, role: true } },
  assignedLab: { select: { id: true, name: true } },
} as const;

// Every route below is behind requireCompanyAuth, so req.principal is a company
// principal and tenantScope(req) is always available.
requestsRouter.use(requireCompanyAuth);

/**
 * GET /api/requests — the tenant's own requests.
 *
 * TENANT ISOLATION: `companyId` comes from `tenantScope(req)`, which reads the
 * authenticated server-side session and throws if there is no company principal.
 * It is spread into the Prisma `where` clause, so the database never returns
 * another company's rows — no post-query filtering is involved, and no query
 * parameter can widen the scope.
 */
requestsRouter.get(
  '/',
  validateQuery(listRequestsQuerySchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { status, type, take } = res.locals.query as ListRequestsQuery;

    const rows = await prisma.request.findMany({
      where: {
        companyId, // <- from the session, never from the client
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      select: requestSelect,
      orderBy: { createdAt: 'desc' },
      take,
    });

    res.status(200).json({
      requests: rows,
      summary: { total: rows.length, byStatus: countByStatus(rows) },
    });
  }),
);

/**
 * GET /api/requests/:id — one request, scoped to the tenant.
 *
 * Uses findFirst with the companyId in the where clause rather than findUnique
 * by id: another company's request id resolves to no row and is reported as 404,
 * so the endpoint never confirms that an id exists elsewhere.
 */
requestsRouter.get(
  '/:id',
  validateParams(requestIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as RequestIdParams;

    const row = await prisma.request.findFirst({
      where: { id, companyId },
      select: {
        ...requestSelect,
        statusEvents: {
          select: { id: true, fromStatus: true, toStatus: true, changedByType: true, changedAt: true },
          orderBy: { changedAt: 'asc' },
        },
      },
    });
    if (!row) throw new ForbiddenTenantAccessError('No request with that id in your company.');

    res.status(200).json({ request: row });
  }),
);

/**
 * POST /api/requests — create a request for one of the tenant's own employees.
 *
 * TENANT ISOLATION, two layers:
 *  1. The employee is looked up with the session's companyId in the where clause,
 *     so a request can never be filed against another company's worker.
 *  2. The row is written with that same session-derived companyId. The zod schema
 *     is `.strict()` and has no companyId field, so a client that sends one is
 *     rejected with 400 instead of having it ignored.
 */
requestsRouter.post(
  '/',
  requireRole(CompanyUserRole.COMPANY_ADMIN, CompanyUserRole.COMPANY_REQUESTER),
  validateBody(createRequestSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const principal = req.principal!;
    const body = req.body as CreateRequestInput;

    const employee = await prisma.employee.findFirst({
      where: { id: body.employeeId, companyId }, // <- tenant-scoped lookup
      select: { id: true },
    });
    if (!employee) {
      throw new ForbiddenTenantAccessError('No employee with that id in your company.');
    }

    if (body.assignedLabId) {
      const lab = await prisma.lab.findFirst({
        where: { id: body.assignedLabId, active: true },
        select: { id: true },
      });
      if (!lab) throw new NotFoundError('No active lab with that id.');
    }

    const created = await prisma.$transaction(async (tx) => {
      const request = await tx.request.create({
        data: {
          companyId, // <- from the session, never from the client
          employeeId: employee.id,
          type: body.type,
          status: RequestStatus.SUBMITTED,
          ...(body.paymentMethod ? { paymentMethod: body.paymentMethod } : {}),
          ...(body.assignedLabId ? { assignedLabId: body.assignedLabId } : {}),
          ...(body.notes ? { notes: body.notes } : {}),
          createdByUserId: principal.id,
        },
        select: requestSelect,
      });

      // Opening entry on the audit trail.
      await tx.requestStatusEvent.create({
        data: {
          requestId: request.id,
          fromStatus: null,
          toStatus: RequestStatus.SUBMITTED,
          changedByType: actorTypeFor('company'),
          changedById: principal.id,
        },
      });

      return request;
    });

    res.status(201).json({ request: created });
  }),
);
