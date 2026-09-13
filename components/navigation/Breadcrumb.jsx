import React from 'react';

/** Hierarchical trail. */
export function Breadcrumb({ items = [], style, ...rest }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', ...style }} {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        const label = typeof it === 'string' ? it : it.label;
        const href = typeof it === 'string' ? undefined : it.href;
        return (
          <React.Fragment key={label + i}>
            {last || !href
              ? <span aria-current={last ? 'page' : undefined} style={{ font: `${last ? 'var(--weight-semibold)' : 'var(--weight-regular)'} var(--text-2xs)/1.3 var(--font-body)`, color: last ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
              : <a href={href} style={{ font: 'var(--weight-regular) var(--text-2xs)/1.3 var(--font-body)', color: 'var(--text-muted)', textDecoration: 'none' }}>{label}</a>}
            {!last && <span aria-hidden="true" style={{ color: 'var(--ma-neutral-300)', font: 'var(--text-2xs)/1 var(--font-body)' }}>/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
