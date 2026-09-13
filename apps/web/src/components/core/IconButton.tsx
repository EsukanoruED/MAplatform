import type { ReactNode, CSSProperties } from 'react';
import { Button } from './Button';
import type { ButtonProps } from './Button';

/** Square action carrying only a glyph. `label` is required — it becomes the accessible name and the tooltip. */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconStart' | 'iconEnd'> {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

const box: Record<NonNullable<IconButtonProps['size']>, number> = { sm: 32, md: 40, lg: 48 };

/** Square, label-less action. */
export function IconButton({ icon, label, size = 'md', variant = 'secondary', style, ...rest }: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      style={{ width: box[size] || box.md, padding: 0, ...style }}
      {...rest}
    >
      {icon}
    </Button>
  );
}
