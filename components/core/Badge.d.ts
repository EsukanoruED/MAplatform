import type { ReactNode, CSSProperties } from 'react';

/** Pill-shaped status chip — the one place the system uses a fully rounded shape. */
export interface BadgeProps {
  /** @default "neutral" */
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'solid';
  /** Prepend a 6px status dot in the current colour. @default false */
  dot?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
