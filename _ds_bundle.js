/* @ds-bundle: {"format":4,"namespace":"MedicalAllianceDesignSystem_32f8e4","components":[{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"SectionHeading","sourcePath":"components/brand/SectionHeading.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"ProgressMeter","sourcePath":"components/feedback/ProgressMeter.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"SelectField","sourcePath":"components/forms/SelectField.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Modal","sourcePath":"components/overlay/Modal.jsx"}],"sourceHashes":{"components/brand/Icon.jsx":"1e122d7feb6b","components/brand/SectionHeading.jsx":"e48fa660e041","components/core/Badge.jsx":"926f0f1992fa","components/core/Button.jsx":"5aad0f91f40c","components/core/Card.jsx":"6fccb052f3a9","components/core/IconButton.jsx":"d5a67c544144","components/core/Logo.jsx":"d199414c42a3","components/core/Tag.jsx":"663d6abc4355","components/data/DataTable.jsx":"634252cf64f0","components/data/StatTile.jsx":"64bdb549bb63","components/feedback/Alert.jsx":"b413e486b1bf","components/feedback/ProgressMeter.jsx":"f3adc6c59044","components/feedback/Toast.jsx":"a6c7d47fe47a","components/feedback/Tooltip.jsx":"09bbd1b28f1c","components/forms/Checkbox.jsx":"3c3dde716592","components/forms/Radio.jsx":"d2a263b65c04","components/forms/SelectField.jsx":"9a26b352da52","components/forms/Switch.jsx":"ff67ceb8be1a","components/forms/TextField.jsx":"55a2b630eb3b","components/navigation/Breadcrumb.jsx":"98fd1be88ab3","components/navigation/Tabs.jsx":"c67d650ed1fe","components/overlay/Modal.jsx":"625c5ec11d44","tweaks-panel.jsx":"d259e3a86f73","ui_kits/portal/CertificatesScreen.jsx":"e943f0b17e12","ui_kits/portal/DashboardScreen.jsx":"f26e91641f7e","ui_kits/portal/LoginScreen.jsx":"5e8409f8e883","ui_kits/portal/PortalChrome.jsx":"8b8b465790f7","ui_kits/portal/WorkerScreen.jsx":"d4b88245a07e","ui_kits/website/ContactScreen.jsx":"03c5ddca290f","ui_kits/website/HomeScreen.jsx":"a228dee356a5","ui_kits/website/RemoteSiteScreen.jsx":"2dc11ce16f04","ui_kits/website/ServicesScreen.jsx":"14fa36559763","ui_kits/website/SiteChrome.jsx":"cdaef587edd0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MedicalAllianceDesignSystem_32f8e4 = window.MedicalAllianceDesignSystem_32f8e4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function pascal(name) {
  return String(name).replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase());
}

/** Lucide glyph, rendered from the loaded lucide icon library. */
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
  style,
  title,
  ...rest
}) {
  const lib = typeof window !== 'undefined' && window.lucide ? window.lucide.icons || window.lucide : null;
  const node = lib ? lib[pascal(name)] || lib[name] : null;
  const children = !node ? null : typeof node[0] === 'string' && Array.isArray(node[2]) ? node[2] : Array.isArray(node) ? node : null;
  if (!children) {
    // Library not loaded yet — hold the box so layout never shifts.
    return /*#__PURE__*/React.createElement("span", _extends({
      "aria-hidden": "true",
      className: className,
      style: {
        display: 'inline-block',
        width: size,
        height: size,
        ...style
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: title ? 'img' : undefined,
    "aria-hidden": title ? undefined : 'true',
    className: className,
    style: {
      display: 'block',
      flex: '0 0 auto',
      ...style
    }
  }, rest), title ? /*#__PURE__*/React.createElement("title", null, title) : null, children.map((child, i) => {
    const [tag, attrs] = child;
    return React.createElement(tag, {
      key: i,
      ...attrs
    });
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/brand/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Eyebrow + title + optional lead, with the 3px brand rule. */
function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'start',
  rule = true,
  level = 2,
  className,
  style,
  ...rest
}) {
  const H = 'h' + level;
  return /*#__PURE__*/React.createElement("header", _extends({
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align === 'center' ? 'center' : 'start',
      maxWidth: align === 'center' ? '62ch' : '54ch',
      marginInline: align === 'center' ? 'auto' : undefined,
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2-5)'
    }
  }, rule && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 'var(--border-width-accent)',
      background: 'var(--surface-brand)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'var(--text-brand)'
    }
  }, eyebrow)), React.createElement(H, {
    style: {
      font: 'var(--type-heading-1)',
      letterSpacing: 'var(--tracking-tight)',
      color: 'var(--text-primary)',
      margin: 0,
      textWrap: 'balance'
    }
  }, title), lead && /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-lg)',
      color: 'var(--text-secondary)',
      textWrap: 'pretty'
    }
  }, lead));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  neutral: {
    background: 'var(--surface-sunken)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)'
  },
  brand: {
    background: 'var(--surface-brand-soft)',
    color: 'var(--ma-maroon-700)',
    border: '1px solid var(--ma-maroon-100)'
  },
  success: {
    background: 'var(--surface-success-soft)',
    color: 'var(--text-success)',
    border: '1px solid var(--ma-green-100)'
  },
  warning: {
    background: 'var(--surface-warning-soft)',
    color: 'var(--text-warning)',
    border: '1px solid var(--ma-amber-100)'
  },
  danger: {
    background: 'var(--surface-danger-soft)',
    color: 'var(--text-danger)',
    border: '1px solid var(--ma-red-100)'
  },
  info: {
    background: 'var(--surface-info-soft)',
    color: 'var(--text-info)',
    border: '1px solid var(--ma-teal-100)'
  },
  solid: {
    background: 'var(--surface-brand)',
    color: 'var(--text-on-brand)',
    border: '1px solid var(--surface-brand)'
  }
};

/** Status chip. */
function Badge({
  tone = 'neutral',
  dot = false,
  size = 'md',
  className,
  style,
  children,
  ...rest
}) {
  const t = tones[tone] || tones.neutral;
  const small = size === 'sm';
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1-5)',
      height: small ? 20 : 24,
      padding: small ? '0 var(--space-2)' : '0 var(--space-2-5)',
      borderRadius: 'var(--radius-chip)',
      font: `var(--weight-semibold) ${small ? 'var(--text-3xs)' : 'var(--text-2xs)'}/1 var(--font-body)`,
      letterSpacing: 'var(--tracking-wide)',
      whiteSpace: 'nowrap',
      ...t,
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'currentColor',
      flex: '0 0 auto'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 var(--space-3)',
    font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)',
    gap: 'var(--space-1-5)'
  },
  md: {
    height: 'var(--control-h-md)',
    padding: '0 var(--space-5)',
    font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)',
    gap: 'var(--space-2)'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 var(--space-6)',
    font: 'var(--weight-bold) var(--text-md)/1 var(--font-body)',
    gap: 'var(--space-2-5)'
  }
};
const variants = {
  primary: {
    background: 'var(--surface-brand)',
    color: 'var(--text-on-brand)',
    border: '1px solid var(--surface-brand)'
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-brand)',
    border: '1px solid transparent'
  },
  ink: {
    background: 'var(--surface-ink)',
    color: 'var(--text-inverse)',
    border: '1px solid var(--surface-ink)'
  },
  danger: {
    background: 'var(--ma-red-600)',
    color: '#fff',
    border: '1px solid var(--ma-red-600)'
  }
};
const hovers = {
  primary: {
    background: 'var(--surface-brand-hover)',
    borderColor: 'var(--surface-brand-hover)'
  },
  secondary: {
    background: 'var(--surface-sunken)',
    borderColor: 'var(--border-strong)'
  },
  ghost: {
    background: 'var(--surface-brand-soft)'
  },
  ink: {
    background: 'var(--ma-maroon-950)'
  },
  danger: {
    background: 'var(--ma-red-700)',
    borderColor: 'var(--ma-red-700)'
  }
};

/** Primary action control. */
function Button({
  variant = 'primary',
  size = 'md',
  iconStart,
  iconEnd,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    className: className,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: fullWidth ? '100%' : undefined,
      height: s.height,
      padding: s.padding,
      font: s.font,
      gap: s.gap,
      letterSpacing: 'var(--tracking-wide)',
      borderRadius: 'var(--radius-control)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'var(--transition-control), transform var(--duration-instant) var(--ease-standard)',
      whiteSpace: 'nowrap',
      textDecoration: 'none',
      ...v,
      ...(hover && !disabled ? hovers[variant] || {} : {}),
      transform: press && !disabled ? 'translateY(1px)' : 'none',
      opacity: disabled ? 0.42 : 1,
      ...style
    }
  }, rest), iconStart, children, iconEnd);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  plain: {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)'
  },
  raised: {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text-primary)'
  },
  sunken: {
    background: 'var(--surface-sunken)',
    border: '1px solid transparent',
    color: 'var(--text-primary)'
  },
  brand: {
    background: 'var(--surface-brand-soft)',
    border: '1px solid var(--ma-maroon-100)',
    color: 'var(--ma-maroon-900)'
  },
  ink: {
    background: 'var(--surface-ink)',
    border: '1px solid rgba(255,255,255,.10)',
    color: 'var(--text-inverse)'
  }
};

