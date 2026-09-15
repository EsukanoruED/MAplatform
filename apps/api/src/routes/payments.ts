import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';
import { validateQuery } from '../middleware/validate';
import { listPaymentsForCompany, paymentSummaryForCompany } from '../services/payments';
import { listPaymentsQuerySchema } from '../validation/requests';
import type { ListPaymentsQuery } from '../validation/requests';

export const paymentsRouter = Router();

/**
 * Company-facing billing.
 *
 * READ-ONLY by design. Settling a payment is an admin action
 * (POST /api/admin/payments/:id/settle) precisely because a company must not be
 * able to mark its own invoice paid. When a real gateway is integrated, its
 * webhook will call the same service function the admin route calls.
 */
paymentsRouter.use(requireCompanyAuth);

/** GET /api/payments — the tenant's own ledger, with totals. */
paymentsRouter.get(
  '/',
  validateQuery(listPaymentsQuerySchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { status, requestId } = res.locals.query as ListPaymentsQuery;

    const [payments, summary] = await Promise.all([
      listPaymentsForCompany(companyId, { status, requestId }),
      paymentSummaryForCompany(companyId),
    ]);

    res.status(200).json({ payments, summary });
  }),
);
