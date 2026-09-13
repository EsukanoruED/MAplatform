import { Link } from 'react-router-dom';
import { Button, Logo, SectionHeading } from '../components';

export function NotFoundScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      justifyContent: 'center', gap: 'var(--space-6)', padding: 'var(--space-12) var(--gutter-inline-lg)',
      maxWidth: 'var(--content-max)', margin: '0 auto', background: 'var(--surface-page)',
    }}>
      <Logo height={30} />
      <SectionHeading
        eyebrow="404"
        title="That page does not exist"
        lead="The link may be out of date. The public site and the occupational health portal are both below."
      />
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Link to="/"><Button>Go to the website</Button></Link>
        <Link to="/portal"><Button variant="secondary">Open the portal</Button></Link>
      </div>
    </div>
  );
}
