import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { AdminUserRole, DocumentType, RequestStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { ValidationError } from '../lib/errors';
import { requireAdminAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { singleDocumentUpload } from '../middleware/upload';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { countByStatus, emptyStatusCounts } from '../services/requestWorkflow';
import {
  assignLab,
  getRequestDetail,
  requestListSelect,
  transitionRequest,
  transitionsAvailableTo,
} from '../services/requests';
import { uploadDocument } from '../services/documents';
import { listLabs } from '../services/labs';
import { markPaymentPaid } from '../services/payments';
import {
  adminListRequestsQuerySchema,
  assignLabSchema,
  paymentIdParamsSchema,
  requestIdParamsSchema,
  settlePaymentSchema,
  transitionRequestSchema,
  uploadDocumentSchema,
} from '../validation/requests';
import type {
  AdminListRequestsQuery,
  AssignLabInput,
  PaymentIdParams,
  RequestIdParams,
  SettlePaymentInput,
  TransitionRequestInput,
} from '../validation/requests';

export const adminRouter = Router();

/**
 * The Medical Alliance staff console.
 *
 * These routes are deliberately NOT tenant-scoped — operating the clinical
 * pipeline means seeing every company's queue. That is exactly why they sit
 * behind a separate identity table (AdminUser), a separate login endpoint, and
 * `requireAdminAuth`, which rejects a company session with 401 before any
 * handler or query runs. A company account has no path to these endpoints.
 *
 * Role split: REVIEWER is clinical (read the queue, move a request through
 * review) while ADMIN additionally handles commercial and configuration actions
 * (settle payments, manage laboratories).
 */
adminRouter.use(requireAdminAuth);

const READ_ROLES = [AdminUserRole.ADMIN, AdminUserRole.REVIEWER] as const;

/** GET /api/admin/companies — the cross-company register. */
adminRouter.get(
  '/companies',
  requireRole(...READ_ROLES),
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

/**
 * GET /api/admin/requests — the cross-company queue.
 *
 * Readable by both admin roles: a reviewer cannot do their job without seeing
 * the work waiting for them.
 */
adminRouter.get(
  '/requests',
  requireRole(...READ_ROLES),
  validateQuery(adminListRequestsQuerySchema),
  errorHandlerSafe(async (_req: ExpressRequest, res: Response) => {
    const { status, type, companyId, take } = res.locals.query as AdminListRequestsQuery;

    const requests = await prisma.request.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(companyId ? { companyId } : {}),
      },
      select: {
        ...requestListSelect,
        company: { select: { id: true, legalName: true, billingType: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    res.status(200).json({
      requests,
      summary: { total: requests.length, byStatus: countByStatus(requests) },
    });
  }),
);

/** GET /api/admin/requests/:id — full detail for review, any company. */
adminRouter.get(
  '/requests/:id',
  requireRole(...READ_ROLES),
  validateParams(requestIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { id } = res.locals.params as RequestIdParams;

    // No companyScope: admins legitimately read across tenants.
    const request = await getRequestDetail(id);

    res.status(200).json({
      request,
      availableTransitions: transitionsAvailableTo(req.principal!, request.status),
    });
  }),
);

/**
 * PATCH /api/admin/requests/:id/status — drive the clinical workflow.
 *
 * Both admin roles may move requests: this is the reviewer's core job. The move
 * is still validated against the state machine and the actor matrix inside the
 * service transaction, and every change appends a RequestStatusEvent.
 */
adminRouter.patch(
  '/requests/:id/status',
  requireRole(...READ_ROLES),
  validateParams(requestIdParamsSchema),
  validateBody(transitionRequestSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { id } = res.locals.params as RequestIdParams;
    const body = req.body as TransitionRequestInput;

    const request = await transitionRequest({
      requestId: id,
      toStatus: body.status,
      principal: req.principal!,
      ...(body.note ? { note: body.note } : {}),
      ...(body.assignedLabId ? { assignedLabId: body.assignedLabId } : {}),
    });

    res.status(200).json({
      request,
      availableTransitions: transitionsAvailableTo(req.principal!, request.status),
    });
  }),
);

/** PATCH /api/admin/requests/:id/lab — assign or change the laboratory. */
adminRouter.patch(
  '/requests/:id/lab',
  requireRole(...READ_ROLES),
  validateParams(requestIdParamsSchema),
  validateBody(assignLabSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { id } = res.locals.params as RequestIdParams;
    const { labId } = req.body as AssignLabInput;

    const request = await assignLab({ requestId: id, labId });
    res.status(200).json({ request });
  }),
);

/**
 * POST /api/admin/requests/:id/documents — upload a clinical output.
 *
 * This is where RESULT and CERTIFICATE documents come from. The company-facing
 * upload route refuses both types, so a certificate can only ever be issued by
 * Medical Alliance staff.
 */
adminRouter.post(
  '/requests/:id/documents',
  requireRole(...READ_ROLES),
  validateParams(requestIdParamsSchema),
  singleDocumentUpload,
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { id } = res.locals.params as RequestIdParams;

    const file = req.file;
    if (!file) {
      throw new ValidationError('Attach a file on the "file" field.', [
        { path: 'file', message: 'A file is required.' },
      ]);
    }

    const metadata = uploadDocumentSchema.parse(req.body ?? {});
    if (metadata.type === DocumentType.CERTIFICATE && !metadata.expiryDate) {
      throw new ValidationError('A certificate needs an expiry date.', [
        { path: 'expiryDate', message: 'Required for a certificate.' },
      ]);
    }

    // No companyScope: the document still inherits the parent request's
    // companyId, so the owning tenant can read it and no other tenant can.
    const document = await uploadDocument({
      requestId: id,
      type: metadata.type,
      fileName: file.originalname,
      contentType: file.mimetype,
      body: file.buffer,
      principal: req.principal!,
      ...(metadata.expiryDate ? { expiryDate: metadata.expiryDate } : {}),
    });

    res.status(201).json({ document });
  }),
);

