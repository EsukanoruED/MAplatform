import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestsScreen } from './RequestsScreen';
import { NewRequestModal } from './NewRequestModal';
import {
  companyUser,
  emptyStatusCounts,
  makeEmployee,
  makeRequestRow,
  mockFetch,
  renderWithProviders,
} from '../../test/utils';

const authStub = { status: 200, body: { user: companyUser } };

function requestListBody(rows: ReturnType<typeof makeRequestRow>[]) {
  return {
    status: 200,
    body: { requests: rows, summary: { total: rows.length, byStatus: emptyStatusCounts() } },
  };
}

describe('RequestsScreen', () => {
  it('shows a loading state while the queue is in flight', () => {
    globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch;
    renderWithProviders(<RequestsScreen />, { route: '/portal/requests' });

    expect(screen.getByRole('status', { busy: true })).toHaveTextContent(/Loading requests/i);
  });

  it('shows the empty state when the company has no requests', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) return requestListBody([]);
      return undefined;
    });

    renderWithProviders(<RequestsScreen />, { route: '/portal/requests' });

    expect(await screen.findByText('No requests yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the queue with worker, type, lab and status', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return requestListBody([
          makeRequestRow({
            status: 'AT_LAB',
            assignedLab: { id: 'lab-1', name: 'Jazan Medical Laboratory' },
          }),
          makeRequestRow({
            id: '22222222-2222-4222-8222-222222222222',
            type: 'CHECKUP',
            status: 'SUBMITTED',
            employee: { id: 'emp-2', fullName: 'R. Menon', site: 'Yanbu Terminal', role: 'Tech' },
          }),
        ]);
      }
      return undefined;
    });

    renderWithProviders(<RequestsScreen />, { route: '/portal/requests' });

    const table = await screen.findByRole('table');
    expect(within(table).getByText('A. Al-Harbi')).toBeInTheDocument();
    expect(within(table).getByText('R. Menon')).toBeInTheDocument();
    expect(within(table).getByText('Jazan Medical Laboratory')).toBeInTheDocument();
    expect(within(table).getByText('At lab')).toBeInTheDocument();
    expect(within(table).getByText('Checkup')).toBeInTheDocument();
  });

  /** Filtering is server-side, so the filter must reach the query string. */
  it('sends the status filter to the API rather than filtering locally', async () => {
    const { calls } = mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) return requestListBody([makeRequestRow()]);
      return undefined;
    });

    renderWithProviders(<RequestsScreen />, { route: '/portal/requests' });
    await screen.findByRole('table');

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText(/Status/i), 'AT_LAB');

    await waitFor(() => {
      expect(calls.some((c) => c.url.includes('status=AT_LAB'))).toBe(true);
    });
  });

  it('shows the no-match empty state and can clear the filters', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('status=COMPLETE')) return requestListBody([]);
      if (url.includes('/api/requests')) return requestListBody([makeRequestRow()]);
      return undefined;
    });

    renderWithProviders(<RequestsScreen />, { route: '/portal/requests' });
    await screen.findByRole('table');

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText(/Status/i), 'COMPLETE');

    expect(await screen.findByText('No requests match these filters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Clear filters/i }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('shows a retryable error state', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/requests')) {
        return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Queue unavailable.' } } };
      }
      return undefined;
    });

    renderWithProviders(<RequestsScreen />, { route: '/portal/requests' });

    expect(await screen.findByText(/Could not load this data/i)).toBeInTheDocument();
    expect(screen.getByText('Queue unavailable.')).toBeInTheDocument();
  });
});

describe('NewRequestModal submission', () => {
  function stubForCreate(createResult: { status: number; body: unknown }) {
    return mockFetch((url, init) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.endsWith('/api/requests') && init?.method === 'POST') return createResult;
      if (url.includes('/api/employees')) {
        return { status: 200, body: { employees: [makeEmployee()], total: 1, sites: ['Jazan Site 4'] } };
      }
      if (url.includes('/api/labs')) {
        return {
          status: 200,
          body: {
            labs: [
              { id: 'lab-1', name: 'Jazan Medical Laboratory', contactEmail: 'a@b.test', active: true, createdAt: '2026-01-01T00:00:00.000Z' },
            ],
          },
        };
      }
      if (url.includes('/api/requests')) return requestListBody([]);
      return undefined;
    });
  }

  it('validates that a worker is chosen before submitting', async () => {
    const { calls } = stubForCreate({ status: 201, body: { request: makeRequestRow() } });

    renderWithProviders(<NewRequestModal open onClose={() => {}} />, { route: '/portal/requests' });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(await screen.findByText(/Choose the worker this examination is for\./i)).toBeInTheDocument();
    expect(calls.some((c) => c.init?.method === 'POST')).toBe(false);
  });

  it('submits the chosen worker, type and laboratory, and never a companyId', async () => {
    const { calls } = stubForCreate({ status: 201, body: { request: makeRequestRow() } });

    renderWithProviders(<NewRequestModal open onClose={() => {}} />, { route: '/portal/requests' });

    const user = userEvent.setup();
    // The picker starts with only a placeholder; wait for the roster to arrive.
    await screen.findByRole('option', { name: /A\. Al-Harbi/ });

    await user.selectOptions(screen.getByLabelText(/Worker/i), 'emp-1');
    await user.selectOptions(screen.getByLabelText(/Examination type/i), 'CHECKUP');
    await user.selectOptions(screen.getByLabelText(/Preferred laboratory/i), 'lab-1');
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    await waitFor(() => expect(calls.some((c) => c.init?.method === 'POST')).toBe(true));

    const post = calls.find((c) => c.init?.method === 'POST');
    const body = JSON.parse(String(post?.init?.body));
    expect(body).toMatchObject({ employeeId: 'emp-1', type: 'CHECKUP', assignedLabId: 'lab-1' });
    expect(body).not.toHaveProperty('companyId');
  });

  it('surfaces a server rejection instead of closing silently', async () => {
    stubForCreate({
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Jazan Medical Laboratory is not currently accepting requests.',
        },
      },
    });

    renderWithProviders(<NewRequestModal open onClose={() => {}} />, { route: '/portal/requests' });

    const user = userEvent.setup();
    await screen.findByRole('option', { name: /A\. Al-Harbi/ });
    await user.selectOptions(screen.getByLabelText(/Worker/i), 'emp-1');
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(await screen.findByText(/not currently accepting requests/i)).toBeInTheDocument();
  });
});
