import React from 'react';

/** Exclusive choice group. */
export function Radio({ name, options = [], value, onChange, layout = 'stack', style }) {
  return (
    <div
      role="radiogroup"
      style={{
        display: 'flex', flexDirection: layout === 'row' ? 'row' : 'column',
        gap: layout === 'row' ? 'var(--space-5)' : 'var(--space-2-5)', flexWrap: 'wrap', ...style,
      }}
    >
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        const d = typeof o === 'string' ? null : o.description;
        const on = value === v;
        return (
          <label key={v} style={{ display: 'flex', gap: 'var(--space-2-5)', alignItems: d ? 'flex-start' : 'center', cursor: 'pointer' }}>
            <input
              type="radio" name={name} value={v} checked={on}
              onChange={() => onChange && onChange(v)}
              style={{
                appearance: 'none', width: 18, height: 18, margin: 0, flex: '0 0 auto', marginTop: d ? 2 : 0,
                borderRadius: '50%', cursor: 'pointer', transition: 'var(--transition-control)',
                border: `1px solid ${on ? 'var(--surface-brand)' : 'var(--border-strong)'}`,
                background: 'var(--surface-card)',
                boxShadow: on ? 'inset 0 0 0 4px var(--surface-brand)' : 'none',
              }}
            />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-primary)' }}>{l}</span>
              {d && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{d}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
