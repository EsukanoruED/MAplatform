import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { RequestDetailScreen } from './RequestDetailScreen';
import { StatusTimeline } from './StatusTimeline';
import {
  companyUser,
  makeDocument,
  makePayment,
  makeRequestDetail,
  makeStatusEvent,
  mockFetch,
  renderWithProviders,
} from '../../test/utils';

const authStub = { status: 200, body: { user: companyUser } };
const REQUEST_ID = '11111111-1111-4111-8111-111111111111';

function renderDetail() {
  return renderWithProviders(
    <Routes>
      <Route path="/portal/requests/:id" element={<RequestDetailScreen />} />
      <Route path="/portal/requests" element={<div>Request queue</div>} />
    </Routes>,
    { route: `/portal/requests/${REQUEST_ID}` },
  );
}

function stubDetail(body: unknown, status = 200) {
  return mockFetch((url) => {
    if (url.endsWith('/api/auth/me')) return authStub;
    if (url.includes(`/api/requests/${REQUEST_ID}`)) return { status, body };
    return undefined;
  });
}

describe('RequestDetailScreen', () => {
  it('shows a loading state while the request is in flight', () => {
    globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch;
    renderDetail();

    expect(screen.getByRole('status', { busy: true })).toHaveTextContent(/Loading request/i);
  });

  it('renders the record, the employee, the company and the lab', async () => {
    stubDetail({
      request: makeRequestDetail({
        assignedLab: { id: 'lab-1', name: 'Jazan Medical Laboratory' },
        notes: 'Annual periodic examination.',
      }),
      availableTransitions: [],
    });

    renderDetail();

    expect(await screen.findByText('A. Al-Harbi')).toBeInTheDocument();
    expect(screen.getByText('Northgate Industrial Services')).toBeInTheDocument();
    expect(screen.getByText('Jazan Medical Laboratory')).toBeInTheDocument();
    expect(screen.getByText('Annual periodic examination.')).toBeInTheDocument();
    // The reference appears in the title and the details grid.
    expect(screen.getAllByText(/RQ-\d{4}-/).length).toBeGreaterThan(0);
  });

  it('renders the status timeline from the persisted events', async () => {
    stubDetail({
      request: makeRequestDetail({
        status: 'AT_LAB',
        statusEvents: [
          makeStatusEvent({ id: 'e1', toStatus: 'SUBMITTED', changedAt: '2026-09-01T08:00:00.000Z' }),
          makeStatusEvent({
            id: 'e2',
            fromStatus: 'SUBMITTED',
            toStatus: 'APPROVED',
            changedByType: 'ADMIN_USER',
            changedAt: '2026-09-03T08:00:00.000Z',
          }),
          makeStatusEvent({
            id: 'e3',
            fromStatus: 'APPROVED',
            toStatus: 'AT_LAB',
            changedByType: 'ADMIN_USER',
            note: 'Sent to Jazan.',
            changedAt: '2026-09-05T08:00:00.000Z',
          }),
        ],
      }),
      availableTransitions: [],
    });

    renderDetail();

    const timeline = await screen.findByRole('list', { name: 'Status history' });
    const entries = within(timeline).getAllByRole('listitem');
    expect(entries).toHaveLength(3);

    // Newest first, so the current status leads.
    expect(within(entries[0]).getByText('At lab')).toBeInTheDocument();
    expect(within(entries[0]).getByText('Sent to Jazan.')).toBeInTheDocument();
    expect(within(entries[0]).getByText(/from Approved/i)).toBeInTheDocument();
    expect(within(entries[2]).getByText('Submitted')).toBeInTheDocument();
  });

  it('lists documents with a download link and payments with their status', async () => {
    stubDetail({
      request: makeRequestDetail({
        documents: [makeDocument({ fileName: 'certificate.pdf' })],
        payments: [makePayment({ status: 'PAID', amountMinor: 40000 })],
      }),
      availableTransitions: [],
    });

    renderDetail();

    expect(await screen.findByText('certificate.pdf')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      '/api/documents/doc-1/download',
    );
    expect(screen.getByText('SAR 400.00')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  /**
   * The action buttons follow the server's own actor-permission matrix, so the
   * UI cannot offer a move the API would refuse.
   */
  it('offers Withdraw only when the API says the transition is available', async () => {
    stubDetail({
      request: makeRequestDetail({ status: 'SUBMITTED' }),
      availableTransitions: ['REJECTED'],
    });

    renderDetail();
    expect(await screen.findByRole('button', { name: /Withdraw/i })).toBeInTheDocument();
  });

  it('hides Withdraw when the API offers no transitions', async () => {
    stubDetail({
      request: makeRequestDetail({ status: 'AT_LAB' }),
      availableTransitions: [],
    });

    renderDetail();
    await screen.findByText('A. Al-Harbi');
    expect(screen.queryByRole('button', { name: /Withdraw/i })).not.toBeInTheDocument();
  });

  it('surfaces the API error when a withdrawal is refused', async () => {
    const { calls } = mockFetch((url, init) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes(`/api/requests/${REQUEST_ID}/status`) && init?.method === 'PATCH') {
        return {
          status: 403,
          body: {
            error: {
              code: 'FORBIDDEN',
              message: 'A request can only be withdrawn while it is SUBMITTED or PENDING_PAYMENT.',
            },
          },
        };
      }
      if (url.includes(`/api/requests/${REQUEST_ID}`)) {
        return {
          status: 200,
          body: {
            request: makeRequestDetail({ status: 'SUBMITTED' }),
            availableTransitions: ['REJECTED'],
          },
        };
      }
      return undefined;
    });

    renderDetail();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Withdraw/i }));

    expect(await screen.findByText(/can only be withdrawn/i)).toBeInTheDocument();
    // The PATCH names a target status only — never an arbitrary field.
    const patch = calls.find((c) => c.init?.method === 'PATCH');
    expect(JSON.parse(String(patch?.init?.body))).toMatchObject({ status: 'REJECTED' });
  });

  it('shows the not-found state for another company’s request id', async () => {
    stubDetail({ error: { code: 'NOT_FOUND', message: 'No request with that id in your company.' } }, 404);

    renderDetail();

    expect(await screen.findByText('No such request in your company')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Status history' })).not.toBeInTheDocument();
  });

  it('shows a retryable error state for a server failure', async () => {
    stubDetail({ error: { code: 'INTERNAL_ERROR', message: 'Database unavailable.' } }, 500);

    renderDetail();

    expect(await screen.findByText(/Could not load this data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });
});

describe('StatusTimeline', () => {
  it('renders an explanatory line when there are no events', () => {
    renderWithProviders(<StatusTimeline events={[]} />, { withAuth: false });
    expect(screen.getByText(/No status changes recorded yet/i)).toBeInTheDocument();
  });

  it('is built purely from the events it is given', () => {
    renderWithProviders(
      <StatusTimeline
        events={[makeStatusEvent({ id: 'only', toStatus: 'COMPLETE', fromStatus: 'UNDER_REVIEW' })]}
      />,
      { withAuth: false },
    );

    const entries = screen.getAllByRole('listitem');
    expect(entries).toHaveLength(1);
    expect(within(entries[0]).getByText('Complete')).toBeInTheDocument();
    // No invented pipeline steps for statuses the request never reached.
    expect(screen.queryByText('At lab')).not.toBeInTheDocument();
    expect(screen.queryByText('Submitted')).not.toBeInTheDocument();
  });
});
