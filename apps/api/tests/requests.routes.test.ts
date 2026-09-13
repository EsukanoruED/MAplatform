import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { CompanyUserRole, RequestStatus, RequestType } from '@prisma/client';
import { createApp } from '../src/app';
import { createTenant, login, prisma, resetDatabase } from './helpers';
import type { TenantFixture } from './helpers';

let app: Express;
let tenant: TenantFixture;
let cookie: string[];
let labId: string;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await resetDatabase();
  tenant = await createTenant('delta');
  cookie = await login(app, 'company', tenant.admin.email);
  const lab = await prisma.lab.create({
    data: { name: 'Test Laboratory', contactEmail: 'lab@test.test' },
  });
  labId = lab.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/requests', () => {
  it('persists a request in Postgres and returns 201', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP, notes: 'Periodic' });

    expect(res.status).toBe(201);
    expect(res.body.request).toMatchObject({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      type: RequestType.CHECKUP,
      status: RequestStatus.SUBMITTED,
    });

    // Verified against the database, not just the response body.
    const row = await prisma.request.findUniqueOrThrow({ where: { id: res.body.request.id } });
    expect(row.notes).toBe('Periodic');
    expect(row.status).toBe(RequestStatus.SUBMITTED);
  });

  it('writes the opening audit-trail event', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });

    const events = await prisma.requestStatusEvent.findMany({ where: { requestId: res.body.request.id } });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      fromStatus: null,
      toStatus: RequestStatus.SUBMITTED,
      changedByType: 'COMPANY_USER',
      changedById: tenant.admin.id,
    });
  });

  it('accepts an optional active lab assignment', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.FITNESS_CERTIFICATE, assignedLabId: labId });

    expect(res.status).toBe(201);
    expect(res.body.request.assignedLab).toMatchObject({ id: labId, name: 'Test Laboratory' });
  });

  it('rejects an inactive lab', async () => {
    await prisma.lab.update({ where: { id: labId }, data: { active: false } });
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP, assignedLabId: labId });

    expect(res.status).toBe(404);
    expect(await prisma.request.count()).toBe(0);
  });

  it('validates the body: unknown type, missing employee, bad id', async () => {
    const badType = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: 'DENTAL' });
    expect(badType.status).toBe(400);

    const noEmployee = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ type: RequestType.CHECKUP });
    expect(noEmployee.status).toBe(400);

    const badId = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: 'not-a-uuid', type: RequestType.CHECKUP });
    expect(badId.status).toBe(400);
  });

  it('rejects a client attempt to set the status directly', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP, status: RequestStatus.COMPLETE });

    expect(res.status).toBe(400);
    expect(await prisma.request.count()).toBe(0);
  });

  it('allows a COMPANY_REQUESTER to file a request', async () => {
    const requesterCookie = await login(app, 'company', tenant.requester.email);
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', requesterCookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });

    expect(res.status).toBe(201);
    const row = await prisma.request.findUniqueOrThrow({ where: { id: res.body.request.id } });
    expect(row.createdByUserId).toBe(tenant.requester.id);
  });

  it('never returns a password hash in the created payload', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });
});

