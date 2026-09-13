const { Card, Badge, Button, Icon, DataTable, SelectField, TextField, Tag, Switch, ProgressMeter } = window.MedicalAllianceDesignSystem_32f8e4;

function CertificatesScreen() {
  const [alerts, setAlerts] = React.useState(true);
  const rows = [
    { ref: 'CT-2026-0841', id: 'MA-40118', name: 'A. Al-Harbi', site: 'Jazan Site 4', issued: '12 Sep 2026', expires: '14 Mar 2027', status: 'Valid', tone: 'success' },
    { ref: 'CT-2026-0837', id: 'MA-40207', name: 'R. Menon', site: 'Yanbu Terminal', issued: '02 Jun 2026', expires: '02 Dec 2026', status: 'Expiring', tone: 'warning' },
    { ref: 'CT-2026-0790', id: 'MA-40311', name: 'K. Ahmed', site: 'Riyadh Depot', issued: '28 Jan 2026', expires: '28 Jul 2027', status: 'Valid', tone: 'success' },
    { ref: 'CT-2025-0612', id: 'MA-39884', name: 'S. Okonkwo', site: 'Jazan Site 4', issued: '19 Nov 2025', expires: '19 May 2026', status: 'Expired', tone: 'danger' },
    { ref: 'CT-2026-0855', id: 'MA-40402', name: 'M. Haddad', site: 'Tabuk Camp 2', issued: '—', expires: '—', status: 'Pending', tone: 'neutral' },
  ];
  return (
    <React.Fragment>
      <PortalTopBar title="Certificates"
        actions={<Button size="sm" variant="secondary" iconStart={<Icon name="download" size={15} />}>Export register</Button>} />
      <PortalBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-5)', alignItems: 'start', maxWidth: 1180 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card padding="var(--space-5)">
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <TextField label="Search" placeholder="Certificate, worker ID or name" iconStart={<Icon name="search" size={16} />} />
                <SelectField label="Site" placeholder="All sites" options={['Jazan Site 4', 'Yanbu Terminal', 'Riyadh Depot', 'Tabuk Camp 2']} />
                <SelectField label="Status" placeholder="All statuses" options={['Valid', 'Expiring', 'Expired', 'Pending']} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Active filters</span>
                <Tag onRemove={() => {}}>Expiring in 30 days</Tag>
                <Tag onRemove={() => {}}>Jazan Site 4</Tag>
              </div>
            </Card>
            <DataTable
              caption="Certificate register — 76 records, 5 shown"
              onRowClick={() => {}}
              columns={[
                { key: 'ref', header: 'Certificate', mono: true, width: '138px' },
                { key: 'id', header: 'Worker', mono: true, width: '108px' },
                { key: 'name', header: 'Name' },
                { key: 'site', header: 'Site' },
                { key: 'expires', header: 'Expires', align: 'end', numeric: true },
                { key: 'status', header: 'Status', render: (r) => <Badge tone={r.tone} dot>{r.status}</Badge> },
              ]}
              rows={rows} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card eyebrow="Register health" title={null} padding="var(--space-5)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <ProgressMeter label="Valid" valueLabel="58 / 76" value={58} max={76} tone="success" />
                <ProgressMeter label="Expiring in 30 days" valueLabel="12 / 76" value={12} max={76} tone="warning" />
                <ProgressMeter label="Expired" valueLabel="6 / 76" value={6} max={76} tone="danger" />
              </div>
            </Card>
            <Card eyebrow="Notifications" title={null} padding="var(--space-5)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Switch label="Expiry alerts" description="Email site supervisors 30 days before a certificate lapses" checked={alerts} onChange={setAlerts} />
                <Switch label="Weekly register digest" checked={false} onChange={() => {}} />
              </div>
            </Card>
          </div>
        </div>
      </PortalBody>
    </React.Fragment>
  );
}
Object.assign(window, { CertificatesScreen });
