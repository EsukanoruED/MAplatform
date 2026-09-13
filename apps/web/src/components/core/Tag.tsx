import type { ReactNode, CSSProperties } from 'react';

/** Square-cornered (2px) metadata label — filters, specialities, site names. Distinct from Badge, which is a status. */
export interface TagProps {
  /** Supply to render a dismiss affordance. */
  onRemove?: () => void;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Square-cornered metadata label, optionally removable. */
export function Tag({ onRemove, icon, className, style, children, ...rest }: TagProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1-5)',
        height: 26, padding: '0 var(--space-2)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)',
        background: 'var(--surface-card)', color: 'var(--text-secondary)',
        font: 'var(--weight-medium) var(--text-2xs)/1 var(--font-body)',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
      {onRemove && (
        <button
          type="button" onClick={onRemove} aria-label="Remove"
          style={{
            border: 0, background: 'transparent', padding: 0, marginInlineStart: 2,
            color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1, fontSize: 13,
          }}
        >×</button>
      )}
    </span>
  );
}
