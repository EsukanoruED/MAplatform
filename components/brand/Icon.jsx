import React from 'react';

function pascal(name) {
  return String(name).replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase());
}

/** Lucide glyph, rendered from the loaded lucide icon library. */
export function Icon({ name, size = 20, strokeWidth = 2, className, style, title, ...rest }) {
  const lib = typeof window !== 'undefined' && window.lucide ? window.lucide.icons || window.lucide : null;
  const node = lib ? lib[pascal(name)] || lib[name] : null;
  const children = !node ? null
    : (typeof node[0] === 'string' && Array.isArray(node[2])) ? node[2]
    : Array.isArray(node) ? node : null;

  if (!children) {
    // Library not loaded yet — hold the box so layout never shifts.
    return <span aria-hidden="true" className={className} style={{ display: 'inline-block', width: size, height: size, ...style }} {...rest} />;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'}
      className={className} style={{ display: 'block', flex: '0 0 auto', ...style }} {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children.map((child, i) => {
        const [tag, attrs] = child;
        return React.createElement(tag, { key: i, ...attrs });
      })}
    </svg>
  );
}
