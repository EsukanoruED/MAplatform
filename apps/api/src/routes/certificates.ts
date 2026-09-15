import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { RequestType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';
import { listCertificatesForCompany } from '../services/documents';
import { requestListSelect } from '../services/requests';

export const certificatesRouter = Router();

certificatesRouter.use(requireCompanyAuth);

/**
 * GET /api/certificates — the company's fitness-certificate register.
 *
 * Returns EVERY fitness-certificate request the company has filed, plus the
 * certificate documents issued against them. The client pairs the two by
 * requestId, so each request appears exactly once — with its certificate if one
 * has been issued, and with its workflow status if not.
 *
 * Listing only issued certificates would misrepresent coverage twice over: an
 * in-flight examination would be invisible, and so would a request that
 * completed without a certificate on file.
 *
 * TENANT ISOLATION: both queries filter on the session's companyId. Document
 * carries its own companyId column, so the certificate query does not depend on
 * a join to be tenant-safe.
 */
certificatesRouter.get(
  '/',
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);

    const [certificates, requests] = await Promise.all([
      listCertificatesForCompany(companyId),
      prisma.request.findMany({
        where: { companyId, type: RequestType.FITNESS_CERTIFICATE },
        select: requestListSelect,
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ]);

    res.status(200).json({ certificates, requests });
  }),
);
