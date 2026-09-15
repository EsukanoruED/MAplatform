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
        // FormData must set its own multipart Content-Type (it carries the
        // boundary), so only JSON bodies get the header.
        ...(init.body && !(init.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
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

export type DocumentType = 'RESULT' | 'CERTIFICATE' | 'ATTACHMENT';
export type ActorType = 'COMPANY_USER' | 'ADMIN_USER' | 'SYSTEM';
export type BillingType = 'PER_REQUEST' | 'SETTLEMENT';
export type LabNotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

/** The roster projection. Deliberately withholds nationalId and dateOfBirth. */
export type Employee = {
  id: string;
  fullName: string;
  role: string | null;
  site: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** The single-record projection, which does include the identifiers. */
export type EmployeeDetail = Employee & {
  companyId: string;
  nationalId: string;
  dateOfBirth: string | null;
};

export type EmployeeListResponse = {
  employees: Employee[];
  total: number;
  sites: string[];
  page: { take: number; skip: number };
};

export type EmployeeWritePayload = {
  fullName: string;
  nationalId: string;
  role?: string | null;
  site?: string | null;
  dateOfBirth?: string | null;
};

export type Lab = {
  id: string;
  name: string;
  contactEmail: string;
  active: boolean;
  createdAt: string;
};

export type RequestStatusEvent = {
  id: string;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  changedByType: ActorType;
  changedById: string | null;
  note: string | null;
  changedAt: string;
};

export type RequestDocument = {
  id: string;
  companyId: string;
  requestId: string;
  type: DocumentType;
  fileName: string;
  contentType: string;
  byteSize: number;
  checksum: string | null;
  uploadedByType: ActorType;
  uploadedById: string | null;
  uploadedAt: string;
  expiryDate: string | null;
};

export type Payment = {
  id: string;
  companyId: string;
  requestId: string | null;
  amountMinor: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  providerReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentSummary = {
  currency: string;
  outstandingMinor: number;
  settledMinor: number;
  byStatus: Record<string, { count: number; amountMinor: number }>;
};

export type LabNotification = {
  id: string;
  requestId: string;
  labId: string;
  status: LabNotificationStatus;
  sentAt: string | null;
  emailMessageId: string | null;
  inboundReceivedAt: string | null;
  lastError: string | null;
  createdAt: string;
  lab: { id: string; name: string; contactEmail: string };
};

/** The full detail payload backing the request screen. */
export type MedicalRequestDetail = MedicalRequest & {
  company: { id: string; legalName: string; billingType: BillingType };
  createdBy: { id: string; name: string; email: string } | null;
  statusEvents: RequestStatusEvent[];
  documents: RequestDocument[];
  payments: Payment[];
  labNotifications: LabNotification[];
};

export type RequestDetailResponse = {
  request: MedicalRequestDetail;
  availableTransitions: RequestStatus[];
};

export type CompanyDashboardSummary = {
  summary: {
    employees: { total: number; active: number };
    requests: {
      total: number;
      open: number;
      pendingAction: number;
      complete: number;
      rejected: number;
      byStatus: Record<RequestStatus, number>;
    };
    certificates: { total: number; expiringWithinDays: number; expiringSoon: number };
    payments: PaymentSummary;
  };
  recentRequests: Array<{
    id: string;
    type: RequestType;
    status: RequestStatus;
    createdAt: string;
    employee: { id: string; fullName: string; site: string | null };
  }>;
  expiringCertificates: Array<{
    id: string;
    fileName: string;
    expiryDate: string | null;
    request: { id: string; employee: { id: string; fullName: string } };
  }>;
};

/** An admin-queue row carries the owning company, which a tenant row never does. */
export type AdminRequestRow = MedicalRequest & {
  company: { id: string; legalName: string; billingType: BillingType };
};

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

  listRequests: (params?: {
    status?: RequestStatus;
    type?: RequestType;
    employeeId?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.type) qs.set('type', params.type);
    if (params?.employeeId) qs.set('employeeId', params.employeeId);
    if (params?.search) qs.set('search', params.search);
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch<RequestListResponse>(`/api/requests${suffix}`);
  },

  getRequest: (id: string) => apiFetch<RequestDetailResponse>(`/api/requests/${id}`),

  /**
   * POST /api/requests. Note there is no companyId parameter: the server derives
   * the tenant from the session and rejects the field outright if sent.
   */
  createRequest: (payload: CreateRequestPayload) =>
    apiFetch<{ request: MedicalRequest }>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ------------------------------------------------------------- employees

  listEmployees: (params?: {
    search?: string;
    site?: string;
    active?: 'true' | 'false' | 'all';
    take?: number;
    skip?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.site) qs.set('site', params.site);
    if (params?.active) qs.set('active', params.active);
    if (params?.take !== undefined) qs.set('take', String(params.take));
    if (params?.skip !== undefined) qs.set('skip', String(params.skip));
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch<EmployeeListResponse>(`/api/employees${suffix}`);
  },

  getEmployee: (id: string) =>
    apiFetch<{ employee: EmployeeDetail; requests: MedicalRequest[] }>(`/api/employees/${id}`),

  createEmployee: (payload: EmployeeWritePayload) =>
    apiFetch<{ employee: EmployeeDetail }>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEmployee: (id: string, payload: Partial<EmployeeWritePayload> & { active?: boolean }) =>
    apiFetch<{ employee: EmployeeDetail }>(`/api/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // ------------------------------------------------------------------- labs

  listLabs: () => apiFetch<{ labs: Lab[] }>('/api/labs'),
  getLab: (id: string) => apiFetch<{ lab: Lab & { _count: { requests: number } } }>(`/api/labs/${id}`),

  // ------------------------------------------------------------ the workflow

  /**
   * Requests a workflow move. The body names a TARGET status only — the server
   * validates it against the state machine and the actor-permission matrix, so
   * this can never set an arbitrary status.
   */
  transitionRequest: (
    id: string,
    payload: { status: RequestStatus; note?: string; assignedLabId?: string },
  ) =>
    apiFetch<RequestDetailResponse>(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // -------------------------------------------------------------- documents

  listRequestDocuments: (requestId: string) =>
    apiFetch<{ documents: RequestDocument[] }>(`/api/requests/${requestId}/documents`),

  /** Uploads a supporting attachment. Companies cannot upload results or certificates. */
  uploadRequestDocument: (requestId: string, file: File) => {
    const form = new FormData();
    form.append('type', 'ATTACHMENT');
    form.append('file', file);
    return apiFetch<{ document: RequestDocument }>(`/api/requests/${requestId}/documents`, {
      method: 'POST',
      body: form,
    });
  },

  getDocument: (id: string) => apiFetch<{ document: RequestDocument }>(`/api/documents/${id}`),

  /**
   * The certificate register: every fitness-certificate request, plus the
   * certificates issued against them. The two are paired by requestId so each
   * request appears once, with or without a certificate.
   */
  listCertificates: () =>
    apiFetch<{
      certificates: Array<
        RequestDocument & {
          request: {
            id: string;
            type: RequestType;
            status: RequestStatus;
            employee: { id: string; fullName: string; site: string | null };
          };
        }
      >;
      requests: MedicalRequest[];
    }>('/api/certificates'),

  /**
   * The authorised download URL. The bytes are streamed by the API behind a
   * tenant check — they are never served as a static asset.
   */
  documentDownloadUrl: (id: string) => `/api/documents/${id}/download`,

  // --------------------------------------------------------------- payments

  listPayments: (params?: { status?: PaymentStatus; requestId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.requestId) qs.set('requestId', params.requestId);
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch<{ payments: Payment[]; summary: PaymentSummary }>(`/api/payments${suffix}`);
  },

  // -------------------------------------------------------------- dashboard

  getCompanyDashboard: () =>
    apiFetch<CompanyDashboardSummary>('/api/dashboard/company/summary'),

  // ------------------------------------------------------------ admin console

  adminListRequests: (params?: { status?: RequestStatus; type?: RequestType; companyId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.type) qs.set('type', params.type);
    if (params?.companyId) qs.set('companyId', params.companyId);
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch<{
      requests: AdminRequestRow[];
      summary: { total: number; byStatus: Record<RequestStatus, number> };
    }>(`/api/admin/requests${suffix}`);
  },

  adminGetRequest: (id: string) =>
    apiFetch<RequestDetailResponse>(`/api/admin/requests/${id}`),

  adminTransitionRequest: (
    id: string,
    payload: { status: RequestStatus; note?: string; assignedLabId?: string },
  ) =>
    apiFetch<RequestDetailResponse>(`/api/admin/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  adminAssignLab: (id: string, labId: string) =>
    apiFetch<{ request: MedicalRequest }>(`/api/admin/requests/${id}/lab`, {
      method: 'PATCH',
      body: JSON.stringify({ labId }),
    }),

  adminListCompanies: () =>
    apiFetch<{
      companies: Array<{
        id: string;
        legalName: string;
        billingType: BillingType;
        status: string;
        createdAt: string;
        _count: { users: number; employees: number; requests: number };
      }>;
    }>('/api/admin/companies'),

  adminGetDashboard: () =>
    apiFetch<{
      summary: {
        companies: number;
        activeLabs: number;
        employees: number;
        awaitingReview: number;
        requests: { total: number; byStatus: Record<RequestStatus, number> };
      };
    }>('/api/admin/dashboard/summary'),
};
