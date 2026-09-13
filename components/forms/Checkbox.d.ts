import type { ReactNode, CSSProperties, InputHTMLAttributes } from 'react';

/** 18px square checkbox, 2px radius, maroon when selected. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'type'> {
  label?: ReactNode;
  /** Second line of smaller muted text under the label. */
  description?: ReactNode;
  /** Renders the mixed-state dash. @default false */
  indeterminate?: boolean;
  style?: CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
