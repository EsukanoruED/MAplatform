import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { AdminUserRole, DocumentType, RequestStatus } from '@prisma/client';
import { createApp } from '../src/app';
import {
  createPlatformAdmin,
  createRequestWithStatus,
  createTenant,
  login,
  prisma,
  resetDatabase,
  restoreStorage,
  useInMemoryStorage,
} from './helpers';
import type { InMemoryStorage, TenantFixture } from './helpers';
import { safeDisplayFileName } from '../src/services/documents';
import { buildStorageKey, isAllowedContentType } from '../src/services/storage';

let app: Express;
let tenant: TenantFixture;
let companyCookie: string[];
let adminCookie: string[];
let storage: InMemoryStorage;
let requestId: string;

const PDF_BYTES = Buffer.from('%PDF-1.4 fake pdf for testing', 'utf8');

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await resetDatabase();
  storage = useInMemoryStorage();

  tenant = await createTenant('acme');
  companyCookie = await login(app, 'company', tenant.admin.email);

  await createPlatformAdmin('ops@ma.test', AdminUserRole.ADMIN);
  adminCookie = await login(app, 'admin', 'ops@ma.test');

  requestId = (
    await createRequestWithStatus({
      companyId: tenant.company.id,
      employeeId: tenant.employees[0].id,
      status: RequestStatus.UNDER_REVIEW,
    })
  ).id;
});

