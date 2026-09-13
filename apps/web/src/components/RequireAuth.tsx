import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './index';
import { useAuth } from '../lib/auth';

/**
 * Route guard for /portal/*.
 *
 * Authentication is decided by GET /api/auth/me, i.e. by whether the browser
 * holds a valid httpOnly session cookie — never by anything in localStorage. The
 * guard renders a loading state while that call is in flight so a signed-in user
 * is not bounced to the login screen on a page refresh.
 *
 * This is a convenience only: every protected API route enforces the same check
 * server-side, so removing this component would hide the UI's data, not expose it.
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 'var(--space-3)', height: '100vh', background: 'var(--surface-page-alt)',
          color: 'var(--text-muted)', font: 'var(--type-body-sm)',
        }}
      >
        <Icon name="loader" size={22} />
        Checking your session…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // Remember where they were headed so login can return them there.
    return <Navigate to="/portal/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
