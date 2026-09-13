import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

/**
 * The brand's section opener: 28×3px maroon rule, uppercase wide-tracked eyebrow,
 * bold heading, optional lead paragraph at a 54–62ch measure.
 */
export interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** @default "start" */
  align?: 'start' | 'center';
  /** Show the 3px maroon rule beside the eyebrow. @default true */
  rule?: boolean;
  /** Heading level rendered. @default 2 */
  level?: 1 | 2 | 3;
  className?: string;
  style?: CSSProperties;
}

/** Eyebrow + title + optional lead, with the 3px brand rule. */
export function SectionHeading({
  eyebrow, title, lead, align = 'start', rule = true, level = 2, className, style, ...rest
}: SectionHeadingProps) {
  const H = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <header
      className={className}
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align === 'center' ? 'center' : 'start',
        maxWidth: align === 'center' ? '62ch' : '54ch',
        marginInline: align === 'center' ? 'auto' : undefined,
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2-5)' }}>
          {rule && <span style={{ width: 28, height: 'var(--border-width-accent)', background: 'var(--surface-brand)' }} />}
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--text-brand)' }}>{eyebrow}</span>
        </span>
      )}
      {React.createElement(H, { style: { font: 'var(--type-heading-1)', letterSpacing: 'var(--tracking-tight)', color: 'var(--text-primary)', margin: 0, textWrap: 'balance' } as CSSProperties }, title)}
      {lead && <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', textWrap: 'pretty' } as CSSProperties}>{lead}</p>}
    </header>
  );
}
