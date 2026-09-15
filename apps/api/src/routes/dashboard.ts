import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { DocumentType, RequestStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';
import { emptyStatusCounts } from '../services/requestWorkflow';
import { paymentSummaryForCompany } from '../services/payments';

export const dashboardRouter = Router();

dashboardRouter.use(requireCompanyAuth);

/** Statuses that represent work still in flight. */
const OPEN_STATUSES: RequestStatus[] = [
  RequestStatus.SUBMITTED,
  RequestStatus.PENDING_PAYMENT,
  RequestStatus.APPROVED,
  RequestStatus.AT_LAB,
  RequestStatus.RESULTS_RECEIVED,
  RequestStatus.UNDER_REVIEW,
];

/** Statuses the company itself needs to act on. */
const PENDING_ACTION_STATUSES: RequestStatus[] = [RequestStatus.PENDING_PAYMENT];

const EXPIRING_WINDOW_DAYS = 30;

/**
 * GET /api/dashboard/company/summary
 *
 * Every figure is aggregated in the database from the tenant's own rows —
 * nothing is stored or cached, so a dashboard number can never drift from the
 * records it describes.
 *
 * TENANT ISOLATION: `companyId` comes from the session and appears in the where
 * clause of every query below, including the aggregates.
 */
dashboardRouter.get(
  '/company/summary',
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);

    const expiringCutoff = new Date();
    expiringCutoff.setDate(expiringCutoff.getDate() + EXPIRING_WINDOW_DAYS);

    const [
      employeeTotal,
      employeeActive,
      requestsByStatus,
      recentRequests,
      certificateTotal,
      expiringCertificates,
      payments,
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId } }),
      prisma.employee.count({ where: { companyId, active: true } }),
      prisma.request.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { _all: true },
      }),
      prisma.request.findMany({
        where: { companyId },
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
          employee: { select: { id: true, fullName: true, site: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.document.count({ where: { companyId, type: DocumentType.CERTIFICATE } }),
      prisma.document.findMany({
        where: {
          companyId,
          type: DocumentType.CERTIFICATE,
          expiryDate: { not: null, lte: expiringCutoff },
        },
        select: {
          id: true,
          fileName: true,
          expiryDate: true,
          request: { select: { id: true, employee: { select: { id: true, fullName: true } } } },
        },
        orderBy: { expiryDate: 'asc' },
        take: 10,
      }),
      paymentSummaryForCompany(companyId),
    ]);

    const byStatus = emptyStatusCounts();
    for (const row of requestsByStatus) byStatus[row.status] = row._count._all;

    const sum = (statuses: RequestStatus[]) =>
      statuses.reduce((total, status) => total + byStatus[status], 0);

    res.status(200).json({
      summary: {
        employees: { total: employeeTotal, active: employeeActive },
        requests: {
          total: Object.values(byStatus).reduce((a, b) => a + b, 0),
          open: sum(OPEN_STATUSES),
          pendingAction: sum(PENDING_ACTION_STATUSES),
          complete: byStatus[RequestStatus.COMPLETE],
          rejected: byStatus[RequestStatus.REJECTED],
          byStatus,
        },
        certificates: {
          total: certificateTotal,
          expiringWithinDays: EXPIRING_WINDOW_DAYS,
          expiringSoon: expiringCertificates.length,
        },
        payments,
      },
      recentRequests,
      expiringCertificates,
    });
  }),
);
