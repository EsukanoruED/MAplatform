import React from 'react';

/** Hairline record table. */
export function DataTable({ columns = [], rows = [], caption, dense = false, onRowClick, style, ...rest }) {
  const [hover, setHover] = React.useState(-1);
  const pad = dense ? 'var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-4)';
  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--surface-card)', ...style }} {...rest}>
      <table style={{ width: '100%', borderCollapse: 'collapse', font: 'var(--type-body-sm)' }}>
        {caption && <caption style={{ captionSide: 'top', textAlign: 'start', padding: pad, font: 'var(--type-label)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>{caption}</caption>}
        <thead>
          <tr style={{ background: 'var(--surface-sunken)' }}>
            {columns.map((c) => (
              <th key={c.key} scope="col" style={{
                textAlign: c.align || 'start', padding: pad,
                font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase',
                color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)', whiteSpace: 'nowrap',
                width: c.width,
              }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id || i}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}
              onClick={onRowClick ? () => onRowClick(r, i) : undefined}
              style={{
                background: hover === i && onRowClick ? 'var(--surface-card-hover)' : 'transparent',
                cursor: onRowClick ? 'pointer' : undefined,
                transition: 'background-color var(--duration-fast) var(--ease-standard)',
              }}
            >
              {columns.map((c) => (
                <td key={c.key} style={{
                  padding: pad, textAlign: c.align || 'start',
                  borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)', verticalAlign: 'middle',
                  fontVariantNumeric: c.numeric ? 'tabular-nums' : undefined,
                  fontFamily: c.mono ? 'var(--font-mono)' : undefined,
                }}>{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
