import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CertificatesScreen } from './CertificatesScreen';
import {
  companyUser,
  makeDocument,
  makeRequestRow,
  mockFetch,
  renderWithProviders,
} from '../../test/utils';

const authStub = { status: 200, body: { user: companyUser } };

/** Builds the two-part payload GET /api/certificates returns. */
function certificatesPayload(
  certificates: ReturnType<typeof makeDocument>[],
  requests: ReturnType<typeof makeRequestRow>[] = [],
) {
  return { status: 200, body: { certificates, requests } };
}

function certificateWithRequest(overrides: Record<string, unknown> = {}) {
  return {
    ...makeDocument(),
    request: {
      id: '11111111-1111-4111-8111-111111111111',
      type: 'FITNESS_CERTIFICATE',
      status: 'COMPLETE',
      employee: { id: 'emp-1', fullName: 'A. Al-Harbi', site: 'Jazan Site 4' },
    },
    ...overrides,
  };
}

describe('CertificatesScreen', () => {
  it('shows a loading state while the register is in flight', () => {
    globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch;
    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });

    expect(screen.getByRole('status', { busy: true })).toHaveTextContent(
      /Loading the certificate register/i,
    );
  });

  it('shows the empty state when the company has no certificate requests', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) return certificatesPayload([], []);
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });

    expect(await screen.findByText('No certificate requests yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders issued certificates and in-flight requests together', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) {
        return certificatesPayload(
          [certificateWithRequest()],
          [
            makeRequestRow(),
            makeRequestRow({
              id: '22222222-2222-4222-8222-222222222222',
              status: 'AT_LAB',
              employee: { id: 'emp-2', fullName: 'R. Menon', site: 'Yanbu Terminal', role: 'Tech' },
            }),
          ],
        );
      }
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });

    const table = await screen.findByRole('table');
    // The issued one shows its expiry state; the in-flight one shows its status.
    expect(within(table).getByText('A. Al-Harbi')).toBeInTheDocument();
    expect(within(table).getByText('R. Menon')).toBeInTheDocument();
    expect(within(table).getByText('At lab')).toBeInTheDocument();
    expect(within(table).getByRole('link', { name: 'Download' })).toBeInTheDocument();

    // The prototype's hard-coded references are gone.
    expect(screen.queryByText('CT-2026-0841')).not.toBeInTheDocument();
    expect(screen.queryByText('S. Okonkwo')).not.toBeInTheDocument();
  });

  it('marks an expired certificate distinctly from a valid one', async () => {
    const past = new Date();
    past.setDate(past.getDate() - 30);

    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) {
        return certificatesPayload(
          [certificateWithRequest({ id: 'doc-expired', expiryDate: past.toISOString() })],
          [makeRequestRow()],
        );
      }
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });

    const table = await screen.findByRole('table');
    expect(within(table).getByText('Expired')).toBeInTheDocument();
  });

  it('filters the register and offers a way to clear the filter', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) {
        return certificatesPayload(
          [
            certificateWithRequest(),
            certificateWithRequest({
              id: 'doc-2',
              requestId: '33333333-3333-4333-8333-333333333333',
              request: {
                id: '33333333-3333-4333-8333-333333333333',
                type: 'FITNESS_CERTIFICATE',
                status: 'COMPLETE',
                employee: { id: 'emp-3', fullName: 'K. Ahmed', site: 'Riyadh Depot' },
              },
            }),
          ],
          [
            makeRequestRow(),
            makeRequestRow({
              id: '33333333-3333-4333-8333-333333333333',
              employee: { id: 'emp-3', fullName: 'K. Ahmed', site: 'Riyadh Depot', role: 'Lead' },
            }),
          ],
        );
      }
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });
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
      if (url.includes('/api/certificates')) {
        return certificatesPayload([certificateWithRequest()], [makeRequestRow()]);
      }
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });
    await screen.findByText('A. Al-Harbi');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Search/i), 'no-such-worker');

    expect(await screen.findByText('No records match these filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear filters/i })).toBeInTheDocument();
  });

  it('shows an error state with a retry when the fetch fails', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) {
        return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } } };
      }
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });

    expect(await screen.findByText(/Could not load this data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('never asks the API for a companyId — the server decides the tenant', async () => {
    const { calls } = mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) return certificatesPayload([], []);
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });
    await screen.findByText('No certificate requests yet');

    for (const call of calls) {
      expect(call.url).not.toMatch(/companyId/i);
      expect(String(call.init?.body ?? '')).not.toMatch(/companyId/i);
    }
  });
});

describe('CertificatesScreen pairing', () => {
  it('shows a completed request that has no certificate on file, rather than hiding it', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) {
        // A COMPLETE request with no CERTIFICATE document attached.
        return certificatesPayload([], [makeRequestRow({ status: 'COMPLETE' })]);
      }
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });

    const table = await screen.findByRole('table');
    expect(within(table).getByText('A. Al-Harbi')).toBeInTheDocument();
    // Falls back to the workflow status when there is no certificate.
    expect(within(table).getByText('Complete')).toBeInTheDocument();
    expect(within(table).queryByRole('link', { name: 'Download' })).not.toBeInTheDocument();
  });

  it('lists a request once even when several certificates exist for it', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) return authStub;
      if (url.includes('/api/certificates')) {
        return certificatesPayload(
          [
            certificateWithRequest({ id: 'old', uploadedAt: '2026-01-01T00:00:00.000Z' }),
            certificateWithRequest({ id: 'new', uploadedAt: '2026-09-01T00:00:00.000Z' }),
          ],
          [makeRequestRow()],
        );
      }
      return undefined;
    });

    renderWithProviders(<CertificatesScreen />, { route: '/portal/certificates' });

    const table = await screen.findByRole('table');
    expect(within(table).getAllByText('A. Al-Harbi')).toHaveLength(1);
    // The newest certificate wins.
    expect(within(table).getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      '/api/documents/new/download',
    );
  });
});
