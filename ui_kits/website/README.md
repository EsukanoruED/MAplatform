# UI kit — Corporate website

Click-through recreation of the Medical Alliance public site, composed **entirely** from the
design-system components (`window.MedicalAllianceDesignSystem_32f8e4`). Nothing here
re-implements a primitive.

> **Provenance.** The brand package supplied for this design system contained logo artwork only —
> no website, Figma file or codebase. These screens are therefore a *brand application reference*,
> not a recreation of an existing product. Replace them with real screens as soon as the live site
> or its design file is available.

## Screens
| File | Route | What it shows |
|---|---|---|
| `HomeScreen.jsx` | `home` | Ink hero with the mark used as a 9%-opacity ground graphic, stat bar, six-service grid, remote-site band, maroon closing CTA |
| `ServicesScreen.jsx` | `services` | Tabbed service detail — the six service lines from the company description |
| `RemoteSiteScreen.jsx` | `remote` | Maroon-900 hero, four-step process, live site register table, readiness meters |
| `ContactScreen.jsx` | `contact` | Two-column request form with validation-ready fields, emergency card, success toast |
| `SiteChrome.jsx` | — | Sticky translucent header with Arabic language switch, ink footer, `Container`, `PhotoSlot` |

## Conventions used
- Page width `--content-max` (1240px), gutters `--gutter-inline-lg` (56px), sections `--section-y` (96px).
- Exactly two ground colours per page beyond white: `--surface-page-alt` bands and one ink or maroon block.
- `PhotoSlot` is a deliberate dashed placeholder. **Do not** replace it with generated or stock-styled
  imagery — it marks where the client's own photography belongs.
- Arabic is present in the header switch and the footer copyright only; a full RTL mirror is not built.

## Running it
Open `index.html`. It loads React + Babel + Lucide from CDN and `_ds_bundle.js` from the project root.
