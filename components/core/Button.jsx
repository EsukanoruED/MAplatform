import React from 'react';

const sizes = {
  sm: { height: 'var(--control-h-sm)', padding: '0 var(--space-3)', font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)', gap: 'var(--space-1-5)' },
  md: { height: 'var(--control-h-md)', padding: '0 var(--space-5)', font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)', gap: 'var(--space-2)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 var(--space-6)', font: 'var(--weight-bold) var(--text-md)/1 var(--font-body)', gap: 'var(--space-2-5)' },
};

const variants = {
  primary:   { background: 'var(--surface-brand)', color: 'var(--text-on-brand)', border: '1px solid var(--surface-brand)' },
  secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' },
  ghost:     { background: 'transparent', color: 'var(--text-brand)', border: '1px solid transparent' },
  ink:       { background: 'var(--surface-ink)', color: 'var(--text-inverse)', border: '1px solid var(--surface-ink)' },
  danger:    { background: 'var(--ma-red-600)', color: '#fff', border: '1px solid var(--ma-red-600)' },
};

const hovers = {
  primary:   { background: 'var(--surface-brand-hover)', borderColor: 'var(--surface-brand-hover)' },
  secondary: { background: 'var(--surface-sunken)', borderColor: 'var(--border-strong)' },
  ghost:     { background: 'var(--surface-brand-soft)' },
  ink:       { background: 'var(--ma-maroon-950)' },
  danger:    { background: 'var(--ma-red-700)', borderColor: 'var(--ma-red-700)' },
};

/** Primary action control. */
export function Button({
  variant = 'primary', size = 'md', iconStart, iconEnd, fullWidth = false,
  disabled = false, type = 'button', className, style, children, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: fullWidth ? '100%' : undefined,
        height: s.height, padding: s.padding, font: s.font, gap: s.gap,
        letterSpacing: 'var(--tracking-wide)',
        borderRadius: 'var(--radius-control)', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-control), transform var(--duration-instant) var(--ease-standard)',
        whiteSpace: 'nowrap', textDecoration: 'none',
        ...v,
        ...(hover && !disabled ? hovers[variant] || {} : {}),
        transform: press && !disabled ? 'translateY(1px)' : 'none',
        opacity: disabled ? 0.42 : 1,
        ...style,
      }}
      {...rest}
    >
      {iconStart}
      {children}
      {iconEnd}
    </button>
  );
}
