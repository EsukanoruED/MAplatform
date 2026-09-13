> **Status note.** This document describes the original design-system and
> click-through prototype that lived at the repository root (`components/`,
> `tokens/`, `ui_kits/`, `_ds_bundle.js`). Those files remain in the repository
> as design reference, but they are **no longer the running application**.
>
> Phase 1 migrated the tokens and all 22 components into a real Vite + React +
> TypeScript app under `apps/web`, and added a Node + Express + Prisma +
> PostgreSQL API under `apps/api`. The CDN/Babel-in-browser loading pattern
> described below is not used by the application any more.
>
> **Start at [`../README.md`](../README.md)** for how to install, configure and
> run the platform. Read on for the design system's own reference: token
> structure, component inventory, accessibility behaviour and brand rules — all
> of which still apply to the migrated `.tsx` components.

---

# Medical Alliance — Design System

**التحالف الطبي**

A front-end design system and browser-based UI prototype kit for Medical Alliance, a healthcare and occupational-health services company. The project ships as a set of design tokens, a 22-component React library, and two click-through prototypes (a corporate website and an internal occupational-health portal) that consume that library. There is no build tool, backend, or package manager involved — everything runs directly in the browser from static files.

## Overview

Medical Alliance provides medical consultations, occupational health programmes, facility equipping and management, training and conferences, medical equipment and supplies, and remote-site medical cover (on-site clinics, emergency response, and fitness-for-work assessment for industrial and remote operations). This is reflected throughout the prototype copy, which is written for two audiences: prospective clients evaluating the company's services (hospital and clinic operators, corporate HSE/HR leads, industrial site managers) and Medical Alliance's own clinical staff managing worker health records.

The project is not a deployed website or product. It is a design system — brand tokens plus a component library — together with two **UI kit prototypes** that demonstrate how that system looks when applied to a public marketing site and an internal clinical portal. Both kits are static, click-through mockups: they render real layouts and interactions in the browser, but they are not wired to any backend, and their content and behaviour are illustrative rather than production data.

## Features

Implemented in the current codebase:

- **Design token system** — CSS custom properties for colour, typography, spacing, radius, elevation, and motion, loaded through a single `styles.css` entry point (`tokens/*.css`).
- **22-component React library**, exposed as a single global namespace (`window.MedicalAllianceDesignSystem_32f8e4`), covering buttons, cards, badges, form fields, feedback (alerts, toasts, tooltips, progress meters), navigation (tabs, breadcrumbs), data display (stat tiles, data tables), and an overlay modal.
- **Two click-through UI kits** built entirely from that component library: a four-screen corporate website and a four-screen occupational-health portal, each with its own shared header/sidebar chrome and in-memory, state-based view switching (no router or URL routing).
- **Client-side interactive states** — a contact form that shows a success toast on submit (no network request is made), a portal sign-in screen that accepts any submitted credentials (no real authentication), and a certificate-issuance flow with a confirmation modal and toast.
- **Icon system** built on the Lucide icon set (loaded from a CDN), wrapped by a single `Icon` component so icons are used consistently and marked decorative (`aria-hidden`) unless a `title` is supplied.
- **Bilingual provisioning, not a full translation** — an Arabic font token (`--font-arabic`, IBM Plex Sans Arabic) and logical CSS properties (e.g. `insetInlineEnd`) are used throughout, and the site header includes an Arabic language toggle and the footer an Arabic copyright line, but no fully translated or mirrored RTL page exists.
- **Logo/asset system** — approved logo lockups (horizontal/stacked × crescent/S mark × dark/white) as SVG, plus cropped mark PNGs, served through a single `Logo` component that always renders the supplied artwork rather than redrawing it.
- **Photography placeholder** — a dashed-border `PhotoSlot` component marks where client photography belongs; no stock or generated imagery is used in its place.
- **Reduced-motion support** — all transition durations collapse to `1ms` under `prefers-reduced-motion: reduce`.

## Pages / Screens

The project has no single page list — it has two independent UI kits, each a small set of client-rendered screens with no backend and no persisted data.

### Corporate website kit (`ui_kits/website/`)

| Screen | File | Purpose |
|---|---|---|
| Home | `HomeScreen.jsx` | Hero introduction with headline stats bar, a six-service grid, a remote-site medical highlight band, and a closing call-to-action |
| Services | `ServicesScreen.jsx` | Tabbed detail view across the six service lines (consultations, occupational health, training, facility equipping, events, supplies), each with descriptive points and a coverage card |
| Remote sites | `RemoteSiteScreen.jsx` | Explains remote-site medical cover: a stats hero, a four-step engagement process, a live site-register table, and readiness progress meters |
| Contact | `ContactScreen.jsx` | Two-column enquiry form (name, organisation, email, phone, service needed, headcount, site details) with a client-side success toast, plus an emergency-contact card and office details |
| Shared chrome | `SiteChrome.jsx` | Sticky header with navigation, language toggle and CTA button; footer with link columns; shared `Page`, `Container` and `PhotoSlot` layout helpers |

