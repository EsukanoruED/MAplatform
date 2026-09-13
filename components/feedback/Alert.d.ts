import type { ReactNode, CSSProperties } from 'react';

/** Persistent in-page message. The 3px leading bar is the only place the system uses a coloured edge rule. */
export interface AlertProps {
  /** @default "info" */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'brand';
  title?: ReactNode;
  icon?: ReactNode;
  /** Supply to render a dismiss affordance. */
  onDismiss?: () => void;
  /** Row of Buttons under the body. */
  actions?: ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
}
export declare function Alert(props: AlertProps): JSX.Element;
