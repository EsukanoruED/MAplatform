const { Logo, Icon, Badge, IconButton, Breadcrumb } = window.MedicalAllianceDesignSystem_32f8e4;
const PLOGO = '../../assets/logo';

const SECTIONS = [
  { h: 'Operations', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'workers', label: 'Workers', icon: 'users', count: 1284 },
    { id: 'certificates', label: 'Certificates', icon: 'file-badge', count: 76 },
  ]},
  { h: 'Sites', items: [
    { id: 'clinics', label: 'Site clinics', icon: 'building-2' },
    { id: 'stock', label: 'Stock and equipment', icon: 'package' },
  ]},
  { h: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]},
];

function PortalSidebar({ route, onNavigate }) {
  return (
    <aside style={{
      width: 'var(--sidebar-w)', flex: '0 0 auto', background: 'var(--ma-maroon-950)',
      borderInlineEnd: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column',
    }} className="ma-ink">
      <div style={{ height: 'var(--topbar-h)', display: 'flex', alignItems: 'center', padding: '0 var(--space-5)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <Logo assetBase={PLOGO} tone="white" height={26} />
      </div>
      <nav style={{ padding: 'var(--space-5) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', flex: 1, overflow: 'auto' }}>
        {SECTIONS.map((s) => (
          <div key={s.h} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'rgba(255,255,255,.42)', padding: '0 var(--space-3) var(--space-2)' }}>{s.h}</span>
            {s.items.map((it) => {
              const on = route === it.id;
              return (
                <button key={it.id} type="button" onClick={() => onNavigate(it.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%',
                    padding: 'var(--space-2-5) var(--space-3)', border: 0, cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)', textAlign: 'start',
                    background: on ? 'var(--ma-maroon-600)' : 'transparent',
                    color: on ? '#fff' : 'rgba(255,255,255,.72)',
                    font: `${on ? 'var(--weight-semibold)' : 'var(--weight-regular)'} var(--text-sm)/1 var(--font-body)`,
                    transition: 'var(--transition-control)',
                  }}>
                  <Icon name={it.icon} size={17} />
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.count != null && (
                    <span style={{ font: 'var(--weight-semibold) var(--text-3xs)/1 var(--font-mono)', color: on ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.42)' }}>
                      {it.count.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ma-maroon-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: 'var(--weight-bold) var(--text-2xs)/1 var(--font-body)' }}>DN</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--weight-semibold) var(--text-xs)/1.3 var(--font-body)', color: '#fff' }}>Dr N. Al-Qahtani</div>
          <div style={{ font: 'var(--type-caption)', color: 'rgba(255,255,255,.5)' }}>Clinical lead</div>
        </div>
        <Icon name="chevron-up" size={15} style={{ color: 'rgba(255,255,255,.5)' }} />
      </div>
    </aside>
  );
}

function PortalTopBar({ title, crumbs, actions }) {
  return (
    <header style={{
      height: 'var(--topbar-h)', flex: '0 0 auto', display: 'flex', alignItems: 'center',
      gap: 'var(--space-4)', padding: '0 var(--space-8)', background: 'var(--surface-page)',
      borderBottom: '1px solid var(--border-subtle)',
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

function PortalShell({ route, onNavigate, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface-page-alt)' }}>
      <PortalSidebar route={route} onNavigate={onNavigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>{children}</div>
    </div>
  );
}

function PortalBody({ children, style }) {
  return <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-8)', ...style }}>{children}</div>;
}

Object.assign(window, { PortalSidebar, PortalTopBar, PortalShell, PortalBody, SECTIONS, PLOGO });