### Occupational health portal kit (`ui_kits/portal/`)

| Screen | File | Purpose |
|---|---|---|
| Sign-in | `LoginScreen.jsx` | Split-panel sign-in form, pre-filled with demo credentials; submitting the form signs in without checking credentials |
| Dashboard | `DashboardScreen.jsx` | Expiry-alert banner, four stat tiles, a tabbed worker review-queue table, screening-coverage progress meters, and a daily clinic schedule |
| Worker record | `WorkerScreen.jsx` | Tabbed worker profile (Overview / Examinations / Certificates / Clinical notes), a fitness-outcome radio group, an "issue certificate" modal with confirmation toast, and an attachments list |
| Certificate register | `CertificatesScreen.jsx` | Certificate table with search/site/status filter controls and active-filter tags (the controls render but are not wired to filter the table rows), register-health progress meters, and notification toggles |
| Shared chrome | `PortalChrome.jsx` | Fixed sidebar (Operations / Sites / Account sections) and a top bar with breadcrumb, search box and notification button |

Three sidebar destinations in the portal (**Site clinics**, **Stock and equipment**, **Settings**) intentionally render a "left blank — no source design supplied" placeholder card rather than an invented screen.

## Technology Stack

| Technology | How it's used |
|---|---|
| **React 18.3.1** | Loaded as a UMD build from `unpkg` via `<script>` tag — no npm install, no JSX build step configured in the project itself |
| **Babel Standalone 7.29** | Loaded from `unpkg`; transpiles each screen's JSX in the browser at page load (`<script type="text/babel" src="…jsx">`) |
| **Lucide 0.470.0** | Icon set, loaded as a UMD build from `unpkg`; wrapped by the `Icon` component, which looks glyphs up by name from `window.lucide` |
| **Plain CSS custom properties** | All design tokens (colour, type, spacing, radius, elevation, motion) are CSS variables in `tokens/*.css` — no Sass/Less, no CSS-in-JS, no Tailwind |
| **Google Fonts** | Nunito Sans, IBM Plex Sans Arabic and IBM Plex Mono are loaded via an `@import` in `tokens/fonts.css` |
| **oxlint** | An oxlint ruleset (`_adherence.oxlintrc.json`, `react`/`import` plugins) is checked in at the project root. It flags raw HTML elements and direct imports from component folders, intended to keep consuming code going through the exported design-system components. No `package.json` script or CI step runs it. |

There is **no package manager, no `package.json`, no bundler (Vite/webpack/etc.), and no TypeScript compiler** in this project. The `.d.ts` files next to each component are hand-written type declarations for editor/documentation purposes only — nothing in the project type-checks them. `_ds_bundle.js` is a pre-transpiled, pre-bundled build of every component (already run through Babel) that the UI kits load directly, alongside the individual `.jsx` sources used for the component "cards" and screens.

## Project Structure

```text
MAplatform/
├── styles.css                # Global CSS entry point — imports every token file
├── readme.md                 # This document
├── _ds_bundle.js             # Pre-built bundle exposing window.MedicalAllianceDesignSystem_32f8e4
├── _ds_manifest.json         # Machine-readable manifest of components, tokens and guideline cards
├── _adherence.oxlintrc.json  # oxlint rules enforcing component-only usage
├── tokens/                   # Design tokens as CSS custom properties
│   ├── fonts.css             # Webfont loading (Google Fonts) + substitution notice
│   ├── colors.css            # Brand, neutral and status colour ramps; semantic aliases; dark (.ma-ink) scope
│   ├── typography.css        # Font families, weights, size scale, line heights, composed type roles
│   ├── spacing.css           # 4px spacing scale and named layout values
│   ├── radius.css            # Corner-radius scale
│   ├── elevation.css         # Shadow scale and focus rings
│   ├── motion.css            # Easing curves and durations (incl. reduced-motion override)
│   └── base.css              # Element-level defaults (headings, links, focus outline, selection colour)
├── components/                # 22 React components grouped by category
│   ├── core/                 # Button, IconButton, Logo, Card, Badge, Tag
│   ├── brand/                 # Icon, SectionHeading
│   ├── forms/                 # TextField, SelectField, Checkbox, Radio, Switch
│   ├── feedback/               # Alert, Toast, Tooltip, ProgressMeter
│   ├── navigation/             # Tabs, Breadcrumb
│   ├── data/                   # StatTile, DataTable
│   └── overlay/                 # Modal
│       # each component folder has: Name.jsx (implementation), Name.d.ts (prop types),
│       # Name.prompt.md (usage note), and a *.card.html demo page for the category
├── guidelines/                 # 20 standalone HTML "specimen cards" documenting colour, type,
│                               # spacing and brand usage (reference pages, not application code)
├── ui_kits/
│   ├── website/                # Corporate website click-through prototype (4 screens + shared chrome)
│   └── portal/                 # Occupational-health portal click-through prototype (4 screens + shared chrome)
└── assets/
    └── logo/                    # Approved logo lockups (SVG/PNG) and the vector master source file
```

