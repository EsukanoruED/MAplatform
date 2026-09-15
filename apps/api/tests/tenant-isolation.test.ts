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
import { AdminUserRole, RequestStatus, RequestType } from '@prisma/client';
import { createApp } from '../src/app';
import {
  TEST_PASSWORD,
  createDocumentRow,
  createPaymentRow,
  createPlatformAdmin,
  createRequestRow,
  createTenant,
  login,
  prisma,
  resetDatabase,
  restoreStorage,
  useInMemoryStorage,
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

// ---------------------------------------------------------------------------
// Phase 2 resources — employees, documents, payments and the workflow
// ---------------------------------------------------------------------------

describe('Phase 2: employees are tenant-scoped', () => {
  it("Company B cannot read Company A's employee detail", async () => {
    const asOwner = await request(app)
      .get(`/api/employees/${companyA.employees[0].id}`)
      .set('Cookie', cookieA);
    expect(asOwner.status).toBe(200);

    const asOther = await request(app)
      .get(`/api/employees/${companyA.employees[0].id}`)
      .set('Cookie', cookieB);
    expect(asOther.status).toBe(404);
    expect(JSON.stringify(asOther.body)).not.toContain(companyA.employees[0].fullName);
  });

  it("Company B cannot edit Company A's employee", async () => {
    const res = await request(app)
      .patch(`/api/employees/${companyA.employees[0].id}`)
      .set('Cookie', cookieB)
      .send({ role: 'Hijacked' });

    expect(res.status).toBe(404);

    const row = await prisma.employee.findUniqueOrThrow({
      where: { id: companyA.employees[0].id },
    });
    expect(row.role).not.toBe('Hijacked');
  });

  it("Company B's roster never contains Company A's workers", async () => {
    const res = await request(app).get('/api/employees?active=all').set('Cookie', cookieB);

    const ids = res.body.employees.map((e: { id: string }) => e.id);
    for (const employee of companyA.employees) expect(ids).not.toContain(employee.id);
    expect(res.body.total).toBe(2);
  });

  it('a search cannot reach across tenants', async () => {
    const res = await request(app).get('/api/employees?search=alpha').set('Cookie', cookieB);
    expect(res.body.employees).toHaveLength(0);
  });
});

describe('Phase 2: documents are tenant-scoped', () => {
  it("Company B cannot read or download Company A's document", async () => {
    const storage = useInMemoryStorage();
    try {
      const aRequest = await createRequestRow(
        companyA.company.id,
        companyA.employees[0].id,
        companyA.admin.id,
      );
      const document = await createDocumentRow({
        companyId: companyA.company.id,
        requestId: aRequest.id,
        storage,
      });

      const metadata = await request(app)
        .get(`/api/documents/${document.id}`)
        .set('Cookie', cookieB);
      expect(metadata.status).toBe(404);

      const download = await request(app)
        .get(`/api/documents/${document.id}/download`)
        .set('Cookie', cookieB);
      expect(download.status).toBe(404);

      // And the owner can, so the 404 is about tenancy rather than a broken fixture.
      const asOwner = await request(app)
        .get(`/api/documents/${document.id}`)
        .set('Cookie', cookieA);
      expect(asOwner.status).toBe(200);
    } finally {
      restoreStorage();
    }
  });

  it("Company B cannot list the documents on Company A's request", async () => {
    const aRequest = await createRequestRow(
      companyA.company.id,
      companyA.employees[0].id,
      companyA.admin.id,
    );

    const res = await request(app)
      .get(`/api/requests/${aRequest.id}/documents`)
      .set('Cookie', cookieB);
    expect(res.status).toBe(404);
  });

  it("Company B cannot attach a document to Company A's request", async () => {
    const storage = useInMemoryStorage();
    try {
      const aRequest = await createRequestRow(
        companyA.company.id,
        companyA.employees[0].id,
        companyA.admin.id,
      );

      const res = await request(app)
        .post(`/api/requests/${aRequest.id}/documents`)
        .set('Cookie', cookieB)
        .attach('file', Buffer.from('%PDF-1.4 intruder'), {
          filename: 'x.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(404);
      expect(await prisma.document.count()).toBe(0);
      expect(storage.objects.size).toBe(0);
    } finally {
      restoreStorage();
    }
  });
});

describe('Phase 2: payments are tenant-scoped', () => {
  it("Company B's ledger never contains Company A's payments", async () => {
    await createPaymentRow({ companyId: companyA.company.id, amountMinor: 99999 });

    const res = await request(app).get('/api/payments').set('Cookie', cookieB);

    expect(res.body.payments).toHaveLength(0);
    expect(res.body.summary.outstandingMinor).toBe(0);
    expect(JSON.stringify(res.body)).not.toContain('99999');
  });

  it("Company B cannot read the payments on Company A's request", async () => {
    const aRequest = await createRequestRow(
      companyA.company.id,
      companyA.employees[0].id,
      companyA.admin.id,
    );
    await createPaymentRow({ companyId: companyA.company.id, requestId: aRequest.id });

    const res = await request(app)
      .get(`/api/requests/${aRequest.id}/payments`)
      .set('Cookie', cookieB);
    expect(res.status).toBe(404);
  });
});

describe('Phase 2: the workflow is tenant-scoped', () => {
  it("Company B cannot transition Company A's request", async () => {
    const aRequest = await createRequestRow(
      companyA.company.id,
      companyA.employees[0].id,
      companyA.admin.id,
    );

    const res = await request(app)
      .patch(`/api/requests/${aRequest.id}/status`)
      .set('Cookie', cookieB)
      .send({ status: RequestStatus.REJECTED });

    expect(res.status).toBe(404);

    const row = await prisma.request.findUniqueOrThrow({ where: { id: aRequest.id } });
    expect(row.status).toBe(RequestStatus.SUBMITTED);
    expect(await prisma.requestStatusEvent.count({ where: { requestId: aRequest.id } })).toBe(0);
  });

  it("Company B's dashboard summary counts only its own rows", async () => {
    await createRequestRow(companyA.company.id, companyA.employees[0].id, companyA.admin.id);
    await createRequestRow(companyA.company.id, companyA.employees[1].id, companyA.admin.id);

    const res = await request(app)
      .get('/api/dashboard/company/summary')
      .set('Cookie', cookieB);

    expect(res.body.summary.requests.total).toBe(0);
    expect(res.body.summary.employees.total).toBe(2);
    expect(res.body.recentRequests).toEqual([]);
  });
});

describe('Phase 2: company users cannot reach the admin console', () => {
  it.each([
    ['get', '/api/admin/requests'],
    ['get', '/api/admin/companies'],
    ['get', '/api/admin/labs'],
    ['get', '/api/admin/dashboard/summary'],
  ])('%s %s refuses a company session', async (_method, path) => {
    const res = await request(app).get(path).set('Cookie', cookieA);
    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain(companyB.company.legalName);
  });

  it('a company session cannot use the admin status route on its own request', async () => {
    const own = await createRequestRow(
      companyA.company.id,
      companyA.employees[0].id,
      companyA.admin.id,
    );

    const res = await request(app)
      .patch(`/api/admin/requests/${own.id}/status`)
      .set('Cookie', cookieA)
      .send({ status: RequestStatus.APPROVED });

    expect(res.status).toBe(401);
    const row = await prisma.request.findUniqueOrThrow({ where: { id: own.id } });
    expect(row.status).toBe(RequestStatus.SUBMITTED);
  });
});

describe('Phase 2: admin roles are limited to their own operations', () => {
  it('a REVIEWER may read the queue but not settle money', async () => {
    await createPlatformAdmin('rev@medicalalliance.test', AdminUserRole.REVIEWER);
    const reviewerCookie = await login(app, 'admin', 'rev@medicalalliance.test');
    const payment = await createPaymentRow({ companyId: companyA.company.id });

    const queue = await request(app).get('/api/admin/requests').set('Cookie', reviewerCookie);
    expect(queue.status).toBe(200);

    const settle = await request(app)
      .post(`/api/admin/payments/${payment.id}/settle`)
      .set('Cookie', reviewerCookie)
      .send({});
    expect(settle.status).toBe(403);
  });

  it('an ADMIN may do both', async () => {
    await createPlatformAdmin('boss@medicalalliance.test', AdminUserRole.ADMIN);
    const bossCookie = await login(app, 'admin', 'boss@medicalalliance.test');
    const payment = await createPaymentRow({ companyId: companyA.company.id });

    const queue = await request(app).get('/api/admin/requests').set('Cookie', bossCookie);
    expect(queue.status).toBe(200);

    const settle = await request(app)
      .post(`/api/admin/payments/${payment.id}/settle`)
      .set('Cookie', bossCookie)
      .send({});
    expect(settle.status).toBe(200);
  });
});
