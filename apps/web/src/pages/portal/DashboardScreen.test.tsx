import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { DashboardScreen } from './DashboardScreen';
import {
  companyUser, emptyStatusCounts, makeRequestRow, mockFetch, renderWithProviders,
} from '../../test/utils';

const authStub = { status: 200, body: { user: companyUser } };

/** The dashboard's figures must come from the API, not from a fixed array. */
describe('DashboardScreen', () => {
  it('shows the empty state and zeroed tiles when there are no requests', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return { status: 200, body: { requests: [], summary: { total: 0, byStatus: emptyStatusCounts() } } };
      }
      if (url.includes('/api/employees')) return { status: 200, body: { employees: [] } };
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    expect(await screen.findByText('No requests yet')).toBeInTheDocument();
    expect(screen.getByText('Open requests')).toBeInTheDocument();
    // The prototype's hard-coded figures are gone.
    expect(screen.queryByText('1,284')).not.toBeInTheDocument();
    expect(screen.queryByText('76')).not.toBeInTheDocument();
  });

  it('derives every stat tile from the API summary', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return {
          status: 200,
          body: {
            requests: [
              makeRequestRow({ id: 'a1111111-1111-4111-8111-111111111111', status: 'AT_LAB' }),
              makeRequestRow({ id: 'a2222222-2222-4222-8222-222222222222', status: 'AT_LAB' }),
              makeRequestRow({ id: 'a3333333-3333-4333-8333-333333333333', status: 'PENDING_PAYMENT' }),
              makeRequestRow({ id: 'a4444444-4444-4444-8444-444444444444', status: 'COMPLETE' }),
            ],
            summary: {
              total: 4,
              byStatus: { ...emptyStatusCounts(), AT_LAB: 2, PENDING_PAYMENT: 1, COMPLETE: 1 },
            },
          },
        };
      }
      if (url.includes('/api/employees')) return { status: 200, body: { employees: [] } };
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });

    // Tile labels render while the query is still pending (value "—"), so wait
    // for the loaded table before reading the figures.
    await screen.findByRole('table');

    // Scoped to the summary row: labels like "At lab" also appear as status
    // badges in the queue table and as pipeline meter labels.
    const summary = screen.getByRole('region', { name: 'Request summary' });
    const tileFor = (label: string) => within(summary).getByText(label).closest('div')?.parentElement;

    // Open = SUBMITTED..UNDER_REVIEW = 2 AT_LAB + 1 PENDING_PAYMENT = 3
    expect(tileFor('Open requests')).toHaveTextContent('3');
    expect(tileFor('At lab')).toHaveTextContent('2');
    expect(tileFor('Completed')).toHaveTextContent('1');
    expect(tileFor('Needs attention')).toHaveTextContent('1');
  });

  it('warns when requests need attention', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return {
          status: 200,
          body: {
            requests: [makeRequestRow({ status: 'UNDER_REVIEW' })],
            summary: { total: 1, byStatus: { ...emptyStatusCounts(), UNDER_REVIEW: 1 } },
          },
        };
      }
      if (url.includes('/api/employees')) return { status: 200, body: { employees: [] } };
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });
    expect(await screen.findByText(/1 request needs attention/i)).toBeInTheDocument();
  });

  it('lists open requests in the queue table with the real worker name', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return {
          status: 200,
          body: {
            requests: [makeRequestRow({ status: 'AT_LAB' })],
            summary: { total: 1, byStatus: { ...emptyStatusCounts(), AT_LAB: 1 } },
          },
        };
      }
      if (url.includes('/api/employees')) return { status: 200, body: { employees: [] } };
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByText('A. Al-Harbi')).toBeInTheDocument();
    expect(screen.getByText('Jazan Site 4')).toBeInTheDocument();
  });

  it('shows an error state when the register cannot be loaded', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Database unavailable.' } } };
      }
      if (url.includes('/api/employees')) return { status: 200, body: { employees: [] } };
      return undefined;
    });

    renderWithProviders(<DashboardScreen />, { route: '/portal' });
    expect(await screen.findByText(/Could not load this data/i)).toBeInTheDocument();
    expect(screen.getByText('Database unavailable.')).toBeInTheDocument();
  });
});
