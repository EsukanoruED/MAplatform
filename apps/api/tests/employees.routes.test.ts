import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app';
import { createTenant, login, prisma, resetDatabase } from './helpers';
import type { TenantFixture } from './helpers';

let app: Express;
let tenant: TenantFixture;
let adminCookie: string[];
let requesterCookie: string[];

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await resetDatabase();
  tenant = await createTenant('acme');
  adminCookie = await login(app, 'company', tenant.admin.email);
  requesterCookie = await login(app, 'company', tenant.requester.email);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/employees', () => {
  it('creates an employee against the authenticated company', async () => {
    const res = await request(app).post('/api/employees').set('Cookie', adminCookie).send({
      fullName: 'N. Farouk',
      nationalId: 'ACME-1001',
      role: 'Rigger',
      site: 'Jazan Site 4',
      dateOfBirth: '1990-04-12',
    });

    expect(res.status).toBe(201);
    expect(res.body.employee).toMatchObject({
      fullName: 'N. Farouk',
      nationalId: 'ACME-1001',
      companyId: tenant.company.id,
      active: true,
    });

    // Verified against the database, not just the response body.
    const row = await prisma.employee.findUniqueOrThrow({ where: { id: res.body.employee.id } });
    expect(row.companyId).toBe(tenant.company.id);
    expect(row.dateOfBirth?.toISOString().slice(0, 10)).toBe('1990-04-12');
  });

  it('lets a COMPANY_REQUESTER register a worker', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Cookie', requesterCookie)
      .send({ fullName: 'S. Idris', nationalId: 'ACME-1002' });

    expect(res.status).toBe(201);
  });

  it('validates required fields', async () => {
    const missingName = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ nationalId: 'ACME-1003' });
    expect(missingName.status).toBe(400);
    expect(missingName.body.error.code).toBe('VALIDATION_FAILED');

    const shortName = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'A', nationalId: 'ACME-1004' });
    expect(shortName.status).toBe(400);

    const missingNationalId = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'Valid Name' });
    expect(missingNationalId.status).toBe(400);
  });

  it('rejects a future date of birth and a malformed date', async () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);

    const futureRes = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({
        fullName: 'Time Traveller',
        nationalId: 'ACME-1005',
        dateOfBirth: future.toISOString().slice(0, 10),
      });
    expect(futureRes.status).toBe(400);

    const malformed = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'Bad Date', nationalId: 'ACME-1006', dateOfBirth: '12/04/1990' });
    expect(malformed.status).toBe(400);
  });

  it('refuses a duplicate national ID within the same company, with a field-level message', async () => {
    await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'First', nationalId: 'ACME-DUP' });

    const second = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'Second', nationalId: 'ACME-DUP' });

    expect(second.status).toBe(400);
    expect(second.body.error.details).toContainEqual(
      expect.objectContaining({ path: 'nationalId' }),
    );
  });

  it('allows the same national ID in a different company (it is scoped, not global)', async () => {
    const other = await createTenant('bravo');
    const otherCookie = await login(app, 'company', other.admin.email);

    const a = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'Shared ID', nationalId: 'SHARED-1' });
    const b = await request(app)
      .post('/api/employees')
      .set('Cookie', otherCookie)
      .send({ fullName: 'Shared ID', nationalId: 'SHARED-1' });

    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
  });

  it('rejects a client-supplied companyId instead of honouring it', async () => {
    const other = await createTenant('charlie');
    const res = await request(app).post('/api/employees').set('Cookie', adminCookie).send({
      fullName: 'Injected',
      nationalId: 'ACME-INJ',
      companyId: other.company.id,
    });

    expect(res.status).toBe(400);
    expect(await prisma.employee.count({ where: { companyId: other.company.id, fullName: 'Injected' } })).toBe(0);
  });
});

