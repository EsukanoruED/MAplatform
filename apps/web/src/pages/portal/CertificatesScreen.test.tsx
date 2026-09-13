import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CertificatesScreen } from './CertificatesScreen';
import {
  companyUser, emptyStatusCounts, makeRequestRow, mockFetch, renderWithProviders,
} from '../../test/utils';

/** Loading, empty, populated and error states for the certificate register. */

function render(route = '/portal/certificates') {
  return renderWithProviders(<CertificatesScreen />, { route });
}

const authStub = { status: 200, body: { user: companyUser } };

describe('CertificatesScreen', () => {
  it('shows a loading state while the request register is in flight', () => {
    globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch;
    render();
    expect(screen.getByRole('status', { busy: true })).toHaveTextContent(/Loading the certificate register/i);
  });

  it('shows the empty state when the company has no requests', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return { status: 200, body: { requests: [], summary: { total: 0, byStatus: emptyStatusCounts() } } };
      }
      return undefined;
    });

    render();
    expect(await screen.findByText('No certificate requests yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the real rows when the company has requests', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return {
          status: 200,
          body: {
            requests: [
              makeRequestRow(),
              makeRequestRow({
                id: '22222222-2222-4222-8222-222222222222',
                status: 'AT_LAB',
                type: 'CHECKUP',
                employee: { id: 'emp-2', fullName: 'R. Menon', site: 'Yanbu Terminal', role: 'Technician' },
              }),
            ],
            summary: { total: 2, byStatus: { ...emptyStatusCounts(), COMPLETE: 1, AT_LAB: 1 } },
          },
        };
      }
      return undefined;
    });

    render();

    const table = await screen.findByRole('table');
    expect(screen.getByText('A. Al-Harbi')).toBeInTheDocument();
    expect(screen.getByText('R. Menon')).toBeInTheDocument();
    // Scoped to the table: "Complete" is also a register-health meter label.
    expect(within(table).getByText('Complete')).toBeInTheDocument();
    expect(within(table).getByText('At lab')).toBeInTheDocument();
    expect(screen.getByText(/Certificate register — 2 records, 2 shown/i)).toBeInTheDocument();

    // The prototype's hard-coded references must be gone.
    expect(screen.queryByText('CT-2026-0841')).not.toBeInTheDocument();
    expect(screen.queryByText('S. Okonkwo')).not.toBeInTheDocument();
  });

  it('filters the real rows and offers a way to clear the filter', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return {
          status: 200,
          body: {
            requests: [
              makeRequestRow(),
              makeRequestRow({
                id: '33333333-3333-4333-8333-333333333333',
                employee: { id: 'emp-3', fullName: 'K. Ahmed', site: 'Riyadh Depot', role: 'Warehouse lead' },
              }),
            ],
            summary: { total: 2, byStatus: { ...emptyStatusCounts(), COMPLETE: 2 } },
          },
        };
      }
      return undefined;
    });

    render();
    await screen.findByText('A. Al-Harbi');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Search/i), 'Ahmed');

    await waitFor(() => expect(screen.queryByText('A. Al-Harbi')).not.toBeInTheDocument());
    expect(screen.getByText('K. Ahmed')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Search/i));
    expect(await screen.findByText('A. Al-Harbi')).toBeInTheDocument();
  });

  it('shows the no-match empty state when filters exclude everything', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return {
          status: 200,
          body: { requests: [makeRequestRow()], summary: { total: 1, byStatus: { ...emptyStatusCounts(), COMPLETE: 1 } } },
        };
      }
      return undefined;
    });

    render();
    await screen.findByText('A. Al-Harbi');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Search/i), 'no-such-worker');

    expect(await screen.findByText('No records match these filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear filters/i })).toBeInTheDocument();
  });

  it('shows an error state with a retry when the fetch fails', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } } };
      }
      return undefined;
    });

    render();
    expect(await screen.findByText(/Could not load this data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('never asks the API for a companyId — the server decides the tenant', async () => {
    const { calls } = mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return { status: 200, body: { requests: [], summary: { total: 0, byStatus: emptyStatusCounts() } } };
      }
      return undefined;
    });

    render();
    await screen.findByText('No certificate requests yet');

    for (const call of calls) {
      expect(call.url).not.toMatch(/companyId/i);
      expect(String(call.init?.body ?? '')).not.toMatch(/companyId/i);
    }
  });
});
