import type { ReactNode, CSSProperties } from 'react';
import type { ButtonProps } from './Button';

/** Square action carrying only a glyph. `label` is required — it becomes the accessible name and the tooltip. */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconStart' | 'iconEnd'> {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
