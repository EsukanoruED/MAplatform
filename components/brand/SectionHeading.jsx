import React from 'react';

/** Eyebrow + title + optional lead, with the 3px brand rule. */
export function SectionHeading({
  eyebrow, title, lead, align = 'start', rule = true, level = 2, className, style, ...rest
}) {
  const H = 'h' + level;
  return (
    <header
      className={className}
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align === 'center' ? 'center' : 'start',
        maxWidth: align === 'center' ? '62ch' : '54ch',
        marginInline: align === 'center' ? 'auto' : undefined,
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2-5)' }}>
          {rule && <span style={{ width: 28, height: 'var(--border-width-accent)', background: 'var(--surface-brand)' }} />}
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--text-brand)' }}>{eyebrow}</span>
        </span>
      )}
      {React.createElement(H, { style: { font: 'var(--type-heading-1)', letterSpacing: 'var(--tracking-tight)', color: 'var(--text-primary)', margin: 0, textWrap: 'balance' } }, title)}
      {lead && <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', textWrap: 'pretty' }}>{lead}</p>}
    </header>
  );
}
