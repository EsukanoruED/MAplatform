import type { ReactNode, CSSProperties } from 'react';

export interface DataTableColumn {
  key: string;
  header: ReactNode;
  /** @default "start" */
  align?: 'start' | 'center' | 'end';
  /** Fixed column width, e.g. "120px". */
  width?: string;
  /** Tabular figures for aligned numeric columns. */
  numeric?: boolean;
  /** Render in IBM Plex Mono — worker IDs, certificate numbers. */
  mono?: boolean;
  /** Cell renderer; receives the row. Return Badges, Buttons, anything. */
  render?: (row: Record<string, any>) => ReactNode;
}

/** Hairline record table: sunken uppercase header, 1px row rules, hover only when rows are clickable. */
export interface DataTableProps {
  columns?: DataTableColumn[];
  rows?: Array<Record<string, any>>;
  caption?: ReactNode;
  /** Tightens row padding for long lists. @default false */
  dense?: boolean;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  style?: CSSProperties;
}
export declare function DataTable(props: DataTableProps): JSX.Element;
