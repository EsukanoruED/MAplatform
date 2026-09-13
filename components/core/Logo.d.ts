import type { CSSProperties } from 'react';

/**
 * The Medical Alliance lockup, served from the supplied SVG/PNG artwork.
 * Two lockups (horizontal, stacked) × two mark treatments (crescent, s) × two tones.
 * `mark` renders the crescent symbol alone for favicons, uniforms and vehicle liveries.
 */
export interface LogoProps {
  /** @default "horizontal" */
  lockup?: 'horizontal' | 'stacked' | 'mark';
  /** Which symbol variant the lockup carries. @default "crescent" */
  mark?: 'crescent' | 's';
  /** `dark` for light grounds, `white` for maroon/ink/photographic grounds. @default "dark" */
  tone?: 'dark' | 'white';
  /** Rendered height in px. Defaults: 34 horizontal, 72 stacked. */
  height?: number;
  /** Path prefix to the logo folder — set this when the assets are not at /assets/logo. @default "/assets/logo" */
  assetBase?: string;
  className?: string;
  style?: CSSProperties;
}
export declare function Logo(props: LogoProps): JSX.Element;
