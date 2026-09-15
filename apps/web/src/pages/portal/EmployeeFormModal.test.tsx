import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeFormModal } from './EmployeeFormModal';
import { companyUser, makeEmployeeDetail, mockFetch, renderWithProviders } from '../../test/utils';

const authStub = { status: 200, body: { user: companyUser } };

function stubCreate(result: { status: number; body: unknown }) {
  return mockFetch((url, init) => {
    if (url.endsWith('/api/auth/me')) return authStub;
    if (url.endsWith('/api/employees') && init?.method === 'POST') return result;
    if (url.includes('/api/employees')) return { status: 200, body: { employees: [], total: 0, sites: [] } };
    return undefined;
  });
}

describe('EmployeeFormModal validation', () => {
  it('blocks submission and shows field errors when required fields are empty', async () => {
    const { calls } = stubCreate({ status: 201, body: { employee: makeEmployeeDetail() } });

    renderWithProviders(<EmployeeFormModal open onClose={() => {}} />, { route: '/portal/workers' });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Register worker/i }));

    expect(await screen.findByText(/Enter the employee’s full name\./i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a national ID or worker number\./i)).toBeInTheDocument();

    // Nothing was sent to the server.
    expect(calls.some((c) => c.init?.method === 'POST')).toBe(false);
  });

  it('rejects a national ID with unsupported characters', async () => {
    stubCreate({ status: 201, body: { employee: makeEmployeeDetail() } });
    renderWithProviders(<EmployeeFormModal open onClose={() => {}} />, { route: '/portal/workers' });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Full name/i), 'Valid Name');
    await user.type(screen.getByLabelText(/National ID/i), '!!bad!!');
    await user.click(screen.getByRole('button', { name: /Register worker/i }));

    expect(await screen.findByText(/letters, digits, spaces, hyphens or slashes/i)).toBeInTheDocument();
  });

  it('rejects a future date of birth', async () => {
    stubCreate({ status: 201, body: { employee: makeEmployeeDetail() } });
    renderWithProviders(<EmployeeFormModal open onClose={() => {}} />, { route: '/portal/workers' });

    const future = new Date();
    future.setFullYear(future.getFullYear() + 2);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Full name/i), 'Valid Name');
    await user.type(screen.getByLabelText(/National ID/i), 'MA-1');
    await user.type(screen.getByLabelText(/Date of birth/i), future.toISOString().slice(0, 10));
    await user.click(screen.getByRole('button', { name: /Register worker/i }));

    expect(await screen.findByText(/cannot be in the future/i)).toBeInTheDocument();
  });

  it('submits valid input and never sends a companyId', async () => {
    const { calls } = stubCreate({ status: 201, body: { employee: makeEmployeeDetail() } });

    renderWithProviders(<EmployeeFormModal open onClose={() => {}} />, { route: '/portal/workers' });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Full name/i), 'N. Farouk');
    await user.type(screen.getByLabelText(/National ID/i), 'ACME-1001');
    await user.type(screen.getByLabelText(/Job title/i), 'Rigger');
    await user.click(screen.getByRole('button', { name: /Register worker/i }));

    await waitFor(() => {
      expect(calls.some((c) => c.init?.method === 'POST')).toBe(true);
    });

    const post = calls.find((c) => c.init?.method === 'POST');
    const body = JSON.parse(String(post?.init?.body));
    expect(body).toMatchObject({ fullName: 'N. Farouk', nationalId: 'ACME-1001', role: 'Rigger' });
    expect(body).not.toHaveProperty('companyId');
  });

  /**
   * The per-company unique national ID only exists server-side, so its error has
   * to land on the right input rather than in a generic banner.
   */
  it('maps a server field error back onto the matching input', async () => {
    stubCreate({
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'An employee with that national ID already exists in your company.',
          details: [{ path: 'nationalId', message: 'Already registered in your company.' }],
        },
      },
    });

    renderWithProviders(<EmployeeFormModal open onClose={() => {}} />, { route: '/portal/workers' });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Full name/i), 'Duplicate Worker');
    await user.type(screen.getByLabelText(/National ID/i), 'ACME-DUP');
    await user.click(screen.getByRole('button', { name: /Register worker/i }));

    expect(await screen.findByText('Already registered in your company.')).toBeInTheDocument();
  });

  it('shows a banner for an error with no field detail', async () => {
    stubCreate({
      status: 500,
      body: { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
    });

    renderWithProviders(<EmployeeFormModal open onClose={() => {}} />, { route: '/portal/workers' });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Full name/i), 'Valid Name');
    await user.type(screen.getByLabelText(/National ID/i), 'MA-2');
    await user.click(screen.getByRole('button', { name: /Register worker/i }));

    expect(await screen.findByText('Could not save')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('seeds the form from the record when editing', async () => {
    mockFetch((url) => (url.endsWith('/api/auth/me') ? authStub : undefined));

    renderWithProviders(
      <EmployeeFormModal open onClose={() => {}} employee={makeEmployeeDetail()} />,
      { route: '/portal/workers/emp-1' },
    );

    expect(screen.getByLabelText(/Full name/i)).toHaveValue('A. Al-Harbi');
    expect(screen.getByLabelText(/National ID/i)).toHaveValue('MA-40118');
    expect(screen.getByLabelText(/Date of birth/i)).toHaveValue('1991-02-14');
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeInTheDocument();
  });
});
