import type { ReactNode, CSSProperties } from 'react';

/**
 * Shared label / hint / error frame for TextField and SelectField. Lifted out of the
 * two prototype files, which each carried an identical private copy.
 */
export interface FieldShellProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

export function FieldShell({ label, hint, error, required, htmlFor, children, style }: FieldShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', ...style }}>
      {label && (
        <label htmlFor={htmlFor} style={{ font: 'var(--type-label)', color: 'var(--text-primary)' }}>
          {label}
          {required && <span style={{ color: 'var(--text-danger)', marginInlineStart: 3 }}>*</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <span style={{ font: 'var(--type-caption)', color: error ? 'var(--text-danger)' : 'var(--text-muted)' }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
