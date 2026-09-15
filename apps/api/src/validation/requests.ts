import { z } from 'zod';
import { DocumentType, PaymentMethod, PaymentStatus, RequestStatus, RequestType } from '@prisma/client';

/**
 * Body accepted by POST /api/requests.
 *
 * There is deliberately NO `companyId` field. The tenant is derived from the
 * authenticated session, and `.strict()` rejects the key outright so a client
 * attempting to set it gets a 400 rather than having it silently ignored.
 */
export const createRequestSchema = z
  .object({
    employeeId: z.string().uuid('employeeId must be a valid identifier.'),
    type: z.nativeEnum(RequestType),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    assignedLabId: z.string().uuid('assignedLabId must be a valid identifier.').optional(),
    notes: z.string().trim().max(2000, 'Notes are too long.').optional(),
  })
  .strict();

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

/** Query string accepted by GET /api/requests. */
export const listRequestsQuerySchema = z
  .object({
    status: z.nativeEnum(RequestStatus).optional(),
    type: z.nativeEnum(RequestType).optional(),
    employeeId: z.string().uuid('employeeId must be a valid identifier.').optional(),
    search: z.string().trim().max(120).optional(),
    take: z.coerce.number().int().min(1).max(200).optional().default(100),
  })
  .strip();

export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;

/** Route params for the single-request endpoint. */
export const requestIdParamsSchema = z
  .object({ id: z.string().uuid('Not a valid request id.') })
  .strip();

export type RequestIdParams = z.infer<typeof requestIdParamsSchema>;

// ---------------------------------------------------------------------------
// Phase 2 — workflow, documents and payments
// ---------------------------------------------------------------------------

/**
 * PATCH /api/requests/:id/status and its admin counterpart.
 *
 * `status` is the TARGET status only. The server reads the current status from
 * the database inside the transaction and validates the move against the state
 * machine — a client can never set an arbitrary status, only request a move.
 */
export const transitionRequestSchema = z
  .object({
    status: z.nativeEnum(RequestStatus),
    note: z.string().trim().max(1000, 'Note is too long.').optional(),
    /** Required when moving to AT_LAB if no lab is assigned yet. */
    assignedLabId: z.string().uuid('assignedLabId must be a valid identifier.').optional(),
  })
  .strict();

export type TransitionRequestInput = z.infer<typeof transitionRequestSchema>;

/** PATCH /api/admin/requests/:id/lab */
export const assignLabSchema = z
  .object({ labId: z.string().uuid('labId must be a valid identifier.') })
  .strict();

export type AssignLabInput = z.infer<typeof assignLabSchema>;

/**
 * Metadata that accompanies a multipart document upload. The file itself is
 * parsed by multer; these are the text fields beside it.
 */
export const uploadDocumentSchema = z
  .object({
    type: z.nativeEnum(DocumentType).optional().default(DocumentType.ATTACHMENT),
    expiryDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')
      .transform((value) => new Date(`${value}T00:00:00Z`))
      .refine((d) => !Number.isNaN(d.getTime()), 'That is not a real date.')
      .optional(),
  })
  .strip();

export type UploadDocumentMetadata = z.infer<typeof uploadDocumentSchema>;

export const documentIdParamsSchema = z
  .object({ id: z.string().uuid('Not a valid document id.') })
  .strip();

export type DocumentIdParams = z.infer<typeof documentIdParamsSchema>;

/** GET /api/payments */
export const listPaymentsQuerySchema = z
  .object({
    status: z.nativeEnum(PaymentStatus).optional(),
    requestId: z.string().uuid().optional(),
  })
  .strip();

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;

export const paymentIdParamsSchema = z
  .object({ id: z.string().uuid('Not a valid payment id.') })
  .strip();

export type PaymentIdParams = z.infer<typeof paymentIdParamsSchema>;

/** POST /api/admin/payments/:id/settle — records an out-of-band settlement. */
export const settlePaymentSchema = z
  .object({
    providerReference: z.string().trim().max(200).optional(),
  })
  .strict();

export type SettlePaymentInput = z.infer<typeof settlePaymentSchema>;

/** GET /api/admin/requests — the cross-company queue's filters. */
export const adminListRequestsQuerySchema = z
  .object({
    status: z.nativeEnum(RequestStatus).optional(),
    type: z.nativeEnum(RequestType).optional(),
    companyId: z.string().uuid().optional(),
    take: z.coerce.number().int().min(1).max(200).optional().default(100),
  })
  .strip();

export type AdminListRequestsQuery = z.infer<typeof adminListRequestsQuerySchema>;

/** GET /api/labs */
export const listLabsQuerySchema = z
  .object({
    includeInactive: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((v) => v === 'true'),
  })
  .strip();

export type ListLabsQuery = z.infer<typeof listLabsQuerySchema>;

export const labIdParamsSchema = z
  .object({ id: z.string().uuid('Not a valid laboratory id.') })
  .strip();

export type LabIdParams = z.infer<typeof labIdParamsSchema>;
