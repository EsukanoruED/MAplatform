import type { ReactNode, CSSProperties } from 'react';

/** 40×22px toggle for settings that take effect immediately. If the change needs a Save button, use Checkbox instead. */
export interface SwitchProps {
  label?: ReactNode;
  description?: ReactNode;
  /** @default false */
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  style?: CSSProperties;
}

/** Instant-effect binary toggle. */
export function Switch({ label, description, checked = false, onChange, disabled = false, style }: SwitchProps) {
  return (
    <label style={{ display: 'flex', gap: 'var(--space-3)', alignItems: description ? 'flex-start' : 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <button
        type="button" role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 40, height: 22, flex: '0 0 auto', marginTop: description ? 1 : 0,
          padding: 2, border: 0, borderRadius: 'var(--radius-pill)',
          background: checked ? 'var(--surface-brand)' : 'var(--ma-neutral-300)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color var(--duration-base) var(--ease-standard)',
          display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
        }}
      >
        <span style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          boxShadow: 'var(--shadow-xs)', transition: 'transform var(--duration-base) var(--ease-standard)',
        }} />
      </button>
      {(label || description) && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {label && <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-primary)' }}>{label}</span>}
          {description && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{description}</span>}
        </span>
      )}
    </label>
  );
}
