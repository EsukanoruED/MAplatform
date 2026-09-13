import type { CSSProperties } from 'react';

/** Controlled radio group — pass `value` and `onChange`. Use for 2–4 exclusive options; beyond that use SelectField. */
export interface RadioProps {
  /** Shared input name — required for keyboard grouping. */
  name: string;
  options?: Array<string | { value: string; label: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  /** @default "stack" */
  layout?: 'stack' | 'row';
  style?: CSSProperties;
}
export declare function Radio(props: RadioProps): JSX.Element;
