import { LabNotificationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

/**
 * Lab dispatch.
 *
 * DEVELOPMENT LIMITATION: no email provider is configured, so nothing is
 * actually sent. Moving a request to AT_LAB records a LabNotification row in
 * PENDING, which is an honest statement of "queued, not delivered". When a
 * provider is wired up in a later phase it fills in `sentAt`/`emailMessageId`
 * (or `lastError` + FAILED), and the inbound-parse webhook fills in
 * `inboundReceivedAt`. No code here claims a delivery that did not happen.
 */
export const labNotificationSelect = {
  id: true,
  requestId: true,
  labId: true,
  status: true,
  sentAt: true,
  emailMessageId: true,
  inboundReceivedAt: true,
  lastError: true,
  createdAt: true,
  lab: { select: { id: true, name: true, contactEmail: true } },
} as const;

/** Queues a dispatch for a request that has just been sent to a lab. */
export async function queueLabNotification(
  tx: Prisma.TransactionClient,
  input: { requestId: string; labId: string },
) {
  logger.info(
    { requestId: input.requestId, labId: input.labId },
    'lab notification queued (no email provider configured — not delivered)',
  );
  return tx.labNotification.create({
    data: {
      requestId: input.requestId,
      labId: input.labId,
      status: LabNotificationStatus.PENDING,
    },
    select: { id: true, status: true },
  });
}

export async function listNotificationsForRequest(requestId: string) {
  return prisma.labNotification.findMany({
    where: { requestId },
    select: labNotificationSelect,
    orderBy: { createdAt: 'desc' },
  });
}
