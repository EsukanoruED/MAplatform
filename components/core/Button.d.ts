import type { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

/**
 * Primary action control. Five grounds: brand maroon, outlined secondary,
 * text-only ghost, near-black ink (for use on maroon or photography), and danger.
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Visual ground. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'ink' | 'danger';
  /** Control height: 32 / 40 / 48px. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading glyph — pass <Icon name="…" size={16} />. */
  iconStart?: ReactNode;
  /** Trailing glyph. */
  iconEnd?: ReactNode;
  /** Stretch to the container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
