import { describe, expect, it } from 'vitest';
import { ActorType, RequestStatus } from '@prisma/client';
import {
  actorTypeFor,
  assertTransition,
  canTransition,
  countByStatus,
  isTerminal,
} from '../src/services/requestWorkflow';
import { InvalidStatusTransitionError } from '../src/lib/errors';

describe('request status state machine', () => {
  it('permits the documented happy path end to end', () => {
    const path: RequestStatus[] = [
      RequestStatus.SUBMITTED,
      RequestStatus.PENDING_PAYMENT,
      RequestStatus.APPROVED,
      RequestStatus.AT_LAB,
      RequestStatus.RESULTS_RECEIVED,
      RequestStatus.UNDER_REVIEW,
      RequestStatus.COMPLETE,
    ];
    for (let i = 0; i < path.length - 1; i += 1) {
      expect(canTransition(path[i], path[i + 1])).toBe(true);
    }
  });

  it('permits rejection from every non-terminal state', () => {
    const nonTerminal = Object.values(RequestStatus).filter((s) => !isTerminal(s));
    expect(nonTerminal.length).toBeGreaterThan(0);
    for (const status of nonTerminal) {
      expect(canTransition(status, RequestStatus.REJECTED)).toBe(true);
    }
  });

  it('refuses to skip ahead or move backwards', () => {
    expect(canTransition(RequestStatus.SUBMITTED, RequestStatus.COMPLETE)).toBe(false);
    expect(canTransition(RequestStatus.SUBMITTED, RequestStatus.AT_LAB)).toBe(false);
    expect(canTransition(RequestStatus.AT_LAB, RequestStatus.APPROVED)).toBe(false);
    expect(canTransition(RequestStatus.COMPLETE, RequestStatus.UNDER_REVIEW)).toBe(false);
  });

  it('treats COMPLETE and REJECTED as terminal', () => {
    expect(isTerminal(RequestStatus.COMPLETE)).toBe(true);
    expect(isTerminal(RequestStatus.REJECTED)).toBe(true);
    expect(isTerminal(RequestStatus.SUBMITTED)).toBe(false);
  });

  it('assertTransition throws a typed domain error on an illegal move', () => {
    expect(() => assertTransition(RequestStatus.SUBMITTED, RequestStatus.APPROVED)).not.toThrow();
    expect(() => assertTransition(RequestStatus.COMPLETE, RequestStatus.SUBMITTED)).toThrow(
      InvalidStatusTransitionError,
    );
  });
});

describe('audit actor mapping', () => {
  it('maps each principal type to its actor type', () => {
    expect(actorTypeFor('company')).toBe(ActorType.COMPANY_USER);
    expect(actorTypeFor('admin')).toBe(ActorType.ADMIN_USER);
    expect(actorTypeFor('system')).toBe(ActorType.SYSTEM);
  });
});

describe('dashboard aggregates', () => {
  it('counts rows by status and zero-fills the rest', () => {
    const counts = countByStatus([
      { status: RequestStatus.SUBMITTED },
      { status: RequestStatus.SUBMITTED },
      { status: RequestStatus.COMPLETE },
    ]);
    expect(counts.SUBMITTED).toBe(2);
    expect(counts.COMPLETE).toBe(1);
    expect(counts.AT_LAB).toBe(0);
    expect(Object.keys(counts).sort()).toEqual(Object.values(RequestStatus).sort());
  });

  it('returns an all-zero map for no rows', () => {
    const counts = countByStatus([]);
    expect(Object.values(counts).every((n) => n === 0)).toBe(true);
  });
});
