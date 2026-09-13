/**
 * The single HTTP client for the Medical Alliance API.
 *
 * Two rules this file exists to enforce:
 *  1. `credentials: 'include'` on every call, so the httpOnly session cookie is
 *     sent and received. The browser owns the cookie; the app never reads it.
 *  2. No authentication token is ever written to localStorage, sessionStorage or
 *     any other client-side store. There is nothing to store — the session lives
 *     on the server and the cookie is invisible to JavaScript.
 */

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

/** A non-2xx response, carrying the server's own error code and message. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }
}

/** In dev the Vite server proxies /api to the API, so this stays same-origin. */
const API_BASE = '';

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.');
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    const body = payload as ApiErrorBody | undefined;
    throw new ApiError(
      response.status,
      body?.error?.code ?? 'UNKNOWN_ERROR',
      body?.error?.message ?? `The request failed (${response.status}).`,
      body?.error?.details,
    );
  }

  return payload as T;
}

// ---------------------------------------------------------------- domain types

export type CompanyUserRole = 'COMPANY_ADMIN' | 'COMPANY_REQUESTER';
export type AdminUserRole = 'ADMIN' | 'REVIEWER';

export type CurrentUser =
  | { type: 'company'; id: string; name: string; email: string; role: CompanyUserRole; companyId: string }
  | { type: 'admin'; id: string; name: string; email: string; role: AdminUserRole };

export type RequestType = 'CHECKUP' | 'FITNESS_CERTIFICATE';

export type RequestStatus =
  | 'SUBMITTED'
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'AT_LAB'
  | 'RESULTS_RECEIVED'
  | 'UNDER_REVIEW'
  | 'COMPLETE'
  | 'REJECTED';

export type PaymentMethod = 'PER_REQUEST' | 'SETTLEMENT';
export type PaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type MedicalRequest = {
  id: string;
  companyId: string;
  employeeId: string;
  type: RequestType;
  status: RequestStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  assignedLabId: string | null;
  createdByUserId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  employee: { id: string; fullName: string; site: string | null; role: string | null };
  assignedLab: { id: string; name: string } | null;
};

export type RequestListResponse = {
  requests: MedicalRequest[];
  summary: { total: number; byStatus: Record<RequestStatus, number> };
};

export type Employee = { id: string; fullName: string; role: string | null; site: string | null };

export type CreateRequestPayload = {
  employeeId: string;
  type: RequestType;
  paymentMethod?: PaymentMethod;
  assignedLabId?: string;
  notes?: string;
};

// -------------------------------------------------------------- typed endpoints

export const api = {
  health: () => apiFetch<{ status: string }>('/health'),

  /** POST /api/auth/company/login — the server sets the session cookie. */
  loginCompany: (email: string, password: string) =>
    apiFetch<{ user: CurrentUser }>('/api/auth/company/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginAdmin: (email: string, password: string) =>
    apiFetch<{ user: CurrentUser }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => apiFetch<{ ok: true }>('/api/auth/logout', { method: 'POST' }),

  /** GET /api/auth/me — throws ApiError(401) when there is no valid session. */
  getCurrentUser: () => apiFetch<{ user: CurrentUser }>('/api/auth/me'),

  listRequests: (params?: { status?: RequestStatus; type?: RequestType }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.type) qs.set('type', params.type);
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch<RequestListResponse>(`/api/requests${suffix}`);
  },

  getRequest: (id: string) => apiFetch<{ request: MedicalRequest }>(`/api/requests/${id}`),

  /**
   * POST /api/requests. Note there is no companyId parameter: the server derives
   * the tenant from the session and rejects the field outright if sent.
   */
  createRequest: (payload: CreateRequestPayload) =>
    apiFetch<{ request: MedicalRequest }>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listEmployees: () => apiFetch<{ employees: Employee[] }>('/api/employees'),
};
