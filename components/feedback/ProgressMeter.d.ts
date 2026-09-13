import type { ReactNode, CSSProperties } from 'react';

/** Linear completion meter — screening programme coverage, stock levels, training completion. */
export interface ProgressMeterProps {
  /** @default 0 */
  value?: number;
  /** @default 100 */
  max?: number;
  /** @default "brand" */
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  label?: ReactNode;
  /** Right-aligned readout, e.g. "82%" or "164 / 200". */
  valueLabel?: ReactNode;
  /** Track height 4 / 6 / 10px. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}
export declare function ProgressMeter(props: ProgressMeterProps): JSX.Element;
