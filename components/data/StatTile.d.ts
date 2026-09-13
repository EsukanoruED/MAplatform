import type { ReactNode, CSSProperties } from 'react';

/**
 * One figure, one label, one optional delta. Numbers are tabular so columns of tiles align.
 */
export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  /** Short suffix — "workers", "%", "days". */
  unit?: ReactNode;
  /** Change readout, e.g. "6 vs last month". */
  delta?: ReactNode;
  /** @default "flat" */
  deltaDirection?: 'up' | 'down' | 'flat';
  icon?: ReactNode;
  /** @default "plain" */
  tone?: 'plain' | 'brand' | 'ink';
  footnote?: ReactNode;
  style?: CSSProperties;
}
export declare function StatTile(props: StatTileProps): JSX.Element;