describe('GET /api/employees', () => {
  it('lists the tenant roster with a total and the sites in use', async () => {
    const res = await request(app).get('/api/employees').set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.employees).toHaveLength(2);
    expect(res.body.total).toBe(2);
    expect(res.body.sites).toEqual(['acme Site']);
  });

  it('never exposes nationalId or dateOfBirth in the list projection', async () => {
    const res = await request(app).get('/api/employees').set('Cookie', adminCookie);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('nationalId');
    expect(body).not.toContain('dateOfBirth');
    expect(body).not.toContain('ACME-1');
  });

  it('searches by name, role and site', async () => {
    await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'Zainab Haddad', nationalId: 'ACME-Z1', role: 'Welder', site: 'Yanbu' });

    const byName = await request(app).get('/api/employees?search=zainab').set('Cookie', adminCookie);
    expect(byName.body.employees).toHaveLength(1);

    const byRole = await request(app).get('/api/employees?search=welder').set('Cookie', adminCookie);
    expect(byRole.body.employees).toHaveLength(1);

    const bySite = await request(app).get('/api/employees?search=yanbu').set('Cookie', adminCookie);
    expect(bySite.body.employees).toHaveLength(1);

    const noMatch = await request(app).get('/api/employees?search=nobody').set('Cookie', adminCookie);
    expect(noMatch.body.employees).toHaveLength(0);
  });

  it('filters by site and by active state', async () => {
    const created = await request(app)
      .post('/api/employees')
      .set('Cookie', adminCookie)
      .send({ fullName: 'Archived Worker', nationalId: 'ACME-ARCH', site: 'Tabuk' });

    await request(app)
      .patch(`/api/employees/${created.body.employee.id}`)
      .set('Cookie', adminCookie)
      .send({ active: false });

    const activeOnly = await request(app).get('/api/employees').set('Cookie', adminCookie);
    expect(activeOnly.body.employees.map((e: { fullName: string }) => e.fullName)).not.toContain('Archived Worker');

    const inactive = await request(app).get('/api/employees?active=false').set('Cookie', adminCookie);
    expect(inactive.body.employees).toHaveLength(1);

    const all = await request(app).get('/api/employees?active=all').set('Cookie', adminCookie);
    expect(all.body.employees).toHaveLength(3);

    const bySite = await request(app).get('/api/employees?site=Tabuk&active=all').set('Cookie', adminCookie);
    expect(bySite.body.employees).toHaveLength(1);
  });

  it('paginates', async () => {
    const page = await request(app).get('/api/employees?take=1&skip=0').set('Cookie', adminCookie);
    expect(page.body.employees).toHaveLength(1);
    expect(page.body.total).toBe(2);
    expect(page.body.page).toEqual({ take: 1, skip: 0 });
  });

  it('rejects an invalid take rather than ignoring it', async () => {
    const res = await request(app).get('/api/employees?take=9999').set('Cookie', adminCookie);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/employees/:id', () => {
  it('returns the detail projection plus that worker’s requests', async () => {
    const res = await request(app)
      .get(`/api/employees/${tenant.employees[0].id}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.employee).toMatchObject({
      id: tenant.employees[0].id,
      companyId: tenant.company.id,
    });
    // The detail view legitimately includes the identifiers the list withholds.
    expect(res.body.employee).toHaveProperty('nationalId');
    expect(res.body.requests).toEqual([]);
  });

  it('404s for an unknown id and 400s for a malformed one', async () => {
    const unknown = await request(app)
      .get('/api/employees/99999999-9999-4999-8999-999999999999')
      .set('Cookie', adminCookie);
    expect(unknown.status).toBe(404);

    const malformed = await request(app).get('/api/employees/not-a-uuid').set('Cookie', adminCookie);
    expect(malformed.status).toBe(400);
  });
});

describe('PATCH /api/employees/:id', () => {
  it('updates a worker', async () => {
    const res = await request(app)
      .patch(`/api/employees/${tenant.employees[0].id}`)
      .set('Cookie', adminCookie)
      .send({ role: 'Senior Operator', site: 'Riyadh Depot' });

    expect(res.status).toBe(200);
    expect(res.body.employee).toMatchObject({ role: 'Senior Operator', site: 'Riyadh Depot' });

    const row = await prisma.employee.findUniqueOrThrow({ where: { id: tenant.employees[0].id } });
    expect(row.role).toBe('Senior Operator');
  });

  it('archives and restores a worker', async () => {
    const archive = await request(app)
      .patch(`/api/employees/${tenant.employees[0].id}`)
      .set('Cookie', adminCookie)
      .send({ active: false });
    expect(archive.body.employee.active).toBe(false);

    const restore = await request(app)
      .patch(`/api/employees/${tenant.employees[0].id}`)
      .set('Cookie', adminCookie)
      .send({ active: true });
    expect(restore.body.employee.active).toBe(true);
  });

  it('requires at least one field', async () => {
    const res = await request(app)
      .patch(`/api/employees/${tenant.employees[0].id}`)
      .set('Cookie', adminCookie)
      .send({});
    expect(res.status).toBe(400);
  });

  it('refuses an edit from a COMPANY_REQUESTER (403)', async () => {
    const res = await request(app)
      .patch(`/api/employees/${tenant.employees[0].id}`)
      .set('Cookie', requesterCookie)
      .send({ role: 'Escalated' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');

    const row = await prisma.employee.findUniqueOrThrow({ where: { id: tenant.employees[0].id } });
    expect(row.role).not.toBe('Escalated');
  });

  it('rejects a companyId in the update body', async () => {
    const other = await createTenant('delta');
    const res = await request(app)
      .patch(`/api/employees/${tenant.employees[0].id}`)
      .set('Cookie', adminCookie)
      .send({ role: 'Fine', companyId: other.company.id });

    expect(res.status).toBe(400);
  });
});

describe('unauthenticated access', () => {
  it.each([
    ['get', '/api/employees'],
    ['post', '/api/employees'],
  ])('%s %s returns 401', async (method, path) => {
    const res = await (method === 'get' ? request(app).get(path) : request(app).post(path).send({}));
    expect(res.status).toBe(401);
  });
});
