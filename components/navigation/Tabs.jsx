import React from 'react';

/** Underlined tab bar. */
export function Tabs({ items = [], value, onChange, size = 'md', style, ...rest }) {
  return (
    <div
      role="tablist"
      style={{ display: 'flex', gap: 'var(--space-6)', borderBottom: '1px solid var(--border-default)', ...style }}
      {...rest}
    >
      {items.map((it) => {
        const v = typeof it === 'string' ? it : it.value;
        const l = typeof it === 'string' ? it : it.label;
        const count = typeof it === 'string' ? null : it.count;
        const on = value === v;
        return (
          <button
            key={v} type="button" role="tab" aria-selected={on}
            onClick={() => onChange && onChange(v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: size === 'sm' ? 'var(--space-2) 0' : 'var(--space-3) 0',
              border: 0, background: 'transparent', cursor: 'pointer',
              font: `var(--weight-semibold) ${size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)'}/1.3 var(--font-body)`,
              color: on ? 'var(--text-brand)' : 'var(--text-secondary)',
              boxShadow: on ? 'inset 0 -2px 0 0 var(--surface-brand)' : 'none',
              transition: 'var(--transition-control)', whiteSpace: 'nowrap',
            }}
          >
            {l}
            {count != null && (
              <span style={{
                font: 'var(--weight-semibold) var(--text-3xs)/1 var(--font-body)',
                background: on ? 'var(--surface-brand-soft)' : 'var(--surface-sunken)',
                color: on ? 'var(--ma-maroon-700)' : 'var(--text-muted)',
                padding: '3px 6px', borderRadius: 'var(--radius-chip)',
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
