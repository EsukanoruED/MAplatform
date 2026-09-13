import type { ReactNode, CSSProperties } from 'react';

/** Square-cornered (2px) metadata label — filters, specialities, site names. Distinct from Badge, which is a status. */
export interface TagProps {
  /** Supply to render a dismiss affordance. */
  onRemove?: () => void;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export declare function Tag(props: TagProps): JSX.Element;