/** Bounded content surface. */
function Card({
  tone = 'plain',
  padding = 'var(--space-6)',
  interactive = false,
  eyebrow,
  title,
  media,
  footer,
  className,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const t = tones[tone] || tones.plain;
  const onInk = tone === 'ink';
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    style: {
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'var(--transition-surface), background-color var(--duration-fast) var(--ease-standard)',
      ...t,
      ...(hover ? {
        boxShadow: 'var(--shadow-lg)',
        transform: 'translateY(-2px)'
      } : {}),
      cursor: interactive ? 'pointer' : undefined,
      ...style
    }
  }, rest), media, /*#__PURE__*/React.createElement("div", {
    style: {
      padding,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      flex: 1
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: onInk ? 'var(--ma-maroon-200)' : 'var(--text-brand)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-heading-4)',
      color: 'inherit'
    }
  }, title), children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `var(--space-3) ${typeof padding === 'string' ? padding : padding + 'px'}`,
      borderTop: `1px solid ${onInk ? 'rgba(255,255,255,.10)' : 'var(--border-subtle)'}`,
      font: 'var(--type-body-sm)',
      color: onInk ? 'rgba(255,255,255,.72)' : 'var(--text-secondary)'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const box = {
  sm: 32,
  md: 40,
  lg: 48
};

/** Square, label-less action. */
function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'secondary',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Button, _extends({
    variant: variant,
    size: size,
    "aria-label": label,
    title: label,
    style: {
      width: box[size] || box.md,
      padding: 0,
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The Medical Alliance lockup. Renders the supplied SVG artwork — never re-drawn. */
function Logo({
  lockup = 'horizontal',
  mark = 'crescent',
  tone = 'dark',
  height,
  assetBase = '/assets/logo',
  className,
  style,
  ...rest
}) {
  const h = height ?? (lockup === 'stacked' ? 72 : 34);
  if (lockup === 'mark') {
    return /*#__PURE__*/React.createElement("img", _extends({
      src: `${assetBase}/ma-mark-${tone === 'white' ? 'white' : 'maroon'}.png`,
      alt: "Medical Alliance",
      className: className,
      style: {
        height: h,
        width: 'auto',
        ...style
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("img", _extends({
    src: `${assetBase}/ma-${lockup}-${mark}-${tone}.svg`,
    alt: "Medical Alliance \u2014 \u0627\u0644\u062A\u062D\u0627\u0644\u0641 \u0627\u0644\u0637\u0628\u064A",
    className: className,
    style: {
      height: h,
      width: 'auto',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square-cornered metadata label, optionally removable. */
function Tag({
  onRemove,
  icon,
  className,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1-5)',
      height: 26,
      padding: '0 var(--space-2)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--surface-card)',
      color: 'var(--text-secondary)',
      font: 'var(--weight-medium) var(--text-2xs)/1 var(--font-body)',
      ...style
    }
  }, rest), icon, children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      border: 0,
      background: 'transparent',
      padding: 0,
      marginInlineStart: 2,
      color: 'var(--text-muted)',
      cursor: 'pointer',
      lineHeight: 1,
      fontSize: 13
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Hairline record table. */
function DataTable({
  columns = [],
  rows = [],
  caption,
  dense = false,
  onRowClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(-1);
  const pad = dense ? 'var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-4)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      background: 'var(--surface-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      font: 'var(--type-body-sm)'
    }
  }, caption && /*#__PURE__*/React.createElement("caption", {
    style: {
      captionSide: 'top',
      textAlign: 'start',
      padding: pad,
      font: 'var(--type-label)',
      color: 'var(--text-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, caption), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)'
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    scope: "col",
    style: {
      textAlign: c.align || 'start',
      padding: pad,
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border-default)',
      whiteSpace: 'nowrap',
      width: c.width
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id || i,
    onMouseEnter: () => setHover(i),
    onMouseLeave: () => setHover(-1),
    onClick: onRowClick ? () => onRowClick(r, i) : undefined,
    style: {
      background: hover === i && onRowClick ? 'var(--surface-card-hover)' : 'transparent',
      cursor: onRowClick ? 'pointer' : undefined,
      transition: 'background-color var(--duration-fast) var(--ease-standard)'
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: pad,
      textAlign: c.align || 'start',
      borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--border-subtle)',
      color: 'var(--text-primary)',
      verticalAlign: 'middle',
      fontVariantNumeric: c.numeric ? 'tabular-nums' : undefined,
      fontFamily: c.mono ? 'var(--font-mono)' : undefined
    }
  }, c.render ? c.render(r) : r[c.key])))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const deltaTones = {
  up: 'var(--text-success)',
  down: 'var(--text-danger)',
  flat: 'var(--text-muted)'
};

/** Single-figure metric tile. */
function StatTile({
  label,
  value,
  unit,
  delta,
  deltaDirection = 'flat',
  icon,
  tone = 'plain',
  footnote,
  style,
  ...rest
}) {
  const ink = tone === 'ink';
  const brand = tone === 'brand';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      padding: 'var(--space-5)',
      borderRadius: 'var(--radius-card)',
      background: ink ? 'var(--surface-ink)' : brand ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
      border: `1px solid ${ink ? 'rgba(255,255,255,.10)' : brand ? 'var(--ma-maroon-100)' : 'var(--border-subtle)'}`,
      color: ink ? 'var(--text-inverse)' : 'var(--text-primary)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: ink ? 'rgba(255,255,255,.66)' : 'var(--text-muted)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: ink ? 'var(--ma-maroon-200)' : 'var(--text-brand)',
      display: 'flex'
    }
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-1-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-display-3)',
      letterSpacing: 'var(--tracking-tight)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)',
      color: ink ? 'rgba(255,255,255,.66)' : 'var(--text-muted)'
    }
  }, unit)), (delta || footnote) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      font: 'var(--type-caption)'
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-semibold)',
      color: ink ? '#fff' : deltaTones[deltaDirection]
    }
  }, deltaDirection === 'up' ? '↑ ' : deltaDirection === 'down' ? '↓ ' : '', delta), footnote && /*#__PURE__*/React.createElement("span", {
    style: {
      color: ink ? 'rgba(255,255,255,.6)' : 'var(--text-muted)'
    }
  }, footnote)));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  info: {
    bg: 'var(--surface-info-soft)',
    bar: 'var(--ma-teal-600)',
    fg: 'var(--text-info)'
  },
  success: {
    bg: 'var(--surface-success-soft)',
    bar: 'var(--ma-green-600)',
    fg: 'var(--text-success)'
  },
  warning: {
    bg: 'var(--surface-warning-soft)',
    bar: 'var(--ma-amber-600)',
    fg: 'var(--text-warning)'
  },
  danger: {
    bg: 'var(--surface-danger-soft)',
    bar: 'var(--ma-red-600)',
    fg: 'var(--text-danger)'
  },
  brand: {
    bg: 'var(--surface-brand-soft)',
    bar: 'var(--surface-brand)',
    fg: 'var(--ma-maroon-700)'
  }
};

/** In-page message block. */
function Alert({
  tone = 'info',
  title,
  icon,
  onDismiss,
  actions,
  style,
  children,
  ...rest
}) {
  const t = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: tone === 'danger' ? 'alert' : 'status',
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      background: t.bg,
      borderRadius: 'var(--radius-md)',
      borderInlineStart: `var(--border-width-accent) solid ${t.bar}`,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.fg,
      display: 'flex',
      paddingTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1-5)'
    }
  }, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      font: 'var(--type-label)',
      color: t.fg
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-1)'
    }
  }, actions)), onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: 0,
      background: 'transparent',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      font: 'var(--text-lg)/1 var(--font-body)',
      padding: 0
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  brand: 'var(--surface-brand)',
  success: 'var(--ma-green-600)',
  warning: 'var(--ma-amber-600)',
  danger: 'var(--ma-red-600)',
  info: 'var(--ma-teal-600)'
};

