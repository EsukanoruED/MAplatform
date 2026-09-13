import type { CSSProperties } from 'react';

/** Controlled underlined tab bar — 2px maroon inset rule marks the active tab. */
export interface TabsProps {
  items?: Array<string | { value: string; label: string; count?: number }>;
  value?: string;
  onChange?: (value: string) => void;
  /** @default "md" */
  size?: 'sm' | 'md';
  style?: CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
