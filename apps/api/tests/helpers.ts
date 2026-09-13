import type { Express } from 'express';
import request from 'supertest';
import {
  AdminUserRole,
  BillingType,
  CompanyUserRole,
  PrismaClient,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import { hashPassword } from '../src/services/auth';

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
    'TRUNCATE TABLE "RequestStatusEvent", "Request", "Employee", "CompanyUser", "AdminUser", "Lab", "Company" RESTART IDENTITY CASCADE',
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
