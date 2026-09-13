import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, companyUser, mockFetch } from '../../test/utils';
import { LoginScreen } from './LoginScreen';

/**
 * The prototype's login accepted any input. These tests pin the corrected
 * behaviour: only a 200 from the API navigates, a 401 shows an inline error and
 * stays put, and no token is ever written to browser storage.
 */

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/portal/login" element={<LoginScreen />} />
      <Route path="/portal" element={<div>Portal dashboard</div>} />
    </Routes>,
    { route: '/portal/login' },
  );
}

describe('LoginScreen', () => {
  it('navigates to /portal when the API accepts the credentials', async () => {
    const { calls } = mockFetch((url, init) => {
      if (url.endsWith('/api/auth/me')) {
        // Signed out on mount; authenticated once login has run.
        return calls.some((c) => c.url.endsWith('/api/auth/company/login'))
          ? { status: 200, body: { user: companyUser } }
          : { status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Not signed in.' } } };
      }
      if (url.endsWith('/api/auth/company/login')) {
        const body = JSON.parse(String(init?.body ?? '{}'));
        return body.password === 'DemoPassw0rd!'
          ? { status: 200, body: { user: companyUser } }
          : { status: 401, body: { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } } };
      }
      return undefined;
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Work email/i), 'ops@northgate.example');
    await user.type(screen.getByLabelText(/Password/i), 'DemoPassw0rd!');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    expect(await screen.findByText('Portal dashboard')).toBeInTheDocument();

    const loginCall = calls.find((c) => c.url.endsWith('/api/auth/company/login'));
    expect(loginCall).toBeDefined();
    expect(loginCall?.init?.credentials).toBe('include');
  });

  it('shows an inline error and does NOT navigate when the credentials are wrong', async () => {
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) {
        return { status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Not signed in.' } } };
      }
      if (url.endsWith('/api/auth/company/login')) {
        return { status: 401, body: { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } } };
      }
      return undefined;
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Work email/i), 'ops@northgate.example');
    await user.type(screen.getByLabelText(/Password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(screen.getByText(/Could not sign in/i)).toBeInTheDocument();
    // Still on the login screen.
    expect(screen.queryByText('Portal dashboard')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Occupational health portal/i })).toBeInTheDocument();
  });

  it('never writes a token to localStorage or sessionStorage', async () => {
    const localSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');
    const sessionSpy = vi.spyOn(window.sessionStorage.__proto__, 'setItem');

    // /me must fail on mount, or the screen redirects before the form renders.
    mockFetch((url) => {
      if (url.endsWith('/api/auth/me')) {
        return { status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Not signed in.' } } };
      }
      if (url.endsWith('/api/auth/company/login')) return { status: 200, body: { user: companyUser } };
      return undefined;
    });

    renderLogin();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Work email/i), 'ops@northgate.example');
    await user.type(screen.getByLabelText(/Password/i), 'DemoPassw0rd!');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    await waitFor(() => expect(screen.getByText('Portal dashboard')).toBeInTheDocument());
    expect(localSpy).not.toHaveBeenCalled();
    expect(sessionSpy).not.toHaveBeenCalled();
  });

  it('does not ship pre-filled demo credentials', () => {
    mockFetch((url) =>
      url.endsWith('/api/auth/me')
        ? { status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Not signed in.' } } }
        : undefined,
    );
    renderLogin();
    expect(screen.getByLabelText(/Work email/i)).toHaveValue('');
    expect(screen.getByLabelText(/Password/i)).toHaveValue('');
  });

  it('surfaces a network failure rather than silently succeeding', async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError('Failed to fetch'); }) as unknown as typeof fetch;

    renderLogin();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Work email/i), 'ops@northgate.example');
    await user.type(screen.getByLabelText(/Password/i), 'DemoPassw0rd!');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    expect(await screen.findByText(/Could not reach the server/i)).toBeInTheDocument();
    expect(screen.queryByText('Portal dashboard')).not.toBeInTheDocument();
  });
});
