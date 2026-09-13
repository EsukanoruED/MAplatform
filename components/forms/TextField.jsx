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

const heights = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };

/** Single-line or multi-line text input with label, hint and error. */
export function TextField({
  label, hint, error, required = false, size = 'md', multiline = false, rows = 4,
  iconStart, id, className, style, inputStyle, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId ? React.useId() : 'f';
  const fieldId = id || autoId;
  const Tag = multiline ? 'textarea' : 'input';
  const shell = {
    display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 'var(--space-2)',
    minHeight: multiline ? undefined : heights[size],
    padding: multiline ? 'var(--space-3)' : `0 var(--space-3)`,
    background: 'var(--surface-card)',
    border: `1px solid ${error ? 'var(--border-danger)' : focus ? 'var(--border-brand)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-control)',
    boxShadow: focus ? (error ? 'var(--shadow-focus-danger)' : 'var(--shadow-focus)') : 'none',
    transition: 'var(--transition-control)',
  };
  return (
    <Shell label={label} hint={hint} error={error} required={required} htmlFor={fieldId} style={style}>
      <div className={className} style={shell}>
        {iconStart && <span style={{ color: 'var(--text-muted)', display: 'flex', paddingTop: multiline ? 2 : 0 }}>{iconStart}</span>}
        <Tag
          id={fieldId} rows={multiline ? rows : undefined} required={required}
          onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
          style={{
            flex: 1, width: '100%', border: 0, outline: 0, background: 'transparent',
            font: 'var(--type-body-sm)', color: 'var(--text-primary)', padding: 0,
            resize: multiline ? 'vertical' : undefined, lineHeight: multiline ? 'var(--leading-body)' : undefined,
            ...inputStyle,
          }}
          {...rest}
        />
      </div>
    </Shell>
  );
}