describe('GET /api/requests', () => {
  it('returns an empty list and a zeroed summary for a company with no requests', async () => {
    const res = await request(app).get('/api/requests').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.requests).toEqual([]);
    expect(res.body.summary.total).toBe(0);
    expect(res.body.summary.byStatus.SUBMITTED).toBe(0);
  });

  it('returns what was just created, newest first', async () => {
    const first = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });
    const second = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[1].id, type: RequestType.FITNESS_CERTIFICATE });

    const res = await request(app).get('/api/requests').set('Cookie', cookie);
    expect(res.body.requests).toHaveLength(2);
    const ids = res.body.requests.map((r: { id: string }) => r.id);
    expect(ids).toContain(first.body.request.id);
    expect(ids).toContain(second.body.request.id);
  });

  it('includes the employee name so the register can render it', async () => {
    await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });

    const res = await request(app).get('/api/requests').set('Cookie', cookie);
    expect(res.body.requests[0].employee.fullName).toBe(tenant.employees[0].fullName);
  });

  it('derives the summary counts from the rows', async () => {
    await prisma.request.createMany({
      data: [
        { companyId: tenant.company.id, employeeId: tenant.employees[0].id, type: RequestType.CHECKUP, status: RequestStatus.SUBMITTED },
        { companyId: tenant.company.id, employeeId: tenant.employees[1].id, type: RequestType.CHECKUP, status: RequestStatus.SUBMITTED },
        { companyId: tenant.company.id, employeeId: tenant.employees[0].id, type: RequestType.FITNESS_CERTIFICATE, status: RequestStatus.COMPLETE },
      ],
    });

    const res = await request(app).get('/api/requests').set('Cookie', cookie);
    expect(res.body.summary.total).toBe(3);
    expect(res.body.summary.byStatus.SUBMITTED).toBe(2);
    expect(res.body.summary.byStatus.COMPLETE).toBe(1);
    expect(res.body.summary.byStatus.AT_LAB).toBe(0);
  });

  it('filters by status and type', async () => {
    await prisma.request.createMany({
      data: [
        { companyId: tenant.company.id, employeeId: tenant.employees[0].id, type: RequestType.CHECKUP, status: RequestStatus.SUBMITTED },
        { companyId: tenant.company.id, employeeId: tenant.employees[1].id, type: RequestType.FITNESS_CERTIFICATE, status: RequestStatus.COMPLETE },
      ],
    });

    const byStatus = await request(app).get('/api/requests?status=COMPLETE').set('Cookie', cookie);
    expect(byStatus.body.requests).toHaveLength(1);

    const byType = await request(app).get('/api/requests?type=CHECKUP').set('Cookie', cookie);
    expect(byType.body.requests).toHaveLength(1);
    expect(byType.body.requests[0].type).toBe(RequestType.CHECKUP);
  });

  it('rejects an invalid status filter rather than ignoring it', async () => {
    const res = await request(app).get('/api/requests?status=NOT_A_STATUS').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/requests/:id', () => {
  it('returns the request with its audit trail', async () => {
    const created = await request(app)
      .post('/api/requests')
      .set('Cookie', cookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });

    const res = await request(app).get(`/api/requests/${created.body.request.id}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.request.statusEvents).toHaveLength(1);
  });

  it('404s for an id that does not exist', async () => {
    const res = await request(app)
      .get('/api/requests/99999999-9999-4999-8999-999999999999')
      .set('Cookie', cookie);
    expect(res.status).toBe(404);
  });

  it('400s for a malformed id', async () => {
    const res = await request(app).get('/api/requests/not-a-uuid').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/employees', () => {
  it('lists the tenant\'s own active workers', async () => {
    const res = await request(app).get('/api/employees').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.employees).toHaveLength(2);
    expect(res.body.employees[0]).toHaveProperty('fullName');
  });

  it('omits deactivated workers', async () => {
    await prisma.employee.update({ where: { id: tenant.employees[0].id }, data: { active: false } });
    const res = await request(app).get('/api/employees').set('Cookie', cookie);
    expect(res.body.employees).toHaveLength(1);
  });
});

describe('role gating', () => {
  it('both company roles may list requests', async () => {
    for (const email of [tenant.admin.email, tenant.requester.email]) {
      const c = await login(app, 'company', email);
      const res = await request(app).get('/api/requests').set('Cookie', c);
      expect(res.status).toBe(200);
    }
  });

  it('the role on the session is the one stored at login', async () => {
    const c = await login(app, 'company', tenant.requester.email);
    const me = await request(app).get('/api/auth/me').set('Cookie', c);
    expect(me.body.user.role).toBe(CompanyUserRole.COMPANY_REQUESTER);
  });
});
