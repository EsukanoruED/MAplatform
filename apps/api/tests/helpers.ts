import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import type { Express } from 'express';
import request from 'supertest';
import {
  AdminUserRole,
  BillingType,
  CompanyUserRole,
  DocumentType,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import { hashPassword } from '../src/services/auth';
import { setStorage } from '../src/services/storage';
import type { StorageAdapter } from '../src/services/storage';

export const prisma = new PrismaClient();

/** The password every fixture account uses. Test-scope only. */
export const TEST_PASSWORD = 'TestPassw0rd!';

/**
 * Wipes every table between tests. CASCADE is safe here — it applies to the
 * TRUNCATE statement, not to the schema's ON DELETE RESTRICT foreign keys, which
 * stay in force for application writes.
 */
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Document", "Payment", "LabNotification", "RequestStatusEvent", "Request", "Employee", "CompanyUser", "AdminUser", "Lab", "Company" RESTART IDENTITY CASCADE',
  );
}

export type TenantFixture = {
  company: { id: string; legalName: string };
  admin: { id: string; email: string };
  requester: { id: string; email: string };
  employees: Array<{ id: string; fullName: string }>;
};

/** Builds one complete tenant: a company, two users and two employees. */
export async function createTenant(slug: string): Promise<TenantFixture> {
  const passwordHash = await hashPassword(TEST_PASSWORD);

  const company = await prisma.company.create({
    data: { legalName: `${slug} Holdings`, billingType: BillingType.PER_REQUEST },
  });

  const admin = await prisma.companyUser.create({
    data: {
      companyId: company.id,
      name: `${slug} Admin`,
      email: `admin@${slug}.test`,
      passwordHash,
      role: CompanyUserRole.COMPANY_ADMIN,
    },
  });

  const requester = await prisma.companyUser.create({
    data: {
      companyId: company.id,
      name: `${slug} Requester`,
      email: `requester@${slug}.test`,
      passwordHash,
      role: CompanyUserRole.COMPANY_REQUESTER,
    },
  });

  const employees = [];
  for (const n of [1, 2]) {
    employees.push(
      await prisma.employee.create({
        data: {
          companyId: company.id,
          fullName: `${slug} Worker ${n}`,
          nationalId: `${slug.toUpperCase()}-${n}`,
          role: 'Operator',
          site: `${slug} Site`,
        },
      }),
    );
  }

  return {
    company: { id: company.id, legalName: company.legalName },
    admin: { id: admin.id, email: admin.email },
    requester: { id: requester.id, email: requester.email },
    employees: employees.map((e) => ({ id: e.id, fullName: e.fullName })),
  };
}

export async function createPlatformAdmin(
  email = 'platform-admin@medicalalliance.test',
  role: AdminUserRole = AdminUserRole.ADMIN,
): Promise<{ id: string; email: string }> {
  const user = await prisma.adminUser.create({
    data: { name: 'Platform Admin', email, passwordHash: await hashPassword(TEST_PASSWORD), role },
  });
  return { id: user.id, email: user.email };
}

export async function createRequestRow(companyId: string, employeeId: string, createdByUserId?: string) {
  return prisma.request.create({
    data: {
      companyId,
      employeeId,
      type: RequestType.CHECKUP,
      status: RequestStatus.SUBMITTED,
      ...(createdByUserId ? { createdByUserId } : {}),
    },
  });
}

/**
 * Logs in and returns the raw Set-Cookie value, which supertest replays on
 * subsequent requests. Nothing about the principal is held client-side — the
 * cookie is only a signed session id.
 */
export async function login(
  app: Express,
  kind: 'company' | 'admin',
  email: string,
  password: string = TEST_PASSWORD,
): Promise<string[]> {
  const res = await request(app).post(`/api/auth/${kind}/login`).send({ email, password });
  if (res.status !== 200) {
    throw new Error(`login for ${email} failed with ${res.status}: ${JSON.stringify(res.body)}`);
  }
  const raw = res.headers['set-cookie'];
  return Array.isArray(raw) ? raw : [raw as unknown as string];
}

// ---------------------------------------------------------------------------
// Phase 2 fixtures
// ---------------------------------------------------------------------------

/**
 * An in-memory StorageAdapter, so the document tests exercise the real upload
 * path without writing clinical files to the test runner's disk.
 */
export class InMemoryStorage implements StorageAdapter {
  readonly name = 'memory';
  readonly objects = new Map<string, Buffer>();

  async put({ key, body }: { key: string; body: Buffer; contentType: string }): Promise<void> {
    if (this.objects.has(key)) throw new Error(`key already exists: ${key}`);
    this.objects.set(key, body);
  }

  createReadStream(key: string): Readable {
    const body = this.objects.get(key);
    if (!body) throw new Error(`no such key: ${key}`);
    return Readable.from(body);
  }

  async exists(key: string): Promise<boolean> {
    return this.objects.has(key);
  }

  async remove(key: string): Promise<void> {
    this.objects.delete(key);
  }
}

/** Installs a fresh in-memory adapter and returns it. */
export function useInMemoryStorage(): InMemoryStorage {
  const storage = new InMemoryStorage();
  setStorage(storage);
  return storage;
}

/** Restores the configured (local disk) adapter. */
export function restoreStorage(): void {
  setStorage(undefined);
}

export async function createLab(
  name = 'Test Laboratory',
  options: { active?: boolean; contactEmail?: string } = {},
) {
  return prisma.lab.create({
    data: {
      name,
      contactEmail: options.contactEmail ?? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@lab.test`,
      active: options.active ?? true,
    },
  });
}

/** A request pinned to an exact status, for transition tests. */
export async function createRequestWithStatus(input: {
  companyId: string;
  employeeId: string;
  status: RequestStatus;
  createdByUserId?: string;
  assignedLabId?: string;
  type?: RequestType;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}) {
  return prisma.request.create({
    data: {
      companyId: input.companyId,
      employeeId: input.employeeId,
      status: input.status,
      type: input.type ?? RequestType.CHECKUP,
      ...(input.createdByUserId ? { createdByUserId: input.createdByUserId } : {}),
      ...(input.assignedLabId ? { assignedLabId: input.assignedLabId } : {}),
      ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
      ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
    },
  });
}

export async function createDocumentRow(input: {
  companyId: string;
  requestId: string;
  type?: DocumentType;
  expiryDate?: Date;
  storage?: InMemoryStorage;
}) {
  const body = Buffer.from('seeded test document', 'utf8');
  const storageKey = `${input.companyId}/${input.requestId}/${randomUUID()}.txt`;
  if (input.storage) await input.storage.put({ key: storageKey, body, contentType: 'text/plain' });

  return prisma.document.create({
    data: {
      companyId: input.companyId,
      requestId: input.requestId,
      type: input.type ?? DocumentType.RESULT,
      fileName: 'result.txt',
      contentType: 'text/plain',
      byteSize: body.length,
      storageKey,
      uploadedByType: 'ADMIN_USER',
      ...(input.expiryDate ? { expiryDate: input.expiryDate } : {}),
    },
  });
}

export async function createPaymentRow(input: {
  companyId: string;
  requestId?: string;
  status?: PaymentStatus;
  amountMinor?: number;
}) {
  return prisma.payment.create({
    data: {
      companyId: input.companyId,
      ...(input.requestId ? { requestId: input.requestId } : {}),
      amountMinor: input.amountMinor ?? 25000,
      currency: 'SAR',
      method: PaymentMethod.PER_REQUEST,
      status: input.status ?? PaymentStatus.PENDING,
    },
  });
}
