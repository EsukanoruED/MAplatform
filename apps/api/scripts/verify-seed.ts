/**
 * Seed smoke check. Asserts the seeded graph resolves — both companies exist,
 * each has users that belong to it, labs are present, and (critically for the
 * tenant-isolation tests) Company A's requests are not visible when the query is
 * scoped to Company B.
 *
 * Run with: npm run db:verify --workspace=apps/api
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
  // eslint-disable-next-line no-console
  console.log(`  ok  ${message}`);
}

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Verifying seeded data…');

  const companies = await prisma.company.findMany({
    include: { users: true, employees: true, requests: true },
    orderBy: { legalName: 'asc' },
  });

  assert(companies.length >= 2, `at least two companies exist (found ${companies.length})`);

  for (const c of companies) {
    assert(c.users.length > 0, `${c.legalName} has ${c.users.length} user(s)`);
    assert(
      c.users.every((u) => u.companyId === c.id),
      `${c.legalName}: every user resolves back to this company`,
    );
    assert(
      c.users.every((u) => u.passwordHash.startsWith('$2')),
      `${c.legalName}: passwords are bcrypt hashes, not plaintext`,
    );
    assert(c.employees.length > 0, `${c.legalName} has ${c.employees.length} employee(s)`);
    assert(
      c.employees.every((e) => e.companyId === c.id),
      `${c.legalName}: every employee carries this companyId`,
    );
  }

  const admins = await prisma.adminUser.findMany();
  assert(admins.length >= 1, `at least one AdminUser exists (found ${admins.length})`);
  const adminEmails = new Set(admins.map((a) => a.email));
  const companyEmails = new Set((await prisma.companyUser.findMany()).map((u) => u.email));
  assert(
    [...adminEmails].every((e) => !companyEmails.has(e)),
    'AdminUser and CompanyUser tables share no email — the identities are separate',
  );

  const labs = await prisma.lab.findMany();
  assert(labs.length >= 2, `at least two labs exist (found ${labs.length})`);

  const [a, b] = companies;
  const aRequests = await prisma.request.findMany({ where: { companyId: a.id } });
  const bRequests = await prisma.request.findMany({ where: { companyId: b.id } });
  assert(aRequests.length > 0, `${a.legalName} has ${aRequests.length} seeded request(s)`);
  assert(bRequests.length > 0, `${b.legalName} has ${bRequests.length} seeded request(s)`);

  const aIds = new Set(aRequests.map((r) => r.id));
  assert(
    bRequests.every((r) => !aIds.has(r.id)),
    'a companyId-scoped query returns only that company\'s requests',
  );

  const events = await prisma.requestStatusEvent.count();
  assert(events >= aRequests.length + bRequests.length, `audit trail has ${events} status event(s)`);

  // eslint-disable-next-line no-console
  console.log('\nAll seed checks passed.');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
