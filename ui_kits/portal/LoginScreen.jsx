const { Logo, Button, TextField, Checkbox, Icon, Card } = window.MedicalAllianceDesignSystem_32f8e4;

function LoginScreen({ onSignIn }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: '0 0 46%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', background: 'var(--surface-page)' }}>
        <form onSubmit={(e) => { e.preventDefault(); onSignIn(); }}
          style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Logo assetBase={PLOGO} height={32} style={{ marginBottom: 'var(--space-4)' }} />
          <div>
            <h1 style={{ font: 'var(--type-heading-2)', letterSpacing: 'var(--tracking-tight)' }}>Occupational health portal</h1>
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Sign in with your Medical Alliance clinical account.
            </p>
          </div>
          <TextField label="Work email" required defaultValue="n.alqahtani@medicalalliance.example" iconStart={<Icon name="mail" size={16} />} />
          <TextField label="Password" type="password" required defaultValue="••••••••••" iconStart={<Icon name="lock" size={16} />} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <Checkbox label="Keep me signed in" />
            <a href="#" onClick={(e) => e.preventDefault()} style={{ font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)' }}>Forgot password?</a>
          </div>
          <Button type="submit" size="lg" fullWidth>Sign in</Button>
          <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            Access is logged. Clinical records are retained to the applicable schedule.
          </p>
        </form>
      </div>
      <div className="ma-ink" style={{ flex: 1, background: 'var(--ma-maroon-950)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 'var(--space-12)' }}>
        <img src={PLOGO + '/ma-mark-white.png'} alt="" style={{ position: 'absolute', top: '-8%', right: '-14%', height: '92%', width: 'auto', opacity: .10 }} />
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
Object.assign(window, { LoginScreen });
