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
  /** Path prefix to the logo folder — set this when the assets are not at /logo. @default "/logo" */
  assetBase?: string;
  className?: string;
  style?: CSSProperties;
}

/** The Medical Alliance lockup. Renders the supplied SVG artwork — never re-drawn. */
export function Logo({
  lockup = 'horizontal', mark = 'crescent', tone = 'dark',
  height, assetBase = '/logo', className, style, ...rest
}: LogoProps) {
  const h = height ?? (lockup === 'stacked' ? 72 : 34);
  if (lockup === 'mark') {
    return (
      <img
        src={`${assetBase}/ma-mark-${tone === 'white' ? 'white' : 'maroon'}.png`}
        alt="Medical Alliance"
        className={className}
        style={{ height: h, width: 'auto', ...style }}
        {...rest}
      />
    );
  }
  return (
    <img
      src={`${assetBase}/ma-${lockup}-${mark}-${tone}.svg`}
      alt="Medical Alliance — التحالف الطبي"
      className={className}
      style={{ height: h, width: 'auto', ...style }}
      {...rest}
    />
  );
}
