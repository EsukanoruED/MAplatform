import type { ReactNode, CSSProperties } from 'react';

/** Transient ink-ground confirmation, bottom-right, auto-dismissed after ~4s by the host. */
export interface ToastProps {
  /** @default "neutral" */
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
  title?: ReactNode;
  icon?: ReactNode;
  /** A single small ghost Button, e.g. Undo. */
  action?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
  children?: ReactNode;
}
export declare function Toast(props: ToastProps): JSX.Element;
