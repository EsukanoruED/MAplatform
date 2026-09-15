/**
 * Development seed.
 *
 * Creates TWO companies on purpose: the platform's core guarantee is that one
 * company can never read another's worker health data, and that guarantee needs
 * two real tenants to be testable (see tests/tenant-isolation.test.ts).
 *
 * Passwords are bcrypt-hashed from SEED_DEMO_PASSWORD. That variable is a
 * well-known development value documented in .env.example — it is not a secret,
 * and a production database must never be seeded with it.
 *
 * Phase 2 extends the fixture to cover the whole workflow: requests spread
 * across every status, a persisted status-event trail for each, certificate and
 * result documents (including one expiring inside the dashboard's 30-day
 * window), and payment rows for both billing arrangements.
 *
 * Document bytes are written through the same StorageAdapter the API uses, so a
 * seeded certificate is genuinely downloadable rather than a dangling row.
 */
import {
  PrismaClient,
  ActorType,
  AdminUserRole,
  BillingType,
  CompanyUserRole,
  DocumentType,
  LabNotificationStatus,
  PaymentMethod,
  PaymentStatus,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import { hashPassword } from '../src/services/auth';
import { env } from '../src/env';
import { buildStorageKey, checksumOf, getStorage } from '../src/services/storage';
import type { StorageAdapter } from '../src/services/storage';

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'DemoPassw0rd!';

/**
 * Writes a seeded document through the real StorageAdapter, so the demo data is
 * genuinely downloadable instead of a Document row pointing at nothing.
 */
async function writeSeedDocument(
  storage: StorageAdapter,
  input: {
    companyId: string;
    requestId: string;
    type: DocumentType;
    fileName: string;
    text: string;
    expiryDate?: Date;
  },
) {
  const contentType = 'text/plain';
  const body = Buffer.from(input.text, 'utf8');
  const storageKey = buildStorageKey({
    companyId: input.companyId,
    requestId: input.requestId,
    contentType,
  });

  await storage.put({ key: storageKey, body, contentType });

  return prisma.document.create({
    data: {
      companyId: input.companyId,
      requestId: input.requestId,
      type: input.type,
      fileName: input.fileName,
      contentType,
      byteSize: body.length,
      storageKey,
      checksum: checksumOf(body),
      uploadedByType: ActorType.ADMIN_USER,
      ...(input.expiryDate ? { expiryDate: input.expiryDate } : {}),
    },
  });
}

async function main(): Promise<void> {
  if (env.isProduction) {
    throw new Error('Refusing to run the development seed against NODE_ENV=production.');
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // ---------------------------------------------------------------- companies
  const companyA = await prisma.company.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      legalName: 'Northgate Industrial Services',
      billingType: BillingType.SETTLEMENT,
    },
  });

  const companyB = await prisma.company.upsert({
    where: { id: '22222222-2222-4222-8222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-4222-8222-222222222222',
      legalName: 'Harbourline Logistics',
      billingType: BillingType.PER_REQUEST,
    },
  });

  // ------------------------------------------------------------ company users
  const companyAAdmin = await prisma.companyUser.upsert({
    where: { email: 'ops@northgate-industrial.example' },
    update: { passwordHash, companyId: companyA.id },
    create: {
      companyId: companyA.id,
      name: 'Dr N. Al-Qahtani',
      email: 'ops@northgate-industrial.example',
      passwordHash,
      role: CompanyUserRole.COMPANY_ADMIN,
    },
  });

  const companyARequester = await prisma.companyUser.upsert({
    where: { email: 'requests@northgate-industrial.example' },
    update: { passwordHash, companyId: companyA.id },
    create: {
      companyId: companyA.id,
      name: 'F. Osman',
      email: 'requests@northgate-industrial.example',
      passwordHash,
      role: CompanyUserRole.COMPANY_REQUESTER,
    },
  });

  const companyBAdmin = await prisma.companyUser.upsert({
    where: { email: 'ops@harbourline-logistics.example' },
    update: { passwordHash, companyId: companyB.id },
    create: {
      companyId: companyB.id,
      name: 'L. Haddad',
      email: 'ops@harbourline-logistics.example',
      passwordHash,
      role: CompanyUserRole.COMPANY_ADMIN,
    },
  });

  // ------------------------------------------------------------- admin users
  await prisma.adminUser.upsert({
    where: { email: 'admin@medicalalliance.example' },
    update: { passwordHash },
    create: {
      name: 'Medical Alliance Operations',
      email: 'admin@medicalalliance.example',
      passwordHash,
      role: AdminUserRole.ADMIN,
    },
  });

  await prisma.adminUser.upsert({
    where: { email: 'reviewer@medicalalliance.example' },
    update: { passwordHash },
    create: {
      name: 'Dr S. Rahman',
      email: 'reviewer@medicalalliance.example',
      passwordHash,
      role: AdminUserRole.REVIEWER,
    },
  });

  // -------------------------------------------------------------------- labs
  const labs = await Promise.all([
    prisma.lab.upsert({
      where: { contactEmail: 'results@riyadh-diagnostics.example' },
      update: {},
      create: { name: 'Riyadh Diagnostics Laboratory', contactEmail: 'results@riyadh-diagnostics.example' },
    }),
    prisma.lab.upsert({
      where: { contactEmail: 'intake@jazan-medlab.example' },
      update: {},
      create: { name: 'Jazan Medical Laboratory', contactEmail: 'intake@jazan-medlab.example' },
    }),
  ]);

  // --------------------------------------------------------------- employees
  // Names and sites mirror the prototype's WORKERS fixture so the migrated
  // screens render recognisable data.
  const companyAEmployees = [
    { nationalId: 'MA-40118', fullName: 'A. Al-Harbi', role: 'Process operator', site: 'Jazan Site 4', dateOfBirth: '1991-02-14' },
    { nationalId: 'MA-40207', fullName: 'R. Menon', role: 'Terminal technician', site: 'Yanbu Terminal', dateOfBirth: '1988-07-02' },
    { nationalId: 'MA-39884', fullName: 'S. Okonkwo', role: 'Maintenance fitter', site: 'Jazan Site 4', dateOfBirth: '1985-11-19' },
    { nationalId: 'MA-40311', fullName: 'K. Ahmed', role: 'Warehouse lead', site: 'Riyadh Depot', dateOfBirth: '1994-04-28' },
  ];
  const companyBEmployees = [
    { nationalId: 'HL-20041', fullName: 'M. Haddad', role: 'Crane operator', site: 'Tabuk Camp 2', dateOfBirth: '1990-01-09' },
    { nationalId: 'HL-20055', fullName: 'T. Ibrahim', role: 'Logistics coordinator', site: 'Dammam Yard', dateOfBirth: '1992-09-30' },
  ];

  for (const e of companyAEmployees) {
    await prisma.employee.upsert({
      where: { companyId_nationalId: { companyId: companyA.id, nationalId: e.nationalId } },
      update: {},
      create: { ...e, companyId: companyA.id, dateOfBirth: new Date(e.dateOfBirth) },
    });
  }
  for (const e of companyBEmployees) {
    await prisma.employee.upsert({
      where: { companyId_nationalId: { companyId: companyB.id, nationalId: e.nationalId } },
      update: {},
      create: { ...e, companyId: companyB.id, dateOfBirth: new Date(e.dateOfBirth) },
    });
  }

  // ---------------------------------------------------------------- requests
  // Seeded only when the table is empty, so re-running the seed does not pile up
  // duplicate demo requests.
  const existingRequests = await prisma.request.count();
  if (existingRequests === 0) {
    const aWorkers = await prisma.employee.findMany({ where: { companyId: companyA.id }, orderBy: { nationalId: 'asc' } });
    const bWorkers = await prisma.employee.findMany({ where: { companyId: companyB.id }, orderBy: { nationalId: 'asc' } });

    /**
     * One entry per demo request. `history` lists the statuses the request moved
     * through, so the seeded timeline looks like a real audit trail rather than a
     * single synthetic row.
     */
    type Plan = {
      companyId: string;
      createdByUserId: string;
      employeeId: string;
      type: RequestType;
      history: RequestStatus[];
      paymentMethod: PaymentMethod;
      paymentStatus: PaymentStatus;
      assignedLabId?: string;
      notes?: string;
      /** Days from today until the issued certificate expires. */
      certificateExpiresInDays?: number;
      withResult?: boolean;
    };

    const plan: Plan[] = [
      // Company A — SETTLEMENT billing, so requests are not gated on payment.
      {
        companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[0].id,
        type: RequestType.FITNESS_CERTIFICATE,
        history: [RequestStatus.SUBMITTED, RequestStatus.APPROVED, RequestStatus.AT_LAB, RequestStatus.RESULTS_RECEIVED, RequestStatus.UNDER_REVIEW, RequestStatus.COMPLETE],
        paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.NOT_REQUIRED,
        assignedLabId: labs[1].id, notes: 'Annual periodic examination.',
        certificateExpiresInDays: 180, withResult: true,
      },
      {
        // Expires inside the dashboard's 30-day window, so "expiring soon" is non-zero.
        companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[1].id,
        type: RequestType.FITNESS_CERTIFICATE,
        history: [RequestStatus.SUBMITTED, RequestStatus.APPROVED, RequestStatus.AT_LAB, RequestStatus.RESULTS_RECEIVED, RequestStatus.UNDER_REVIEW, RequestStatus.COMPLETE],
        paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.NOT_REQUIRED,
        assignedLabId: labs[0].id, certificateExpiresInDays: 21, withResult: true,
      },
      {
        companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[1].id,
        type: RequestType.CHECKUP,
        history: [RequestStatus.SUBMITTED, RequestStatus.APPROVED, RequestStatus.AT_LAB],
        paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.NOT_REQUIRED,
        assignedLabId: labs[0].id, notes: 'Audiometry and spirometry.',
      },
      {
        companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[2].id,
        type: RequestType.FITNESS_CERTIFICATE,
        history: [RequestStatus.SUBMITTED, RequestStatus.APPROVED, RequestStatus.AT_LAB, RequestStatus.RESULTS_RECEIVED, RequestStatus.UNDER_REVIEW],
        paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.NOT_REQUIRED,
        assignedLabId: labs[1].id, withResult: true,
      },
      {
        companyId: companyA.id, createdByUserId: companyARequester.id, employeeId: aWorkers[3].id,
        type: RequestType.CHECKUP,
        history: [RequestStatus.SUBMITTED],
        paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.NOT_REQUIRED,
      },
      {
        companyId: companyA.id, createdByUserId: companyARequester.id, employeeId: aWorkers[0].id,
        type: RequestType.CHECKUP,
        history: [RequestStatus.SUBMITTED, RequestStatus.REJECTED],
        paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.NOT_REQUIRED,
        notes: 'Withdrawn — duplicate of an existing request.',
      },
      // Company B — PER_REQUEST billing, so requests wait on payment.
      {
        companyId: companyB.id, createdByUserId: companyBAdmin.id, employeeId: bWorkers[0].id,
        type: RequestType.FITNESS_CERTIFICATE,
        history: [RequestStatus.SUBMITTED, RequestStatus.PENDING_PAYMENT],
        paymentMethod: PaymentMethod.PER_REQUEST, paymentStatus: PaymentStatus.PENDING,
      },
      {
        companyId: companyB.id, createdByUserId: companyBAdmin.id, employeeId: bWorkers[1].id,
        type: RequestType.CHECKUP,
        history: [RequestStatus.SUBMITTED, RequestStatus.PENDING_PAYMENT, RequestStatus.APPROVED, RequestStatus.AT_LAB, RequestStatus.RESULTS_RECEIVED, RequestStatus.UNDER_REVIEW, RequestStatus.COMPLETE],
        paymentMethod: PaymentMethod.PER_REQUEST, paymentStatus: PaymentStatus.PAID,
        assignedLabId: labs[0].id, certificateExpiresInDays: 300, withResult: true,
      },
    ];

    const storage = getStorage();
    const daysFromNow = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };

    for (const entry of plan) {
      const finalStatus = entry.history[entry.history.length - 1];

      const created = await prisma.request.create({
        data: {
          companyId: entry.companyId,
          createdByUserId: entry.createdByUserId,
          employeeId: entry.employeeId,
          type: entry.type,
          status: finalStatus,
          paymentMethod: entry.paymentMethod,
          paymentStatus: entry.paymentStatus,
          ...(entry.assignedLabId ? { assignedLabId: entry.assignedLabId } : {}),
          ...(entry.notes ? { notes: entry.notes } : {}),
        },
      });

      // Walk the history so the timeline has a row per transition, spaced out in
      // time rather than all sharing one timestamp.
      let previous: RequestStatus | null = null;
      for (const [index, status] of entry.history.entries()) {
        const changedAt = new Date();
        changedAt.setDate(changedAt.getDate() - (entry.history.length - index) * 3);
        await prisma.requestStatusEvent.create({
          data: {
            requestId: created.id,
            fromStatus: previous,
            toStatus: status,
            changedByType: previous === null ? ActorType.COMPANY_USER : ActorType.ADMIN_USER,
            changedById: previous === null ? entry.createdByUserId : null,
            note: previous === null ? 'Request submitted.' : null,
            changedAt,
          },
        });
        previous = status;
      }

      // Ledger row, matching the company's billing arrangement.
      await prisma.payment.create({
        data: {
          companyId: entry.companyId,
          requestId: created.id,
          amountMinor: entry.type === RequestType.FITNESS_CERTIFICATE ? 40000 : 25000,
          currency: 'SAR',
          method: entry.paymentMethod,
          status: entry.paymentStatus === PaymentStatus.PAID ? PaymentStatus.PAID : PaymentStatus.PENDING,
          ...(entry.paymentStatus === PaymentStatus.PAID
            ? { paidAt: daysFromNow(-10), providerReference: 'SEED-SETTLEMENT' }
            : {}),
        },
      });

      // A request that reached the lab has a dispatch record. Nothing was
      // emailed — see services/labNotification.ts.
      if (entry.assignedLabId && entry.history.includes(RequestStatus.AT_LAB)) {
        await prisma.labNotification.create({
          data: {
            requestId: created.id,
            labId: entry.assignedLabId,
            status: LabNotificationStatus.PENDING,
          },
        });
      }

      // Documents. Bytes go through the real StorageAdapter so they download.
      if (entry.withResult) {
        await writeSeedDocument(storage, {
          companyId: entry.companyId,
          requestId: created.id,
          type: DocumentType.RESULT,
          fileName: 'laboratory-result.txt',
          text: `Laboratory result for request ${created.id}. Seeded development data.`,
        });
      }
      if (entry.certificateExpiresInDays !== undefined && finalStatus === RequestStatus.COMPLETE) {
        await writeSeedDocument(storage, {
          companyId: entry.companyId,
          requestId: created.id,
          type: DocumentType.CERTIFICATE,
          fileName: 'fitness-certificate.txt',
          text: `Certificate of medical fitness for request ${created.id}. Seeded development data.`,
          expiryDate: daysFromNow(entry.certificateExpiresInDays),
        });
      }
    }
  }

  const counts = {
    companies: await prisma.company.count(),
    companyUsers: await prisma.companyUser.count(),
    adminUsers: await prisma.adminUser.count(),
    employees: await prisma.employee.count(),
    labs: await prisma.lab.count(),
    requests: await prisma.request.count(),
    statusEvents: await prisma.requestStatusEvent.count(),
    documents: await prisma.document.count(),
    payments: await prisma.payment.count(),
    labNotifications: await prisma.labNotification.count(),
  };
  // eslint-disable-next-line no-console
  console.log('Seed complete:', counts);
  // eslint-disable-next-line no-console
  console.log(`Demo password for every seeded account: ${DEMO_PASSWORD} (development only)`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
