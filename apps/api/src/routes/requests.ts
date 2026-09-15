import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { CompanyUserRole, DocumentType } from '@prisma/client';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { ValidationError } from '../lib/errors';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { singleDocumentUpload } from '../middleware/upload';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { countByStatus } from '../services/requestWorkflow';
import {
  createRequest,
  getRequestDetail,
  listRequestsForCompany,
  transitionRequest,
  transitionsAvailableTo,
} from '../services/requests';
import { listDocumentsForRequest, uploadDocument } from '../services/documents';
import { listPaymentsForCompany } from '../services/payments';
import {
  createRequestSchema,
  listRequestsQuerySchema,
  requestIdParamsSchema,
  transitionRequestSchema,
  uploadDocumentSchema,
} from '../validation/requests';
import type {
  CreateRequestInput,
  ListRequestsQuery,
  RequestIdParams,
  TransitionRequestInput,
} from '../validation/requests';

export const requestsRouter = Router();

/**
 * The company-facing request API.
 *
 * TENANT ISOLATION: every handler derives `companyId` from `tenantScope(req)` —
 * the authenticated server-side session — and passes it to the service layer as
 * the tenant scope. No handler accepts a companyId from the body, query or path;
 * the zod schemas are `.strict()` and have no such field, so sending one is a
 * 400 rather than a silent no-op.
 */
requestsRouter.use(requireCompanyAuth);

/** GET /api/requests — the tenant's own requests, with a status summary. */
requestsRouter.get(
  '/',
  validateQuery(listRequestsQuerySchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { status, type, employeeId, search, take } = res.locals.query as ListRequestsQuery;

    const rows = await listRequestsForCompany(companyId, { status, type, employeeId, search, take });

    res.status(200).json({
      requests: rows,
      summary: { total: rows.length, byStatus: countByStatus(rows) },
    });
  }),
);

/** POST /api/requests — file a checkup or fitness-certificate request. */
requestsRouter.post(
  '/',
  requireRole(CompanyUserRole.COMPANY_ADMIN, CompanyUserRole.COMPANY_REQUESTER),
  validateBody(createRequestSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const body = req.body as CreateRequestInput;

    const request = await createRequest(companyId, req.principal!, {
      employeeId: body.employeeId,
      type: body.type,
      ...(body.assignedLabId ? { assignedLabId: body.assignedLabId } : {}),
      ...(body.notes ? { notes: body.notes } : {}),
    });

    res.status(201).json({ request });
  }),
);

/**
 * GET /api/requests/:id — full detail, including the persisted status timeline,
 * documents, payments and lab dispatches.
 *
 * `availableTransitions` tells the UI which workflow actions this principal may
 * actually perform — the same matrix the write endpoint enforces, so the buttons
 * shown and the permissions applied cannot drift apart.
 */
requestsRouter.get(
  '/:id',
  validateParams(requestIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as RequestIdParams;

    const request = await getRequestDetail(id, companyId);

    res.status(200).json({
      request,
      availableTransitions: transitionsAvailableTo(req.principal!, request.status),
    });
  }),
);

/**
 * PATCH /api/requests/:id/status — request a workflow move.
 *
 * The body names a TARGET status only. The service re-reads the current status
 * inside its transaction and validates the move against both the state machine
 * and the actor-permission matrix, so a company user cannot drive a request
 * through the clinical pipeline — in practice the only move available to them is
 * withdrawing a request they have just filed.
 */
requestsRouter.patch(
  '/:id/status',
  requireRole(CompanyUserRole.COMPANY_ADMIN, CompanyUserRole.COMPANY_REQUESTER),
  validateParams(requestIdParamsSchema),
  validateBody(transitionRequestSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as RequestIdParams;
    const body = req.body as TransitionRequestInput;

    const request = await transitionRequest({
      requestId: id,
      toStatus: body.status,
      principal: req.principal!,
      companyScope: companyId, // <- confines the transition to the tenant's own rows
      ...(body.note ? { note: body.note } : {}),
      ...(body.assignedLabId ? { assignedLabId: body.assignedLabId } : {}),
    });

    res.status(200).json({
      request,
      availableTransitions: transitionsAvailableTo(req.principal!, request.status),
    });
  }),
);

/** GET /api/requests/:id/documents — files attached to one of the tenant's requests. */
requestsRouter.get(
  '/:id/documents',
  validateParams(requestIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as RequestIdParams;

    const documents = await listDocumentsForRequest(id, companyId);
    res.status(200).json({ documents });
  }),
);

/**
 * POST /api/requests/:id/documents — attach a supporting file.
 *
 * A company may attach supporting paperwork (ATTACHMENT) only. RESULT and
 * CERTIFICATE are clinical outputs issued by Medical Alliance, so a company
 * cannot upload its own certificate: that route is admin-only.
 */
requestsRouter.post(
  '/:id/documents',
  requireRole(CompanyUserRole.COMPANY_ADMIN, CompanyUserRole.COMPANY_REQUESTER),
  validateParams(requestIdParamsSchema),
  singleDocumentUpload,
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as RequestIdParams;

    const file = req.file;
    if (!file) {
      throw new ValidationError('Attach a file on the "file" field.', [
        { path: 'file', message: 'A file is required.' },
      ]);
    }

    const metadata = uploadDocumentSchema.parse(req.body ?? {});
    if (metadata.type !== DocumentType.ATTACHMENT) {
      throw new ValidationError(
        'Companies may upload supporting attachments only. Results and certificates are issued by Medical Alliance.',
        [{ path: 'type', message: 'Only ATTACHMENT is permitted here.' }],
      );
    }

    const document = await uploadDocument({
      requestId: id,
      type: DocumentType.ATTACHMENT,
      fileName: file.originalname,
      contentType: file.mimetype,
      body: file.buffer,
      principal: req.principal!,
      companyScope: companyId, // <- the upload cannot target another tenant's request
    });

    res.status(201).json({ document });
  }),
);

/** GET /api/requests/:id/payments — the ledger rows for one request. */
requestsRouter.get(
  '/:id/payments',
  validateParams(requestIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as RequestIdParams;

    // Confirms the request belongs to this tenant before exposing its payments.
    await getRequestDetail(id, companyId);
    const payments = await listPaymentsForCompany(companyId, { requestId: id });

    res.status(200).json({ payments });
  }),
);
