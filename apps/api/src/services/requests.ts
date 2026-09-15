import { PaymentStatus, Prisma, RequestStatus } from '@prisma/client';
import type { RequestType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ForbiddenTenantAccessError, ValidationError } from '../lib/errors';
import { actorFromPrincipal, actorTypeFor, assertCanTransition, availableTransitions } from './requestWorkflow';
import { assertLabSelectable } from './labs';
import { createRequestPayment, paymentPlanFor } from './payments';
import { queueLabNotification } from './labNotification';
import { paymentSelect } from './payments';
import { documentSelect } from './documents';
import { labNotificationSelect } from './labNotification';
import type { Principal } from '../types/principal';

/**
 * The Request lifecycle, in one place.
 *
 * Routes never write `Request.status` directly. They call `transitionRequest`,
 * which is the only function that changes a status — so the state machine, the
 * actor-permission matrix and the audit trail can never be bypassed by adding a
 * new endpoint.
 */

/** Shared projection for list views. */
export const requestListSelect = {
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

/** Everything the request-detail screen renders, including the timeline. */
export const requestDetailSelect = {
  ...requestListSelect,
  company: { select: { id: true, legalName: true, billingType: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  statusEvents: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      changedByType: true,
      changedById: true,
      note: true,
      changedAt: true,
    },
    orderBy: { changedAt: 'asc' as const },
  },
  documents: { select: documentSelect, orderBy: { uploadedAt: 'desc' as const } },
  payments: { select: paymentSelect, orderBy: { createdAt: 'desc' as const } },
  labNotifications: { select: labNotificationSelect, orderBy: { createdAt: 'desc' as const } },
} as const;

export type CreateRequestServiceInput = {
  employeeId: string;
  type: RequestType;
  assignedLabId?: string;
  notes?: string;
};

/**
 * Files a new request for one of the company's own employees.
 *
 * Three tenant checks, all server-side:
 *  1. the employee is looked up with the session's companyId in the where clause;
 *  2. the row is written with that same companyId;
 *  3. the create schema has no companyId field at all (see validation/requests.ts).
 */
export async function createRequest(
  companyId: string,
  principal: Principal,
  input: CreateRequestServiceInput,
) {
  const [company, employee] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId }, select: { id: true, billingType: true } }),
    prisma.employee.findFirst({
      where: { id: input.employeeId, companyId }, // <- tenant-scoped lookup
      select: { id: true, active: true, fullName: true },
    }),
  ]);

  if (!company) throw new ForbiddenTenantAccessError('Company not found.');
  if (!employee) throw new ForbiddenTenantAccessError('No employee with that id in your company.');
  if (!employee.active) {
    throw new ValidationError(
      `${employee.fullName} is archived. Reactivate the employee before filing a request.`,
      [{ path: 'employeeId', message: 'Employee is archived.' }],
    );
  }

  if (input.assignedLabId) await assertLabSelectable(input.assignedLabId);

  // Billing arrangement decides both the request's payment fields and, below,
  // whether the request is gated on payment before approval.
  const plan = paymentPlanFor(company.billingType, input.type);

  return prisma.$transaction(async (tx) => {
    const created = await tx.request.create({
      data: {
        companyId, // <- from the session, never from the client
        employeeId: employee.id,
        type: input.type,
        status: RequestStatus.SUBMITTED,
        paymentMethod: plan.method,
        paymentStatus: plan.requestPaymentStatus,
        ...(input.assignedLabId ? { assignedLabId: input.assignedLabId } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
        createdByUserId: principal.type === 'company' ? principal.id : null,
      },
      select: requestListSelect,
    });

    await tx.requestStatusEvent.create({
      data: {
        requestId: created.id,
        fromStatus: null,
        toStatus: RequestStatus.SUBMITTED,
        changedByType: actorTypeFor(principal.type === 'admin' ? 'admin' : 'company'),
        changedById: principal.id,
        note: 'Request submitted.',
      },
    });

    await createRequestPayment(tx, {
      companyId,
      requestId: created.id,
      billingType: company.billingType,
      type: input.type,
    });

    return created;
  });
}

export type ListRequestsOptions = {
  status?: RequestStatus;
  type?: RequestType;
  employeeId?: string;
  search?: string;
  take?: number;
};

/** Tenant-scoped request list. `companyId` always comes from the session. */
export async function listRequestsForCompany(companyId: string, options: ListRequestsOptions = {}) {
  const { status, type, employeeId, search, take = 100 } = options;

  const where: Prisma.RequestWhereInput = {
    companyId, // <- the only tenant filter that matters
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(employeeId ? { employeeId } : {}),
    ...(search
      ? { employee: { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } } }
      : {}),
  };

  return prisma.request.findMany({
    where,
    select: requestListSelect,
    orderBy: { createdAt: 'desc' },
    take,
  });
}

