import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import {
  AdminUserRole,
  BillingType,
  DocumentType,
  PaymentMethod,
  PaymentStatus,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import { createApp } from '../src/app';
import {
  createDocumentRow,
  createPaymentRow,
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
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('billing arrangement drives the new request', () => {
  it('a PER_REQUEST company gets a payable request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });

    expect(res.status).toBe(201);
    expect(res.body.request.paymentMethod).toBe(PaymentMethod.PER_REQUEST);
    expect(res.body.request.paymentStatus).toBe(PaymentStatus.PENDING);

    const payment = await prisma.payment.findFirstOrThrow({
      where: { requestId: res.body.request.id },
    });
    expect(payment.method).toBe(PaymentMethod.PER_REQUEST);
    expect(payment.status).toBe(PaymentStatus.PENDING);
    expect(payment.amountMinor).toBeGreaterThan(0);
  });

  it('a SETTLEMENT company is not gated on payment', async () => {
    await prisma.company.update({
      where: { id: tenant.company.id },
      data: { billingType: BillingType.SETTLEMENT },
    });

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });

    expect(res.body.request.paymentMethod).toBe(PaymentMethod.SETTLEMENT);
    expect(res.body.request.paymentStatus).toBe(PaymentStatus.NOT_REQUIRED);

    // A ledger row still exists for the settlement run.
    const payment = await prisma.payment.findFirstOrThrow({
      where: { requestId: res.body.request.id },
    });
    expect(payment.method).toBe(PaymentMethod.SETTLEMENT);
  });

  it('prices a certificate higher than a checkup', async () => {
    const checkup = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({ employeeId: tenant.employees[0].id, type: RequestType.CHECKUP });
    const certificate = await request(app)
      .post('/api/requests')
      .set('Cookie', companyCookie)
      .send({ employeeId: tenant.employees[1].id, type: RequestType.FITNESS_CERTIFICATE });

    const checkupPayment = await prisma.payment.findFirstOrThrow({
      where: { requestId: checkup.body.request.id },
    });
    const certificatePayment = await prisma.payment.findFirstOrThrow({
      where: { requestId: certificate.body.request.id },
    });

    expect(certificatePayment.amountMinor).toBeGreaterThan(checkupPayment.amountMinor);
  });
});

