import type { ReactNode, CSSProperties } from 'react';

/** One figure, one label, one optional delta. Numbers are tabular so columns of tiles align. */
export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  /** Short suffix — "workers", "%", "days". */
  unit?: ReactNode;
  /** Change readout, e.g. "6 vs last month". */
  delta?: ReactNode;
  /** @default "flat" */
  deltaDirection?: 'up' | 'down' | 'flat';
  icon?: ReactNode;
  /** @default "plain" */
  tone?: 'plain' | 'brand' | 'ink';
  footnote?: ReactNode;
  style?: CSSProperties;
}

const deltaTones: Record<NonNullable<StatTileProps['deltaDirection']>, string> = {
  up: 'var(--text-success)', down: 'var(--text-danger)', flat: 'var(--text-muted)',
};

/** Single-figure metric tile. */
export function StatTile({ label, value, unit, delta, deltaDirection = 'flat', icon, tone = 'plain', footnote, style, ...rest }: StatTileProps) {
  const ink = tone === 'ink';
  const brand = tone === 'brand';
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
        padding: 'var(--space-5)', borderRadius: 'var(--radius-card)',
        background: ink ? 'var(--surface-ink)' : brand ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
        border: `1px solid ${ink ? 'rgba(255,255,255,.10)' : brand ? 'var(--ma-maroon-100)' : 'var(--border-subtle)'}`,
        color: ink ? 'var(--text-inverse)' : 'var(--text-primary)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: ink ? 'rgba(255,255,255,.66)' : 'var(--text-muted)' }}>{label}</span>
        {icon && <span style={{ color: ink ? 'var(--ma-maroon-200)' : 'var(--text-brand)', display: 'flex' }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1-5)' }}>
        <span style={{ font: 'var(--type-display-3)', letterSpacing: 'var(--tracking-tight)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {unit && <span style={{ font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)', color: ink ? 'rgba(255,255,255,.66)' : 'var(--text-muted)' }}>{unit}</span>}
      </div>
      {(delta || footnote) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', font: 'var(--type-caption)' }}>
          {delta && <span style={{ fontWeight: 'var(--weight-semibold)', color: ink ? '#fff' : deltaTones[deltaDirection] }}>
            {deltaDirection === 'up' ? '↑ ' : deltaDirection === 'down' ? '↓ ' : ''}{delta}
          </span>}
          {footnote && <span style={{ color: ink ? 'rgba(255,255,255,.6)' : 'var(--text-muted)' }}>{footnote}</span>}
        </div>
      )}
    </div>
  );
}