/** GET /api/admin/labs — the full partner list, including deactivated ones. */
adminRouter.get(
  '/labs',
  requireRole(...READ_ROLES),
  errorHandlerSafe(async (_req: ExpressRequest, res: Response) => {
    const labs = await listLabs({ includeInactive: true });
    res.status(200).json({ labs });
  }),
);

/**
 * POST /api/admin/payments/:id/settle — record an out-of-band settlement.
 *
 * ADMIN only: this is a commercial action, not a clinical one, so a REVIEWER
 * cannot mark money received.
 *
 * NO PAYMENT PROVIDER IS INTEGRATED. This records a settlement that happened
 * elsewhere (bank transfer, invoice run); it does not capture funds and does not
 * pretend a gateway confirmed anything.
 */
adminRouter.post(
  '/payments/:id/settle',
  requireRole(AdminUserRole.ADMIN),
  validateParams(paymentIdParamsSchema),
  validateBody(settlePaymentSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { id } = res.locals.params as PaymentIdParams;
    const body = req.body as SettlePaymentInput;

    const payment = await markPaymentPaid({
      paymentId: id,
      ...(body.providerReference ? { providerReference: body.providerReference } : {}),
    });

    res.status(200).json({ payment });
  }),
);

/** GET /api/admin/dashboard/summary — the platform-wide operational picture. */
adminRouter.get(
  '/dashboard/summary',
  requireRole(...READ_ROLES),
  errorHandlerSafe(async (_req: ExpressRequest, res: Response) => {
    const [byStatusRows, companies, labs, employees, awaitingReview] = await Promise.all([
      prisma.request.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.company.count(),
      prisma.lab.count({ where: { active: true } }),
      prisma.employee.count(),
      prisma.request.count({
        where: { status: { in: [RequestStatus.RESULTS_RECEIVED, RequestStatus.UNDER_REVIEW] } },
      }),
    ]);

    const byStatus = emptyStatusCounts();
    for (const row of byStatusRows) byStatus[row.status] = row._count._all;

    res.status(200).json({
      summary: {
        companies,
        activeLabs: labs,
        employees,
        awaitingReview,
        requests: {
          total: Object.values(byStatus).reduce((a, b) => a + b, 0),
          byStatus,
        },
      },
    });
  }),
);
