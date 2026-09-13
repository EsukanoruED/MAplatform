import type { ReactNode, CSSProperties } from 'react';
import { Icon } from '../components';

/**
 * Shared website building blocks, migrated verbatim from the prototype's
 * SiteChrome.jsx. The prototype put these on `window`; they are now real exports.
 */

export function Container({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 var(--gutter-inline-lg)', ...style }}>
      {children}
    </div>
  );
}

/** Honest stand-in for brand photography — no invented imagery. */
export function PhotoSlot({ label, height = 320, style }: { label: string; height?: number; style?: CSSProperties }) {
  return (
    <div style={{
      height, borderRadius: 'var(--radius-card)', background: 'var(--surface-sunken)',
      border: '1px dashed var(--border-strong)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)',
      ...style,
    }}>
      <Icon name="image" size={22} />
      <span style={{ font: 'var(--type-caption)', textAlign: 'center', maxWidth: '28ch' }}>{label}</span>
    </div>
  );
}