afterEach(() => {
  restoreStorage();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('storage key safety', () => {
  it('never derives the stored key from the client filename', () => {
    const key = buildStorageKey({
      companyId: 'company-1',
      requestId: 'request-1',
      contentType: 'application/pdf',
    });
    expect(key).toMatch(/^company-1\/request-1\/[0-9a-f-]{36}\.pdf$/);
    expect(key).not.toContain('..');
  });

  it('strips path traversal and control characters from the display filename', () => {
    expect(safeDisplayFileName('../../../etc/passwd')).toBe('passwd');
    expect(safeDisplayFileName('C:\\Windows\\system32\\config')).toBe('config');
    expect(safeDisplayFileName('')).toBe('document');
    expect(safeDisplayFileName('report".pdf')).toBe('report.pdf');
  });

  it('allow-lists content types rather than blocking known-bad ones', () => {
    expect(isAllowedContentType('application/pdf')).toBe(true);
    expect(isAllowedContentType('image/png')).toBe(true);
    expect(isAllowedContentType('application/pdf; charset=binary')).toBe(true);
    // Scriptable and executable types are not on the list.
    expect(isAllowedContentType('image/svg+xml')).toBe(false);
    expect(isAllowedContentType('text/html')).toBe(false);
    expect(isAllowedContentType('application/x-msdownload')).toBe(false);
  });
});

describe('POST /api/requests/:id/documents (company)', () => {
  it('attaches a supporting document and stores the bytes under a generated key', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .attach('file', PDF_BYTES, { filename: 'consent-form.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(201);
    expect(res.body.document).toMatchObject({
      companyId: tenant.company.id,
      requestId,
      type: DocumentType.ATTACHMENT,
      fileName: 'consent-form.pdf',
      contentType: 'application/pdf',
      byteSize: PDF_BYTES.length,
    });
    // The response never leaks the storage key.
    expect(res.body.document).not.toHaveProperty('storageKey');

    const row = await prisma.document.findUniqueOrThrow({ where: { id: res.body.document.id } });
    expect(storage.objects.has(row.storageKey)).toBe(true);
    expect(row.checksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it('refuses a content type outside the allow-list', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .attach('file', Buffer.from('<svg onload=alert(1)>'), {
        filename: 'x.svg',
        contentType: 'image/svg+xml',
      });

    expect(res.status).toBe(400);
    expect(await prisma.document.count()).toBe(0);
    expect(storage.objects.size).toBe(0);
  });

  it('refuses a request with no file', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .field('type', DocumentType.ATTACHMENT);

    expect(res.status).toBe(400);
  });

  it('refuses an empty file', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .attach('file', Buffer.alloc(0), { filename: 'empty.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
    expect(await prisma.document.count()).toBe(0);
  });

  it('refuses a company attempting to issue its own CERTIFICATE', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .field('type', DocumentType.CERTIFICATE)
      .attach('file', PDF_BYTES, { filename: 'self-issued.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/issued by Medical Alliance/i);
    expect(await prisma.document.count()).toBe(0);
  });

  it('refuses a RESULT upload from a company too', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .field('type', DocumentType.RESULT)
      .attach('file', PDF_BYTES, { filename: 'result.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/admin/requests/:id/documents', () => {
  it('lets staff issue a certificate with an expiry date', async () => {
    const res = await request(app)
      .post(`/api/admin/requests/${requestId}/documents`)
      .set('Cookie', adminCookie)
      .field('type', DocumentType.CERTIFICATE)
      .field('expiryDate', '2027-03-14')
      .attach('file', PDF_BYTES, { filename: 'certificate.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(201);
    expect(res.body.document.type).toBe(DocumentType.CERTIFICATE);
    expect(res.body.document.expiryDate).toContain('2027-03-14');
    // The document inherits the request's tenant, so the company can read it.
    expect(res.body.document.companyId).toBe(tenant.company.id);
  });

  it('requires an expiry date on a certificate', async () => {
    const res = await request(app)
      .post(`/api/admin/requests/${requestId}/documents`)
      .set('Cookie', adminCookie)
      .field('type', DocumentType.CERTIFICATE)
      .attach('file', PDF_BYTES, { filename: 'certificate.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toContainEqual(expect.objectContaining({ path: 'expiryDate' }));
  });

  it('is not reachable by a company session', async () => {
    const res = await request(app)
      .post(`/api/admin/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .field('type', DocumentType.CERTIFICATE)
      .attach('file', PDF_BYTES, { filename: 'certificate.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/documents/:id and download', () => {
  async function uploadOne() {
    const res = await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .attach('file', PDF_BYTES, { filename: 'consent-form.pdf', contentType: 'application/pdf' });
    return res.body.document.id as string;
  }

  it('returns metadata without the storage key', async () => {
    const id = await uploadOne();

    const res = await request(app).get(`/api/documents/${id}`).set('Cookie', companyCookie);

    expect(res.status).toBe(200);
    expect(res.body.document.fileName).toBe('consent-form.pdf');
    expect(JSON.stringify(res.body)).not.toContain('storageKey');
  });

  it('streams the bytes with a safe disposition and no-store caching', async () => {
    const id = await uploadOne();

    const res = await request(app)
      .get(`/api/documents/${id}/download`)
      .set('Cookie', companyCookie)
      .buffer(true)
      .parse((r, cb) => {
        const chunks: Buffer[] = [];
        r.on('data', (c: Buffer) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['cache-control']).toContain('no-store');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(Buffer.from(res.body).toString('utf8')).toBe(PDF_BYTES.toString('utf8'));
  });

  it('404s when the row exists but the stored object has gone', async () => {
    const id = await uploadOne();
    const row = await prisma.document.findUniqueOrThrow({ where: { id } });
    storage.objects.delete(row.storageKey);

    const res = await request(app).get(`/api/documents/${id}/download`).set('Cookie', companyCookie);
    expect(res.status).toBe(404);
  });

  it('400s a malformed document id', async () => {
    const res = await request(app).get('/api/documents/not-a-uuid').set('Cookie', companyCookie);
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const id = await uploadOne();
    const res = await request(app).get(`/api/documents/${id}/download`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/requests/:id/documents', () => {
  it('lists the documents attached to a request', async () => {
    await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .attach('file', PDF_BYTES, { filename: 'a.pdf', contentType: 'application/pdf' });
    await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .attach('file', PDF_BYTES, { filename: 'b.pdf', contentType: 'application/pdf' });

    const res = await request(app)
      .get(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie);

    expect(res.status).toBe(200);
    expect(res.body.documents).toHaveLength(2);
  });

  it('includes documents on the request detail payload', async () => {
    await request(app)
      .post(`/api/requests/${requestId}/documents`)
      .set('Cookie', companyCookie)
      .attach('file', PDF_BYTES, { filename: 'a.pdf', contentType: 'application/pdf' });

    const res = await request(app).get(`/api/requests/${requestId}`).set('Cookie', companyCookie);
    expect(res.body.request.documents).toHaveLength(1);
  });
});
