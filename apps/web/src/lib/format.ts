import type { RequestStatus, RequestType } from './api';

/** Display labels and Badge tones for the Request enums. */
const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'Submitted',
  PENDING_PAYMENT: 'Pending payment',
  APPROVED: 'Approved',
  AT_LAB: 'At lab',
  RESULTS_RECEIVED: 'Results received',
  UNDER_REVIEW: 'Under review',
  COMPLETE: 'Complete',
  REJECTED: 'Rejected',
};

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const STATUS_TONES: Record<RequestStatus, BadgeTone> = {
  SUBMITTED: 'neutral',
  PENDING_PAYMENT: 'warning',
  APPROVED: 'info',
  AT_LAB: 'info',
  RESULTS_RECEIVED: 'info',
  UNDER_REVIEW: 'warning',
  COMPLETE: 'success',
  REJECTED: 'danger',
};

const TYPE_LABELS: Record<RequestType, string> = {
  CHECKUP: 'Checkup',
  FITNESS_CERTIFICATE: 'Fitness certificate',
};

export function statusLabel(status: RequestStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function statusTone(status: RequestStatus): BadgeTone {
  return STATUS_TONES[status] ?? 'neutral';
}

export function typeLabel(type: RequestType): string {
  return TYPE_LABELS[type] ?? type;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * "12 Sep 2026" — the date format the prototype screens used.
 *
 * The month abbreviations are pinned rather than taken from Intl: en-GB renders
 * September as "Sept", and the abbreviation set varies with the runtime's ICU
 * data, so the same record could read differently on two machines.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** A short, stable, human-quotable reference derived from the request id. */
export function requestReference(id: string, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  return `RQ-${Number.isNaN(year) ? '----' : year}-${id.slice(0, 6).toUpperCase()}`;
}
