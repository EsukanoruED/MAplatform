const { Card, Badge, Button, IconButton, Icon, Tabs, DataTable, Radio, TextField, Modal, Toast, Tag, Alert } = window.MedicalAllianceDesignSystem_32f8e4;

function WorkerScreen({ worker, onBack }) {
  const w = worker || WORKERS[0];
  const [tab, setTab] = React.useState('overview');
  const [outcome, setOutcome] = React.useState('restricted');
  const [issuing, setIssuing] = React.useState(false);
  const [issued, setIssued] = React.useState(false);

  return (
    <React.Fragment>
      <PortalTopBar
        title={w.name}
        crumbs={[{ label: 'Workers', href: '#' }, { label: w.site, href: '#' }, w.id]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <IconButton label="Print record" variant="secondary" icon={<Icon name="printer" size={17} />} />
            <Button size="sm" onClick={() => setIssuing(true)}>Issue certificate</Button>
          </div>
        } />
      <PortalBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-5)', alignItems: 'start', maxWidth: 1180 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {w.tone === 'danger' && (
              <Alert tone="danger" title="Not fit for duty" icon={<Icon name="triangle-alert" size={18} />}>
                Site supervisor notified 11 Sep 2026. Review scheduled in 14 days.
              </Alert>
            )}
            <Card padding="0">
              <div style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
                <Tabs value={tab} onChange={setTab} items={[
                  { value: 'overview', label: 'Overview' },
                  { value: 'exams', label: 'Examinations', count: 12 },
                  { value: 'certs', label: 'Certificates', count: 4 },
                  { value: 'notes', label: 'Clinical notes' },
                ]} />
              </div>
              <div style={{ padding: 'var(--space-5)' }}>
                {tab === 'exams' || tab === 'certs' ? (
                  <DataTable dense style={{ border: 0, borderRadius: 0 }}
                    columns={[
                      { key: 'ref', header: tab === 'certs' ? 'Certificate' : 'Reference', mono: true, width: '140px' },
                      { key: 'type', header: 'Type' },
                      { key: 'date', header: 'Date', numeric: true },
                      { key: 'status', header: 'Result', render: (r) => <Badge tone={r.tone} dot>{r.status}</Badge> },
                    ]}
                    rows={[
                      { ref: 'EX-2026-1184', type: 'Periodic examination', date: '12 Sep 2026', status: 'Fit with restrictions', tone: 'warning' },
                      { ref: 'EX-2025-0912', type: 'Periodic examination', date: '08 Sep 2025', status: 'Fit for duty', tone: 'success' },
                      { ref: 'EX-2025-0410', type: 'Return to work', date: '22 Apr 2025', status: 'Fit for duty', tone: 'success' },
                      { ref: 'EX-2024-0733', type: 'Pre-placement', date: '03 Jul 2024', status: 'Fit for duty', tone: 'success' },
                    ]} />
                ) : tab === 'notes' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <TextField label="Add a clinical note" multiline rows={3} placeholder="Findings, restrictions, review interval" />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button size="sm" variant="secondary">Save note</Button></div>
                    {[['12 Sep 2026', 'Dr N. Al-Qahtani', 'Hearing threshold shift at 4 kHz, left. Restriction: no continuous exposure above 85 dB(A) without double protection. Review in 12 weeks.'],
                      ['08 Sep 2025', 'Dr N. Al-Qahtani', 'All parameters within range. No restrictions.']].map(([d, a, t]) => (
                      <div key={d} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{d}</span><span>{a}</span>
                        </div>
                        <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>{t}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5) var(--space-8)' }}>
                    {[['Worker ID', w.id, true], ['Site', w.site], ['Role', 'Process operator'], ['Employer', 'Gulf Industrial Services'],
                      ['Date of birth', '14 Feb 1991'], ['Last examination', '12 Sep 2026'], ['Next due', '12 Sep 2027'], ['Certificate expires', w.expires]]
                      .map(([k, v, mono]) => (
                      <div key={k}>
                        <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
                        <div style={{ font: mono ? 'var(--type-mono)' : 'var(--type-body)', marginTop: 3 }}>{v}</div>
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Surveillance programme</div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {['Audiometry', 'Spirometry', 'Vision', 'Heat stress', 'Biological monitoring'].map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card tone="sunken" eyebrow="Current status" title={null} padding="var(--space-5)">
              <Badge tone={w.tone} dot>{w.status}</Badge>
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                Recorded 12 Sep 2026 · valid to {w.expires}
              </div>
            </Card>
            <Card eyebrow="This visit" title="Record outcome" padding="var(--space-5)">
              <Radio name="outcome" value={outcome} onChange={setOutcome} style={{ marginTop: 'var(--space-2)' }}
                options={[
                  { value: 'fit', label: 'Fit for duty' },
                  { value: 'restricted', label: 'Fit with restrictions', description: 'Record the restriction and review date' },
                  { value: 'unfit', label: 'Not fit' },
                ]} />
              <Button fullWidth style={{ marginTop: 'var(--space-4)' }} onClick={() => setIssuing(true)}>Save and issue</Button>
            </Card>
            <Card eyebrow="Attachments" title={null} padding="var(--space-5)">
              {[['Audiometry report', 'PDF · 240 KB'], ['Spirometry trace', 'PDF · 118 KB'], ['Consent form', 'PDF · 84 KB']].map(([n, m], i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2-5) 0', borderTop: i ? '1px solid var(--border-subtle)' : 0 }}>
                  <span style={{ color: 'var(--text-brand)' }}><Icon name="file-text" size={16} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: 'var(--type-body-sm)' }}>{n}</div>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{m}</div>
                  </div>
                  <Icon name="download" size={15} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </Card>
            <Button variant="ghost" onClick={onBack} iconStart={<Icon name="arrow-left" size={16} />}>Back to dashboard</Button>
          </div>
        </div>
      </PortalBody>

      <Modal open={issuing} onClose={() => setIssuing(false)} width={460}
        title="Issue fitness certificate"
        description="This record will be locked once the certificate is issued."
        footer={<React.Fragment>
          <Button variant="secondary" onClick={() => setIssuing(false)}>Cancel</Button>
          <Button onClick={() => { setIssuing(false); setIssued(true); }}>Issue certificate</Button>
        </React.Fragment>}>
        {w.name} · {w.id} · Periodic examination · 12 Sep 2026
      </Modal>

      {issued && (
        <div style={{ position: 'fixed', insetInlineEnd: 'var(--space-6)', bottom: 'var(--space-6)', zIndex: 70 }}>
          <Toast tone="success" title="Certificate issued" icon={<Icon name="check" size={16} />} onDismiss={() => setIssued(false)}>
            {w.id} · valid to 14 Mar 2027
          </Toast>
        </div>
      )}
    </React.Fragment>
  );
}
Object.assign(window, { WorkerScreen });
