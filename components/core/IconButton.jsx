import React from 'react';
import { Button } from './Button.jsx';

const box = { sm: 32, md: 40, lg: 48 };

/** Square, label-less action. */
export function IconButton({ icon, label, size = 'md', variant = 'secondary', style, ...rest }) {
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
