import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { validateParams, validateQuery } from '../middleware/validate';
import { getLab, listLabs } from '../services/labs';
import { labIdParamsSchema, listLabsQuerySchema } from '../validation/requests';
import type { LabIdParams, ListLabsQuery } from '../validation/requests';

export const labsRouter = Router();

/**
 * Laboratories are shared reference data, not tenant-owned — every company picks
 * from the same partner list — so this router uses plain `requireAuth` rather
 * than the company-scoped guard. It is still authenticated: the partner list is
 * not public.
 *
 * These routes are READ-ONLY by design. Creating, editing and deactivating labs
 * belongs to Medical Alliance staff and lives under /api/admin/labs, so a company
 * account has no route through which to modify the shared list.
 */
labsRouter.use(requireAuth);

/**
 * GET /api/labs — selectable laboratories.
 *
 * Defaults to active only, which is what a request form should offer.
 * `includeInactive=true` is honoured only for admin principals, so a company
 * cannot enumerate decommissioned partners.
 */
labsRouter.get(
  '/',
  validateQuery(listLabsQuerySchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { includeInactive } = res.locals.query as ListLabsQuery;
    const isAdmin = req.principal?.type === 'admin';

    const labs = await listLabs({ includeInactive: includeInactive && isAdmin });
    res.status(200).json({ labs });
  }),
);

/** GET /api/labs/:id — one laboratory's details. */
labsRouter.get(
  '/:id',
  validateParams(labIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { id } = res.locals.params as LabIdParams;
    const isAdmin = req.principal?.type === 'admin';

    const lab = await getLab(id, { includeInactive: isAdmin });
    res.status(200).json({ lab });
  }),
);
