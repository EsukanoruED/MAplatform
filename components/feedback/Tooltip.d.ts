import type { ReactNode, CSSProperties } from 'react';

/** Ink-ground label shown on hover and keyboard focus. Fades only — no scale, no bounce. */
export interface TooltipProps {
  label: ReactNode;
  /** @default "top" */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** The trigger. */
  children: ReactNode;
  style?: CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
