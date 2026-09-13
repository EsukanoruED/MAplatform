import type { ReactNode, CSSProperties, SelectHTMLAttributes } from 'react';

/** Native `<select>` wearing the brand control shell, with a CSS chevron (no icon dependency). */
export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'style' | 'size' | 'children'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Strings, or `{ value, label }` pairs. */
  options?: Array<string | { value: string; label: string }>;
  /** Renders as an empty-valued first option. */
  placeholder?: string;
  style?: CSSProperties;
}
export declare function SelectField(props: SelectFieldProps): JSX.Element;
