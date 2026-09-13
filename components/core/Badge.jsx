import React from 'react';

const tones = {
  neutral: { background: 'var(--surface-sunken)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
  brand:   { background: 'var(--surface-brand-soft)', color: 'var(--ma-maroon-700)', border: '1px solid var(--ma-maroon-100)' },
  success: { background: 'var(--surface-success-soft)', color: 'var(--text-success)', border: '1px solid var(--ma-green-100)' },
  warning: { background: 'var(--surface-warning-soft)', color: 'var(--text-warning)', border: '1px solid var(--ma-amber-100)' },
  danger:  { background: 'var(--surface-danger-soft)', color: 'var(--text-danger)', border: '1px solid var(--ma-red-100)' },
  info:    { background: 'var(--surface-info-soft)', color: 'var(--text-info)', border: '1px solid var(--ma-teal-100)' },
  solid:   { background: 'var(--surface-brand)', color: 'var(--text-on-brand)', border: '1px solid var(--surface-brand)' },
};

/** Status chip. */
export function Badge({ tone = 'neutral', dot = false, size = 'md', className, style, children, ...rest }) {
  const t = tones[tone] || tones.neutral;
  const small = size === 'sm';
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1-5)',
        height: small ? 20 : 24, padding: small ? '0 var(--space-2)' : '0 var(--space-2-5)',
        borderRadius: 'var(--radius-chip)',
        font: `var(--weight-semibold) ${small ? 'var(--text-3xs)' : 'var(--text-2xs)'}/1 var(--font-body)`,
        letterSpacing: 'var(--tracking-wide)', whiteSpace: 'nowrap',
        ...t, ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flex: '0 0 auto' }} />}
      {children}
    </span>
  );
}
