/**
 * Login rate limiting. The limiter is skipped by default under NODE_ENV=test so
 * it cannot make the other auth tests order-dependent; this file opts in via
 * ENABLE_RATE_LIMIT_IN_TESTS and builds its own app instance.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { TEST_PASSWORD, createTenant, prisma, resetDatabase } from './helpers';
import type { TenantFixture } from './helpers';

let app: Express;
let tenant: TenantFixture;

beforeAll(async () => {
  process.env.ENABLE_RATE_LIMIT_IN_TESTS = 'true';
  process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = '5';
  process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES = '15';

  // Re-import so env.ts and the limiter pick up the variables set above.
  const { createApp } = await import('../src/app?rate-limit');
  app = (createApp as () => Express)();
});

beforeEach(async () => {
  await resetDatabase();
  tenant = await createTenant('echo');
});

afterAll(async () => {
  delete process.env.ENABLE_RATE_LIMIT_IN_TESTS;
  await prisma.$disconnect();
});

describe('POST /api/auth/company/login rate limiting', () => {
  it('blocks further attempts after the configured maximum', async () => {
    const attempt = () =>
      request(app)
        .post('/api/auth/company/login')
        .send({ email: tenant.admin.email, password: 'wrong-password' });

    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      statuses.push((await attempt()).status);
    }

    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);

    // Even the CORRECT password is refused once the limit is tripped.
    const blocked = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.admin.email, password: TEST_PASSWORD });
    expect(blocked.status).toBe(429);
  });

  it('keys on the email as well as the IP, so one account being locked does not lock another', async () => {
    for (let i = 0; i < 6; i += 1) {
      await request(app)
        .post('/api/auth/company/login')
        .send({ email: tenant.admin.email, password: 'wrong-password' });
    }

    const other = await request(app)
      .post('/api/auth/company/login')
      .send({ email: tenant.requester.email, password: TEST_PASSWORD });
    expect(other.status).toBe(200);
  });
});
