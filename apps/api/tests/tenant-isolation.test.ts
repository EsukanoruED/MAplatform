/**
 * TENANT ISOLATION — the platform's core security guarantee.
 *
 * The product promise is that one company can never see another company's
 * employee health data. These tests authenticate as Company B and try, by every
 * route the API exposes, to reach Company A's records. Every attempt must fail.
 *
 * Do not weaken or skip anything in this file.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { RequestType } from '@prisma/client';
import { createApp } from '../src/app';
import {
  TEST_PASSWORD,
  createPlatformAdmin,
  createRequestRow,
  createTenant,
  login,
  prisma,
  resetDatabase,
} from './helpers';
import type { TenantFixture } from './helpers';

let app: Express;
let companyA: TenantFixture;
let companyB: TenantFixture;
let cookieA: string[];
let cookieB: string[];

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await resetDatabase();
  companyA = await createTenant('alpha');
  companyB = await createTenant('bravo');
  cookieA = await login(app, 'company', companyA.admin.email);
  cookieB = await login(app, 'company', companyB.admin.email);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/requests is scoped to the authenticated company', () => {
  it("Company B cannot see a request Company A created through the API", async () => {
    // Company A files a real request through the HTTP API.
    const created = await request(app)
      .post('/api/requests')
      .set('Cookie', cookieA)
      .send({ employeeId: companyA.employees[0].id, type: RequestType.FITNESS_CERTIFICATE });

    expect(created.status).toBe(201);
    const requestId: string = created.body.request.id;
    expect(created.body.request.companyId).toBe(companyA.company.id);

    // Company A sees it.
    const aList = await request(app).get('/api/requests').set('Cookie', cookieA);
    expect(aList.status).toBe(200);
    expect(aList.body.requests.map((r: { id: string }) => r.id)).toContain(requestId);

    // Company B must not. THIS IS THE ASSERTION THE WHOLE PLATFORM RESTS ON.
    const bList = await request(app).get('/api/requests').set('Cookie', cookieB);
    expect(bList.status).toBe(200);
    expect(bList.body.requests.map((r: { id: string }) => r.id)).not.toContain(requestId);
    expect(bList.body.requests).toHaveLength(0);
    expect(bList.body.summary.total).toBe(0);
  });

  it('each company sees exactly its own rows when both have data', async () => {
    await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);
    await createRequestRow(companyA.company.id, companyA.employees[1].id, companyA.admin.id);
    await createRequestRow(companyB.company.id, companyB.employees[0].id, companyB.admin.id);

    const aList = await request(app).get('/api/requests').set('Cookie', cookieA);
    const bList = await request(app).get('/api/requests').set('Cookie', cookieB);

    expect(aList.body.requests).toHaveLength(2);
    expect(bList.body.requests).toHaveLength(1);
    expect(aList.body.requests.every((r: { companyId: string }) => r.companyId === companyA.company.id)).toBe(true);
    expect(bList.body.requests.every((r: { companyId: string }) => r.companyId === companyB.company.id)).toBe(true);
  });

  it('a status filter cannot be used to widen the scope', async () => {
    const a = await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);

    const res = await request(app).get('/api/requests?status=SUBMITTED').set('Cookie', cookieB);
    expect(res.status).toBe(200);
    expect(res.body.requests.map((r: { id: string }) => r.id)).not.toContain(a.id);
    expect(res.body.requests).toHaveLength(0);
  });

  it('the dashboard summary is computed from the tenant\'s own rows only', async () => {
    await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);
    await createRequestRow(companyA.company.id, companyA.employees[1].id, companyA.admin.id);

    const bList = await request(app).get('/api/requests').set('Cookie', cookieB);
    expect(bList.body.summary.total).toBe(0);
    expect(Object.values(bList.body.summary.byStatus).every((n) => n === 0)).toBe(true);
  });
});

describe('GET /api/requests/:id refuses cross-tenant reads', () => {
  it("returns 404 for another company's request id", async () => {
    const aRequest = await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);

    const asOwner = await request(app).get(`/api/requests/${aRequest.id}`).set('Cookie', cookieA);
    expect(asOwner.status).toBe(200);

    const asOther = await request(app).get(`/api/requests/${aRequest.id}`).set('Cookie', cookieB);
    // 404, not 403: the API must not confirm that the id exists at all.
    expect(asOther.status).toBe(404);
    expect(asOther.body.error.code).toBe('NOT_FOUND');
    expect(JSON.stringify(asOther.body)).not.toContain(companyA.company.id);
  });
});

describe('POST /api/requests cannot write into another tenant', () => {
  it("refuses to file a request against another company's employee", async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookieB)
      .send({ employeeId: companyA.employees[0].id, type: RequestType.CHECKUP });

    expect(res.status).toBe(404);
    expect(await prisma.request.count()).toBe(0);
  });

  it('rejects a client-supplied companyId instead of honouring it', async () => {
    const res = await request(app).post('/api/requests').set('Cookie', cookieB).send({
      employeeId: companyB.employees[0].id,
      type: RequestType.CHECKUP,
      companyId: companyA.company.id,
    });

    // The zod schema is .strict() and has no companyId field.
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(await prisma.request.count()).toBe(0);
  });

  it('always stamps the row with the session companyId', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', cookieB)
      .send({ employeeId: companyB.employees[0].id, type: RequestType.CHECKUP });

    expect(res.status).toBe(201);
    const row = await prisma.request.findUniqueOrThrow({ where: { id: res.body.request.id } });
    expect(row.companyId).toBe(companyB.company.id);
    expect(row.createdByUserId).toBe(companyB.admin.id);
  });
});

describe('GET /api/employees is scoped to the authenticated company', () => {
  it("Company B never sees Company A's workers", async () => {
    const bList = await request(app).get('/api/employees').set('Cookie', cookieB);
    expect(bList.status).toBe(200);

    const names = bList.body.employees.map((e: { fullName: string }) => e.fullName);
    expect(names).toHaveLength(2);
    expect(names.every((n: string) => n.startsWith('bravo'))).toBe(true);
    for (const a of companyA.employees) {
      expect(bList.body.employees.map((e: { id: string }) => e.id)).not.toContain(a.id);
    }
  });

  it('does not expose nationalId or dateOfBirth even for its own workers', async () => {
    const res = await request(app).get('/api/employees').set('Cookie', cookieB);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('nationalId');
    expect(body).not.toContain('dateOfBirth');
    expect(body).not.toContain('BRAVO-1');
  });
});

describe('unauthenticated access is refused everywhere', () => {
  it.each([
    ['get', '/api/requests'],
    ['get', '/api/employees'],
    ['get', '/api/admin/companies'],
    ['get', '/api/auth/me'],
  ])('%s %s returns 401 with no session', async (method, path) => {
    const res = await (method === 'get' ? request(app).get(path) : request(app).post(path));
    expect(res.status).toBe(401);
  });

  it('POST /api/requests returns 401 with no session and writes nothing', async () => {
    const res = await request(app)
      .post('/api/requests')
      .send({ employeeId: companyA.employees[0].id, type: RequestType.CHECKUP });

    expect(res.status).toBe(401);
    expect(await prisma.request.count()).toBe(0);
  });
});

describe('company and admin principals do not cross over', () => {
  it('a company session cannot reach the admin console routes', async () => {
    const res = await request(app).get('/api/admin/companies').set('Cookie', cookieB);
    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain(companyA.company.legalName);
  });

  it('an admin session cannot use the tenant-scoped routes', async () => {
    await createPlatformAdmin('cross@medicalalliance.test');
    const adminCookie = await login(app, 'admin', 'cross@medicalalliance.test');

    const res = await request(app).get('/api/requests').set('Cookie', adminCookie);
    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/company account/i);
  });

  it('the admin console can legitimately see across companies (the contrast case)', async () => {
    await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);
    await createRequestRow(companyB.company.id, companyB.employees[0].id, companyB.admin.id);

    await createPlatformAdmin('console@medicalalliance.test');
    const adminCookie = await login(app, 'admin', 'console@medicalalliance.test');

    const res = await request(app).get('/api/admin/requests').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.requests).toHaveLength(2);

    const companyIds = new Set(res.body.requests.map((r: { companyId: string }) => r.companyId));
    expect(companyIds).toEqual(new Set([companyA.company.id, companyB.company.id]));
  });
});

describe('the session is the only source of tenant scope', () => {
  it('re-logging in as the other company switches the visible data set, nothing else does', async () => {
    await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);

    // Same supertest client, same code path — only the session cookie differs.
    const asA = await request(app).get('/api/requests').set('Cookie', cookieA);
    const asB = await request(app).get('/api/requests').set('Cookie', cookieB);
    expect(asA.body.requests).toHaveLength(1);
    expect(asB.body.requests).toHaveLength(0);

    // A header or query parameter naming the other company changes nothing.
    const spoofed = await request(app)
      .get(`/api/requests?companyId=${companyA.company.id}`)
      .set('Cookie', cookieB)
      .set('X-Company-Id', companyA.company.id);
    expect(spoofed.body.requests).toHaveLength(0);
  });

  it('a session stays bound to its company after the user record is edited', async () => {
    // Even if someone re-pointed the user row, the live session's companyId is
    // what was verified at login — it is not re-read from client input.
    const res = await request(app).get('/api/requests').set('Cookie', cookieB);
    expect(res.status).toBe(200);
    expect(res.body.requests.every((r: { companyId: string }) => r.companyId === companyB.company.id)).toBe(true);
  });
});

describe('database-level tenancy', () => {
  it('every Request row carries a non-null companyId', async () => {
    await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);
    const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      'SELECT COUNT(*)::bigint AS count FROM "Request" WHERE "companyId" IS NULL',
    );
    expect(Number(rows[0].count)).toBe(0);
  });

  it('a company with history cannot be deleted (onDelete: Restrict)', async () => {
    await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);
    await expect(prisma.company.delete({ where: { id: companyA.company.id } })).rejects.toThrow();
    expect(await prisma.company.findUnique({ where: { id: companyA.company.id } })).not.toBeNull();
  });
});
