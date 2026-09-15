import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/auth';
import type { RequestStatusEvent } from '../lib/api';

/** A fresh QueryClient per test, with retries off so failures assert immediately. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export type RenderAppOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string;
  queryClient?: QueryClient;
  withAuth?: boolean;
};

/** Renders a component inside the providers the real app supplies. */
export function renderWithProviders(ui: ReactElement, options: RenderAppOptions = {}) {
  const { route = '/', queryClient = makeQueryClient(), withAuth = true, ...rest } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          {withAuth ? <AuthProvider>{children}</AuthProvider> : children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...rest }) };
}

// ------------------------------------------------------------------ fetch mock

type Handler = (url: string, init?: RequestInit) => { status: number; body: unknown } | undefined;

/**
 * Installs a `fetch` stub over `globalThis`. Tests declare responses per path;
 * anything unmatched returns 404 so a missing stub fails loudly rather than
 * hanging.
 */
export function mockFetch(handler: Handler) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  const impl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push({ url, init });
    const match = handler(url, init) ?? { status: 404, body: { error: { code: 'NOT_FOUND', message: `No stub for ${url}` } } };
    return new Response(JSON.stringify(match.body), {
      status: match.status,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  globalThis.fetch = impl as unknown as typeof fetch;
  return { calls };
}

export const companyUser = {
  type: 'company' as const,
  id: 'user-1',
  name: 'Dr N. Al-Qahtani',
  email: 'ops@northgate.example',
  role: 'COMPANY_ADMIN' as const,
  companyId: 'company-a',
};

export function makeRequestRow(overrides: Record<string, unknown> = {}) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    companyId: 'company-a',
    employeeId: 'emp-1',
    type: 'FITNESS_CERTIFICATE',
    status: 'COMPLETE',
    paymentMethod: 'SETTLEMENT',
    paymentStatus: 'PAID',
    assignedLabId: null,
    createdByUserId: 'user-1',
    notes: null,
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-12T08:00:00.000Z',
    employee: { id: 'emp-1', fullName: 'A. Al-Harbi', site: 'Jazan Site 4', role: 'Process operator' },
    assignedLab: null,
    ...overrides,
  };
}

export function emptyStatusCounts() {
  return {
    SUBMITTED: 0, PENDING_PAYMENT: 0, APPROVED: 0, AT_LAB: 0,
    RESULTS_RECEIVED: 0, UNDER_REVIEW: 0, COMPLETE: 0, REJECTED: 0,
  };
}

// ---------------------------------------------------------------------------
// Phase 2 fixtures
// ---------------------------------------------------------------------------

export function makeEmployee(overrides: Record<string, unknown> = {}) {
  return {
    id: 'emp-1',
    fullName: 'A. Al-Harbi',
    role: 'Process operator',
    site: 'Jazan Site 4',
    active: true,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
    ...overrides,
  };
}

export function makeEmployeeDetail(overrides: Record<string, unknown> = {}) {
  return {
    ...makeEmployee(),
    companyId: 'company-a',
    nationalId: 'MA-40118',
    dateOfBirth: '1991-02-14T00:00:00.000Z',
    ...overrides,
  };
}

export function makeStatusEvent(overrides: Partial<RequestStatusEvent> = {}): RequestStatusEvent {
  return {
    id: 'evt-1',
    fromStatus: null,
    toStatus: 'SUBMITTED',
    changedByType: 'COMPANY_USER',
    changedById: 'user-1',
    note: null,
    changedAt: '2026-09-01T08:00:00.000Z',
    ...overrides,
  };
}

export function makeDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: 'doc-1',
    companyId: 'company-a',
    requestId: '11111111-1111-4111-8111-111111111111',
    type: 'CERTIFICATE',
    fileName: 'certificate.pdf',
    contentType: 'application/pdf',
    byteSize: 2048,
    checksum: 'abc',
    uploadedByType: 'ADMIN_USER',
    uploadedById: 'admin-1',
    uploadedAt: '2026-09-12T08:00:00.000Z',
    expiryDate: '2027-03-14T00:00:00.000Z',
    ...overrides,
  };
}

export function makePayment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay-1',
    companyId: 'company-a',
    requestId: '11111111-1111-4111-8111-111111111111',
    amountMinor: 40000,
    currency: 'SAR',
    method: 'PER_REQUEST',
    status: 'PENDING',
    providerReference: null,
    paidAt: null,
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-12T08:00:00.000Z',
    ...overrides,
  };
}

/** The full request-detail payload the detail screens consume. */
export function makeRequestDetail(overrides: Record<string, unknown> = {}) {
  return {
    ...makeRequestRow(),
    company: { id: 'company-a', legalName: 'Northgate Industrial Services', billingType: 'SETTLEMENT' },
    createdBy: { id: 'user-1', name: 'Dr N. Al-Qahtani', email: 'ops@northgate.example' },
    statusEvents: [makeStatusEvent()],
    documents: [],
    payments: [],
    labNotifications: [],
    ...overrides,
  };
}

/** The aggregate payload behind the company dashboard. */
export function makeDashboardSummary(overrides: Record<string, unknown> = {}) {
  return {
    summary: {
      employees: { total: 4, active: 4 },
      requests: {
        total: 3,
        open: 2,
        pendingAction: 1,
        complete: 1,
        rejected: 0,
        byStatus: { ...emptyStatusCounts(), SUBMITTED: 1, PENDING_PAYMENT: 1, COMPLETE: 1 },
      },
      certificates: { total: 1, expiringWithinDays: 30, expiringSoon: 1 },
      payments: {
        currency: 'SAR',
        outstandingMinor: 40000,
        settledMinor: 25000,
        byStatus: {},
      },
    },
    recentRequests: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        type: 'FITNESS_CERTIFICATE',
        status: 'COMPLETE',
        createdAt: '2026-09-12T08:00:00.000Z',
        employee: { id: 'emp-1', fullName: 'A. Al-Harbi', site: 'Jazan Site 4' },
      },
    ],
    expiringCertificates: [
      {
        id: 'doc-1',
        fileName: 'certificate.pdf',
        expiryDate: '2026-10-01T00:00:00.000Z',
        request: { id: '11111111-1111-4111-8111-111111111111', employee: { id: 'emp-1', fullName: 'A. Al-Harbi' } },
      },
    ],
    ...overrides,
  };
}
