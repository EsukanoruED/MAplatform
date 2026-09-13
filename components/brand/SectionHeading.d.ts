import type { ReactNode, CSSProperties } from 'react';

/**
 * The brand's section opener: 28×3px maroon rule, uppercase wide-tracked eyebrow,
 * bold heading, optional lead paragraph at a 54–62ch measure.
 */
export interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** @default "start" */
  align?: 'start' | 'center';
  /** Show the 3px maroon rule beside the eyebrow. @default true */
  rule?: boolean;
  /** Heading level rendered. @default 2 */
  level?: 1 | 2 | 3;
  className?: string;
  style?: CSSProperties;
}
export declare function SectionHeading(props: SectionHeadingProps): JSX.Element;
