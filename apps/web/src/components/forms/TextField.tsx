import React from 'react';
import type { ReactNode, CSSProperties, InputHTMLAttributes, FocusEvent } from 'react';
import { FieldShell } from './field-shell';

/** Labelled text input. Set `multiline` for a textarea — same shell, same states. */
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'size'> {
  label?: ReactNode;
  /** Helper text under the field; replaced by `error` when present. */
  hint?: ReactNode;
  /** Error message — also turns the border and focus ring red. */
  error?: ReactNode;
  required?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** @default false */
  multiline?: boolean;
  /** Textarea rows when `multiline`. @default 4 */
  rows?: number;
  /** Leading glyph inside the field. */
  iconStart?: ReactNode;
  /** Applied to the wrapper. */
  style?: CSSProperties;
  /** Applied to the input element itself. */
  inputStyle?: CSSProperties;
}

const heights: Record<NonNullable<TextFieldProps['size']>, string> = {
  sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)',
};

/** Single-line or multi-line text input with label, hint and error. */
export function TextField({
  label, hint, error, required = false, size = 'md', multiline = false, rows = 4,
  iconStart, id, className, style, inputStyle, ...rest
}: TextFieldProps) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const fieldId = id || autoId;
  // One shell renders either an <input> or a <textarea>. The two elements have
  // incompatible prop and event types, so the tag is widened at this single
  // internal boundary rather than duplicating the whole block per element. The
  // component's public surface (TextFieldProps) stays fully typed.
  const Field = (multiline ? 'textarea' : 'input') as unknown as React.ComponentType<Record<string, unknown>>;
  const shell: CSSProperties = {
    display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 'var(--space-2)',
    minHeight: multiline ? undefined : heights[size],
    padding: multiline ? 'var(--space-3)' : '0 var(--space-3)',
    background: 'var(--surface-card)',
    border: `1px solid ${error ? 'var(--border-danger)' : focus ? 'var(--border-brand)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-control)',
    boxShadow: focus ? (error ? 'var(--shadow-focus-danger)' : 'var(--shadow-focus)') : 'none',
    transition: 'var(--transition-control)',
  };
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={fieldId} style={style}>
      <div className={className} style={shell}>
        {iconStart && <span style={{ color: 'var(--text-muted)', display: 'flex', paddingTop: multiline ? 2 : 0 }}>{iconStart}</span>}
        <Field
          id={fieldId} rows={multiline ? rows : undefined} required={required}
          onFocus={(e: FocusEvent<HTMLInputElement>) => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={(e: FocusEvent<HTMLInputElement>) => { setFocus(false); rest.onBlur?.(e); }}
          style={{
            flex: 1, width: '100%', border: 0, outline: 0, background: 'transparent',
            font: 'var(--type-body-sm)', color: 'var(--text-primary)', padding: 0,
            resize: multiline ? 'vertical' : undefined, lineHeight: multiline ? 'var(--leading-body)' : undefined,
            ...inputStyle,
          }}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}
