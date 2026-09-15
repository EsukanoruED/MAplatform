import type { ActorType, DocumentType, PaymentStatus, RequestStatus, RequestType } from './api';

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

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

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

// ---------------------------------------------------------------------------
// Phase 2 display helpers
// ---------------------------------------------------------------------------


const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  RESULT: 'Laboratory result',
  CERTIFICATE: 'Fitness certificate',
  ATTACHMENT: 'Attachment',
};

export function documentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NOT_REQUIRED: 'Not required',
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export function paymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function paymentStatusTone(status: PaymentStatus): BadgeTone {
  if (status === 'PAID') return 'success';
  if (status === 'FAILED') return 'danger';
  if (status === 'PENDING') return 'warning';
  return 'neutral';
}

const ACTOR_LABELS: Record<ActorType, string> = {
  COMPANY_USER: 'Company',
  ADMIN_USER: 'Medical Alliance',
  SYSTEM: 'System',
};

export function actorLabel(actor: ActorType): string {
  return ACTOR_LABELS[actor] ?? actor;
}

/**
 * Money is carried as integer minor units end to end, so formatting is the only
 * place it becomes a decimal — and it never round-trips through a float.
 */
export function formatMoney(amountMinor: number, currency = 'SAR'): string {
  const major = (amountMinor / 100).toFixed(2);
  return `${currency} ${major.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** "in 12 days" / "21 days ago" / "today" — for certificate expiry. */
export function relativeDays(iso: string | null | undefined): string {
  if (!iso) return '—';
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return '—';
  const days = Math.round((target.getTime() - Date.now()) / 86_400_000);
  if (days === 0) return 'today';
  if (days > 0) return `in ${days} day${days === 1 ? '' : 's'}`;
  const past = Math.abs(days);
  return `${past} day${past === 1 ? '' : 's'} ago`;
}

/** Certificates inside this window are flagged on the register and dashboard. */
export const EXPIRY_WARNING_DAYS = 30;

export function expiryTone(iso: string | null | undefined): BadgeTone {
  if (!iso) return 'neutral';
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return 'neutral';
  const days = Math.round((target.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'danger';
  if (days <= EXPIRY_WARNING_DAYS) return 'warning';
  return 'success';
}

export function expiryLabel(iso: string | null | undefined): string {
  if (!iso) return 'No expiry';
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return 'No expiry';
  const days = Math.round((target.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Expired';
  if (days <= EXPIRY_WARNING_DAYS) return 'Expiring';
  return 'Valid';
}
