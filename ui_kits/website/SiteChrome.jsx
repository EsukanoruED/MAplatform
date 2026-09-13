const { Logo, Button, Icon, Badge } = window.MedicalAllianceDesignSystem_32f8e4;
const LOGO = '../../assets/logo';

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'remote', label: 'Remote sites' },
  { id: 'contact', label: 'Contact' },
];

function SiteHeader({ route, onNavigate }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.88)',
      backdropFilter: 'var(--blur-scrim)', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: 'var(--content-max)', margin: '0 auto', height: 'var(--topbar-h)',
        padding: '0 var(--gutter-inline-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)',
      }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} style={{ display: 'flex' }}>
          <Logo assetBase={LOGO} height={30} />
        </a>
        <nav style={{ display: 'flex', gap: 'var(--space-6)', marginInlineStart: 'auto' }}>
          {NAV.map((n) => (
            <a key={n.id} href="#" onClick={(e) => { e.preventDefault(); onNavigate(n.id); }}
              style={{
                font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)',
                color: route === n.id ? 'var(--text-brand)' : 'var(--text-secondary)',
                textDecoration: 'none', paddingBottom: 2,
                borderBottom: route === n.id ? '2px solid var(--surface-brand)' : '2px solid transparent',
              }}>{n.label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <Icon name="globe" size={16} /><span dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>عربي</span>
          </a>
          <Button size="sm" onClick={() => onNavigate('contact')}>Request a consultation</Button>
        </div>
      </div>
    </header>
  );
}

function SiteFooter({ onNavigate }) {
  const cols = [
    { h: 'Services', items: ['Medical consultations', 'Occupational health', 'Training and consultancy', 'Facility equipping', 'Medical supplies'] },
    { h: 'Remote sites', items: ['On-site clinics', 'Emergency response', 'Fitness for work', 'Medication management'] },
    { h: 'Company', items: ['About', 'Accreditations', 'Careers', 'Contact'] },
  ];
  return (
    <footer className="ma-ink" style={{ background: 'var(--ma-maroon-950)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-16) var(--gutter-inline-lg) var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)', gap: 'var(--space-10)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Logo assetBase={LOGO} tone="white" height={30} />
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', maxWidth: '32ch' }}>
              Healthcare services and medical consultancy — occupational health, facility management and remote-site medical cover.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Badge tone="neutral" style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.78)' }}>ISO 9001</Badge>
              <Badge tone="neutral" style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.78)' }}>24/7 cover</Badge>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--ma-maroon-200)' }}>{c.h}</span>
              {c.items.map((i) => (
                <a key={i} href="#" onClick={(e) => { e.preventDefault(); onNavigate('services'); }}
                  style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', textDecoration: 'none' }}>{i}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-5)', borderTop: '1px solid rgba(255,255,255,.10)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>© 2026 Medical Alliance · التحالف الطبي</span>
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Privacy · Terms · Patient safety policy</span>
        </div>
      </div>
    </footer>
  );
}

/* Reusable page shell so every route shares the same frame. */
function Page({ children }) {
  return <main style={{ background: 'var(--surface-page)' }}>{children}</main>;
}

function Container({ children, style }) {
  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 var(--gutter-inline-lg)', ...style }}>
      {children}
    </div>
  );
}

/* Honest stand-in for brand photography — no invented imagery. */
function PhotoSlot({ label, height = 320, style }) {
  return (
    <div style={{
      height, borderRadius: 'var(--radius-card)', background: 'var(--surface-sunken)',
      border: '1px dashed var(--border-strong)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)',
      ...style,
    }}>
      <Icon name="image" size={22} />
      <span style={{ font: 'var(--type-caption)', textAlign: 'center', maxWidth: '28ch' }}>{label}</span>
    </div>
  );
}

Object.assign(window, { SiteHeader, SiteFooter, Page, Container, PhotoSlot, NAV, LOGO });
