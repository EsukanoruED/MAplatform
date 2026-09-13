import type { CSSProperties } from 'react';
import { iconRegistry } from './icon-registry';

/**
 * Lucide glyph wrapper. **Intentional addition** — the supplied brand package contained
 * no icon set, so the system standardises on Lucide (2px stroke, 24px grid, round caps).
 *
 * Glyphs come from the `lucide-react` package via `./icon-registry`. The prototype
 * read them off a `window.lucide` global loaded from a CDN; that dependency is gone.
 * An unregistered name renders an empty box of the right size so layout never shifts,
 * matching the prototype's library-not-loaded-yet behaviour.
 */
export interface IconProps {
  /** Lucide icon name, kebab-case: "heart-pulse". Must be registered in ./icon-registry. */
  name: string;
  /** Box size in px. @default 20 */
  size?: number;
  /** @default 2 */
  strokeWidth?: number;
  /** Supply for standalone meaningful icons; omitted icons are aria-hidden. */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/** Lucide glyph, rendered from the bundled lucide-react icon set. */
export function Icon({ name, size = 20, strokeWidth = 2, className, style, title, ...rest }: IconProps) {
  const Glyph = iconRegistry[name];

  if (!Glyph) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[Icon] "${name}" is not registered — add it to components/brand/icon-registry.ts`);
    }
    // Not registered — hold the box so layout never shifts.
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{ display: 'inline-block', width: size, height: size, ...style }}
        {...rest}
      />
    );
  }

  return (
    <Glyph
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      className={className}
      style={{ display: 'block', flex: '0 0 auto', ...style }}
      {...rest}
    />
  );
}
