import React from 'react';

/** Hover/focus label. */
export function Tooltip({ label, placement = 'top', children, style }) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: { bottom: '100%', left: '50%', transform: 'translate(-50%,-6px)' },
    bottom: { top: '100%', left: '50%', transform: 'translate(-50%,6px)' },
    left: { right: '100%', top: '50%', transform: 'translate(-6px,-50%)' },
    right: { left: '100%', top: '50%', transform: 'translate(6px,-50%)' },
  }[placement];
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
    >
      {children}
      <span
        role="tooltip"
        style={{
          position: 'absolute', ...pos, zIndex: 40, pointerEvents: 'none',
          padding: 'var(--space-1-5) var(--space-2-5)',
          background: 'var(--surface-ink)', color: 'var(--text-inverse)',
          font: 'var(--type-caption)', borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap',
          opacity: open ? 1 : 0,
          transition: `opacity var(--duration-fast) var(--ease-standard)`,
        }}
      >{label}</span>
    </span>
  );
}