/** Linear progress / completion meter. */
function ProgressMeter({
  value = 0,
  max = 100,
  tone = 'brand',
  label,
  valueLabel,
  size = 'md',
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const h = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1-5)',
      ...style
    }
  }, rest), (label || valueLabel) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, label), valueLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-sm)/1.3 var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, valueLabel)), /*#__PURE__*/React.createElement("div", {
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    style: {
      height: h,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--ma-neutral-100)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      background: tones[tone] || tones.brand,
      borderRadius: 'inherit',
      transition: 'width var(--duration-slow) var(--ease-standard)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressMeter.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const accents = {
  neutral: 'var(--ma-neutral-400)',
  success: 'var(--ma-green-500)',
  warning: 'var(--ma-amber-500)',
  danger: 'var(--ma-red-500)',
  brand: 'var(--ma-maroon-500)'
};

/** Transient confirmation. */
function Toast({
  tone = 'neutral',
  title,
  icon,
  action,
  onDismiss,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start',
      minWidth: 300,
      maxWidth: 420,
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--surface-ink)',
      color: 'var(--text-inverse)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      borderInlineStart: `var(--border-width-accent) solid ${accents[tone] || accents.neutral}`,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      paddingTop: 2,
      color: accents[tone]
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      font: 'var(--type-label)'
    }
  }, title), children && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'rgba(255,255,255,.72)'
    }
  }, children)), action, onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: 0,
      background: 'transparent',
      color: 'rgba(255,255,255,.6)',
      cursor: 'pointer',
      font: 'var(--text-lg)/1 var(--font-body)',
      padding: 0
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/** Hover/focus label. */
function Tooltip({
  label,
  placement = 'top',
  children,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translate(-50%,-6px)'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translate(-50%,6px)'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translate(-6px,-50%)'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translate(6px,-50%)'
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      ...pos,
      zIndex: 40,
      pointerEvents: 'none',
      padding: 'var(--space-1-5) var(--space-2-5)',
      background: 'var(--surface-ink)',
      color: 'var(--text-inverse)',
      font: 'var(--type-caption)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-md)',
      whiteSpace: 'nowrap',
      opacity: open ? 1 : 0,
      transition: `opacity var(--duration-fast) var(--ease-standard)`
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square checkbox with inline label. */
function Checkbox({
  label,
  description,
  checked,
  indeterminate = false,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const autoId = React.useId ? React.useId() : 'c';
  const fieldId = id || autoId;
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2-5)',
      alignItems: description ? 'flex-start' : 'center',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    id: fieldId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    style: {
      appearance: 'none',
      width: 18,
      height: 18,
      margin: 0,
      flex: '0 0 auto',
      marginTop: description ? 2 : 0,
      border: `1px solid ${checked || indeterminate ? 'var(--surface-brand)' : 'var(--border-strong)'}`,
      background: checked || indeterminate ? 'var(--surface-brand)' : 'var(--surface-card)',
      borderRadius: 'var(--radius-xs)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'var(--transition-control)',
      backgroundImage: checked ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>\")" : indeterminate ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round'><line x1='6' y1='12' x2='18' y2='12'/></svg>\")" : 'none',
      backgroundSize: '14px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }, rest)), (label || description) && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-primary)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
/** Exclusive choice group. */
function Radio({
  name,
  options = [],
  value,
  onChange,
  layout = 'stack',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    style: {
      display: 'flex',
      flexDirection: layout === 'row' ? 'row' : 'column',
      gap: layout === 'row' ? 'var(--space-5)' : 'var(--space-2-5)',
      flexWrap: 'wrap',
      ...style
    }
  }, options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const l = typeof o === 'string' ? o : o.label;
    const d = typeof o === 'string' ? null : o.description;
    const on = value === v;
    return /*#__PURE__*/React.createElement("label", {
      key: v,
      style: {
        display: 'flex',
        gap: 'var(--space-2-5)',
        alignItems: d ? 'flex-start' : 'center',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: name,
      value: v,
      checked: on,
      onChange: () => onChange && onChange(v),
      style: {
        appearance: 'none',
        width: 18,
        height: 18,
        margin: 0,
        flex: '0 0 auto',
        marginTop: d ? 2 : 0,
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'var(--transition-control)',
        border: `1px solid ${on ? 'var(--surface-brand)' : 'var(--border-strong)'}`,
        background: 'var(--surface-card)',
        boxShadow: on ? 'inset 0 0 0 4px var(--surface-brand)' : 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-body-sm)',
        color: 'var(--text-primary)'
      }
    }, l), d && /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--text-muted)'
      }
    }, d)));
  }));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/SelectField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Shell({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1-5)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-primary)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-danger)',
      marginInlineStart: 3
    }
  }, "*")), children, (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: error ? 'var(--text-danger)' : 'var(--text-muted)'
    }
  }, error || hint));
}

/** Native select in the brand control shell. */
function SelectField({
  label,
  hint,
  error,
  required = false,
  size = 'md',
  options = [],
  placeholder,
  id,
  className,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId ? React.useId() : 's';
  const fieldId = id || autoId;
  const h = {
    sm: 'var(--control-h-sm)',
    md: 'var(--control-h-md)',
    lg: 'var(--control-h-lg)'
  }[size] || 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement(Shell, {
    label: label,
    hint: hint,
    error: error,
    required: required,
    htmlFor: fieldId,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      position: 'relative',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    required: required,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      width: '100%',
      height: h,
      padding: '0 var(--space-8) 0 var(--space-3)',
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      font: 'var(--type-body-sm)',
      border: `1px solid ${error ? 'var(--border-danger)' : focus ? 'var(--border-brand)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-control)',
      boxShadow: focus ? 'var(--shadow-focus)' : 'none',
      transition: 'var(--transition-control)',
      cursor: 'pointer'
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const l = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      insetInlineEnd: 'var(--space-3)',
      top: '50%',
      marginTop: -3,
      width: 8,
      height: 8,
      borderInlineEnd: '1.5px solid var(--text-muted)',
      borderBottom: '1.5px solid var(--text-muted)',
      transform: 'rotate(45deg)',
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { SelectField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SelectField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Instant-effect binary toggle. */
function Switch({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: description ? 'flex-start' : 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: 40,
      height: 22,
      flex: '0 0 auto',
      marginTop: description ? 1 : 0,
      padding: 2,
      border: 0,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--surface-brand)' : 'var(--ma-neutral-300)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color var(--duration-base) var(--ease-standard)',
      display: 'flex',
      justifyContent: checked ? 'flex-end' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-xs)',
      transition: 'transform var(--duration-base) var(--ease-standard)'
    }
  })), (label || description) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-primary)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Shell({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1-5)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-primary)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-danger)',
      marginInlineStart: 3
    }
  }, "*")), children, (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: error ? 'var(--text-danger)' : 'var(--text-muted)'
    }
  }, error || hint));
}
const heights = {
  sm: 'var(--control-h-sm)',
  md: 'var(--control-h-md)',
  lg: 'var(--control-h-lg)'
};

/** Single-line or multi-line text input with label, hint and error. */
function TextField({
  label,
  hint,
  error,
  required = false,
  size = 'md',
  multiline = false,
  rows = 4,
  iconStart,
  id,
  className,
  style,
  inputStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId ? React.useId() : 'f';
  const fieldId = id || autoId;
  const Tag = multiline ? 'textarea' : 'input';
  const shell = {
    display: 'flex',
    alignItems: multiline ? 'flex-start' : 'center',
    gap: 'var(--space-2)',
    minHeight: multiline ? undefined : heights[size],
    padding: multiline ? 'var(--space-3)' : `0 var(--space-3)`,
    background: 'var(--surface-card)',
    border: `1px solid ${error ? 'var(--border-danger)' : focus ? 'var(--border-brand)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-control)',
    boxShadow: focus ? error ? 'var(--shadow-focus-danger)' : 'var(--shadow-focus)' : 'none',
    transition: 'var(--transition-control)'
  };
  return /*#__PURE__*/React.createElement(Shell, {
    label: label,
    hint: hint,
    error: error,
    required: required,
    htmlFor: fieldId,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: className,
    style: shell
  }, iconStart && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      display: 'flex',
      paddingTop: multiline ? 2 : 0
    }
  }, iconStart), /*#__PURE__*/React.createElement(Tag, _extends({
    id: fieldId,
    rows: multiline ? rows : undefined,
    required: required,
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      flex: 1,
      width: '100%',
      border: 0,
      outline: 0,
      background: 'transparent',
      font: 'var(--type-body-sm)',
      color: 'var(--text-primary)',
      padding: 0,
      resize: multiline ? 'vertical' : undefined,
      lineHeight: multiline ? 'var(--leading-body)' : undefined,
      ...inputStyle
    }
  }, rest))));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Hierarchical trail. */
