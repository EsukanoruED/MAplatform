import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ForbiddenTenantAccessError, ValidationError } from '../lib/errors';

/**
 * Employee records.
 *
 * TENANT RULE: every function here takes `companyId` as its first argument and
 * puts it in the Prisma `where` clause. Callers must pass the value from
 * `tenantScope(req)` — i.e. the authenticated session — never a request body.
 * There is no function in this module that reads an employee without a tenant
 * filter, so a route cannot accidentally omit one.
 */

/**
 * Fields safe to return in a LIST. nationalId and dateOfBirth are withheld:
 * a roster view does not need them, and they are the most sensitive columns on
 * the table.
 */
export const employeeListSelect = {
  id: true,
  fullName: true,
  role: true,
  site: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Fields returned for a single record the user explicitly opened. Includes the
 * identifiers a detail view legitimately needs.
 */
export const employeeDetailSelect = {
  ...employeeListSelect,
  companyId: true,
  nationalId: true,
  dateOfBirth: true,
} as const;

export type ListEmployeesOptions = {
  search?: string;
  site?: string;
  active?: boolean;
  take?: number;
  skip?: number;
};

/** Tenant-scoped, searchable roster. */
export async function listEmployees(companyId: string, options: ListEmployeesOptions = {}) {
  const { search, site, active, take = 100, skip = 0 } = options;

  const where: Prisma.EmployeeWhereInput = {
    companyId, // <- session-derived; the only tenant filter that matters
    ...(active === undefined ? {} : { active }),
    ...(site ? { site } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { role: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { site: { contains: search, mode: Prisma.QueryMode.insensitive } },
            // nationalId is searchable but never returned in the list projection.
            { nationalId: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: employeeListSelect,
      orderBy: { fullName: 'asc' },
      take,
      skip,
    }),
    prisma.employee.count({ where }),
  ]);

  return { employees, total };
}

/** The distinct sites this company uses, for the roster's filter control. */
export async function listEmployeeSites(companyId: string): Promise<string[]> {
  const rows = await prisma.employee.findMany({
    where: { companyId, site: { not: null } },
    select: { site: true },
    distinct: ['site'],
    orderBy: { site: 'asc' },
  });
  return rows.map((r) => r.site).filter((s): s is string => Boolean(s));
}

/**
 * One employee, tenant-scoped.
 *
 * findFirst with companyId rather than findUnique by id: another company's
 * employee id resolves to no row, and the caller reports 404 — so the API never
 * confirms that an id exists in a different tenant.
 */
export async function getEmployee(companyId: string, id: string) {
  const employee = await prisma.employee.findFirst({
    where: { id, companyId },
    select: employeeDetailSelect,
  });
  if (!employee) throw new ForbiddenTenantAccessError('No employee with that id in your company.');
  return employee;
}

export type EmployeeWriteInput = {
  fullName: string;
  nationalId: string;
  role?: string | null;
  site?: string | null;
  dateOfBirth?: Date | null;
  active?: boolean;
};

export async function createEmployee(companyId: string, input: EmployeeWriteInput) {
  try {
    return await prisma.employee.create({
      data: {
        companyId, // <- session-derived
        fullName: input.fullName,
        nationalId: input.nationalId,
        role: input.role ?? null,
        site: input.site ?? null,
        dateOfBirth: input.dateOfBirth ?? null,
        ...(input.active === undefined ? {} : { active: input.active }),
      },
      select: employeeDetailSelect,
    });
  } catch (err) {
    throw translateUniqueViolation(err);
  }
}

export async function updateEmployee(
  companyId: string,
  id: string,
  input: Partial<EmployeeWriteInput>,
) {
  // Confirms ownership before writing. Without this an UPDATE keyed on id alone
  // would happily modify another tenant's row.
  await getEmployee(companyId, id);

  try {
    return await prisma.employee.update({
      where: { id },
      data: {
        ...(input.fullName === undefined ? {} : { fullName: input.fullName }),
        ...(input.nationalId === undefined ? {} : { nationalId: input.nationalId }),
        ...(input.role === undefined ? {} : { role: input.role }),
        ...(input.site === undefined ? {} : { site: input.site }),
        ...(input.dateOfBirth === undefined ? {} : { dateOfBirth: input.dateOfBirth }),
        ...(input.active === undefined ? {} : { active: input.active }),
      },
      select: employeeDetailSelect,
    });
  } catch (err) {
    throw translateUniqueViolation(err);
  }
}

/**
 * Turns the @@unique([companyId, nationalId]) violation into a field-level
 * message the form can show, instead of a 500.
 */
function translateUniqueViolation(err: unknown): unknown {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return new ValidationError('An employee with that national ID already exists in your company.', [
      { path: 'nationalId', message: 'Already registered in your company.' },
    ]);
  }
  return err;
}
