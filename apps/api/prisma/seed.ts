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
 */
import { PrismaClient, ActorType, AdminUserRole, BillingType, CompanyUserRole, PaymentMethod, PaymentStatus, RequestStatus, RequestType } from '@prisma/client';
import { hashPassword } from '../src/services/auth';
import { env } from '../src/env';

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'DemoPassw0rd!';

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

  await prisma.companyUser.upsert({
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

    const plan: Array<{
      companyId: string; createdByUserId: string; employeeId: string;
      type: RequestType; status: RequestStatus; paymentMethod: PaymentMethod; paymentStatus: PaymentStatus;
      assignedLabId?: string;
    }> = [
      { companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[0].id, type: RequestType.FITNESS_CERTIFICATE, status: RequestStatus.COMPLETE, paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.PAID, assignedLabId: labs[1].id },
      { companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[1].id, type: RequestType.CHECKUP, status: RequestStatus.AT_LAB, paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.PAID, assignedLabId: labs[0].id },
      { companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[2].id, type: RequestType.FITNESS_CERTIFICATE, status: RequestStatus.UNDER_REVIEW, paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.PAID, assignedLabId: labs[1].id },
      { companyId: companyA.id, createdByUserId: companyAAdmin.id, employeeId: aWorkers[3].id, type: RequestType.CHECKUP, status: RequestStatus.SUBMITTED, paymentMethod: PaymentMethod.SETTLEMENT, paymentStatus: PaymentStatus.PENDING },
      { companyId: companyB.id, createdByUserId: companyBAdmin.id, employeeId: bWorkers[0].id, type: RequestType.FITNESS_CERTIFICATE, status: RequestStatus.PENDING_PAYMENT, paymentMethod: PaymentMethod.PER_REQUEST, paymentStatus: PaymentStatus.PENDING },
    ];

    for (const r of plan) {
      const created = await prisma.request.create({ data: r });
      await prisma.requestStatusEvent.create({
        data: {
          requestId: created.id,
          fromStatus: null,
          toStatus: created.status,
          changedByType: ActorType.SYSTEM,
          note: 'Seeded demo record.',
        },
      });
    }
  }

  const counts = {
    companies: await prisma.company.count(),
    companyUsers: await prisma.companyUser.count(),
    adminUsers: await prisma.adminUser.count(),
    employees: await prisma.employee.count(),
    labs: await prisma.lab.count(),
    requests: await prisma.request.count(),
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
