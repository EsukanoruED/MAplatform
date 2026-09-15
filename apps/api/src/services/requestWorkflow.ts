import { ActorType, RequestStatus } from '@prisma/client';
import { ForbiddenError, InvalidStatusTransitionError } from '../lib/errors';
import type { Principal } from '../types/principal';

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

// ---------------------------------------------------------------------------
// Who may perform which transition
// ---------------------------------------------------------------------------

/**
 * Transition authority, keyed by the target status.
 *
 * The clinical pipeline is operated by Medical Alliance staff, so every forward
 * transition is admin-side. A company can do exactly one thing to a request it
 * filed: withdraw it, and only while nothing clinical has happened yet. That is
 * expressed as REJECTED being reachable by a company principal only from
 * SUBMITTED or PENDING_PAYMENT (see `companyWithdrawableFrom`).
 *
 * This matrix is the single source of truth. Routes never decide permissions
 * themselves — they call `assertCanTransition`, so the company API and the admin
 * API cannot drift apart.
 */
export type TransitionActor = 'company' | 'admin' | 'system';

const ADMIN_ONLY: readonly TransitionActor[] = ['admin', 'system'];

const TRANSITION_AUTHORITY: Readonly<Record<RequestStatus, readonly TransitionActor[]>> = {
  [RequestStatus.SUBMITTED]: ADMIN_ONLY,
  [RequestStatus.PENDING_PAYMENT]: ADMIN_ONLY,
  [RequestStatus.APPROVED]: ADMIN_ONLY,
  [RequestStatus.AT_LAB]: ADMIN_ONLY,
  [RequestStatus.RESULTS_RECEIVED]: ADMIN_ONLY,
  [RequestStatus.UNDER_REVIEW]: ADMIN_ONLY,
  [RequestStatus.COMPLETE]: ADMIN_ONLY,
  // Company users may withdraw their own request — but only from the states below.
  [RequestStatus.REJECTED]: ['company', 'admin', 'system'],
};

/** The only states a company principal may withdraw (reject) a request from. */
export const companyWithdrawableFrom: readonly RequestStatus[] = [
  RequestStatus.SUBMITTED,
  RequestStatus.PENDING_PAYMENT,
];

export function canActorTransition(
  actor: TransitionActor,
  from: RequestStatus,
  to: RequestStatus,
): boolean {
  if (!canTransition(from, to)) return false;
  if (!TRANSITION_AUTHORITY[to].includes(actor)) return false;
  if (actor === 'company' && to === RequestStatus.REJECTED) {
    return companyWithdrawableFrom.includes(from);
  }
  return true;
}

/**
 * Validates a transition for a given actor, throwing the right error for the
 * right reason: 422 when the move is not in the state machine at all, 403 when
 * the move is legal but this actor may not perform it.
 */
export function assertCanTransition(
  actor: TransitionActor,
  from: RequestStatus,
  to: RequestStatus,
): void {
  // Shape of the workflow first — an impossible move is impossible for everyone.
  assertTransition(from, to);

  if (!TRANSITION_AUTHORITY[to].includes(actor)) {
    throw new ForbiddenError(
      `A ${actor} account cannot move a request to ${to}. This transition is performed by Medical Alliance staff.`,
    );
  }
  if (actor === 'company' && to === RequestStatus.REJECTED && !companyWithdrawableFrom.includes(from)) {
    throw new ForbiddenError(
      `A request can only be withdrawn while it is ${companyWithdrawableFrom.join(' or ')}. This one is ${from}.`,
    );
  }
}

/** The transitions a given actor may perform from a given state. */
export function availableTransitions(
  actor: TransitionActor,
  from: RequestStatus,
): RequestStatus[] {
  return ALLOWED_TRANSITIONS[from].filter((to) => canActorTransition(actor, from, to));
}

export function actorFromPrincipal(principal: Principal): TransitionActor {
  return principal.type === 'admin' ? 'admin' : 'company';
}
