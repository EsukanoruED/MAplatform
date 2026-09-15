import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon, Logo } from '../components';
import { useAuth } from '../lib/auth';

/**
 * The Medical Alliance staff console shell.
 *
 * Reuses the portal's visual language — same ink sidebar, same topbar — so the
 * two consoles read as one product, while keeping the navigation separate
 * because the audiences and permissions are different.
 *
 * `RequireAdmin` below is a convenience only. Every /api/admin route is guarded
 * server-side by `requireAdminAuth`, so removing this component would hide the
 * UI, not expose the data.
 */
const SECTIONS = [
  {
    h: 'Operations',
    items: [{ to: '/admin/requests', label: 'Request queue', icon: 'clipboard-check' }],
  },
] as const;

function initials(name: string): string {
  const parts = name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '··';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Guards /admin/*. A company session is sent to the portal rather than the admin
 * login, because it IS signed in — just not as staff.
 */
export function RequireAdmin() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          height: '100vh',
          background: 'var(--surface-page-alt)',
          color: 'var(--text-muted)',
          font: 'var(--type-body-sm)',
        }}
      >
        <Icon name="loader" size={22} />
        Checking your session…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/portal/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (user?.type !== 'admin') {
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
}

function AdminSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    navigate('/portal/login', { replace: true });
  };

  return (
    <aside
      className="ma-ink"
      style={{
        width: 'var(--sidebar-w)',
        flex: '0 0 auto',
        background: 'var(--ma-maroon-950)',
        borderInlineEnd: '1px solid rgba(255,255,255,.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 'var(--topbar-h)', display: 'flex', alignItems: 'center', padding: '0 var(--space-5)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <Logo tone="white" height={26} />
      </div>
      <nav style={{ padding: 'var(--space-5) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', flex: 1, overflow: 'auto' }}>
        {SECTIONS.map((section) => (
          <div key={section.h} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'rgba(255,255,255,.42)', padding: '0 var(--space-3) var(--space-2)' }}>
              {section.h}
            </span>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  width: '100%',
                  padding: 'var(--space-2-5) var(--space-3)',
                  border: 0,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'start',
                  textDecoration: 'none',
                  background: isActive ? 'var(--ma-maroon-600)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,.72)',
                  font: `${isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)'} var(--text-sm)/1 var(--font-body)`,
                  transition: 'var(--transition-control)',
                })}
              >
                <Icon name={item.icon} size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ma-maroon-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: 'var(--weight-bold) var(--text-2xs)/1 var(--font-body)', flex: '0 0 auto' }}>
          {initials(user?.name ?? '')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--weight-semibold) var(--text-xs)/1.3 var(--font-body)', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name ?? 'Signed in'}
          </div>
          <div style={{ font: 'var(--type-caption)', color: 'rgba(255,255,255,.5)' }}>
            {user?.type === 'admin' && user.role === 'ADMIN' ? 'Administrator' : 'Reviewer'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          aria-label="Sign out"
          title="Sign out"
          style={{ border: 0, background: 'transparent', color: 'rgba(255,255,255,.5)', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <Icon name="log-out" size={16} />
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface-page-alt)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
