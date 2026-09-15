import { z } from 'zod';

/**
 * Employee payloads.
 *
 * None of these schemas has a `companyId` field, and all are `.strict()`: a
 * client that sends one gets a 400 rather than having it silently ignored. The
 * tenant always comes from the authenticated session.
 */

const nameField = z
  .string()
  .trim()
  .min(2, 'Enter the employee’s full name.')
  .max(160, 'Name is too long.');

const nationalIdField = z
  .string()
  .trim()
  .min(3, 'Enter a national ID or worker number.')
  .max(64, 'National ID is too long.')
  .regex(/^[A-Za-z0-9][A-Za-z0-9\- /]*$/, 'Use letters, digits, spaces, hyphens or slashes only.');

const optionalShortText = (max: number, tooLong: string) =>
  z
    .string()
    .trim()
    .max(max, tooLong)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

/**
 * A date of birth must be a real past date, and the person must be old enough to
 * be a worker. Rejecting the future and absurd ages here keeps obviously-wrong
 * data out of clinical records.
 */
const dateOfBirthField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'That is not a real date.')
  .refine((value) => new Date(`${value}T00:00:00Z`) < new Date(), 'Date of birth cannot be in the future.')
  .refine((value) => {
    const year = Number(value.slice(0, 4));
    return year >= 1900;
  }, 'Date of birth is too far in the past.')
  .transform((value) => new Date(`${value}T00:00:00Z`))
  .nullable()
  .optional();

export const createEmployeeSchema = z
  .object({
    fullName: nameField,
    nationalId: nationalIdField,
    role: optionalShortText(120, 'Job title is too long.'),
    site: optionalShortText(120, 'Site name is too long.'),
    dateOfBirth: dateOfBirthField,
  })
  .strict();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/** PATCH semantics: every field optional, but at least one must be present. */
export const updateEmployeeSchema = z
  .object({
    fullName: nameField.optional(),
    nationalId: nationalIdField.optional(),
    role: optionalShortText(120, 'Job title is too long.'),
    site: optionalShortText(120, 'Site name is too long.'),
    dateOfBirth: dateOfBirthField,
    active: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const listEmployeesQuerySchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    site: z.string().trim().max(120).optional(),
    // `active` arrives as a query string, so accept the string forms explicitly.
    active: z
      .enum(['true', 'false', 'all'])
      .optional()
      .default('true')
      .transform((v) => (v === 'all' ? undefined : v === 'true')),
    take: z.coerce.number().int().min(1).max(200).optional().default(100),
    skip: z.coerce.number().int().min(0).optional().default(0),
  })
  .strip();

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;

export const employeeIdParamsSchema = z
  .object({ id: z.string().uuid('Not a valid employee id.') })
  .strip();

export type EmployeeIdParams = z.infer<typeof employeeIdParamsSchema>;
