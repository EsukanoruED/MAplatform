import type { CSSProperties } from 'react';

/**
 * Lucide glyph wrapper. **Intentional addition** — the supplied brand package contained
 * no icon set, so the system standardises on Lucide (2px stroke, 24px grid, round caps),
 * loaded from CDN. See readme.md → ICONOGRAPHY.
 *
 * Requires `<script src="https://unpkg.com/lucide@0.470.0/dist/umd/lucide.js"></script>`
 * on the page (or any build that puts the lucide icon map on `window.lucide`).
 */
export interface IconProps {
  /** Lucide icon name, kebab or Pascal: "heart-pulse" or "HeartPulse". */
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
export declare function Icon(props: IconProps): JSX.Element;
