import React from 'react';

/** The Medical Alliance lockup. Renders the supplied SVG artwork — never re-drawn. */
export function Logo({
  lockup = 'horizontal', mark = 'crescent', tone = 'dark',
  height, assetBase = '/assets/logo', className, style, ...rest
}) {
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
