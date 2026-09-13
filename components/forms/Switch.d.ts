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
export declare function Switch(props: SwitchProps): JSX.Element;
