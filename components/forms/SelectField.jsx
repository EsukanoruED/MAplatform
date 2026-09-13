import React from 'react';

function Shell({ label, hint, error, required, htmlFor, children, style }) {
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

/** Native select in the brand control shell. */
export function SelectField({
  label, hint, error, required = false, size = 'md', options = [], placeholder,
  id, className, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId ? React.useId() : 's';
  const fieldId = id || autoId;
  const h = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' }[size] || 'var(--control-h-md)';
  return (
    <Shell label={label} hint={hint} error={error} required={required} htmlFor={fieldId} style={style}>
      <div className={className} style={{ position: 'relative', display: 'flex' }}>
        <select
          id={fieldId} required={required}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            appearance: 'none', width: '100%', height: h,
            padding: '0 var(--space-8) 0 var(--space-3)',
            background: 'var(--surface-card)', color: 'var(--text-primary)',
            font: 'var(--type-body-sm)',
            border: `1px solid ${error ? 'var(--border-danger)' : focus ? 'var(--border-brand)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-control)',
            boxShadow: focus ? 'var(--shadow-focus)' : 'none',
            transition: 'var(--transition-control)', cursor: 'pointer',
          }}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const v = typeof o === 'string' ? o : o.value;
            const l = typeof o === 'string' ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <span aria-hidden="true" style={{
          position: 'absolute', insetInlineEnd: 'var(--space-3)', top: '50%', marginTop: -3,
          width: 8, height: 8, borderInlineEnd: '1.5px solid var(--text-muted)',
          borderBottom: '1.5px solid var(--text-muted)', transform: 'rotate(45deg)', pointerEvents: 'none',
        }} />
      </div>
    </Shell>
  );
}
