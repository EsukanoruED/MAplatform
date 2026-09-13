import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Breadcrumb, Button, Card, Icon, SectionHeading, Tabs } from '../../components';
import { Container, PhotoSlot } from '../../layouts/site-chrome';

/** Migrated from ui_kits/website/ServicesScreen.jsx — copy and layout unchanged. */

const DETAIL = {
  consultations: { icon: 'stethoscope', title: 'Medical and health consultations', lead: 'Clinical consultation for individuals, employers and healthcare operators.',
    points: ['Individual and employer-referred consultations', 'Second opinion and case review', 'Health programme design for workforces'] },
  occupational: { icon: 'hard-hat', title: 'Occupational health', lead: 'Assessment, surveillance and certification against the applicable schedule.',
    points: ['Pre-placement, periodic, return-to-work and exit examinations', 'Audiometry, spirometry, vision and biological monitoring', 'Medical fitness certificates with audit-ready records'] },
  training: { icon: 'graduation-cap', title: 'Training and consultancy', lead: 'Courses and advisory in medicine, public and private health, and occupational health.',
    points: ['Accredited course delivery on client premises or ours', 'Curriculum and competency framework development', 'Clinical governance and quality advisory'] },
  facilities: { icon: 'building-2', title: 'Equipping and management', lead: 'Hospitals and medical centres of all types — set up and kept running.',
    points: ['Facility planning, equipping and commissioning', 'Operational management and staffing models', 'Standards, resourcing and readiness reviews'] },
  events: { icon: 'users', title: 'Forums and conferences', lead: 'Organisation, delivery and supervision of medical professional events.',
    points: ['Scientific programme and speaker management', 'On-site medical and logistics supervision', 'CME accreditation support'] },
  supply: { icon: 'package', title: 'Equipment and supplies', lead: 'Procurement and supply of the resources that keep services running.',
    points: ['Equipment sourcing and lifecycle support', 'Consumables and medication supply', 'Stock control for remote and site clinics'] },
} as const;

type ServiceKey = keyof typeof DETAIL;

export function ServicesScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<ServiceKey>('occupational');
  const d = DETAIL[tab];
  return (
    <>
      <section style={{ background: 'var(--surface-page-alt)', borderBottom: '1px solid var(--border-subtle)', padding: 'var(--space-10) 0 var(--space-12)' }}>
        <Container>
          <Breadcrumb items={[{ label: 'Home', href: '/' }, 'Services']} style={{ marginBottom: 'var(--space-5)' }} />
          <SectionHeading eyebrow="Services" title="What Medical Alliance delivers"
            lead="Six service lines, each with defined scope, documentation and escalation. Select a line to see what is included." />
        </Container>
      </section>

      <Container style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--section-y)' }}>
        <div style={{ overflowX: 'auto' }}>
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as ServiceKey)}
            items={(Object.keys(DETAIL) as ServiceKey[]).map((k) => ({ value: k, label: DETAIL[k].title.split(' and ')[0] }))}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-12)', marginTop: 'var(--space-10)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <span style={{ color: 'var(--text-brand)' }}><Icon name={d.icon} size={34} /></span>
            <h2 style={{ font: 'var(--type-heading-1)', letterSpacing: 'var(--tracking-tight)' }}>{d.title}</h2>
            <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', maxWidth: 'var(--prose-max)' }}>{d.lead}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-5)' }}>
              {d.points.map((p) => (
                <li key={p} style={{ display: 'flex', gap: 'var(--space-3)', font: 'var(--type-body)', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-brand)', paddingTop: 3 }}><Icon name="check" size={17} /></span>{p}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/contact')}>Discuss this service</Button>
              <Button variant="ghost" iconStart={<Icon name="download" size={16} />}>Capability statement</Button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PhotoSlot height={220} label="Photography: clinical detail — equipment, hands, documentation" />
            <Card tone="sunken" eyebrow="Governance" title="How every engagement is run">
              <ul style={{ margin: 0, paddingInlineStart: 18, font: 'var(--type-body-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Named clinical lead and documented scope</li>
                <li>Records retained to the applicable schedule</li>
                <li>Monthly reporting and annual audit</li>
              </ul>
            </Card>
            <Card tone="brand" eyebrow="Coverage" title="Where we operate">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                {['Riyadh', 'Jazan', 'Yanbu', 'Dammam', 'Remote sites'].map((c) => <Badge key={c} tone="brand">{c}</Badge>)}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
