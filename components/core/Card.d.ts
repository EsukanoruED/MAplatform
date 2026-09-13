import type { ReactNode, CSSProperties } from 'react';

/** Bounded content surface: 10px radius, hairline border, warm shadow only when raised or hovered. */
export interface CardProps {
  /** @default "plain" */
  tone?: 'plain' | 'raised' | 'sunken' | 'brand' | 'ink';
  /** Inner padding — pass a spacing token. @default "var(--space-6)" */
  padding?: string;
  /** Adds the hover lift (-2px + shadow-lg) and a pointer cursor. @default false */
  interactive?: boolean;
  /** Small uppercase brand label above the title. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Full-bleed element above the padded body (image, chart, map). */
  media?: ReactNode;
  /** Hairline-separated strip at the bottom. */
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
