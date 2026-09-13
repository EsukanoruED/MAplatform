import React from 'react';

/** Square checkbox with inline label. */
export function Checkbox({ label, description, checked, indeterminate = false, disabled = false, id, style, ...rest }) {
  const autoId = React.useId ? React.useId() : 'c';
  const fieldId = id || autoId;
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2-5)', alignItems: description ? 'flex-start' : 'center', opacity: disabled ? 0.5 : 1, ...style }}>
      <input
        ref={ref} id={fieldId} type="checkbox" checked={checked} disabled={disabled}
        style={{
          appearance: 'none', width: 18, height: 18, margin: 0, flex: '0 0 auto',
          marginTop: description ? 2 : 0,
          border: `1px solid ${checked || indeterminate ? 'var(--surface-brand)' : 'var(--border-strong)'}`,
          background: checked || indeterminate ? 'var(--surface-brand)' : 'var(--surface-card)',
          borderRadius: 'var(--radius-xs)', cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'var(--transition-control)',
          backgroundImage: checked
            ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>\")"
            : indeterminate
            ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round'><line x1='6' y1='12' x2='18' y2='12'/></svg>\")"
            : 'none',
          backgroundSize: '14px', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        }}
        {...rest}
      />
      {(label || description) && (
        <label htmlFor={fieldId} style={{ display: 'flex', flexDirection: 'column', gap: 2, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {label && <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-primary)' }}>{label}</span>}
          {description && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{description}</span>}
        </label>
      )}
    </div>
  );
}
