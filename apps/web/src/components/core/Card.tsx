import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

/** Bounded content surface: 10px radius, hairline border, warm shadow only when raised or hovered. */
export interface CardProps {
  /** @default "plain" */
  tone?: 'plain' | 'raised' | 'sunken' | 'brand' | 'ink';
  /** Inner padding — pass a spacing token. @default "var(--space-6)" */
  padding?: string;
  /** Adds the hover lift (-2px + shadow-lg) and a pointer cursor. @default false */
  interactive?: boolean;
  /** Small uppercase brand label above the title. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Full-bleed element above the padded body (image, chart, map). */
  media?: ReactNode;
  /** Hairline-separated strip at the bottom. */
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

type CardTone = NonNullable<CardProps['tone']>;

const tones: Record<CardTone, CSSProperties> = {
  plain:  { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' },
  raised: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' },
  sunken: { background: 'var(--surface-sunken)', border: '1px solid transparent', color: 'var(--text-primary)' },
  brand:  { background: 'var(--surface-brand-soft)', border: '1px solid var(--ma-maroon-100)', color: 'var(--ma-maroon-900)' },
  ink:    { background: 'var(--surface-ink)', border: '1px solid rgba(255,255,255,.10)', color: 'var(--text-inverse)' },
};

/** Bounded content surface. */
export function Card({
  tone = 'plain', padding = 'var(--space-6)', interactive = false,
  eyebrow, title, media, footer, className, style, children, ...rest
}: CardProps) {
  const [hover, setHover] = React.useState(false);
  const t = tones[tone] || tones.plain;
  const onInk = tone === 'ink';
  return (
    <div
      className={className}
      onMouseEnter={interactive ? () => setHover(true) : undefined}
      onMouseLeave={interactive ? () => setHover(false) : undefined}
      style={{
        borderRadius: 'var(--radius-card)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'var(--transition-surface), background-color var(--duration-fast) var(--ease-standard)',
        ...t,
        ...(hover ? { boxShadow: 'var(--shadow-lg)', transform: 'translateY(-2px)' } : {}),
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
      {...rest}
    >
      {media}
      <div style={{ padding, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
        {eyebrow && (
          <span style={{
            font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
            color: onInk ? 'var(--ma-maroon-200)' : 'var(--text-brand)',
          }}>{eyebrow}</span>
        )}
        {title && <h3 style={{ font: 'var(--type-heading-4)', color: 'inherit' }}>{title}</h3>}
        {children}
      </div>
      {footer && (
        <div style={{
          padding: `var(--space-3) ${padding}`,
          borderTop: `1px solid ${onInk ? 'rgba(255,255,255,.10)' : 'var(--border-subtle)'}`,
          font: 'var(--type-body-sm)', color: onInk ? 'rgba(255,255,255,.72)' : 'var(--text-secondary)',
        }}>{footer}</div>
      )}
    </div>
  );
}
