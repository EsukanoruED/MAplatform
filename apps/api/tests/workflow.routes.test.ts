import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { AdminUserRole, PaymentStatus, RequestStatus, RequestType } from '@prisma/client';
import { createApp } from '../src/app';
import {
  createLab,
  createPlatformAdmin,
  createRequestWithStatus,
  createTenant,
  login,
  prisma,
  resetDatabase,
} from './helpers';
import type { TenantFixture } from './helpers';

let app: Express;
let tenant: TenantFixture;
let companyCookie: string[];
let adminCookie: string[];
let reviewerCookie: string[];
let labId: string;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await resetDatabase();
  tenant = await createTenant('acme');
  companyCookie = await login(app, 'company', tenant.admin.email);

  await createPlatformAdmin('ops@ma.test', AdminUserRole.ADMIN);
  adminCookie = await login(app, 'admin', 'ops@ma.test');

  await createPlatformAdmin('reviewer@ma.test', AdminUserRole.REVIEWER);
  reviewerCookie = await login(app, 'admin', 'reviewer@ma.test');

  labId = (await createLab()).id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

/** Reads the persisted timeline for a request. */
async function timelineOf(requestId: string) {
  return prisma.requestStatusEvent.findMany({
    where: { requestId },
    orderBy: { changedAt: 'asc' },
  });
}

describe('request creation writes the opening audit and ledger rows', () => {
  it('records a SUBMITTED status event and a payment row', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.FITNESS_CERTIFICATE });

    expect(res.status).toBe(201);
    const requestId: string = res.body.request.id;

    const events = await timelineOf(requestId);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      fromStatus: null,
      toStatus: RequestStatus.SUBMITTED,
      changedByType: 'COMPANY_USER',
      changedById: tenant.admin.id,
    });

    const payments = await prisma.payment.findMany({ where: { requestId } });
    expect(payments).toHaveLength(1);
    expect(payments[0].companyId).toBe(tenant.company.id);
  });

  it('refuses a request for an archived employee', async () => {
    await prisma.employee.update({
      where: { id: tenant.employees[0].id },
      data: { active: false },
    });

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });

    expect(res.status).toBe(400);
    expect(await prisma.request.count()).toBe(0);
  });

  it('refuses an inactive laboratory with a clear message', async () => {
    const inactive = await createLab('Closed Lab', { active: false });

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({
        employeeId: tenant.employees[0].id,
        type: RequestType.CHECKUP,
        assignedLabId: inactive.id,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/not currently accepting requests/i);
    expect(await prisma.request.count()).toBe(0);
  });

  it('404s for a laboratory id that does not exist', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({
        employeeId: tenant.employees[0].id,
        type: RequestType.CHECKUP,
        assignedLabId: '99999999-9999-4999-8999-999999999999',
      });

    expect(res.status).toBe(404);
  });
});

describe('valid status transitions (admin)', () => {
  it('walks the full happy path, appending one event per move', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
      assignedLabId: labId,
    });

    const path: RequestStatus[] = [
      RequestStatus.APPROVED,
      RequestStatus.AT_LAB,
      RequestStatus.RESULTS_RECEIVED,
      RequestStatus.UNDER_REVIEW,
      RequestStatus.COMPLETE,
    ];

    for (const status of path) {
      const res = await request(app)
        .patch(`/api/admin/requests/${created.id}/status`)
        .set('Cookie', adminCookie)
        .send({ status });
      expect(res.status, `moving to ${status}`).toBe(200);
      expect(res.body.request.status).toBe(status);
    }

    const events = await timelineOf(created.id);
    expect(events).toHaveLength(path.length);
    expect(events.map((e) => e.toStatus)).toEqual(path);
    expect(events[0].fromStatus).toBe(RequestStatus.SUBMITTED);
    expect(events.every((e) => e.changedByType === 'ADMIN_USER')).toBe(true);

    const row = await prisma.request.findUniqueOrThrow({ where: { id: created.id } });
    expect(row.status).toBe(RequestStatus.COMPLETE);
  });

  it('lets a REVIEWER move a request through clinical review', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.RESULTS_RECEIVED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', reviewerCookie)
      .send({ status: RequestStatus.UNDER_REVIEW, note: 'Picked up for review.' });

    expect(res.status).toBe(200);
    const events = await timelineOf(created.id);
    expect(events[0].note).toBe('Picked up for review.');
  });

  it('records the note on the timeline', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
    });

    await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.REJECTED, note: 'Duplicate submission.' });

    const events = await timelineOf(created.id);
    expect(events.at(-1)).toMatchObject({
      toStatus: RequestStatus.REJECTED,
      note: 'Duplicate submission.',
    });
  });

  it('returns the transitions available from the new state', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.APPROVED });

    expect(res.body.availableTransitions).toEqual(
      expect.arrayContaining([RequestStatus.AT_LAB, RequestStatus.REJECTED]),
    );
  });
});