function Breadcrumb({
  items = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    "aria-label": "Breadcrumb",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      flexWrap: 'wrap',
      ...style
    }
  }, rest), items.map((it, i) => {
    const last = i === items.length - 1;
    const label = typeof it === 'string' ? it : it.label;
    const href = typeof it === 'string' ? undefined : it.href;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: label + i
    }, last || !href ? /*#__PURE__*/React.createElement("span", {
      "aria-current": last ? 'page' : undefined,
      style: {
        font: `${last ? 'var(--weight-semibold)' : 'var(--weight-regular)'} var(--text-2xs)/1.3 var(--font-body)`,
        color: last ? 'var(--text-primary)' : 'var(--text-muted)'
      }
    }, label) : /*#__PURE__*/React.createElement("a", {
      href: href,
      style: {
        font: 'var(--weight-regular) var(--text-2xs)/1.3 var(--font-body)',
        color: 'var(--text-muted)',
        textDecoration: 'none'
      }
    }, label), !last && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        color: 'var(--ma-neutral-300)',
        font: 'var(--text-2xs)/1 var(--font-body)'
      }
    }, "/"));
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Underlined tab bar. */
function Tabs({
  items = [],
  value,
  onChange,
  size = 'md',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--space-6)',
      borderBottom: '1px solid var(--border-default)',
      ...style
    }
  }, rest), items.map(it => {
    const v = typeof it === 'string' ? it : it.value;
    const l = typeof it === 'string' ? it : it.label;
    const count = typeof it === 'string' ? null : it.count;
    const on = value === v;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(v),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: size === 'sm' ? 'var(--space-2) 0' : 'var(--space-3) 0',
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        font: `var(--weight-semibold) ${size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)'}/1.3 var(--font-body)`,
        color: on ? 'var(--text-brand)' : 'var(--text-secondary)',
        boxShadow: on ? 'inset 0 -2px 0 0 var(--surface-brand)' : 'none',
        transition: 'var(--transition-control)',
        whiteSpace: 'nowrap'
      }
    }, l, count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--weight-semibold) var(--text-3xs)/1 var(--font-body)',
        background: on ? 'var(--surface-brand-soft)' : 'var(--surface-sunken)',
        color: on ? 'var(--ma-maroon-700)' : 'var(--text-muted)',
        padding: '3px 6px',
        borderRadius: 'var(--radius-chip)'
      }
    }, count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Modal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Centred dialog over a scrim. */
function Modal({
  open = true,
  title,
  description,
  onClose,
  footer,
  width = 520,
  children,
  style,
  ...rest
}) {
  React.useEffect(() => {
    if (!open || !onClose) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      background: 'var(--surface-overlay)',
      backdropFilter: 'blur(2px)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === 'string' ? title : undefined,
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: width,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-surface)',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-4)',
      padding: 'var(--space-6) var(--space-6) var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1-5)'
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-heading-3)',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      margin: 0
    }
  }, description)), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: 0,
      background: 'transparent',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      font: 'var(--text-xl)/1 var(--font-body)',
      padding: 0
    }
  }, "\xD7")), children && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-6) var(--space-6)',
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-2)',
      padding: 'var(--space-4) var(--space-6)',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--surface-page-alt)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Modal.jsx", error: String((e && e.message) || e) }); }

// tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // data-om-starter: inert presence marker — Claude Design's starter-usage
  // probe reads it. The closed panel renders nothing, so the marker rides
  // the <html> element as an attribute instead of a rendered node — zero
  // elements added, so page CSS (even structural selectors like
  // :nth-child) can never observe it. It records that the page WIRES a
  // tweaks panel, whether or not the panel is open. Keep this effect.
  React.useEffect(() => {
    document.documentElement.setAttribute('data-om-starter', 'tweaks-panel');
    return () => document.documentElement.removeAttribute('data-om-starter');
  }, []);
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/CertificatesScreen.jsx
try { (() => {
const {
  Card,
  Badge,
  Button,
  Icon,
  DataTable,
  SelectField,
  TextField,
  Tag,
  Switch,
  ProgressMeter
} = window.MedicalAllianceDesignSystem_32f8e4;
function CertificatesScreen() {
  const [alerts, setAlerts] = React.useState(true);
  const rows = [{
    ref: 'CT-2026-0841',
    id: 'MA-40118',
    name: 'A. Al-Harbi',
    site: 'Jazan Site 4',
    issued: '12 Sep 2026',
    expires: '14 Mar 2027',
    status: 'Valid',
    tone: 'success'
  }, {
    ref: 'CT-2026-0837',
    id: 'MA-40207',
    name: 'R. Menon',
    site: 'Yanbu Terminal',
    issued: '02 Jun 2026',
    expires: '02 Dec 2026',
    status: 'Expiring',
    tone: 'warning'
  }, {
    ref: 'CT-2026-0790',
    id: 'MA-40311',
    name: 'K. Ahmed',
    site: 'Riyadh Depot',
    issued: '28 Jan 2026',
    expires: '28 Jul 2027',
    status: 'Valid',
    tone: 'success'
  }, {
    ref: 'CT-2025-0612',
    id: 'MA-39884',
    name: 'S. Okonkwo',
    site: 'Jazan Site 4',
    issued: '19 Nov 2025',
    expires: '19 May 2026',
    status: 'Expired',
    tone: 'danger'
  }, {
    ref: 'CT-2026-0855',
    id: 'MA-40402',
    name: 'M. Haddad',
    site: 'Tabuk Camp 2',
    issued: '—',
    expires: '—',
    status: 'Pending',
    tone: 'neutral'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PortalTopBar, {
    title: "Certificates",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconStart: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      })
    }, "Export register")
  }), /*#__PURE__*/React.createElement(PortalBody, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: 'var(--space-5)',
      alignItems: 'start',
      maxWidth: 1180
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Search",
    placeholder: "Certificate, worker ID or name",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(SelectField, {
    label: "Site",
    placeholder: "All sites",
    options: ['Jazan Site 4', 'Yanbu Terminal', 'Riyadh Depot', 'Tabuk Camp 2']
  }), /*#__PURE__*/React.createElement(SelectField, {
    label: "Status",
    placeholder: "All statuses",
    options: ['Valid', 'Expiring', 'Expired', 'Pending']
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-4)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, "Active filters"), /*#__PURE__*/React.createElement(Tag, {
    onRemove: () => {}
  }, "Expiring in 30 days"), /*#__PURE__*/React.createElement(Tag, {
    onRemove: () => {}
  }, "Jazan Site 4"))), /*#__PURE__*/React.createElement(DataTable, {
    caption: "Certificate register \u2014 76 records, 5 shown",
    onRowClick: () => {},
    columns: [{
      key: 'ref',
      header: 'Certificate',
      mono: true,
      width: '138px'
    }, {
      key: 'id',
      header: 'Worker',
      mono: true,
      width: '108px'
    }, {
      key: 'name',
      header: 'Name'
    }, {
      key: 'site',
      header: 'Site'
    }, {
      key: 'expires',
      header: 'Expires',
      align: 'end',
      numeric: true
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone,
        dot: true
      }, r.status)
    }],
    rows: rows
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Register health",
    title: null,
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Valid",
    valueLabel: "58 / 76",
    value: 58,
    max: 76,
    tone: "success"
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Expiring in 30 days",
    valueLabel: "12 / 76",
    value: 12,
    max: 76,
    tone: "warning"
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Expired",
    valueLabel: "6 / 76",
    value: 6,
    max: 76,
    tone: "danger"
  }))), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Notifications",
    title: null,
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    label: "Expiry alerts",
    description: "Email site supervisors 30 days before a certificate lapses",
    checked: alerts,
    onChange: setAlerts
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Weekly register digest",
    checked: false,
    onChange: () => {}
  })))))));
}
Object.assign(window, {
  CertificatesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/CertificatesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/DashboardScreen.jsx
try { (() => {
const {
  StatTile,
  Card,
  DataTable,
  Badge,
  Button,
  Icon,
  Alert,
  ProgressMeter,
  Tabs
} = window.MedicalAllianceDesignSystem_32f8e4;
const WORKERS = [{
  id: 'MA-40118',
  name: 'A. Al-Harbi',
  site: 'Jazan Site 4',
  exam: 'Periodic',
  status: 'Fit for duty',
  tone: 'success',
  expires: '14 Mar 2027'
}, {
  id: 'MA-40207',
  name: 'R. Menon',
  site: 'Yanbu Terminal',
  exam: 'Return to work',
  status: 'Fit with restrictions',
  tone: 'warning',
  expires: '02 Dec 2026'
}, {
  id: 'MA-39884',
  name: 'S. Okonkwo',
  site: 'Jazan Site 4',
  exam: 'Periodic',
  status: 'Not fit',
  tone: 'danger',
  expires: '—'
}, {
  id: 'MA-40311',
  name: 'K. Ahmed',
  site: 'Riyadh Depot',
  exam: 'Pre-placement',
  status: 'Fit for duty',
  tone: 'success',
  expires: '28 Jul 2027'
}, {
  id: 'MA-40402',
  name: 'M. Haddad',
  site: 'Tabuk Camp 2',
  exam: 'Periodic',
  status: 'Pending review',
  tone: 'neutral',
  expires: '—'
}];
function DashboardScreen({
  onOpenWorker
}) {
  const [tab, setTab] = React.useState('due');
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PortalTopBar, {
    title: "Dashboard",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      iconStart: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 15
      })
    }, "New examination")
  }), /*#__PURE__*/React.createElement(PortalBody, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      maxWidth: 1180
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "4 certificates expire in the next 30 days",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-clock",
      size: 18
    }),
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Review schedule")
  }, "Jazan Site 4 and Yanbu Terminal have workers due for periodic examination."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Workers cleared",
    value: "1,284",
    delta: "42 this week",
    deltaDirection: "up",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "shield-check",
      size: 18
    })
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Due in 30 days",
    value: "76",
    unit: "workers",
    tone: "brand",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-clock",
      size: 18
    })
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Restricted",
    value: "31",
    delta: "3 vs last month",
    deltaDirection: "down",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 18
    })
  }), /*#__PURE__*/React.createElement(StatTile, {
    tone: "ink",
    label: "Active site clinics",
    value: "7",
    footnote: "3 remote \xB7 4 industrial"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.55fr 1fr',
      gap: 'var(--space-5)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-5) 0'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    size: "sm",
    items: [{
      value: 'due',
      label: 'Due for review',
      count: 5
    }, {
      value: 'recent',
      label: 'Recently issued',
      count: 18
    }, {
      value: 'flagged',
      label: 'Flagged',
      count: 2
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    onRowClick: r => onOpenWorker(r),
    style: {
      border: 0,
      borderRadius: 0
    },
    columns: [{
      key: 'id',
      header: 'Worker ID',
      mono: true,
      width: '118px'
    }, {
      key: 'name',
      header: 'Name'
    }, {
      key: 'site',
      header: 'Site'
    }, {
      key: 'status',
      header: 'Fitness',
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone,
        dot: true
      }, r.status)
    }, {
      key: 'expires',
      header: 'Expires',
      align: 'end',
      numeric: true
    }],
    rows: WORKERS
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Programme",
    title: "Screening coverage"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Periodic \u2014 all sites",
    valueLabel: "164 / 200",
    value: 164,
    max: 200
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Audiometry",
    valueLabel: "91%",
    value: 91,
    tone: "success"
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Spirometry",
    valueLabel: "64%",
    value: 64,
    tone: "info"
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Stock \u2014 Site 4",
    valueLabel: "38%",
    value: 38,
    tone: "warning"
  }))), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Today",
    title: "Clinic schedule",
    footer: "Jazan Site 4 \xB7 Dr N. Al-Qahtani"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, [['08:30', 'Pre-placement × 4', 'shield-check'], ['10:00', 'Audiometry block', 'ear'], ['13:00', 'Return-to-work review', 'clipboard-check'], ['15:30', 'Stock count', 'package']].map(([t, l, ic], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-2-5) 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-mono)',
      color: 'var(--text-muted)',
      width: 44
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)'
    }
  }, l))))))))));
}
Object.assign(window, {
  DashboardScreen,
  WORKERS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/LoginScreen.jsx
try { (() => {
const {
  Logo,
  Button,
  TextField,
  Checkbox,
  Icon,
  Card
} = window.MedicalAllianceDesignSystem_32f8e4;
function LoginScreen({
  onSignIn
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 46%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-12)',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSignIn();
    },
    style: {
      width: '100%',
      maxWidth: 360,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: PLOGO,
    height: 32,
    style: {
      marginBottom: 'var(--space-4)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-heading-2)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "Occupational health portal"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      marginTop: 'var(--space-2)'
    }
  }, "Sign in with your Medical Alliance clinical account.")), /*#__PURE__*/React.createElement(TextField, {
    label: "Work email",
    required: true,
    defaultValue: "n.alqahtani@medicalalliance.example",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Password",
    type: "password",
    required: true,
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 16
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Keep me signed in"
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      font: 'var(--weight-semibold) var(--text-xs)/1 var(--font-body)'
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    size: "lg",
    fullWidth: true
  }, "Sign in"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, "Access is logged. Clinical records are retained to the applicable schedule."))), /*#__PURE__*/React.createElement("div", {
    className: "ma-ink",
    style: {
      flex: 1,
      background: 'var(--ma-maroon-950)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 'var(--space-12)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: PLOGO + '/ma-mark-white.png',
    alt: "",
    style: {
      position: 'absolute',
      top: '-8%',
      right: '-14%',
      height: '92%',
      width: 'auto',
      opacity: .10
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: '34ch',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'var(--ma-maroon-200)'
    }
  }, "Medical Alliance"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-display-3)',
      color: '#fff',
      letterSpacing: 'var(--tracking-tight)',
      textWrap: 'balance'
    }
  }, "One record per worker, from pre-placement to exit."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body)',
      color: 'rgba(255,255,255,.66)'
    }
  }, "Examinations, restrictions, certificates and site coverage in a single audit-ready file."))));
}
Object.assign(window, {
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/PortalChrome.jsx
try { (() => {
const {
  Logo,
  Icon,
  Badge,
  IconButton,
  Breadcrumb
} = window.MedicalAllianceDesignSystem_32f8e4;
const PLOGO = '../../assets/logo';
const SECTIONS = [{
  h: 'Operations',
  items: [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'layout-dashboard'
  }, {
    id: 'workers',
    label: 'Workers',
    icon: 'users',
    count: 1284
  }, {
    id: 'certificates',
    label: 'Certificates',
    icon: 'file-badge',
    count: 76
  }]
}, {
  h: 'Sites',
  items: [{
    id: 'clinics',
    label: 'Site clinics',
    icon: 'building-2'
  }, {
    id: 'stock',
    label: 'Stock and equipment',
    icon: 'package'
  }]
}, {
  h: 'Account',
  items: [{
    id: 'settings',
    label: 'Settings',
    icon: 'settings'
  }]
}];
function PortalSidebar({
  route,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-w)',
      flex: '0 0 auto',
      background: 'var(--ma-maroon-950)',
      borderInlineEnd: '1px solid rgba(255,255,255,.08)',
      display: 'flex',
      flexDirection: 'column'
    },
    className: "ma-ink"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-5)',
      borderBottom: '1px solid rgba(255,255,255,.08)'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: PLOGO,
    tone: "white",
    height: 26
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      padding: 'var(--space-5) var(--space-3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      flex: 1,
      overflow: 'auto'
    }
  }, SECTIONS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.h,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,.42)',
      padding: '0 var(--space-3) var(--space-2)'
    }
  }, s.h), s.items.map(it => {
    const on = route === it.id;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onNavigate(it.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        width: '100%',
        padding: 'var(--space-2-5) var(--space-3)',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'start',
        background: on ? 'var(--ma-maroon-600)' : 'transparent',
        color: on ? '#fff' : 'rgba(255,255,255,.72)',
        font: `${on ? 'var(--weight-semibold)' : 'var(--weight-regular)'} var(--text-sm)/1 var(--font-body)`,
        transition: 'var(--transition-control)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 17
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, it.label), it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--weight-semibold) var(--text-3xs)/1 var(--font-mono)',
        color: on ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.42)'
      }
    }, it.count.toLocaleString()));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-4) var(--space-5)',
      borderTop: '1px solid rgba(255,255,255,.08)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'var(--ma-maroon-600)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      font: 'var(--weight-bold) var(--text-2xs)/1 var(--font-body)'
    }
  }, "DN"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--weight-semibold) var(--text-xs)/1.3 var(--font-body)',
      color: '#fff'
    }
  }, "Dr N. Al-Qahtani"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'rgba(255,255,255,.5)'
    }
  }, "Clinical lead")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-up",
    size: 15,
    style: {
      color: 'rgba(255,255,255,.5)'
    }
  })));
}
function PortalTopBar({
  title,
  crumbs,
  actions
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--topbar-h)',
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '0 var(--space-8)',
      background: 'var(--surface-page)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, crumbs && /*#__PURE__*/React.createElement(Breadcrumb, {
    items: crumbs,
    style: {
      marginBottom: 2
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-heading-3)'
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      height: 'var(--control-h-md)',
      padding: '0 var(--space-3)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-control)',
      color: 'var(--text-muted)',
      font: 'var(--type-body-sm)',
      width: 240
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), " Search workers or IDs"), /*#__PURE__*/React.createElement(IconButton, {
    label: "Notifications",
    variant: "ghost",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 18
    })
  }), actions);
}
function PortalShell({
  route,
  onNavigate,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--surface-page-alt)'
    }
  }, /*#__PURE__*/React.createElement(PortalSidebar, {
    route: route,
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, children));
}
function PortalBody({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 'var(--space-8)',
      ...style
    }
  }, children);
}
Object.assign(window, {
  PortalSidebar,
  PortalTopBar,
  PortalShell,
  PortalBody,
  SECTIONS,
  PLOGO
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/PortalChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/WorkerScreen.jsx
try { (() => {
const {
  Card,
  Badge,
  Button,
  IconButton,
  Icon,
  Tabs,
  DataTable,
  Radio,
  TextField,
  Modal,
  Toast,
  Tag,
  Alert
} = window.MedicalAllianceDesignSystem_32f8e4;
function WorkerScreen({
  worker,
  onBack
}) {
  const w = worker || WORKERS[0];
  const [tab, setTab] = React.useState('overview');
  const [outcome, setOutcome] = React.useState('restricted');
  const [issuing, setIssuing] = React.useState(false);
  const [issued, setIssued] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PortalTopBar, {
    title: w.name,
    crumbs: [{
      label: 'Workers',
      href: '#'
    }, {
      label: w.site,
      href: '#'
    }, w.id],
    actions: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--space-2)'
      }
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Print record",
      variant: "secondary",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "printer",
        size: 17
      })
    }), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setIssuing(true)
    }, "Issue certificate"))
  }), /*#__PURE__*/React.createElement(PortalBody, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 'var(--space-5)',
      alignItems: 'start',
      maxWidth: 1180
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, w.tone === 'danger' && /*#__PURE__*/React.createElement(Alert, {
    tone: "danger",
    title: "Not fit for duty",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 18
    })
  }, "Site supervisor notified 11 Sep 2026. Review scheduled in 14 days."), /*#__PURE__*/React.createElement(Card, {
    padding: "0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-5) 0'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      value: 'overview',
      label: 'Overview'
    }, {
      value: 'exams',
      label: 'Examinations',
      count: 12
    }, {
      value: 'certs',
      label: 'Certificates',
      count: 4
    }, {
      value: 'notes',
      label: 'Clinical notes'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5)'
    }
  }, tab === 'exams' || tab === 'certs' ? /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    style: {
      border: 0,
      borderRadius: 0
    },
    columns: [{
      key: 'ref',
      header: tab === 'certs' ? 'Certificate' : 'Reference',
      mono: true,
      width: '140px'
    }, {
      key: 'type',
      header: 'Type'
    }, {
      key: 'date',
      header: 'Date',
      numeric: true
    }, {
      key: 'status',
      header: 'Result',
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone,
        dot: true
      }, r.status)
    }],
    rows: [{
      ref: 'EX-2026-1184',
      type: 'Periodic examination',
      date: '12 Sep 2026',
      status: 'Fit with restrictions',
      tone: 'warning'
    }, {
      ref: 'EX-2025-0912',
      type: 'Periodic examination',
      date: '08 Sep 2025',
      status: 'Fit for duty',
      tone: 'success'
    }, {
      ref: 'EX-2025-0410',
      type: 'Return to work',
      date: '22 Apr 2025',
      status: 'Fit for duty',
      tone: 'success'
    }, {
      ref: 'EX-2024-0733',
      type: 'Pre-placement',
      date: '03 Jul 2024',
      status: 'Fit for duty',
      tone: 'success'
    }]
  }) : tab === 'notes' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Add a clinical note",
    multiline: true,
    rows: 3,
    placeholder: "Findings, restrictions, review interval"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary"
  }, "Save note")), [['12 Sep 2026', 'Dr N. Al-Qahtani', 'Hearing threshold shift at 4 kHz, left. Restriction: no continuous exposure above 85 dB(A) without double protection. Review in 12 weeks.'], ['08 Sep 2025', 'Dr N. Al-Qahtani', 'All parameters within range. No restrictions.']].map(([d, a, t]) => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, d), /*#__PURE__*/React.createElement("span", null, a)), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, t)))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-5) var(--space-8)'
    }
  }, [['Worker ID', w.id, true], ['Site', w.site], ['Role', 'Process operator'], ['Employer', 'Gulf Industrial Services'], ['Date of birth', '14 Feb 1991'], ['Last examination', '12 Sep 2026'], ['Next due', '12 Sep 2027'], ['Certificate expires', w.expires]].map(([k, v, mono]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      font: mono ? 'var(--type-mono)' : 'var(--type-body)',
      marginTop: 3
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 6
    }
  }, "Surveillance programme"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, ['Audiometry', 'Spirometry', 'Vision', 'Heat stress', 'Biological monitoring'].map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t
  }, t)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "sunken",
    eyebrow: "Current status",
    title: null,
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: w.tone,
    dot: true
  }, w.status), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-3)'
    }
  }, "Recorded 12 Sep 2026 \xB7 valid to ", w.expires)), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "This visit",
    title: "Record outcome",
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "outcome",
    value: outcome,
    onChange: setOutcome,
    style: {
      marginTop: 'var(--space-2)'
    },
    options: [{
      value: 'fit',
      label: 'Fit for duty'
    }, {
      value: 'restricted',
      label: 'Fit with restrictions',
      description: 'Record the restriction and review date'
    }, {
      value: 'unfit',
      label: 'Not fit'
    }]
  }), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    style: {
      marginTop: 'var(--space-4)'
    },
    onClick: () => setIssuing(true)
  }, "Save and issue")), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Attachments",
    title: null,
    padding: "var(--space-5)"
  }, [['Audiometry report', 'PDF · 240 KB'], ['Spirometry trace', 'PDF · 118 KB'], ['Consent form', 'PDF · 84 KB']].map(([n, m], i) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-2-5) 0',
      borderTop: i ? '1px solid var(--border-subtle)' : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-sm)'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, m)), /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 15,
    style: {
      color: 'var(--text-muted)'
    }
  })))), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onBack,
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 16
    })
  }, "Back to dashboard")))), /*#__PURE__*/React.createElement(Modal, {
    open: issuing,
    onClose: () => setIssuing(false),
    width: 460,
    title: "Issue fitness certificate",
    description: "This record will be locked once the certificate is issued.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setIssuing(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      onClick: () => {
        setIssuing(false);
        setIssued(true);
      }
    }, "Issue certificate"))
  }, w.name, " \xB7 ", w.id, " \xB7 Periodic examination \xB7 12 Sep 2026"), issued && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      insetInlineEnd: 'var(--space-6)',
      bottom: 'var(--space-6)',
      zIndex: 70
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: "Certificate issued",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }),
    onDismiss: () => setIssued(false)
  }, w.id, " \xB7 valid to 14 Mar 2027")));
}
Object.assign(window, {
  WorkerScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/WorkerScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ContactScreen.jsx
try { (() => {
const {
  Card,
  Icon,
  Button,
  TextField,
  SelectField,
  Checkbox,
  SectionHeading,
  Breadcrumb,
  Toast,
  Badge
} = window.MedicalAllianceDesignSystem_32f8e4;
function ContactScreen() {
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement(Container, {
    style: {
      paddingTop: 'var(--space-10)',
      paddingBottom: 'var(--section-y)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: 'Home',
      href: '#'
    }, 'Contact'],
    style: {
      marginBottom: 'var(--space-5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr .9fr',
      gap: 'var(--space-16)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Contact",
    title: "Request a consultation or site assessment",
    lead: "Tell us the operation, the headcount and the location. We respond within one working day."
  }), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Full name",
    required: true,
    placeholder: "Name"
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Organisation",
    required: true,
    placeholder: "Company or facility"
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Work email",
    required: true,
    placeholder: "name@company.com",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Phone",
    placeholder: "+966",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "phone",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(SelectField, {
    label: "What do you need?",
    placeholder: "Select a service",
    options: ['Remote-site medical cover', 'Occupational health programme', 'Facility equipping or management', 'Training and consultancy', 'Medical supplies', 'Something else']
  }), /*#__PURE__*/React.createElement(SelectField, {
    label: "Approximate headcount",
    placeholder: "Select a range",
    options: ['Under 50', '50–250', '250–1,000', 'Over 1,000']
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Site and scope",
    multiline: true,
    rows: 4,
    placeholder: "Location, shift pattern, hazard profile, distance to the nearest hospital"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "This site operates 24 hours",
    description: "We will scope night cover and on-call escalation"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    size: "lg"
  }, "Send request"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, "We reply within one working day.")))), sent && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      insetInlineEnd: 'var(--space-6)',
      bottom: 'var(--space-6)',
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: "Request received",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }),
    onDismiss: () => setSent(false)
  }, "A clinical lead will contact you within one working day."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "ink"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-heading-4)'
    }
  }, "Emergency and out of hours"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'rgba(255,255,255,.72)'
    }
  }, "Existing clients with a site clinic use the 24-hour clinical line."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-2)',
      font: 'var(--type-heading-3)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "siren",
    size: 20
  }), " +966 11 000 0911")), [['map-pin', 'Head office', 'Riyadh, Saudi Arabia'], ['mail', 'General enquiries', 'info@medicalalliance.example'], ['clock', 'Office hours', 'Sun–Thu, 08:00–17:00 AST']].map(([ic, t, v]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)',
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)'
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      marginTop: 2
    }
  }, v))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "ISO 9001"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "MoH licensed"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "CME accredited"))))));
}
Object.assign(window, {
  ContactScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ContactScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomeScreen.jsx
try { (() => {
const {
  Button,
  Card,
  Icon,
  Badge,
  SectionHeading,
  StatTile
} = window.MedicalAllianceDesignSystem_32f8e4;
const SERVICES = [{
  icon: 'stethoscope',
  title: 'Medical and health consultations',
  body: 'Clinical advice for individuals, employers and healthcare operators.'
}, {
  icon: 'hard-hat',
  title: 'Occupational health',
  body: 'Fitness assessments, surveillance programmes and certificate issuance.'
}, {
  icon: 'graduation-cap',
  title: 'Training and consultancy',
  body: 'Courses in medicine, public and private health, and occupational health.'
}, {
  icon: 'building-2',
  title: 'Facility equipping and management',
  body: 'Hospitals and medical centres — set-up, staffing and operating standards.'
}, {
  icon: 'users',
  title: 'Forums and conferences',
  body: 'Organisation, delivery and supervision of medical professional events.'
}, {
  icon: 'package',
  title: 'Medical equipment and supplies',
  body: 'Procurement and supply of equipment, consumables and medication.'
}];
function HomeScreen({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("section", {
    className: "ma-ink",
    style: {
      background: 'var(--ma-maroon-950)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: .09,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO + '/ma-mark-white.png',
    alt: "",
    style: {
      height: '150%',
      width: 'auto',
      transform: 'translateX(14%)'
    }
  })), /*#__PURE__*/React.createElement(Container, {
    style: {
      position: 'relative',
      paddingTop: 'var(--space-24)',
      paddingBottom: 'var(--space-24)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '22ch',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'var(--ma-maroon-200)'
    }
  }, "Healthcare services \xB7 Medical consultancy"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-display-1)',
      letterSpacing: 'var(--tracking-tightest)',
      margin: 0,
      textWrap: 'balance'
    }
  }, "Medical cover, wherever the work is."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-lg)',
      color: 'var(--text-secondary)',
      maxWidth: '46ch'
    }
  }, "Occupational health, facility management and remote-site clinical services for hospitals, corporate employers and industrial operations."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => onNavigate('contact'),
    iconEnd: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, "Request a site assessment"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    onClick: () => onNavigate('services'),
    style: {
      background: 'transparent',
      color: '#fff',
      borderColor: 'rgba(255,255,255,.32)'
    }
  }, "Our services")))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid rgba(255,255,255,.10)'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 'var(--space-6)',
      paddingTop: 'var(--space-6)',
      paddingBottom: 'var(--space-6)'
    }
  }, [['7', 'Site clinics operated'], ['1,284', 'Workers cleared this year'], ['24/7', 'Emergency response cover'], ['12', 'Years in occupational health']].map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-heading-2)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, v), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, l)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--section-y) 0'
    }
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "What we do",
    title: "Six service lines, one standard of care",
    lead: "Every engagement is run against the same clinical governance, documentation and audit expectations."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-10)'
    }
  }, SERVICES.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.title,
    interactive: true,
    onClick: () => onNavigate('services')
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)',
      marginBottom: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 26
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-heading-4)'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, s.body)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-page-alt)',
      borderBlock: '1px solid var(--border-subtle)',
      padding: 'var(--section-y) 0'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-16)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Remote-site medical",
    title: "A clinic, a doctor and a plan \u2014 on your site",
    lead: "For operations in remote locations, industrial sites and other challenging work environments."
  }), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, ['First aid, emergency care and stabilisation of injured or ill workers', 'Site clinic operation, with medication, supplies and equipment maintained', 'Fitness-for-work assessment and management of routine illness and minor injury', 'Occupational health input into site health and safety'].map(t => /*#__PURE__*/React.createElement("li", {
    key: t,
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      font: 'var(--type-body)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)',
      paddingTop: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 17
  })), t))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => onNavigate('remote'),
    iconEnd: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    })
  }, "How site cover works"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    height: 260,
    label: "Photography: site clinic interior \u2014 cool neutral light, no staged smiles"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Median response",
    value: "6",
    unit: "min",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "siren",
      size: 18
    })
  }), /*#__PURE__*/React.createElement(StatTile, {
    tone: "brand",
    label: "Clinic uptime",
    value: "99.4",
    unit: "%"
  }))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--section-y) 0'
    }
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-brand)',
      borderRadius: 'var(--radius-surface)',
      color: '#fff',
      padding: 'var(--space-14) var(--space-12)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-10)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 320
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-heading-1)',
      letterSpacing: 'var(--tracking-tight)',
      color: '#fff',
      textWrap: 'balance'
    }
  }, "Tell us about your site and we will scope the cover."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-lg)',
      color: 'rgba(255,255,255,.82)',
      marginTop: 'var(--space-3)',
      maxWidth: '52ch'
    }
  }, "Assessments are returned within five working days, with a staffing model, equipment list and escalation plan.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "ink",
    onClick: () => onNavigate('contact')
  }, "Request a consultation"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    style: {
      background: 'transparent',
      color: '#fff',
      borderColor: 'rgba(255,255,255,.4)'
    },
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "phone-call",
      size: 17
    })
  }, "+966 11 000 0000"))))));
}
Object.assign(window, {
  HomeScreen,
  SERVICES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/RemoteSiteScreen.jsx
try { (() => {
const {
  Card,
  Icon,
  Badge,
  SectionHeading,
  Button,
  DataTable,
  Breadcrumb,
  Alert,
  ProgressMeter
} = window.MedicalAllianceDesignSystem_32f8e4;
const STEPS = [{
  icon: 'clipboard-check',
  t: 'Site assessment',
  b: 'Hazard profile, headcount, shift pattern, distance to definitive care.'
}, {
  icon: 'stethoscope',
  t: 'Staffing model',
  b: 'Doctor, paramedic or nurse cover matched to risk and roster.'
}, {
  icon: 'package',
  t: 'Clinic and stock',
  b: 'Equipment list, medication formulary and resupply schedule.'
}, {
  icon: 'siren',
  t: 'Escalation plan',
  b: 'Stabilisation, transfer routes and receiving facility agreements.'
}];
function RemoteSiteScreen({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("section", {
    className: "ma-ink",
    style: {
      background: 'var(--ma-maroon-900)',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      paddingTop: 'var(--space-12)',
      paddingBottom: 'var(--space-16)'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: 'Home',
      href: '#'
    }, {
      label: 'Services',
      href: '#'
    }, 'Remote sites'],
    style: {
      marginBottom: 'var(--space-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr',
      gap: 'var(--space-12)',
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'var(--ma-maroon-200)'
    }
  }, "Remote-site medical services"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-display-2)',
      letterSpacing: 'var(--tracking-tight)',
      margin: 'var(--space-4) 0 0',
      textWrap: 'balance'
    }
  }, "When the nearest hospital is two hours away"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-lg)',
      color: 'var(--text-secondary)',
      marginTop: 'var(--space-4)',
      maxWidth: '52ch'
    }
  }, "We place clinicians, clinics and escalation plans on industrial and remote sites, then run them to a documented standard.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, [['6 min', 'Median on-site response'], ['99.4%', 'Clinic uptime'], ['0', 'Reportable escalation failures'], ['24/7', 'Doctor availability']].map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      background: 'rgba(255,255,255,.05)',
      border: '1px solid rgba(255,255,255,.10)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-heading-2)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, l))))))), /*#__PURE__*/React.createElement(Container, {
    style: {
      paddingTop: 'var(--section-y-tight)',
      paddingBottom: 'var(--section-y-tight)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "How it works",
    title: "Four steps from assessment to standing cover"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-8)'
    }
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement(Card, {
    key: s.t
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 24
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-bold) var(--text-2xs)/1 var(--font-mono)',
      color: 'var(--ma-neutral-300)'
    }
  }, "0", i + 1)), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-heading-4)',
      marginTop: 'var(--space-2)'
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, s.b))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-page-alt)',
      borderBlock: '1px solid var(--border-subtle)',
      padding: 'var(--section-y-tight) 0'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr .9fr',
      gap: 'var(--space-12)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Current cover",
    title: "Live site register",
    level: 2
  }), /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'site',
      header: 'Site'
    }, {
      key: 'cover',
      header: 'Cover'
    }, {
      key: 'head',
      header: 'Headcount',
      align: 'end',
      numeric: true
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone,
        dot: true
      }, r.status)
    }],
    rows: [{
      site: 'Jazan Site 4',
      cover: 'Doctor + paramedic',
      head: '420',
      status: 'Operating',
      tone: 'success'
    }, {
      site: 'Yanbu Terminal',
      cover: 'Paramedic, on call',
      head: '186',
      status: 'Operating',
      tone: 'success'
    }, {
      site: 'Riyadh Depot',
      cover: 'Nurse, day shift',
      head: '92',
      status: 'Restocking',
      tone: 'warning'
    }, {
      site: 'Tabuk Camp 2',
      cover: 'Doctor, rotational',
      head: '310',
      status: 'Mobilising',
      tone: 'info'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "brand",
    title: "Mobilisation in 21 days",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-check",
      size: 18
    }),
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => onNavigate('contact')
    }, "Start an assessment")
  }, "Typical time from signed scope to a staffed, stocked clinic on site."), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-heading-4)'
    }
  }, "Readiness snapshot"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Formulary complete",
    valueLabel: "96%",
    value: 96,
    tone: "success"
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Equipment calibration",
    valueLabel: "88%",
    value: 88
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    label: "Stock \u2014 Site 4",
    valueLabel: "38%",
    value: 38,
    tone: "warning"
  })))))));
}
Object.assign(window, {
  RemoteSiteScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/RemoteSiteScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ServicesScreen.jsx
try { (() => {
const {
  Card,
  Icon,
  Badge,
  Tabs,
  SectionHeading,
  Button,
  Breadcrumb
} = window.MedicalAllianceDesignSystem_32f8e4;
const DETAIL = {
  consultations: {
    icon: 'stethoscope',
    title: 'Medical and health consultations',
    lead: 'Clinical consultation for individuals, employers and healthcare operators.',
    points: ['Individual and employer-referred consultations', 'Second opinion and case review', 'Health programme design for workforces']
  },
  occupational: {
    icon: 'hard-hat',
    title: 'Occupational health',
    lead: 'Assessment, surveillance and certification against the applicable schedule.',
    points: ['Pre-placement, periodic, return-to-work and exit examinations', 'Audiometry, spirometry, vision and biological monitoring', 'Medical fitness certificates with audit-ready records']
  },
  training: {
    icon: 'graduation-cap',
    title: 'Training and consultancy',
    lead: 'Courses and advisory in medicine, public and private health, and occupational health.',
    points: ['Accredited course delivery on client premises or ours', 'Curriculum and competency framework development', 'Clinical governance and quality advisory']
  },
  facilities: {
    icon: 'building-2',
    title: 'Equipping and management',
    lead: 'Hospitals and medical centres of all types — set up and kept running.',
    points: ['Facility planning, equipping and commissioning', 'Operational management and staffing models', 'Standards, resourcing and readiness reviews']
  },
  events: {
    icon: 'users',
    title: 'Forums and conferences',
    lead: 'Organisation, delivery and supervision of medical professional events.',
    points: ['Scientific programme and speaker management', 'On-site medical and logistics supervision', 'CME accreditation support']
  },
  supply: {
    icon: 'package',
    title: 'Equipment and supplies',
    lead: 'Procurement and supply of the resources that keep services running.',
    points: ['Equipment sourcing and lifecycle support', 'Consumables and medication supply', 'Stock control for remote and site clinics']
  }
};
function ServicesScreen({
  onNavigate
}) {
  const [tab, setTab] = React.useState('occupational');
  const d = DETAIL[tab];
  return /*#__PURE__*/React.createElement(Page, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-page-alt)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: 'var(--space-10) 0 var(--space-12)'
    }
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: 'Home',
      href: '#'
    }, 'Services'],
    style: {
      marginBottom: 'var(--space-5)'
    }
  }), /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Services",
    title: "What Medical Alliance delivers",
    lead: "Six service lines, each with defined scope, documentation and escalation. Select a line to see what is included."
  }))), /*#__PURE__*/React.createElement(Container, {
    style: {
      paddingTop: 'var(--space-8)',
      paddingBottom: 'var(--section-y)'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: Object.keys(DETAIL).map(k => ({
      value: k,
      label: DETAIL[k].title.split(' and ')[0]
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 'var(--space-12)',
      marginTop: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: d.icon,
    size: 34
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-heading-1)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, d.title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-lg)',
      color: 'var(--text-secondary)',
      maxWidth: 'var(--prose-max)'
    }
  }, d.lead), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 'var(--space-5)'
    }
  }, d.points.map(p => /*#__PURE__*/React.createElement("li", {
    key: p,
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      font: 'var(--type-body)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-brand)',
      paddingTop: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 17
  })), p))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onNavigate('contact')
  }, "Discuss this service"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconStart: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 16
    })
  }, "Capability statement"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    height: 220,
    label: "Photography: clinical detail \u2014 equipment, hands, documentation"
  }), /*#__PURE__*/React.createElement(Card, {
    tone: "sunken",
    eyebrow: "Governance",
    title: "How every engagement is run"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingInlineStart: 18,
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("li", null, "Named clinical lead and documented scope"), /*#__PURE__*/React.createElement("li", null, "Records retained to the applicable schedule"), /*#__PURE__*/React.createElement("li", null, "Monthly reporting and annual audit"))), /*#__PURE__*/React.createElement(Card, {
    tone: "brand",
    eyebrow: "Coverage",
    title: "Where we operate"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-1)'
    }
  }, ['Riyadh', 'Jazan', 'Yanbu', 'Dammam', 'Remote sites'].map(c => /*#__PURE__*/React.createElement(Badge, {
    key: c,
    tone: "brand"
  }, c))))))));
}
Object.assign(window, {
  ServicesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ServicesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/SiteChrome.jsx
try { (() => {
const {
  Logo,
  Button,
  Icon,
  Badge
} = window.MedicalAllianceDesignSystem_32f8e4;
const LOGO = '../../assets/logo';
const NAV = [{
  id: 'home',
  label: 'Home'
}, {
  id: 'services',
  label: 'Services'
}, {
  id: 'remote',
  label: 'Remote sites'
}, {
  id: 'contact',
  label: 'Contact'
}];
function SiteHeader({
  route,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: 'rgba(255,255,255,.88)',
      backdropFilter: 'var(--blur-scrim)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      height: 'var(--topbar-h)',
      padding: '0 var(--gutter-inline-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('home');
    },
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: LOGO,
    height: 30
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-6)',
      marginInlineStart: 'auto'
    }
  }, NAV.map(n => /*#__PURE__*/React.createElement("a", {
    key: n.id,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate(n.id);
    },
    style: {
      font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)',
      color: route === n.id ? 'var(--text-brand)' : 'var(--text-secondary)',
      textDecoration: 'none',
      paddingBottom: 2,
      borderBottom: route === n.id ? '2px solid var(--surface-brand)' : '2px solid transparent'
    }
  }, n.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--weight-semibold) var(--text-sm)/1 var(--font-body)',
      color: 'var(--text-secondary)',
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "globe",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    dir: "rtl",
    style: {
      fontFamily: 'var(--font-arabic)'
    }
  }, "\u0639\u0631\u0628\u064A")), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => onNavigate('contact')
  }, "Request a consultation"))));
}
function SiteFooter({
  onNavigate
}) {
  const cols = [{
    h: 'Services',
    items: ['Medical consultations', 'Occupational health', 'Training and consultancy', 'Facility equipping', 'Medical supplies']
  }, {
    h: 'Remote sites',
    items: ['On-site clinics', 'Emergency response', 'Fitness for work', 'Medication management']
  }, {
    h: 'Company',
    items: ['About', 'Accreditations', 'Careers', 'Contact']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    className: "ma-ink",
    style: {
      background: 'var(--ma-maroon-950)',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: 'var(--space-16) var(--gutter-inline-lg) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr repeat(3, 1fr)',
      gap: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: LOGO,
    tone: "white",
    height: 30
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      maxWidth: '32ch'
    }
  }, "Healthcare services and medical consultancy \u2014 occupational health, facility management and remote-site medical cover."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    style: {
      background: 'rgba(255,255,255,.06)',
      borderColor: 'rgba(255,255,255,.18)',
      color: 'rgba(255,255,255,.78)'
    }
  }, "ISO 9001"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    style: {
      background: 'rgba(255,255,255,.06)',
      borderColor: 'rgba(255,255,255,.18)',
      color: 'rgba(255,255,255,.78)'
    }
  }, "24/7 cover"))), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-widest)',
      textTransform: 'uppercase',
      color: 'var(--ma-maroon-200)'
    }
  }, c.h), c.items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('services');
    },
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-secondary)',
      textDecoration: 'none'
    }
  }, i))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-12)',
      paddingTop: 'var(--space-5)',
      borderTop: '1px solid rgba(255,255,255,.10)',
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, "\xA9 2026 Medical Alliance \xB7 \u0627\u0644\u062A\u062D\u0627\u0644\u0641 \u0627\u0644\u0637\u0628\u064A"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, "Privacy \xB7 Terms \xB7 Patient safety policy"))));
}

/* Reusable page shell so every route shares the same frame. */
function Page({
  children
}) {
  return /*#__PURE__*/React.createElement("main", {
    style: {
      background: 'var(--surface-page)'
    }
  }, children);
}
function Container({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '0 var(--gutter-inline-lg)',
      ...style
    }
  }, children);
}

/* Honest stand-in for brand photography — no invented imagery. */
function PhotoSlot({
  label,
  height = 320,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: 'var(--radius-card)',
      background: 'var(--surface-sunken)',
      border: '1px dashed var(--border-strong)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      color: 'var(--text-muted)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "image",
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      textAlign: 'center',
      maxWidth: '28ch'
    }
  }, label));
}
Object.assign(window, {
  SiteHeader,
  SiteFooter,
  Page,
  Container,
  PhotoSlot,
  NAV,
  LOGO
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SiteChrome.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.ProgressMeter = __ds_scope.ProgressMeter;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.SelectField = __ds_scope.SelectField;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Modal = __ds_scope.Modal;

})();
