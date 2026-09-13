const { Card, Icon, Badge, SectionHeading, Button, DataTable, Breadcrumb, Alert, ProgressMeter } = window.MedicalAllianceDesignSystem_32f8e4;

const STEPS = [
  { icon: 'clipboard-check', t: 'Site assessment', b: 'Hazard profile, headcount, shift pattern, distance to definitive care.' },
  { icon: 'stethoscope', t: 'Staffing model', b: 'Doctor, paramedic or nurse cover matched to risk and roster.' },
  { icon: 'package', t: 'Clinic and stock', b: 'Equipment list, medication formulary and resupply schedule.' },
  { icon: 'siren', t: 'Escalation plan', b: 'Stabilisation, transfer routes and receiving facility agreements.' },
];

function RemoteSiteScreen({ onNavigate }) {
  return (
    <Page>
      <section className="ma-ink" style={{ background: 'var(--ma-maroon-900)', color: 'var(--text-primary)' }}>
        <Container style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
          <Breadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Services', href: '#' }, 'Remote sites']} style={{ marginBottom: 'var(--space-6)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 'var(--space-12)', alignItems: 'end' }}>
            <div>
              <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--ma-maroon-200)' }}>Remote-site medical services</span>
              <h1 style={{ font: 'var(--type-display-2)', letterSpacing: 'var(--tracking-tight)', margin: 'var(--space-4) 0 0', textWrap: 'balance' }}>
                When the nearest hospital is two hours away
              </h1>
              <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', marginTop: 'var(--space-4)', maxWidth: '52ch' }}>
                We place clinicians, clinics and escalation plans on industrial and remote sites, then run them to a documented standard.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[['6 min', 'Median on-site response'], ['99.4%', 'Clinic uptime'], ['0', 'Reportable escalation failures'], ['24/7', 'Doctor availability']].map(([v, l]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 'var(--radius-card)', padding: 'var(--space-4)' }}>
                  <div style={{ font: 'var(--type-heading-2)', fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container style={{ paddingTop: 'var(--section-y-tight)', paddingBottom: 'var(--section-y-tight)' }}>
        <SectionHeading eyebrow="How it works" title="Four steps from assessment to standing cover" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 'var(--space-5)', marginTop: 'var(--space-8)' }}>
          {STEPS.map((s, i) => (
            <Card key={s.t}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-brand)' }}><Icon name={s.icon} size={24} /></span>
                <span style={{ font: 'var(--weight-bold) var(--text-2xs)/1 var(--font-mono)', color: 'var(--ma-neutral-300)' }}>0{i + 1}</span>
              </div>
              <h3 style={{ font: 'var(--type-heading-4)', marginTop: 'var(--space-2)' }}>{s.t}</h3>
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>{s.b}</p>
            </Card>
          ))}
        </div>
      </Container>

      <section style={{ background: 'var(--surface-page-alt)', borderBlock: '1px solid var(--border-subtle)', padding: 'var(--section-y-tight) 0' }}>
        <Container style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 'var(--space-12)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <SectionHeading eyebrow="Current cover" title="Live site register" level={2} />
            <DataTable
              columns={[
                { key: 'site', header: 'Site' },
                { key: 'cover', header: 'Cover' },
                { key: 'head', header: 'Headcount', align: 'end', numeric: true },
                { key: 'status', header: 'Status', render: (r) => <Badge tone={r.tone} dot>{r.status}</Badge> },
              ]}
              rows={[
                { site: 'Jazan Site 4', cover: 'Doctor + paramedic', head: '420', status: 'Operating', tone: 'success' },
                { site: 'Yanbu Terminal', cover: 'Paramedic, on call', head: '186', status: 'Operating', tone: 'success' },
                { site: 'Riyadh Depot', cover: 'Nurse, day shift', head: '92', status: 'Restocking', tone: 'warning' },
                { site: 'Tabuk Camp 2', cover: 'Doctor, rotational', head: '310', status: 'Mobilising', tone: 'info' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Alert tone="brand" title="Mobilisation in 21 days" icon={<Icon name="calendar-check" size={18} />}
              actions={<Button size="sm" onClick={() => onNavigate('contact')}>Start an assessment</Button>}>
              Typical time from signed scope to a staffed, stocked clinic on site.
            </Alert>
            <Card>
              <h3 style={{ font: 'var(--type-heading-4)' }}>Readiness snapshot</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                <ProgressMeter label="Formulary complete" valueLabel="96%" value={96} tone="success" />
                <ProgressMeter label="Equipment calibration" valueLabel="88%" value={88} />
                <ProgressMeter label="Stock — Site 4" valueLabel="38%" value={38} tone="warning" />
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </Page>
  );
}
Object.assign(window, { RemoteSiteScreen });
