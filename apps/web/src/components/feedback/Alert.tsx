import type { ReactNode, CSSProperties } from 'react';

/** Persistent in-page message. The 3px leading bar is the only place the system uses a coloured edge rule. */
export interface AlertProps {
  /** @default "info" */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'brand';
  title?: ReactNode;
  icon?: ReactNode;
  /** Supply to render a dismiss affordance. */
  onDismiss?: () => void;
  /** Row of Buttons under the body. */
  actions?: ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
}

type AlertTone = NonNullable<AlertProps['tone']>;

const tones: Record<AlertTone, { bg: string; bar: string; fg: string }> = {
  info:    { bg: 'var(--surface-info-soft)', bar: 'var(--ma-teal-600)', fg: 'var(--text-info)' },
  success: { bg: 'var(--surface-success-soft)', bar: 'var(--ma-green-600)', fg: 'var(--text-success)' },
  warning: { bg: 'var(--surface-warning-soft)', bar: 'var(--ma-amber-600)', fg: 'var(--text-warning)' },
  danger:  { bg: 'var(--surface-danger-soft)', bar: 'var(--ma-red-600)', fg: 'var(--text-danger)' },
  brand:   { bg: 'var(--surface-brand-soft)', bar: 'var(--surface-brand)', fg: 'var(--ma-maroon-700)' },
};

/** In-page message block. */
export function Alert({ tone = 'info', title, icon, onDismiss, actions, style, children, ...rest }: AlertProps) {
  const t = tones[tone] || tones.info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      style={{
        display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4)',
        background: t.bg, borderRadius: 'var(--radius-md)',
        borderInlineStart: `var(--border-width-accent) solid ${t.bar}`,
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ color: t.fg, display: 'flex', paddingTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
        {title && <strong style={{ font: 'var(--type-label)', color: t.fg }}>{title}</strong>}
        {children && <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>{children}</div>}
        {actions && <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss"
          style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', font: 'var(--text-lg)/1 var(--font-body)', padding: 0 }}>×</button>
      )}
    </div>
  );
}