/**
 * One request with its full detail, including the persisted status timeline.
 *
 * `companyScope` is undefined only for admin callers. For a company principal it
 * is always the session companyId, and a foreign id therefore resolves to no row.
 */
export async function getRequestDetail(id: string, companyScope?: string) {
  const request = await prisma.request.findFirst({
    where: { id, ...(companyScope ? { companyId: companyScope } : {}) },
    select: requestDetailSelect,
  });
  if (!request) throw new ForbiddenTenantAccessError('No request with that id in your company.');
  return request;
}

export type TransitionInput = {
  requestId: string;
  toStatus: RequestStatus;
  principal: Principal;
  note?: string;
  /** Set when moving to AT_LAB without a lab already assigned. */
  assignedLabId?: string;
  /** The session companyId for a company principal; undefined for an admin. */
  companyScope?: string;
};

/**
 * The ONLY way a request's status changes.
 *
 * Runs in one transaction: re-reads the current status inside it, validates the
 * move against the state machine AND the actor matrix, applies side effects, and
 * appends the RequestStatusEvent. If any step throws, none of it persists — so a
 * status can never change without its audit row, and vice versa.
 */
export async function transitionRequest(input: TransitionInput) {
  const actor = actorFromPrincipal(input.principal);

  const current = await prisma.request.findFirst({
    where: {
      id: input.requestId,
      ...(input.companyScope ? { companyId: input.companyScope } : {}),
    },
    select: { id: true, companyId: true, status: true, assignedLabId: true, paymentStatus: true },
  });
  if (!current) throw new ForbiddenTenantAccessError('No request with that id in your company.');

  // Throws 422 for an impossible move, 403 for one this actor may not make.
  assertCanTransition(actor, current.status, input.toStatus);

  // --- side-effect preconditions, checked before anything is written ---------

  let labIdForDispatch: string | undefined;
  if (input.toStatus === RequestStatus.AT_LAB) {
    const labId = input.assignedLabId ?? current.assignedLabId ?? undefined;
    if (!labId) {
      throw new ValidationError(
        'Assign a laboratory before sending this request to the lab.',
        [{ path: 'assignedLabId', message: 'A laboratory is required.' }],
      );
    }
    await assertLabSelectable(labId);
    labIdForDispatch = labId;
  }

  // A PER_REQUEST company must have settled before the request is approved.
  if (
    input.toStatus === RequestStatus.APPROVED &&
    current.status === RequestStatus.PENDING_PAYMENT &&
    current.paymentStatus !== PaymentStatus.PAID
  ) {
    throw new ValidationError(
      'This request is awaiting payment. Settle the payment before approving it.',
      [{ path: 'status', message: 'Payment outstanding.' }],
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.request.update({
      where: { id: current.id },
      data: {
        status: input.toStatus,
        ...(labIdForDispatch ? { assignedLabId: labIdForDispatch } : {}),
      },
      select: requestListSelect,
    });

    await tx.requestStatusEvent.create({
      data: {
        requestId: current.id,
        fromStatus: current.status,
        toStatus: input.toStatus,
        changedByType: actorTypeFor(actor),
        changedById: input.principal.id,
        note: input.note ?? null,
      },
    });

    // Sending to a lab queues a dispatch record. Nothing is emailed in Phase 2 —
    // see services/labNotification.ts.
    if (labIdForDispatch) {
      await queueLabNotification(tx, { requestId: current.id, labId: labIdForDispatch });
    }

    return updated;
  });
}

/** Assigns or changes the laboratory on a request without moving its status. */
export async function assignLab(input: {
  requestId: string;
  labId: string;
  companyScope?: string;
}) {
  const request = await prisma.request.findFirst({
    where: { id: input.requestId, ...(input.companyScope ? { companyId: input.companyScope } : {}) },
    select: { id: true, status: true },
  });
  if (!request) throw new ForbiddenTenantAccessError('No request with that id in your company.');

  if (request.status === RequestStatus.COMPLETE || request.status === RequestStatus.REJECTED) {
    throw new ValidationError('A closed request cannot be reassigned to a laboratory.');
  }

  await assertLabSelectable(input.labId);

  return prisma.request.update({
    where: { id: request.id },
    data: { assignedLabId: input.labId },
    select: requestListSelect,
  });
}

/** The transitions the given principal may perform on the given request now. */
export function transitionsAvailableTo(principal: Principal, status: RequestStatus) {
  return availableTransitions(actorFromPrincipal(principal), status);
}
