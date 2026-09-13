import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Badge, Button, Icon, Logo } from '../components';

/**
 * Public website chrome, migrated from the prototype's SiteChrome.jsx.
 *
 * Adaptations, all structural rather than visual:
 *  - The prototype's `onNavigate(routeId)` prop-drilling is replaced by React
 *    Router <Link>/<NavLink>; active-state styling now comes from NavLink's
 *    isActive rather than a `route === n.id` comparison.
 *  - Screens render through <Outlet /> instead of being chosen by a switch in
 *    index.html.
 *  - Logo asset paths come from the Logo component's /logo default (Vite serves
 *    apps/web/public/logo) instead of the prototype's '../../assets/logo'.
 * Markup, styling and copy are unchanged.
 */

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/remote-sites', label: 'Remote sites' },
  { to: '/contact', label: 'Contact' },
] as const;

const FOOTER_COLUMNS = [
  { h: 'Services', items: ['Medical consultations', 'Occupational health', 'Training and consultancy', 'Facility equipping', 'Medical supplies'] },
  { h: 'Remote sites', items: ['On-site clinics', 'Emergency response', 'Fitness for work', 'Medication management'] },
  { h: 'Company', items: ['About', 'Accreditations', 'Careers', 'Contact'] },
];

function SiteHeader() {
  const navigate = useNavigate();
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.88)',
      backdropFilter: 'var(--blur-scrim)', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: 'var(--content-max)', margin: '0 auto', minHeight: 'var(--topbar-h)',
        padding: 'var(--space-2) var(--gutter-inline-lg)', display: 'flex', alignItems: 'center',
        gap: 'var(--space-8)', flexWrap: 'wrap',
      }}>
        <Link to="/" style={{ display: 'flex' }} aria-label="Medical Alliance — home">
          <Logo height={30} />
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--space-6)', marginInlineStart: 'auto', flexWrap: 'wrap' }}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              style={({ isActive }) => ({
                font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)',
                color: isActive ? 'var(--text-brand)' : 'var(--text-secondary)',
                textDecoration: 'none', paddingBottom: 2,
                borderBottom: isActive ? '2px solid var(--surface-brand)' : '2px solid transparent',
              })}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)', color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            <Icon name="globe" size={16} />
            <span dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>عربي</span>
          </a>
          <Button size="sm" onClick={() => navigate('/contact')}>Request a consultation</Button>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="ma-ink" style={{ background: 'var(--ma-maroon-950)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-16) var(--gutter-inline-lg) var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-10)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Logo tone="white" height={30} />
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', maxWidth: '32ch' }}>
              Healthcare services and medical consultancy — occupational health, facility management and remote-site medical cover.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Badge tone="neutral" style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.78)' }}>ISO 9001</Badge>
              <Badge tone="neutral" style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.78)' }}>24/7 cover</Badge>
            </div>
          </div>
          {FOOTER_COLUMNS.map((c) => (
            <div key={c.h} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--ma-maroon-200)' }}>{c.h}</span>
              {c.items.map((i) => (
                <Link key={i} to="/services" style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', textDecoration: 'none' }}>{i}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-5)', borderTop: '1px solid rgba(255,255,255,.10)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>© 2026 Medical Alliance · التحالف الطبي</span>
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            Privacy · Terms · Patient safety policy · <Link to="/portal/login" style={{ color: 'inherit' }}>Portal sign-in</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  return (
    <>
      <SiteHeader />
      <main style={{ background: 'var(--surface-page)' }}>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
