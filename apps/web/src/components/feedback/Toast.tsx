import type { ReactNode, CSSProperties } from 'react';

/** Transient ink-ground confirmation, bottom-right, auto-dismissed after ~4s by the host. */
export interface ToastProps {
  /** @default "neutral" */
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
  title?: ReactNode;
  icon?: ReactNode;
  /** A single small ghost Button, e.g. Undo. */
  action?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
  children?: ReactNode;
}

type ToastTone = NonNullable<ToastProps['tone']>;

const accents: Record<ToastTone, string> = {
  neutral: 'var(--ma-neutral-400)', success: 'var(--ma-green-500)',
  warning: 'var(--ma-amber-500)', danger: 'var(--ma-red-500)', brand: 'var(--ma-maroon-500)',
};

/** Transient confirmation. */
export function Toast({ tone = 'neutral', title, icon, action, onDismiss, style, children, ...rest }: ToastProps) {
  return (
    <div
      role="status"
      style={{
        display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
        minWidth: 300, maxWidth: 420, padding: 'var(--space-3) var(--space-4)',
        background: 'var(--surface-ink)', color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
        borderInlineStart: `var(--border-width-accent) solid ${accents[tone] || accents.neutral}`,
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: 'flex', paddingTop: 2, color: accents[tone] }}>{icon}</span>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title && <strong style={{ font: 'var(--type-label)' }}>{title}</strong>}
        {children && <span style={{ font: 'var(--type-caption)', color: 'rgba(255,255,255,.72)' }}>{children}</span>}
      </div>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss"
          style={{ border: 0, background: 'transparent', color: 'rgba(255,255,255,.6)', cursor: 'pointer', font: 'var(--text-lg)/1 var(--font-body)', padding: 0 }}>×</button>
      )}
    </div>
  );
}
