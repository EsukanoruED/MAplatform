const { Card, Icon, Button, TextField, SelectField, Checkbox, SectionHeading, Breadcrumb, Toast, Badge } = window.MedicalAllianceDesignSystem_32f8e4;

function ContactScreen() {
  const [sent, setSent] = React.useState(false);
  return (
    <Page>
      <Container style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--section-y)' }}>
        <Breadcrumb items={[{ label: 'Home', href: '#' }, 'Contact']} style={{ marginBottom: 'var(--space-5)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 'var(--space-16)', alignItems: 'start' }}>
          <div>
            <SectionHeading eyebrow="Contact" title="Request a consultation or site assessment"
              lead="Tell us the operation, the headcount and the location. We respond within one working day." />
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginTop: 'var(--space-8)' }}>
              <TextField label="Full name" required placeholder="Name" />
              <TextField label="Organisation" required placeholder="Company or facility" />
              <TextField label="Work email" required placeholder="name@company.com" iconStart={<Icon name="mail" size={16} />} />
              <TextField label="Phone" placeholder="+966" iconStart={<Icon name="phone" size={16} />} />
              <SelectField label="What do you need?" placeholder="Select a service"
                options={['Remote-site medical cover', 'Occupational health programme', 'Facility equipping or management', 'Training and consultancy', 'Medical supplies', 'Something else']} />
              <SelectField label="Approximate headcount" placeholder="Select a range" options={['Under 50', '50–250', '250–1,000', 'Over 1,000']} />
              <div style={{ gridColumn: '1 / -1' }}>
                <TextField label="Site and scope" multiline rows={4}
                  placeholder="Location, shift pattern, hazard profile, distance to the nearest hospital" />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Checkbox label="This site operates 24 hours" description="We will scope night cover and on-call escalation" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <Button type="submit" size="lg">Send request</Button>
                  <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>We reply within one working day.</span>
                </div>
              </div>
            </form>
            {sent && (
              <div style={{ position: 'fixed', insetInlineEnd: 'var(--space-6)', bottom: 'var(--space-6)', zIndex: 50 }}>
                <Toast tone="success" title="Request received" icon={<Icon name="check" size={16} />} onDismiss={() => setSent(false)}>
                  A clinical lead will contact you within one working day.
                </Toast>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card tone="ink">
              <h3 style={{ font: 'var(--type-heading-4)' }}>Emergency and out of hours</h3>
              <p style={{ font: 'var(--type-body-sm)', color: 'rgba(255,255,255,.72)' }}>
                Existing clients with a site clinic use the 24-hour clinical line.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)', font: 'var(--type-heading-3)' }}>
                <Icon name="siren" size={20} /> +966 11 000 0911
              </div>
            </Card>
            {[['map-pin', 'Head office', 'Riyadh, Saudi Arabia'], ['mail', 'General enquiries', 'info@medicalalliance.example'], ['clock', 'Office hours', 'Sun–Thu, 08:00–17:00 AST']].map(([ic, t, v]) => (
              <Card key={t} padding="var(--space-5)">
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--text-brand)', paddingTop: 2 }}><Icon name={ic} size={18} /></span>
                  <div>
                    <div style={{ font: 'var(--type-label)' }}>{t}</div>
                    <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{v}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Badge tone="brand">ISO 9001</Badge><Badge tone="neutral">MoH licensed</Badge><Badge tone="neutral">CME accredited</Badge>
            </div>
          </div>
        </div>
      </Container>
    </Page>
  );
}
Object.assign(window, { ContactScreen });
