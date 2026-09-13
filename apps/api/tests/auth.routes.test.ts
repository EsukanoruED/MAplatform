import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { AdminUserRole } from '@prisma/client';
import { createApp } from '../src/app';
import {
  TEST_PASSWORD,
  createPlatformAdmin,
  createTenant,
  login,
  prisma,
  resetDatabase,
} from './helpers';
import type { TenantFixture } from './helpers';

let app: Express;
let tenant: TenantFixture;
let platformAdmin: { id: string; email: string };

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await resetDatabase();
  tenant = await createTenant('acme');
  platformAdmin = await createPlatformAdmin();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /health', () => {
  it('reports ok without authentication', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/company/login', () => {
  it('sets an httpOnly session cookie on success and returns safe fields only', async () => {
    const res = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.admin.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      type: 'company',
      id: tenant.admin.id,
      email: tenant.admin.email,
      companyId: tenant.company.id,
    });
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    expect(JSON.stringify(res.body)).not.toContain(TEST_PASSWORD);

    const cookie = (res.headers['set-cookie'] as unknown as string[])[0];
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/^ma\.sid=/);
  });

  it('records lastLoginAt', async () => {
    const before = await prisma.companyUser.findUniqueOrThrow({ where: { id: tenant.admin.id } });
    expect(before.lastLoginAt).toBeNull();

    await login(app, 'company', tenant.admin.email);

    const after = await prisma.companyUser.findUniqueOrThrow({ where: { id: tenant.admin.id } });
    expect(after.lastLoginAt).toBeInstanceOf(Date);
  });

  it('rejects a wrong password with 401 and no usable session', async () => {
    const res = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.admin.email, password: 'not-the-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');

    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const me = await request(app).get('/api/auth/me').set('Cookie', cookies as unknown as string[]);
      expect(me.status).toBe(401);
    }
  });

  it('gives an identical response for an unknown email and a wrong password', async () => {
    const unknown = await request(app)
      .post('/api/auth/company/login')
      .send({ email: 'nobody@nowhere.test', password: TEST_PASSWORD });
    const wrongPassword = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.admin.email, password: 'wrong' });

    expect(unknown.status).toBe(wrongPassword.status);
    expect(unknown.body).toEqual(wrongPassword.body);
  });

  it('refuses a deactivated account without saying why', async () => {
    await prisma.companyUser.update({ where: { id: tenant.admin.id }, data: { active: false } });
    const res = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.admin.email, password: TEST_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('is case-insensitive on the email', async () => {
    const res = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.admin.email.toUpperCase(), password: TEST_PASSWORD });
    expect(res.status).toBe(200);
  });

  it('validates the body with zod', async () => {
    const notAnEmail = await request(app)
      .post('/api/auth/company/login')
      .send({ email: 'not-an-email', password: TEST_PASSWORD });
    expect(notAnEmail.status).toBe(400);
    expect(notAnEmail.body.error.code).toBe('VALIDATION_FAILED');

    const noPassword = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.admin.email });
    expect(noPassword.status).toBe(400);
  });

  it('rejects a login body carrying extra fields such as role or companyId', async () => {
    const res = await request(app).post('/api/auth/company/login').send({
      email: tenant.admin.email,
      password: TEST_PASSWORD,
      role: 'COMPANY_ADMIN',
      companyId: 'some-other-company',
    });
    expect(res.status).toBe(400);
  });

  it('rotates the session id on login (no session fixation)', async () => {
    const agent = request.agent(app);
    const first = await agent.post('/api/auth/company/login').send({ email: tenant.admin.email, password: TEST_PASSWORD });
    const second = await agent.post('/api/auth/company/login').send({ email: tenant.admin.email, password: TEST_PASSWORD });

    const idOf = (r: typeof first) => ((r.headers['set-cookie'] as unknown as string[]) ?? [''])[0].split(';')[0];
    expect(idOf(first)).not.toBe(idOf(second));
  });
});

describe('POST /api/auth/admin/login', () => {
  it('authenticates a platform admin', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: platformAdmin.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ type: 'admin', role: AdminUserRole.ADMIN });
    expect(res.body.user).not.toHaveProperty('companyId');
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: platformAdmin.email, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  // The two identity tables are the whole reason a bug cannot promote a tenant
  // account to platform admin. These two cases lock that in.
  it('never authenticates a CompanyUser through the admin endpoint', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: tenant.admin.email, password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('never authenticates an AdminUser through the company endpoint', async () => {
    const res = await request(app)
      .post('/api/auth/company/login')
      .send({ email: platformAdmin.email, password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without a session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('returns the company principal for a company session', async () => {
    const cookie = await login(app, 'company', tenant.admin.email);
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.companyId).toBe(tenant.company.id);
    expect(res.body.user.role).toBe('COMPANY_ADMIN');
  });

  it('returns the admin principal for an admin session', async () => {
    const cookie = await login(app, 'admin', platformAdmin.email);
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.type).toBe('admin');
  });

  it('rejects a forged cookie value', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', ['ma.sid=s%3Aforged.signature']);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('destroys the session so /me returns 401 afterwards', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/company/login').send({ email: tenant.admin.email, password: TEST_PASSWORD });
    await expect(agent.get('/api/auth/me').then((r) => r.status)).resolves.toBe(200);

    const out = await agent.post('/api/auth/logout');
    expect(out.status).toBe(200);

    const after = await agent.get('/api/auth/me');
    expect(after.status).toBe(401);
  });

  it('succeeds even with no session', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});

describe('error handling', () => {
  it('returns the standard error shape for an unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error.code');
    expect(res.body).toHaveProperty('error.message');
  });

  it('never leaks a stack trace to the client', async () => {
    const res = await request(app)
      .post('/api/auth/company/login')
      .send({ email: 'nope', password: '' });
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('at ');
    expect(body).not.toMatch(/\/src\//);
    expect(body).not.toContain('node_modules');
  });
});
