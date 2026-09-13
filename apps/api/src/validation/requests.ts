import { z } from 'zod';
import { PaymentMethod, RequestStatus, RequestType } from '@prisma/client';

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
    take: z.coerce.number().int().min(1).max(200).optional().default(100),
  })
  .strip();

export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;

/** Route params for the single-request endpoint. */
export const requestIdParamsSchema = z
  .object({ id: z.string().uuid('Not a valid request id.') })
  .strip();

export type RequestIdParams = z.infer<typeof requestIdParamsSchema>;
