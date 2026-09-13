import React from 'react';
import type { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

/**
 * Primary action control. Five grounds: brand maroon, outlined secondary,
 * text-only ghost, near-black ink (for use on maroon or photography), and danger.
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Visual ground. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'ink' | 'danger';
  /** Control height: 32 / 40 / 48px. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading glyph — pass <Icon name="…" size={16} />. */
  iconStart?: ReactNode;
  /** Trailing glyph. */
  iconEnd?: ReactNode;
  /** Stretch to the container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

type ButtonVariant = NonNullable<ButtonProps['variant']>;
type ButtonSize = NonNullable<ButtonProps['size']>;

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { height: 'var(--control-h-sm)', padding: '0 var(--space-3)', font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)', gap: 'var(--space-1-5)' },
  md: { height: 'var(--control-h-md)', padding: '0 var(--space-5)', font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)', gap: 'var(--space-2)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 var(--space-6)', font: 'var(--weight-bold) var(--text-md)/1 var(--font-body)', gap: 'var(--space-2-5)' },
};

// Borders are declared as longhand (width/style/colour) rather than the `border`
// shorthand. The hover map below overrides borderColor alone, and React warns —
// correctly — that removing a longhand on re-render while a shorthand is also set
// can leave stale styling. Same rendered result, no mixed declarations.
const variants: Record<ButtonVariant, CSSProperties> = {
  primary:   { background: 'var(--surface-brand)', color: 'var(--text-on-brand)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--surface-brand)' },
  secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border-strong)' },
  ghost:     { background: 'transparent', color: 'var(--text-brand)', borderWidth: 1, borderStyle: 'solid', borderColor: 'transparent' },
  ink:       { background: 'var(--surface-ink)', color: 'var(--text-inverse)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--surface-ink)' },
  danger:    { background: 'var(--ma-red-600)', color: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--ma-red-600)' },
};

const hovers: Record<ButtonVariant, CSSProperties> = {
  primary:   { background: 'var(--surface-brand-hover)', borderColor: 'var(--surface-brand-hover)' },
  secondary: { background: 'var(--surface-sunken)', borderColor: 'var(--border-strong)' },
  // These two keep the variant's own border colour; listing it explicitly keeps
  // every hover entry the same shape, so no property is dropped on re-render.
  ghost:     { background: 'var(--surface-brand-soft)', borderColor: 'transparent' },
  ink:       { background: 'var(--ma-maroon-950)', borderColor: 'var(--ma-maroon-950)' },
  danger:    { background: 'var(--ma-red-700)', borderColor: 'var(--ma-red-700)' },
};

/** Primary action control. */
export function Button({
  variant = 'primary', size = 'md', iconStart, iconEnd, fullWidth = false,
  disabled = false, type = 'button', className, style, children, ...rest
}: ButtonProps) {
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
