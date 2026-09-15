import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { RequireAdmin } from './AdminLayout';
import { companyUser, mockFetch, renderWithProviders } from '../test/utils';

const adminUser = {
  type: 'admin' as const,
  id: 'admin-1',
  name: 'Medical Alliance Operations',
  email: 'admin@medicalalliance.example',
  role: 'ADMIN' as const,
};

/**
 * The admin guard's contract. It is a convenience only — every /api/admin route
 * is enforced server-side by requireAdminAuth, so removing this component would
 * hide the UI, not expose the data. These tests pin the redirect behaviour.
 */
function renderGuarded(route = '/admin/requests') {
  return renderWithProviders(
    <Routes>
      <Route path="/portal/login" element={<div>Sign-in screen</div>} />
      <Route path="/portal" element={<div>Company portal</div>} />
      <Route element={<RequireAdmin />}>
        <Route path="/admin/requests" element={<div>Admin queue</div>} />
        <Route path="/admin/requests/:id" element={<div>Admin request detail</div>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('RequireAdmin', () => {
  it('shows a loading state while the session is being checked', () => {
    globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch;
    renderGuarded();

    expect(screen.getByRole('status')).toHaveTextContent(/Checking your session/i);
    expect(screen.queryByText('Admin queue')).not.toBeInTheDocument();
  });

  it('redirects an unauthenticated visitor to the sign-in screen', async () => {
    mockFetch((url) =>
      url.endsWith('/api/auth/me')
        ? { status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Not signed in.' } } }
        : undefined,
    );

    renderGuarded();
    expect(await screen.findByText('Sign-in screen')).toBeInTheDocument();
    expect(screen.queryByText('Admin queue')).not.toBeInTheDocument();
  });

  /**
   * A company user IS signed in — just not as staff — so they go to their own
   * portal rather than being asked to sign in again.
   */
  it.each(['/admin/requests', '/admin/requests/abc'])(
    'sends a signed-in company user at %s back to the portal',
    async (route) => {
      mockFetch((url) =>
        url.endsWith('/api/auth/me') ? { status: 200, body: { user: companyUser } } : undefined,
      );

      renderGuarded(route);

      expect(await screen.findByText('Company portal')).toBeInTheDocument();
      expect(screen.queryByText('Admin queue')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin request detail')).not.toBeInTheDocument();
    },
  );

  it('admits a staff principal', async () => {
    mockFetch((url) =>
      url.endsWith('/api/auth/me') ? { status: 200, body: { user: adminUser } } : undefined,
    );

    renderGuarded();
    expect(await screen.findByText('Admin queue')).toBeInTheDocument();
  });

  it('sends the session check with credentials', async () => {
    const { calls } = mockFetch((url) =>
      url.endsWith('/api/auth/me') ? { status: 200, body: { user: adminUser } } : undefined,
    );

    renderGuarded();
    await screen.findByText('Admin queue');

    const meCall = calls.find((c) => c.url.endsWith('/api/auth/me'));
    expect(meCall?.init?.credentials).toBe('include');
  });
});
