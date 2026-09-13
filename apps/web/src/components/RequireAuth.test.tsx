import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { companyUser, mockFetch, renderWithProviders } from '../test/utils';

/**
 * The guard's contract: redirect to /portal/login when GET /api/auth/me fails,
 * render the protected tree when it succeeds, and show a loading state in
 * between so a refresh does not bounce a signed-in user.
 */
function renderGuarded(route = '/portal') {
  return renderWithProviders(
    <Routes>
      <Route path="/portal/login" element={<div>Sign-in screen</div>} />
      <Route element={<RequireAuth />}>
        <Route path="/portal" element={<div>Protected dashboard</div>} />
        <Route path="/portal/certificates" element={<div>Protected certificates</div>} />
        <Route path="/portal/workers/:id" element={<div>Protected worker</div>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('RequireAuth', () => {
  it('shows a loading state while the session is being checked', () => {
    // A fetch that never settles keeps the guard in its loading state.
    globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch;
    renderGuarded();
    expect(screen.getByRole('status')).toHaveTextContent(/Checking your session/i);
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
  });

  it('redirects to /portal/login when unauthenticated', async () => {
    mockFetch((url) =>
      url.endsWith('/api/auth/me')
        ? { status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Not signed in.' } } }
        : undefined,
    );
    renderGuarded();
    expect(await screen.findByText('Sign-in screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
  });

  it.each([
    ['/portal', 'Protected dashboard'],
    ['/portal/certificates', 'Protected certificates'],
    ['/portal/workers/emp-1', 'Protected worker'],
  ])('renders %s when authenticated', async (route, expected) => {
    mockFetch((url) => (url.endsWith('/api/auth/me') ? { status: 200, body: { user: companyUser } } : undefined));
    renderGuarded(route);
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });

  it.each(['/portal', '/portal/certificates', '/portal/workers/emp-1'])(
    'guards %s against an unauthenticated visitor',
    async (route) => {
      mockFetch((url) =>
        url.endsWith('/api/auth/me')
          ? { status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Not signed in.' } } }
          : undefined,
      );
      renderGuarded(route);
      expect(await screen.findByText('Sign-in screen')).toBeInTheDocument();
    },
  );

  it('sends credentials with the session check', async () => {
    const { calls } = mockFetch((url) =>
      url.endsWith('/api/auth/me') ? { status: 200, body: { user: companyUser } } : undefined,
    );
    renderGuarded();
    await screen.findByText('Protected dashboard');
    const meCall = calls.find((c) => c.url.endsWith('/api/auth/me'));
    expect(meCall?.init?.credentials).toBe('include');
  });
});
