import React from 'react';

const tones = { brand: 'var(--surface-brand)', success: 'var(--ma-green-600)', warning: 'var(--ma-amber-600)', danger: 'var(--ma-red-600)', info: 'var(--ma-teal-600)' };

/** Linear progress / completion meter. */
export function ProgressMeter({ value = 0, max = 100, tone = 'brand', label, valueLabel, size = 'md', style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', ...style }} {...rest}>
      {(label || valueLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          {label && <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>{label}</span>}
          {valueLabel && <span style={{ font: 'var(--weight-semibold) var(--text-sm)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{valueLabel}</span>}
        </div>
      )}
      <div
        role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}
        style={{ height: h, borderRadius: 'var(--radius-pill)', background: 'var(--ma-neutral-100)', overflow: 'hidden' }}
      >
        <div style={{ width: pct + '%', height: '100%', background: tones[tone] || tones.brand, borderRadius: 'inherit', transition: 'width var(--duration-slow) var(--ease-standard)' }} />
      </div>
    </div>
  );
}