describe('GET /api/payments', () => {
  it('returns the tenant ledger with totals', async () => {
    await createPaymentRow({ companyId: tenant.company.id, amountMinor: 25000 });
    await createPaymentRow({
      companyId: tenant.company.id,
      amountMinor: 40000,
      status: PaymentStatus.PAID,
    });

    const res = await request(app).get('/api/payments').set('Cookie', companyCookie);

    expect(res.status).toBe(200);
    expect(res.body.payments).toHaveLength(2);
    expect(res.body.summary.outstandingMinor).toBe(25000);
    expect(res.body.summary.settledMinor).toBe(40000);
    expect(res.body.summary.currency).toBe('SAR');
  });

  it('filters by status', async () => {
    await createPaymentRow({ companyId: tenant.company.id });
    await createPaymentRow({ companyId: tenant.company.id, status: PaymentStatus.PAID });

    const res = await request(app)
      .get(`/api/payments?status=${PaymentStatus.PAID}`)
      .set('Cookie', companyCookie);
    expect(res.body.payments).toHaveLength(1);
  });

  it('is read-only for companies — there is no company settle route', async () => {
    const payment = await createPaymentRow({ companyId: tenant.company.id });

    const res = await request(app)
      .post(`/api/payments/${payment.id}/settle`)
      .set('Cookie', companyCookie)
      .send({});

    // No such route exists on the company router.
    expect(res.status).toBe(404);
    const row = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(row.status).toBe(PaymentStatus.PENDING);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/payments');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/admin/payments/:id/settle', () => {
  it('settles a payment and syncs the parent request', async () => {
    const req1 = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.PENDING,
    });
    const payment = await createPaymentRow({
      companyId: tenant.company.id,
      requestId: req1.id,
    });

    const res = await request(app)
      .post(`/api/admin/payments/${payment.id}/settle`)
      .set('Cookie', adminCookie)
      .send({ providerReference: 'BANK-TRANSFER-001' });

    expect(res.status).toBe(200);
    expect(res.body.payment.status).toBe(PaymentStatus.PAID);
    expect(res.body.payment.providerReference).toBe('BANK-TRANSFER-001');
    expect(res.body.payment.paidAt).not.toBeNull();

    const request1 = await prisma.request.findUniqueOrThrow({ where: { id: req1.id } });
    expect(request1.paymentStatus).toBe(PaymentStatus.PAID);
  });

  it('refuses to settle twice', async () => {
    const payment = await createPaymentRow({
      companyId: tenant.company.id,
      status: PaymentStatus.PAID,
    });

    const res = await request(app)
      .post(`/api/admin/payments/${payment.id}/settle`)
      .set('Cookie', adminCookie)
      .send({});

    expect(res.status).toBe(400);
  });

  it('refuses a REVIEWER — settling money is an ADMIN action', async () => {
    const payment = await createPaymentRow({ companyId: tenant.company.id });

    const res = await request(app)
      .post(`/api/admin/payments/${payment.id}/settle`)
      .set('Cookie', reviewerCookie)
      .send({});

    expect(res.status).toBe(403);
    const row = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(row.status).toBe(PaymentStatus.PENDING);
  });

  it('refuses a company session', async () => {
    const payment = await createPaymentRow({ companyId: tenant.company.id });

    const res = await request(app)
      .post(`/api/admin/payments/${payment.id}/settle`)
      .set('Cookie', companyCookie)
      .send({});

    expect(res.status).toBe(401);
  });
});

describe('GET /api/dashboard/company/summary', () => {
  it('aggregates employees, requests, certificates and payments from real rows', async () => {
    await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.SUBMITTED,
    });
    await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[1].id,
      status: RequestStatus.PENDING_PAYMENT,
    });
    const done = await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.COMPLETE,
    });

    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    await createDocumentRow({
      companyId: tenant.company.id,
      requestId: done.id,
      type: DocumentType.CERTIFICATE,
      expiryDate: soon,
    });

    await createPaymentRow({ companyId: tenant.company.id, amountMinor: 25000 });

    const res = await request(app)
      .get('/api/dashboard/company/summary')
      .set('Cookie', companyCookie);

    expect(res.status).toBe(200);
    const { summary, recentRequests, expiringCertificates } = res.body;

    expect(summary.employees).toEqual({ total: 2, active: 2 });
    expect(summary.requests.total).toBe(3);
    expect(summary.requests.open).toBe(2);
    expect(summary.requests.pendingAction).toBe(1);
    expect(summary.requests.complete).toBe(1);
    expect(summary.requests.byStatus.SUBMITTED).toBe(1);
    expect(summary.certificates.total).toBe(1);
    expect(summary.certificates.expiringSoon).toBe(1);
    expect(summary.payments.outstandingMinor).toBe(25000);

    expect(recentRequests).toHaveLength(3);
    expect(recentRequests[0].employee).toHaveProperty('fullName');
    expect(expiringCertificates).toHaveLength(1);
  });

  it('returns zeroes for a company with no data', async () => {
    const res = await request(app)
      .get('/api/dashboard/company/summary')
      .set('Cookie', companyCookie);

    expect(res.body.summary.requests.total).toBe(0);
    expect(res.body.summary.certificates.total).toBe(0);
    expect(res.body.recentRequests).toEqual([]);
    expect(Object.values(res.body.summary.requests.byStatus).every((n) => n === 0)).toBe(true);
  });

  it('is not reachable by an admin session (it is tenant-scoped)', async () => {
    const res = await request(app).get('/api/dashboard/company/summary').set('Cookie', adminCookie);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/dashboard/summary', () => {
  it('reports the platform-wide picture to staff', async () => {
    await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.UNDER_REVIEW,
    });

    const res = await request(app).get('/api/admin/dashboard/summary').set('Cookie', reviewerCookie);

    expect(res.status).toBe(200);
    expect(res.body.summary.companies).toBe(1);
    expect(res.body.summary.employees).toBe(2);
    expect(res.body.summary.awaitingReview).toBe(1);
    expect(res.body.summary.requests.total).toBe(1);
  });

  it('refuses a company session', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/summary')
      .set('Cookie', companyCookie);
    expect(res.status).toBe(401);
  });
});
