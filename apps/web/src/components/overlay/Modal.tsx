import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

/** Centred dialog on a 56%-opacity ink scrim with a 2px backdrop blur. Escape and scrim-click both close. */
export interface ModalProps {
  /** @default true */
  open?: boolean;
  title?: ReactNode;
  /** One-line explanation under the title. */
  description?: ReactNode;
  onClose?: () => void;
  /** Right-aligned action row on a tinted strip. */
  footer?: ReactNode;
  /** Max width in px. @default 520 */
  width?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Centred dialog over a scrim. */
export function Modal({ open = true, title, description, onClose, footer, width = 520, children, style, ...rest }: ModalProps) {
  React.useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)',
        background: 'var(--surface-overlay)', backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, background: 'var(--surface-card)',
          borderRadius: 'var(--radius-surface)', boxShadow: 'var(--shadow-xl)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'none', ...style,
        }}
        {...rest}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', padding: 'var(--space-6) var(--space-6) var(--space-4)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
            {title && <h2 style={{ font: 'var(--type-heading-3)', color: 'var(--text-primary)', margin: 0 }}>{title}</h2>}
            {description && <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)', margin: 0 }}>{description}</p>}
          </div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close"
              style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', font: 'var(--text-xl)/1 var(--font-body)', padding: 0 }}>×</button>
          )}
        </div>
        {children && <div style={{ padding: '0 var(--space-6) var(--space-6)', font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>{children}</div>}
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-page-alt)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
