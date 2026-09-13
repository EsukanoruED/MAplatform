const { StatTile, Card, DataTable, Badge, Button, Icon, Alert, ProgressMeter, Tabs } = window.MedicalAllianceDesignSystem_32f8e4;

const WORKERS = [
  { id: 'MA-40118', name: 'A. Al-Harbi', site: 'Jazan Site 4', exam: 'Periodic', status: 'Fit for duty', tone: 'success', expires: '14 Mar 2027' },
  { id: 'MA-40207', name: 'R. Menon', site: 'Yanbu Terminal', exam: 'Return to work', status: 'Fit with restrictions', tone: 'warning', expires: '02 Dec 2026' },
  { id: 'MA-39884', name: 'S. Okonkwo', site: 'Jazan Site 4', exam: 'Periodic', status: 'Not fit', tone: 'danger', expires: '—' },
  { id: 'MA-40311', name: 'K. Ahmed', site: 'Riyadh Depot', exam: 'Pre-placement', status: 'Fit for duty', tone: 'success', expires: '28 Jul 2027' },
  { id: 'MA-40402', name: 'M. Haddad', site: 'Tabuk Camp 2', exam: 'Periodic', status: 'Pending review', tone: 'neutral', expires: '—' },
];

function DashboardScreen({ onOpenWorker }) {
  const [tab, setTab] = React.useState('due');
  return (
    <React.Fragment>
      <PortalTopBar title="Dashboard" actions={<Button size="sm" iconStart={<Icon name="plus" size={15} />}>New examination</Button>} />
      <PortalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 1180 }}>
          <Alert tone="warning" title="4 certificates expire in the next 30 days"
            icon={<Icon name="calendar-clock" size={18} />}
            actions={<Button size="sm" variant="secondary">Review schedule</Button>}>
            Jazan Site 4 and Yanbu Terminal have workers due for periodic examination.
          </Alert>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 'var(--space-4)' }}>
            <StatTile label="Workers cleared" value="1,284" delta="42 this week" deltaDirection="up" icon={<Icon name="shield-check" size={18} />} />
            <StatTile label="Due in 30 days" value="76" unit="workers" tone="brand" icon={<Icon name="calendar-clock" size={18} />} />
            <StatTile label="Restricted" value="31" delta="3 vs last month" deltaDirection="down" icon={<Icon name="triangle-alert" size={18} />} />
            <StatTile tone="ink" label="Active site clinics" value="7" footnote="3 remote · 4 industrial" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
            <Card padding="0">
              <div style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
                <Tabs value={tab} onChange={setTab} size="sm" items={[
                  { value: 'due', label: 'Due for review', count: 5 },
                  { value: 'recent', label: 'Recently issued', count: 18 },
                  { value: 'flagged', label: 'Flagged', count: 2 },
                ]} />
              </div>
              <div style={{ padding: 'var(--space-5)' }}>
                <DataTable dense onRowClick={(r) => onOpenWorker(r)}
                  style={{ border: 0, borderRadius: 0 }}
                  columns={[
                    { key: 'id', header: 'Worker ID', mono: true, width: '118px' },
                    { key: 'name', header: 'Name' },
                    { key: 'site', header: 'Site' },
                    { key: 'status', header: 'Fitness', render: (r) => <Badge tone={r.tone} dot>{r.status}</Badge> },
                    { key: 'expires', header: 'Expires', align: 'end', numeric: true },
                  ]}
                  rows={WORKERS} />
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Card eyebrow="Programme" title="Screening coverage">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <ProgressMeter label="Periodic — all sites" valueLabel="164 / 200" value={164} max={200} />
                  <ProgressMeter label="Audiometry" valueLabel="91%" value={91} tone="success" />
                  <ProgressMeter label="Spirometry" valueLabel="64%" value={64} tone="info" />
                  <ProgressMeter label="Stock — Site 4" valueLabel="38%" value={38} tone="warning" />
                </div>
              </Card>
              <Card eyebrow="Today" title="Clinic schedule" footer="Jazan Site 4 · Dr N. Al-Qahtani">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[['08:30', 'Pre-placement × 4', 'shield-check'], ['10:00', 'Audiometry block', 'ear'], ['13:00', 'Return-to-work review', 'clipboard-check'], ['15:30', 'Stock count', 'package']].map(([t, l, ic], i) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2-5) 0', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
                      <span style={{ font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-mono)', color: 'var(--text-muted)', width: 44 }}>{t}</span>
                      <span style={{ color: 'var(--text-brand)' }}><Icon name={ic} size={16} /></span>
                      <span style={{ font: 'var(--type-body-sm)' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PortalBody>
    </React.Fragment>
  );
}
Object.assign(window, { DashboardScreen, WORKERS });