describe('invalid status transitions', () => {
  it('refuses a move that skips ahead (422) and writes nothing', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.COMPLETE });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');

    const row = await prisma.request.findUniqueOrThrow({ where: { id: created.id } });
    expect(row.status).toBe(RequestStatus.SUBMITTED);
    expect(await timelineOf(created.id)).toHaveLength(0);
  });

  it('refuses a backwards move', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.AT_LAB,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.APPROVED });

    expect(res.status).toBe(422);
  });

  it('refuses any move out of a terminal state', async () => {
    for (const terminal of [RequestStatus.COMPLETE, RequestStatus.REJECTED]) {
      const created = await createRequestWithStatus({
        companyId: tenant.company.id,
        employeeId: tenant.employees[0].id,
        status: terminal,
      });

      const res = await request(app)
        .patch(`/api/admin/requests/${created.id}/status`)
        .set('Cookie', adminCookie)
        .send({ status: RequestStatus.UNDER_REVIEW });

      expect(res.status, `out of ${terminal}`).toBe(422);
    }
  });

  it('rejects an unknown status value at validation', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'ARCHIVED' });

    expect(res.status).toBe(400);
  });

  it('requires a laboratory before a request can go AT_LAB', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.APPROVED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.AT_LAB });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toContainEqual(
      expect.objectContaining({ path: 'assignedLabId' }),
    );
    expect(await timelineOf(created.id)).toHaveLength(0);
  });

  it('accepts a laboratory supplied with the AT_LAB move and queues a dispatch', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.APPROVED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.AT_LAB, assignedLabId: labId });

    expect(res.status).toBe(200);
    expect(res.body.request.assignedLabId).toBe(labId);

    const dispatches = await prisma.labNotification.findMany({ where: { requestId: created.id } });
    expect(dispatches).toHaveLength(1);
    // Nothing is emailed in Phase 2 — the row is queued, not delivered.
    expect(dispatches[0].status).toBe('PENDING');
    expect(dispatches[0].sentAt).toBeNull();
  });

  it('blocks approval while a PER_REQUEST payment is outstanding', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.PENDING,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.APPROVED });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/awaiting payment/i);
  });

  it('allows approval once the payment is settled', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.PAID,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.APPROVED });

    expect(res.status).toBe(200);
  });
});

describe('company users cannot drive the clinical pipeline', () => {
  it.each([
    RequestStatus.APPROVED,
    RequestStatus.AT_LAB,
    RequestStatus.RESULTS_RECEIVED,
    RequestStatus.UNDER_REVIEW,
    RequestStatus.COMPLETE,
    RequestStatus.PENDING_PAYMENT,
  ])('refuses a company user moving a request to %s', async (status) => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
      assignedLabId: labId,
    });

    const res = await request(app)
      .patch(`/api/requests/${created.id}/status`)
      .set('Cookie', companyCookie)
      .send({ status });

    // Either not reachable from SUBMITTED (422) or not this actor's to make (403).
    expect([403, 422]).toContain(res.status);

    const row = await prisma.request.findUniqueOrThrow({ where: { id: created.id } });
    expect(row.status).toBe(RequestStatus.SUBMITTED);
  });

  it('lets a company withdraw its own request while SUBMITTED', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
    });

    const res = await request(app)
      .patch(`/api/requests/${created.id}/status`)
      .set('Cookie', companyCookie)
      .send({ status: RequestStatus.REJECTED, note: 'Filed in error.' });

    expect(res.status).toBe(200);
    const events = await timelineOf(created.id);
    expect(events.at(-1)).toMatchObject({
      toStatus: RequestStatus.REJECTED,
      changedByType: 'COMPANY_USER',
    });
  });

  it('refuses a withdrawal once the request is with the lab', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.AT_LAB,
      assignedLabId: labId,
    });

    const res = await request(app)
      .patch(`/api/requests/${created.id}/status`)
      .set('Cookie', companyCookie)
      .send({ status: RequestStatus.REJECTED });

    expect(res.status).toBe(403);
    const row = await prisma.request.findUniqueOrThrow({ where: { id: created.id } });
    expect(row.status).toBe(RequestStatus.AT_LAB);
  });
});

