import { ActorType, RequestStatus } from '@prisma/client';
import { InvalidStatusTransitionError } from '../lib/errors';

/**
 * The Request status state machine. Kept here rather than in route handlers so
 * it can be unit-tested in isolation and reused by the future lab-reply and
 * expiry handlers.
 *
 *   SUBMITTED → PENDING_PAYMENT → APPROVED → AT_LAB → RESULTS_RECEIVED
 *             → UNDER_REVIEW → COMPLETE
 *
 * REJECTED is reachable from any state before COMPLETE. COMPLETE and REJECTED
 * are terminal.
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<RequestStatus, readonly RequestStatus[]>> = {
  [RequestStatus.SUBMITTED]: [RequestStatus.PENDING_PAYMENT, RequestStatus.APPROVED, RequestStatus.REJECTED],
  [RequestStatus.PENDING_PAYMENT]: [RequestStatus.APPROVED, RequestStatus.REJECTED],
  [RequestStatus.APPROVED]: [RequestStatus.AT_LAB, RequestStatus.REJECTED],
  [RequestStatus.AT_LAB]: [RequestStatus.RESULTS_RECEIVED, RequestStatus.REJECTED],
  [RequestStatus.RESULTS_RECEIVED]: [RequestStatus.UNDER_REVIEW, RequestStatus.REJECTED],
  [RequestStatus.UNDER_REVIEW]: [RequestStatus.COMPLETE, RequestStatus.REJECTED],
  [RequestStatus.COMPLETE]: [],
  [RequestStatus.REJECTED]: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Throws `InvalidStatusTransitionError` when the move is not in the state machine. */
export function assertTransition(from: RequestStatus, to: RequestStatus): void {
  if (!canTransition(from, to)) throw new InvalidStatusTransitionError(from, to);
}

export function isTerminal(status: RequestStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}

/** Actor type recorded on the audit trail for a given principal type. */
export function actorTypeFor(principalType: 'company' | 'admin' | 'system'): ActorType {
  if (principalType === 'company') return ActorType.COMPANY_USER;
  if (principalType === 'admin') return ActorType.ADMIN_USER;
  return ActorType.SYSTEM;
}

/**
 * Dashboard aggregate shape. Derived from real rows rather than stored, so it can
 * never drift from the request table.
 */
export type RequestStatusCounts = Record<RequestStatus, number>;

export function emptyStatusCounts(): RequestStatusCounts {
  return Object.values(RequestStatus).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as RequestStatusCounts);
}

export function countByStatus(rows: Array<{ status: RequestStatus }>): RequestStatusCounts {
  return rows.reduce((acc, row) => {
    acc[row.status] += 1;
    return acc;
  }, emptyStatusCounts());
}