Not tracked in git (see `.gitignore`): `SKILL.md`, `thumbnail.html`, `.thumbnail`, `scraps/`, `uploads/`, and `assets/logo/source/` — these are generator-internal files, a duplicate copy of supplied assets, and a large source PDF kept outside version control.

## Design System

- **Colour** — a maroon brand ramp (`--ma-maroon-50` … `--ma-maroon-950`, primary `#801717`) and a warm-tinted neutral ramp, plus teal/green/amber/red status ramps for clinical states. Text, surface, border and focus colours are exposed as semantic aliases (`--text-primary`, `--surface-card`, `--border-subtle`, etc.), which are redefined under a `.ma-ink` class for dark grounds (headers, sidebars, hero sections).
- **Typography** — Nunito Sans (Latin), IBM Plex Sans Arabic (Arabic), and IBM Plex Mono (identifiers), assembled into composed type roles (`--type-display-1`, `--type-heading-2`, `--type-body-sm`, `--type-eyebrow`, `--type-mono`, etc.) so components reference one token rather than separate size/weight/line-height values.
- **Spacing** — a 4px base scale (`--space-1` … `--space-40`) plus named layout values (`--content-max: 1240px`, `--gutter-inline-lg: 56px`, `--section-y: 96px`, `--sidebar-w: 264px`, `--topbar-h: 64px`).
- **Radius & elevation** — a fixed radius scale (2/4/6/10/16/24px, plus a pill radius reserved for status badges) and a four-step warm-toned shadow scale, with a separate focus-ring shadow token.
- **Motion** — a single easing curve (`--ease-standard`) and a small set of durations, all collapsing to `1ms` under `prefers-reduced-motion: reduce`.
- **Buttons** — five variants (`primary`, `secondary`, `ghost`, `ink`, `danger`) and three sizes, with hover/press/disabled states implemented via local component state (no CSS `:hover` rules).
- **Cards, forms, navigation** — implemented as individual components (see below) that consume the same token set, so spacing, radius and colour stay consistent across the website and portal kits.

## Components

All 22 components are exported from a single bundle onto `window.MedicalAllianceDesignSystem_32f8e4`:

| Component | Role |
|---|---|
| `Button` | Primary action control — 5 visual variants, 3 sizes, optional leading/trailing icon |
| `IconButton` | Square, icon-only button built on `Button`, requires a `label` for its `aria-label`/`title` |
| `Logo` | Renders the approved logo artwork (never redraws it) in horizontal, stacked or mark-only form |
| `Card` | General-purpose surface container used throughout both kits |
| `Badge` | Status chip (used with a `tone` and a `dot` alongside a text label, so status is never colour-only) |
| `Tag` | Removable metadata chip (e.g. active filters) |
| `Icon` | Wrapper around the Lucide icon set; decorative by default (`aria-hidden`), accessible when given a `title` |
| `SectionHeading` | Eyebrow + rule + heading + lead paragraph pattern used to open marketing sections |
| `TextField` | Labelled single-line or multi-line input with hint/error text and focus state |
| `SelectField` | Labelled select control |
| `Checkbox`, `Radio`, `Switch` | Labelled choice controls with optional descriptions |
| `Alert` | Persistent, tone-coloured banner with an optional inline action |
| `Toast` | Dismissible, ink-ground confirmation message |
| `Tooltip` | Hover label |
| `ProgressMeter` | Labelled progress/completion bar |
| `Tabs` | Underlined tab bar, optionally showing a count per tab |
| `Breadcrumb` | Slash-separated hierarchy trail |
| `StatTile` | Labelled metric tile with an optional delta and icon |
| `DataTable` | Hairline data table with per-column rendering, numeric alignment and a dense mode |
| `Modal` | Centred dialog on a scrim, with header, body and right-aligned footer actions |

## Responsive Design

