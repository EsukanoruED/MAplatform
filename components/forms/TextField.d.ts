import type { ReactNode, CSSProperties, InputHTMLAttributes } from 'react';

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
export declare function TextField(props: TextFieldProps): JSX.Element;
