import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/auth';

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
