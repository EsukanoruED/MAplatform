import { BillingType, PaymentMethod, PaymentStatus, RequestType } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { env } from '../env';
import { prisma } from '../lib/prisma';
import { ForbiddenTenantAccessError, ValidationError } from '../lib/errors';

/**
 * Billing foundation.
 *
 * NO PAYMENT PROVIDER IS INTEGRATED. Phase 2 models the money without moving
 * any: a Payment row records what is owed, in which currency, under which
 * billing arrangement, and whether it has been settled. `markPaid` is the seam a
 * real provider's webhook would call once integrated — it is deliberately
 * ADMIN-ONLY at the route layer so a company cannot mark its own invoice paid.
 */

/** Price for a request type, in minor units (halalas). */
export function priceForRequestType(type: RequestType): number {
  return type === RequestType.FITNESS_CERTIFICATE
    ? env.billing.certificatePriceMinor
    : env.billing.checkupPriceMinor;
}

/**
 * How a company's billing type maps onto a new request.
 *
 * PER_REQUEST  — the request is gated on payment, so it enters PENDING_PAYMENT.
 * SETTLEMENT   — the company is invoiced periodically; the request is not gated,
 *                but a ledger row is still written so the settlement run has it.
 */
export function paymentPlanFor(billingType: BillingType, type: RequestType) {
  const amountMinor = priceForRequestType(type);
  return billingType === BillingType.SETTLEMENT
    ? {
        method: PaymentMethod.SETTLEMENT,
        requestPaymentStatus: PaymentStatus.NOT_REQUIRED,
        ledgerStatus: PaymentStatus.PENDING,
        gatesApproval: false,
        amountMinor,
      }
    : {
        method: PaymentMethod.PER_REQUEST,
        requestPaymentStatus: PaymentStatus.PENDING,
        ledgerStatus: PaymentStatus.PENDING,
        gatesApproval: true,
        amountMinor,
      };
}

export const paymentSelect = {
  id: true,
  companyId: true,
  requestId: true,
  amountMinor: true,
  currency: true,
  method: true,
  status: true,
  providerReference: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Creates the ledger row that accompanies a new request. */
export async function createRequestPayment(
  tx: Prisma.TransactionClient,
  input: {
    companyId: string;
    requestId: string;
    billingType: BillingType;
    type: RequestType;
  },
) {
  const plan = paymentPlanFor(input.billingType, input.type);
  return tx.payment.create({
    data: {
      companyId: input.companyId,
      requestId: input.requestId,
      amountMinor: plan.amountMinor,
      currency: env.billing.currency,
      method: plan.method,
      status: plan.ledgerStatus,
    },
    select: paymentSelect,
  });
}

/** Company-scoped payment list. `companyId` always comes from the session. */
export async function listPaymentsForCompany(
  companyId: string,
  filters: { status?: PaymentStatus; requestId?: string } = {},
) {
  return prisma.payment.findMany({
    where: {
      companyId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.requestId ? { requestId: filters.requestId } : {}),
    },
    select: {
      ...paymentSelect,
      request: { select: { id: true, type: true, status: true, employee: { select: { fullName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

/**
 * Marks a payment settled and syncs the parent request's paymentStatus.
 *
 * Called by the admin route today; a provider webhook would call the same
 * function once a gateway is integrated. `providerReference` is whatever the
 * provider gives back — null in development, which is why this never pretends
 * to be a real confirmation.
 */
export async function markPaymentPaid(input: {
  paymentId: string;
  providerReference?: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    select: { id: true, status: true, requestId: true },
  });
  if (!payment) throw new ForbiddenTenantAccessError('No payment with that id.');
  if (payment.status === PaymentStatus.PAID) {
    throw new ValidationError('That payment is already settled.');
  }
  if (payment.status === PaymentStatus.REFUNDED) {
    throw new ValidationError('A refunded payment cannot be marked paid.');
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        ...(input.providerReference ? { providerReference: input.providerReference } : {}),
      },
      select: paymentSelect,
    });

    // Keep the denormalised status on Request in step with the ledger.
    if (payment.requestId) {
      await tx.request.update({
        where: { id: payment.requestId },
        data: { paymentStatus: PaymentStatus.PAID },
      });
    }

    return updated;
  });
}

/** Aggregate owed/settled totals for a company's dashboard. */
export async function paymentSummaryForCompany(companyId: string) {
  const grouped = await prisma.payment.groupBy({
    by: ['status'],
    where: { companyId },
    _sum: { amountMinor: true },
    _count: { _all: true },
  });

  const summary = {
    currency: env.billing.currency,
    outstandingMinor: 0,
    settledMinor: 0,
    byStatus: {} as Record<string, { count: number; amountMinor: number }>,
  };

  for (const row of grouped) {
    const amount = row._sum.amountMinor ?? 0;
    summary.byStatus[row.status] = { count: row._count._all, amountMinor: amount };
    if (row.status === PaymentStatus.PENDING || row.status === PaymentStatus.FAILED) {
      summary.outstandingMinor += amount;
    }
    if (row.status === PaymentStatus.PAID) summary.settledMinor += amount;
  }

  return summary;
}