describe('laboratory assignment', () => {
  it('assigns a lab without moving the status', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.APPROVED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/lab`)
      .set('Cookie', adminCookie)
      .send({ labId });

    expect(res.status).toBe(200);
    expect(res.body.request.assignedLabId).toBe(labId);
    expect(res.body.request.status).toBe(RequestStatus.APPROVED);
  });

  it('refuses an inactive lab', async () => {
    const inactive = await createLab('Retired Lab', { active: false });
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.APPROVED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/lab`)
      .set('Cookie', adminCookie)
      .send({ labId: inactive.id });

    expect(res.status).toBe(400);
  });

  it('refuses reassignment on a closed request', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.COMPLETE,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/lab`)
      .set('Cookie', adminCookie)
      .send({ labId });

    expect(res.status).toBe(400);
  });

  it('is not reachable by a company session', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.APPROVED,
    });

    const res = await request(app)
      .patch(`/api/admin/requests/${created.id}/lab`)
      .set('Cookie', companyCookie)
      .send({ labId });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/labs', () => {
  it('lists active laboratories for an authenticated company user', async () => {
    await createLab('Inactive One', { active: false });

    const res = await request(app).get('/api/labs').set('Cookie', companyCookie);

    expect(res.status).toBe(200);
    expect(res.body.labs).toHaveLength(1);
    expect(res.body.labs[0].active).toBe(true);
  });

  it('ignores includeInactive for a company principal', async () => {
    await createLab('Inactive Two', { active: false });

    const res = await request(app)
      .get('/api/labs?includeInactive=true')
      .set('Cookie', companyCookie);

    expect(res.body.labs).toHaveLength(1);
  });

  it('honours includeInactive for an admin principal', async () => {
    await createLab('Inactive Three', { active: false });

    const res = await request(app).get('/api/labs?includeInactive=true').set('Cookie', adminCookie);
    expect(res.body.labs).toHaveLength(2);
  });

  it('404s an inactive laboratory for a company user', async () => {
    const inactive = await createLab('Hidden Lab', { active: false });

    const res = await request(app).get(`/api/labs/${inactive.id}`).set('Cookie', companyCookie);
    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/labs');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/requests/:id timeline', () => {
  it('returns the persisted status events in order', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
      assignedLabId: labId,
    });

    await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.APPROVED });
    await request(app)
      .patch(`/api/admin/requests/${created.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: RequestStatus.AT_LAB });

    const res = await request(app).get(`/api/requests/${created.id}`).set('Cookie', companyCookie);

    expect(res.status).toBe(200);
    expect(res.body.request.statusEvents).toHaveLength(2);
    expect(res.body.request.statusEvents.map((e: { toStatus: string }) => e.toStatus)).toEqual([
      RequestStatus.APPROVED,
      RequestStatus.AT_LAB,
    ]);
    expect(res.body.request.labNotifications).toHaveLength(1);
  });

  it('tells the company which transitions it may perform', async () => {
    const created = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
    });

    const res = await request(app).get(`/api/requests/${created.id}`).set('Cookie', companyCookie);

    // A company may only withdraw; it never sees APPROVED as an option.
    expect(res.body.availableTransitions).toEqual([RequestStatus.REJECTED]);
  });
});
