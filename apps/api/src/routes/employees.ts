import { Router } from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import { CompanyUserRole } from '@prisma/client';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { requireCompanyAuth, tenantScope } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createEmployee,
  getEmployee,
  listEmployeeSites,
  listEmployees,
  updateEmployee,
} from '../services/employees';
import { listRequestsForCompany } from '../services/requests';
import {
  createEmployeeSchema,
  employeeIdParamsSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from '../validation/employees';
import type {
  CreateEmployeeInput,
  EmployeeIdParams,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from '../validation/employees';

export const employeesRouter = Router();

/**
 * Employee management, Phase 2.
 *
 * TENANT ISOLATION: every handler takes its companyId from `tenantScope(req)`,
 * which reads the authenticated server-side session. The service layer
 * (services/employees.ts) has no function that reads or writes an employee
 * without that filter, so no route here can accidentally omit it.
 */
employeesRouter.use(requireCompanyAuth);

/** GET /api/employees — searchable, filterable roster for the signed-in company. */
employeesRouter.get(
  '/',
  validateQuery(listEmployeesQuerySchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { search, site, active, take, skip } = res.locals.query as ListEmployeesQuery;

    const [{ employees, total }, sites] = await Promise.all([
      listEmployees(companyId, { search, site, active, take, skip }),
      listEmployeeSites(companyId),
    ]);

    res.status(200).json({
      employees,
      total,
      sites,
      page: { take, skip },
    });
  }),
);

/**
 * POST /api/employees — register a worker against the signed-in company.
 *
 * Both company roles may add workers: a requester who cannot register the person
 * they need examined would not be able to do their job.
 */
employeesRouter.post(
  '/',
  requireRole(CompanyUserRole.COMPANY_ADMIN, CompanyUserRole.COMPANY_REQUESTER),
  validateBody(createEmployeeSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const body = req.body as CreateEmployeeInput;

    const employee = await createEmployee(companyId, {
      fullName: body.fullName,
      nationalId: body.nationalId,
      role: body.role ?? null,
      site: body.site ?? null,
      dateOfBirth: body.dateOfBirth ?? null,
    });

    res.status(201).json({ employee });
  }),
);

/**
 * GET /api/employees/:id — one worker plus their request history.
 *
 * Both reads are tenant-scoped; a foreign id resolves to no row and is reported
 * as 404 rather than 403, so the API never confirms it exists elsewhere.
 */
employeesRouter.get(
  '/:id',
  validateParams(employeeIdParamsSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as EmployeeIdParams;

    const employee = await getEmployee(companyId, id);
    const requests = await listRequestsForCompany(companyId, { employeeId: id });

    res.status(200).json({ employee, requests });
  }),
);

/**
 * PATCH /api/employees/:id — edit a worker.
 *
 * Restricted to COMPANY_ADMIN: amending an existing clinical subject's identity
 * is a heavier action than registering a new one, so a requester may create but
 * not rewrite.
 */
employeesRouter.patch(
  '/:id',
  requireRole(CompanyUserRole.COMPANY_ADMIN),
  validateParams(employeeIdParamsSchema),
  validateBody(updateEmployeeSchema),
  errorHandlerSafe(async (req: ExpressRequest, res: Response) => {
    const { companyId } = tenantScope(req);
    const { id } = res.locals.params as EmployeeIdParams;
    const body = req.body as UpdateEmployeeInput;

    // updateEmployee re-checks ownership before writing.
    const employee = await updateEmployee(companyId, id, body);

    res.status(200).json({ employee });
  }),
);
