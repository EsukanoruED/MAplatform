import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../lib/errors';

/**
 * Laboratories are platform-wide reference data, not tenant-owned: every company
 * picks from the same partner list. They are therefore readable by any
 * authenticated principal, but writable only through the admin routes.
 */
export const labSelect = {
  id: true,
  name: true,
  contactEmail: true,
  active: true,
  createdAt: true,
} as const;

export async function listLabs(options: { includeInactive?: boolean } = {}) {
  return prisma.lab.findMany({
    where: options.includeInactive ? {} : { active: true },
    select: labSelect,
    orderBy: { name: 'asc' },
  });
}

export async function getLab(id: string, options: { includeInactive?: boolean } = {}) {
  const lab = await prisma.lab.findFirst({
    where: { id, ...(options.includeInactive ? {} : { active: true }) },
    select: { ...labSelect, _count: { select: { requests: true } } },
  });
  if (!lab) throw new NotFoundError('No laboratory with that id.');
  return lab;
}

/**
 * Validates a lab id supplied for a request. Distinguishes the two failure
 * modes so the caller gets an accurate message: the lab does not exist at all,
 * versus it exists but has been deactivated and may not take new work.
 */
export async function assertLabSelectable(labId: string): Promise<{ id: string; name: string }> {
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    select: { id: true, name: true, active: true },
  });
  if (!lab) throw new NotFoundError('No laboratory with that id.');
  if (!lab.active) {
    throw new ValidationError(
      `${lab.name} is not currently accepting requests. Choose an active laboratory.`,
    );
  }
  return { id: lab.id, name: lab.name };
}