The two UI kits are built at a fixed design-review viewport (1280×760, per the `@dsCard` metadata in each kit's `index.html`) using fixed-column CSS grid layouts (e.g. a hard-coded 4-column stat grid, a 264px fixed sidebar). **No responsive breakpoints or media queries for layout are implemented** — the only `@media` rule in the entire token set is `prefers-reduced-motion`. The design tokens (spacing scale, content-max width, etc.) are structured in a way that could support a responsive pass, but no tablet or mobile layout currently exists.

## Accessibility

Implemented, verifiable in the code:

- Form fields use real `<label htmlFor>` associations (`TextField`, `SelectField`, etc.).
- `IconButton` requires a `label` prop, applied as both `aria-label` and `title`.
- `Icon` renders decorative icons with `aria-hidden="true"` by default, and switches to `role="img"` with a visible `<title>` when one is supplied.
- A visible focus style is defined globally (`:focus-visible { outline: 2px solid var(--focus-ring) }`) plus a focus glow on form fields.
- All motion durations collapse to `1ms` under `prefers-reduced-motion: reduce`.
- The `Logo` component always sets descriptive `alt` text (including the Arabic name).
- Status is conveyed with a coloured dot **and** a text label together (`Badge tone="…" dot`), not colour alone.

No accessibility audit or automated testing (axe, Lighthouse CI, etc.) is present in the project, and no specific WCAG conformance level is claimed.

## Assets

- **Logos** — `assets/logo/` contains the approved lockups as SVG (`ma-horizontal-crescent-{dark,white}.svg`, `ma-horizontal-s-{dark,white}.svg`, `ma-stacked-crescent-{dark,white}.svg`, `ma-stacked-s-{dark,white}.svg`) and two cropped mark-only PNGs (`ma-mark-{maroon,white}.png`), plus a vector master PDF under `assets/logo/source/` (excluded from git).
- **Icons** — sourced at runtime from the Lucide CDN build; no local icon files are stored in the project.
- **Fonts** — Nunito Sans, IBM Plex Sans Arabic and IBM Plex Mono are loaded from Google Fonts at runtime; no font files are bundled in the project.
- **Photography** — none is included. The `PhotoSlot` component renders a dashed placeholder wherever a real photograph would go.

## Installation

There is no package manager or dependency list in this project. To run either UI kit locally:

1. Clone or copy the `MAplatform` folder.
2. Open `ui_kits/website/index.html` or `ui_kits/portal/index.html` directly in a browser (or serve the folder with any static file server).

An internet connection is required on first load, since React, ReactDOM, Babel Standalone, Lucide and the Google Fonts are all pulled from CDNs at runtime rather than bundled locally.

## Development

There is no development server, build step, or npm script in this project — every file is static and interpreted directly by the browser.

- To edit a screen or component, edit the relevant `.jsx` file directly; Babel Standalone re-transpiles it in the browser on the next page load.
- Component "cards" (`components/*/*.card.html`) and guideline specimens (`guidelines/*.card.html`) can each be opened directly in a browser to preview a single component or foundation in isolation.
- `_ds_manifest.json` lists every component, token and card the project currently defines, and `_ds_bundle.js` is a pre-built, already-transpiled copy of the component library used by the two UI kits.
- An oxlint configuration (`_adherence.oxlintrc.json`) exists at the project root, but no script or CI job in the project currently runs it.

## Build

There is no build step. `_ds_bundle.js` is a pre-generated, pre-transpiled bundle of the component library checked into the repository; there is no build command in this project that regenerates it.

## Deployment

No deployment configuration (hosting config, CI/CD pipeline, Dockerfile, etc.) is included in this project.

## Browser Support

No explicit browser-support configuration (e.g. Browserslist) is present. The project depends on modern browser features used directly in the CSS and components — CSS custom properties, `backdrop-filter`, `color-mix()`, and CSS logical properties (`insetInlineEnd`, `marginInlineStart`) — so it targets current evergreen desktop browsers rather than a specified compatibility matrix.

## Project Status

Prototype / reference stage. The token set and 22-component library are complete and internally consistent, and both UI kits are functional click-through demonstrations. Neither kit is connected to a backend, real authentication, or persisted data, and three portal sections (Site clinics, Stock and equipment, Settings) are explicitly left as unbuilt placeholders. No production website or platform currently exists in this project.

## Future Improvements

Based on gaps and placeholders visible in the code itself:

- **Unbuilt portal sections** — Site clinics, Stock and equipment, and Settings render a placeholder card rather than a real screen.
- **Non-functional certificate filters** — the search/site/status controls on the Certificates screen are rendered but not wired to filter the table.
- **No responsive layouts** — both kits are built for a single fixed desktop viewport.
- **Partial Arabic/RTL support** — Arabic appears only in the header language toggle and footer copyright; there is no fully translated or mirrored RTL screen.
- **Substituted fonts and icons** — Nunito Sans, IBM Plex Sans Arabic and Lucide are stand-ins; no licensed brand font files or a custom icon set are included in the project.
- **No photography** — every image slot uses the `PhotoSlot` placeholder.
- **No automated linting/testing wired up** — the `_adherence.oxlintrc.json` ruleset exists but is not run by any script in the project.

## License

No license file or license declaration is present in this project.
