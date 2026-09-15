import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { DashboardScreen } from './DashboardScreen';
import {
  companyUser,
  emptyStatusCounts,
  makeDashboardSummary,
  mockFetch,
  renderWithProviders,
} from '../../test/utils';

const authStub = { status: 200, body: { user: companyUser } };

/**
 * The dashboard's figures must come from GET /api/dashboard/company/summary —
 * aggregated server-side from the tenant's own rows — not from a hard-coded
 * array or a count derived in the browser from a partial list.
 */
describe('DashboardScreen', () => {
  it('shows a loading state while the summary is in flight', () => {
    globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch;
    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    expect(screen.getByRole('status', { busy: true })).toHaveTextContent(/Loading requests/i);
  });

  it('shows the empty state and dashes in the tiles when there is no data', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/dashboard/company/summary')) {
        return {
          status: 200,
          body: makeDashboardSummary({
            summary: {
              employees: { total: 0, active: 0 },
              requests: {
                total: 0,
                open: 0,
                pendingAction: 0,
                complete: 0,
                rejected: 0,
                byStatus: emptyStatusCounts(),
              },
              certificates: { total: 0, expiringWithinDays: 30, expiringSoon: 0 },
              payments: { currency: 'SAR', outstandingMinor: 0, settledMinor: 0, byStatus: {} },
            },
            recentRequests: [],
            expiringCertificates: [],
          }),
        };
      }
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    expect(await screen.findByText('No requests yet')).toBeInTheDocument();
    // The prototype's hard-coded figures are gone.
    expect(screen.queryByText('1,284')).not.toBeInTheDocument();
    expect(screen.queryByText('76')).not.toBeInTheDocument();
  });

  it('renders every stat tile from the API summary', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/dashboard/company/summary')) {
        return { status: 200, body: makeDashboardSummary() };
      }
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    await screen.findByRole('table');

    // Scoped to the summary row: several of these labels also appear below.
    const summary = screen.getByRole('region', { name: 'Request summary' });
    const tileFor = (label: string) => within(summary).getByText(label).closest('div')?.parentElement;

    expect(tileFor('Registered workers')).toHaveTextContent('4');
    expect(tileFor('Open requests')).toHaveTextContent('2');
    expect(tileFor('Needs attention')).toHaveTextContent('1');
    expect(tileFor('Certificates')).toHaveTextContent('1');
  });

  it('warns about expiring certificates and requests needing attention', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/dashboard/company/summary')) {
        return { status: 200, body: makeDashboardSummary() };
      }
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    expect(await screen.findByText(/1 certificate expires in the next 30 days/i)).toBeInTheDocument();
    expect(screen.getByText(/1 request needs your attention/i)).toBeInTheDocument();
  });

  it('lists recent requests with the real worker name', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/dashboard/company/summary')) {
        return { status: 200, body: makeDashboardSummary() };
      }
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    const table = await screen.findByRole('table');
    expect(within(table).getByText('A. Al-Harbi')).toBeInTheDocument();
    expect(within(table).getByText('Jazan Site 4')).toBeInTheDocument();
  });

  it('shows the outstanding and settled balances', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/dashboard/company/summary')) {
        return { status: 200, body: makeDashboardSummary() };
      }
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    expect(await screen.findByText('SAR 400.00')).toBeInTheDocument();
    expect(screen.getByText('SAR 250.00')).toBeInTheDocument();
  });

  it('shows an error state when the summary cannot be loaded', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/dashboard/company/summary')) {
        return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Database unavailable.' } } };
      }
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    expect(await screen.findByText(/Could not load this data/i)).toBeInTheDocument();
    expect(screen.getByText('Database unavailable.')).toBeInTheDocument();
  });

  it('never asks the API for a companyId — the server decides the tenant', async () => {
    const { calls } = mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/dashboard/company/summary')) {
        return { status: 200, body: makeDashboardSummary() };
      }
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });
    await screen.findByRole('table');

    for (const call of calls) {
      expect(call.url).not.toMatch(/companyId/i);
      expect(String(call.init?.body ?? '')).not.toMatch(/companyId/i);
    }
  });
});
