const { Button, Card, Icon, Badge, SectionHeading, StatTile } = window.MedicalAllianceDesignSystem_32f8e4;

const SERVICES = [
  { icon: 'stethoscope', title: 'Medical and health consultations', body: 'Clinical advice for individuals, employers and healthcare operators.' },
  { icon: 'hard-hat', title: 'Occupational health', body: 'Fitness assessments, surveillance programmes and certificate issuance.' },
  { icon: 'graduation-cap', title: 'Training and consultancy', body: 'Courses in medicine, public and private health, and occupational health.' },
  { icon: 'building-2', title: 'Facility equipping and management', body: 'Hospitals and medical centres — set-up, staffing and operating standards.' },
  { icon: 'users', title: 'Forums and conferences', body: 'Organisation, delivery and supervision of medical professional events.' },
  { icon: 'package', title: 'Medical equipment and supplies', body: 'Procurement and supply of equipment, consumables and medication.' },
];

function HomeScreen({ onNavigate }) {
  return (
    <Page>
      {/* Hero — ink ground, no invented photography */}
      <section className="ma-ink" style={{ background: 'var(--ma-maroon-950)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .09, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <img src={LOGO + '/ma-mark-white.png'} alt="" style={{ height: '150%', width: 'auto', transform: 'translateX(14%)' }} />
        </div>
        <Container style={{ position: 'relative', paddingTop: 'var(--space-24)', paddingBottom: 'var(--space-24)' }}>
          <div style={{ maxWidth: '22ch', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--ma-maroon-200)' }}>Healthcare services · Medical consultancy</span>
            <h1 style={{ font: 'var(--type-display-1)', letterSpacing: 'var(--tracking-tightest)', margin: 0, textWrap: 'balance' }}>Medical cover, wherever the work is.</h1>
            <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', maxWidth: '46ch' }}>
              Occupational health, facility management and remote-site clinical services for hospitals, corporate employers and industrial operations.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button size="lg" onClick={() => onNavigate('contact')} iconEnd={<Icon name="arrow-right" size={18} />}>Request a site assessment</Button>
              <Button size="lg" variant="secondary" onClick={() => onNavigate('services')}
                style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.32)' }}>Our services</Button>
            </div>
          </div>
        </Container>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.10)' }}>
          <Container style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-6)', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
            {[['7', 'Site clinics operated'], ['1,284', 'Workers cleared this year'], ['24/7', 'Emergency response cover'], ['12', 'Years in occupational health']].map(([v, l]) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: 'var(--type-heading-2)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{l}</span>
              </div>
            ))}
          </Container>
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: 'var(--section-y) 0' }}>
        <Container>
          <SectionHeading eyebrow="What we do" title="Six service lines, one standard of care"
            lead="Every engagement is run against the same clinical governance, documentation and audit expectations." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 'var(--space-5)', marginTop: 'var(--space-10)' }}>
            {SERVICES.map((s) => (
              <Card key={s.title} interactive onClick={() => onNavigate('services')}>
                <span style={{ color: 'var(--text-brand)', marginBottom: 'var(--space-2)' }}><Icon name={s.icon} size={26} /></span>
                <h3 style={{ font: 'var(--type-heading-4)' }}>{s.title}</h3>
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>{s.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Remote site band */}
      <section style={{ background: 'var(--surface-page-alt)', borderBlock: '1px solid var(--border-subtle)', padding: 'var(--section-y) 0' }}>
        <Container style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <SectionHeading eyebrow="Remote-site medical" title="A clinic, a doctor and a plan — on your site"
              lead="For operations in remote locations, industrial sites and other challenging work environments." />
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {['First aid, emergency care and stabilisation of injured or ill workers',
                'Site clinic operation, with medication, supplies and equipment maintained',
                'Fitness-for-work assessment and management of routine illness and minor injury',
                'Occupational health input into site health and safety'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 'var(--space-3)', font: 'var(--type-body)', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-brand)', paddingTop: 3 }}><Icon name="check" size={17} /></span>{t}
                </li>
              ))}
            </ul>
            <div><Button variant="secondary" onClick={() => onNavigate('remote')} iconEnd={<Icon name="arrow-right" size={16} />}>How site cover works</Button></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PhotoSlot height={260} label="Photography: site clinic interior — cool neutral light, no staged smiles" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <StatTile label="Median response" value="6" unit="min" icon={<Icon name="siren" size={18} />} />
              <StatTile tone="brand" label="Clinic uptime" value="99.4" unit="%" />
            </div>
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section style={{ padding: 'var(--section-y) 0' }}>
        <Container>
          <div style={{
            background: 'var(--surface-brand)', borderRadius: 'var(--radius-surface)', color: '#fff',
            padding: 'var(--space-14) var(--space-12)', display: 'flex', alignItems: 'center', gap: 'var(--space-10)', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <h2 style={{ font: 'var(--type-heading-1)', letterSpacing: 'var(--tracking-tight)', color: '#fff', textWrap: 'balance' }}>
                Tell us about your site and we will scope the cover.
              </h2>
              <p style={{ font: 'var(--type-body-lg)', color: 'rgba(255,255,255,.82)', marginTop: 'var(--space-3)', maxWidth: '52ch' }}>
                Assessments are returned within five working days, with a staffing model, equipment list and escalation plan.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button size="lg" variant="ink" onClick={() => onNavigate('contact')}>Request a consultation</Button>
              <Button size="lg" variant="secondary" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}
                iconStart={<Icon name="phone-call" size={17} />}>+966 11 000 0000</Button>
            </div>
          </div>
        </Container>
      </section>
    </Page>
  );
}
Object.assign(window, { HomeScreen, SERVICES });
