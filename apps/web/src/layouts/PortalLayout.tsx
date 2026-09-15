import type { ReactNode, CSSProperties } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Breadcrumb, Icon, IconButton, Logo } from '../components';
import { useAuth } from '../lib/auth';

/**
 * Portal chrome, migrated from the prototype's PortalChrome.jsx.
 *
 * Adaptations:
 *  - The prototype's `route`/`onNavigate` state pair is replaced by React Router
 *    <NavLink>s; the sidebar's active highlight comes from NavLink's isActive.
 *  - The Placeholder screens the prototype rendered for unbuilt sections are now
 *    real routes rendering the same "left intentionally blank" card.
 *  - The hard-coded user block in the sidebar footer now shows the signed-in
 *    principal from GET /api/auth/me, and gained a working sign-out control.
 *  - The sidebar's static counts (1,284 workers / 76 certificates) are gone:
 *    they were decoration, and inventing numbers next to real data would be
 *    misleading. Live counts belong on the dashboard, which computes them.
 * Layout, spacing and styling are otherwise unchanged.
 */

const SECTIONS = [
  {
    h: 'Operations',
    items: [
      { to: '/portal', label: 'Dashboard', icon: 'layout-dashboard', end: true },
      { to: '/portal/workers', label: 'Workers', icon: 'users', end: false },
      { to: '/portal/requests', label: 'Requests', icon: 'clipboard-check', end: false },
      { to: '/portal/certificates', label: 'Certificates', icon: 'file-badge', end: false },
    ],
  },
  {
    h: 'Sites',
    items: [
      { to: '/portal/clinics', label: 'Site clinics', icon: 'building-2', end: false },
      { to: '/portal/stock', label: 'Stock and equipment', icon: 'package', end: false },
    ],
  },
  {
    h: 'Account',
    items: [{ to: '/portal/settings', label: 'Settings', icon: 'settings', end: false }],
  },
] as const;

function initials(name: string): string {
  const parts = name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '··';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

function PortalSidebar() {
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
        width: 'var(--sidebar-w)', flex: '0 0 auto', background: 'var(--ma-maroon-950)',
        borderInlineEnd: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ height: 'var(--topbar-h)', display: 'flex', alignItems: 'center', padding: '0 var(--space-5)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <Logo tone="white" height={26} />
      </div>
      <nav style={{ padding: 'var(--space-5) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', flex: 1, overflow: 'auto' }}>
        {SECTIONS.map((s) => (
          <div key={s.h} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'rgba(255,255,255,.42)', padding: '0 var(--space-3) var(--space-2)' }}>{s.h}</span>
            {s.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%',
                  padding: 'var(--space-2-5) var(--space-3)', border: 0, cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)', textAlign: 'start', textDecoration: 'none',
                  background: isActive ? 'var(--ma-maroon-600)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,.72)',
                  font: `${isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)'} var(--text-sm)/1 var(--font-body)`,
                  transition: 'var(--transition-control)',
                })}
              >
                <Icon name={it.icon} size={17} />
                <span style={{ flex: 1 }}>{it.label}</span>
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
            {user?.type === 'company' && user.role === 'COMPANY_ADMIN'
              ? 'Company admin'
              : user?.type === 'company'
                ? 'Requester'
                : user?.type === 'admin'
                  ? 'Medical Alliance staff'
                  : ''}
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

export function PortalTopBar({
  title, crumbs, actions,
}: {
  title: ReactNode;
  crumbs?: Array<string | { label: string; href?: string }>;
  actions?: ReactNode;
}) {
  return (
    <header style={{
      minHeight: 'var(--topbar-h)', flex: '0 0 auto', display: 'flex', alignItems: 'center',
      gap: 'var(--space-4)', padding: 'var(--space-2) var(--space-8)', background: 'var(--surface-page)',
      borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {crumbs && <Breadcrumb items={crumbs} style={{ marginBottom: 2 }} />}
        <h1 style={{ font: 'var(--type-heading-3)' }}>{title}</h1>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)', height: 'var(--control-h-md)',
        padding: '0 var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-control)',
        color: 'var(--text-muted)', font: 'var(--type-body-sm)', width: 240,
      }}>
        <Icon name="search" size={16} /> Search workers or IDs
      </div>
      <IconButton label="Notifications" variant="ghost" icon={<Icon name="bell" size={18} />} />
      {actions}
    </header>
  );
}

export function PortalBody({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-8)', ...style }}>{children}</div>;
}

export function PortalLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface-page-alt)' }}>
      <PortalSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
