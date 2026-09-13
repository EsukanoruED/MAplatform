import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Checkbox, Icon, Logo, TextField } from '../../components';
import { ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';

/**
 * Migrated from ui_kits/portal/LoginScreen.jsx, and materially corrected.
 *
 * The prototype called `onSignIn()` unconditionally on submit — every input was
 * accepted. This version posts to POST /api/auth/company/login and only proceeds
 * when the server issues a session. The inline error Alert and the submitting
 * state are new UI, because the prototype had no failure path to show.
 *
 * No token is stored anywhere on the client: the server sets an httpOnly cookie
 * the page cannot read, and the app asks GET /api/auth/me who it is.
 *
 * The right-hand ink panel, the copy and the layout are unchanged. The
 * pre-filled demo credentials are gone — shipping a password in a value
 * attribute would be exactly the habit this rebuild is meant to end.
 */
export function LoginScreen() {
  const { signIn, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Where RequireAuth sent us from, so sign-in returns the user to it.
  const from = (location.state as { from?: string } | null)?.from ?? '/portal';

  // Already signed in (e.g. arrived here by typing the URL) — go straight in.
  React.useEffect(() => {
    if (status === 'authenticated') navigate(from, { replace: true });
  }, [status, navigate, from]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Show the server's message. It is deliberately generic for bad
      // credentials and never says which field was wrong.
      setError(
        err instanceof ApiError
          ? err.message
          : 'Sign-in failed. Please try again.',
      );
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 460px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', background: 'var(--surface-page)' }}>
        <form
          onSubmit={onSubmit}
          noValidate
          style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
        >
          <Logo height={32} style={{ marginBottom: 'var(--space-4)' }} />
          <div>
            <h1 style={{ font: 'var(--type-heading-2)', letterSpacing: 'var(--tracking-tight)' }}>Occupational health portal</h1>
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Sign in with your Medical Alliance clinical account.
            </p>
          </div>

          {error && (
            <Alert tone="danger" title="Could not sign in" icon={<Icon name="triangle-alert" size={18} />}>
              {error}
            </Alert>
          )}

          <TextField
            label="Work email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            iconStart={<Icon name="mail" size={16} />}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconStart={<Icon name="lock" size={16} />}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <Checkbox label="Keep me signed in" defaultChecked={false} />
            <a href="#" onClick={(e) => e.preventDefault()} style={{ font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)' }}>Forgot password?</a>
          </div>
          <Button type="submit" size="lg" fullWidth disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            Access is logged. Clinical records are retained to the applicable schedule.
          </p>
        </form>
      </div>
      <div className="ma-ink" style={{ flex: '1 1 380px', background: 'var(--ma-maroon-950)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 'var(--space-12)' }}>
        <img src="/logo/ma-mark-white.png" alt="" style={{ position: 'absolute', top: '-8%', right: '-14%', height: '92%', width: 'auto', opacity: .10 }} />
        <div style={{ position: 'relative', maxWidth: '34ch', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--ma-maroon-200)' }}>Medical Alliance</span>
          <p style={{ font: 'var(--type-display-3)', color: '#fff', letterSpacing: 'var(--tracking-tight)', textWrap: 'balance' }}>
            One record per worker, from pre-placement to exit.
          </p>
          <p style={{ font: 'var(--type-body)', color: 'rgba(255,255,255,.66)' }}>
            Examinations, restrictions, certificates and site coverage in a single audit-ready file.
          </p>
        </div>
      </div>
    </div>
  );
}
