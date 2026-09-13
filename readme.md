# Medical Alliance — Design System
**التحالف الطبي**

A brand and interface system for Medical Alliance, a healthcare services and medical consultancy
company. Built from the logo package supplied by the client; everything above the logo — colour ramps,
type scale, spacing, components, screens — is derived from that artwork and the company description.

---

## 1. Company context

Medical Alliance delivers medical, occupational health and healthcare management services to
individuals, employers and healthcare facilities. Six service lines run through everything in this system,
and they are the vocabulary the interface should speak in:

1. **Medical and health consultations** — clinical advice for individuals, employers and operators.
2. **Training and consultancy** — courses in medicine, public and private health, occupational health.
3. **Facility equipping and management** — hospitals and medical centres of all types.
4. **Forums and conferences** — organisation, delivery and supervision of medical events.
5. **Medical equipment and supplies** — procurement and supply of equipment, consumables, medication.
6. **Medical checkups and fitness assessments** — examinations and medical fitness certificates.

Plus the operational speciality the brand is most distinctive for: **remote-site doctor services** —
first aid and emergency stabilisation, site clinic operation and stock control, fitness-for-work
assessment, and occupational health input into site safety.

**Audiences:** hospital and clinic operators, corporate HSE and HR leaders, industrial and remote-site
operations managers, and healthcare professionals attending training. The system must read as credible
in a hospital corridor, a corporate boardroom, and a site office — and reproduce cleanly on print,
digital, uniforms, vehicle liveries and equipment labels.

### Sources given
| Source | Path | Notes |
|---|---|---|
| Logo package (8 SVGs) | `uploads/medical_alliance_logos_svg/` | Horizontal + stacked lockups × crescent/S marks × dark/white tones. Copied to `assets/logo/`. |
| Logo master | `uploads/التحالف الطبي_logo.pdf` | Vector master, retained at `assets/logo/source/medical-alliance-logo.pdf`. |
| Company description | Brief (chat) | Reproduced above; the source of all service-line copy in this system. |

**No product, website, Figma file, codebase or deck was supplied.** There is therefore no existing UI to
recreate. The component inventory is the standard set for a system of this scope, and the two UI kits are
*brand application references* rather than recreations — each says so in its own README. If a live site
or product design exists, it should replace those kits.

---

## 2. Content fundamentals

**Voice: a senior clinician briefing a client.** Precise, unhurried, quietly authoritative. The brand earns
trust by being specific, not by being warm.

- **Person.** "We" for Medical Alliance; "you"/"your" for the client organisation. Never "I". Never
  first-person plural boasting — "We are the leading…" is out; "We place clinicians on site within
  21 days" is in.
- **Casing.** Sentence case everywhere: headings, buttons, labels, table headers excepted (those are
  uppercase micro-labels via `--type-eyebrow`). No Title Case. No ALL CAPS except eyebrows.
- **Length.** Headlines under 9 words. Lead paragraphs one or two sentences. Body paragraphs under
  four lines at a 68ch measure. Button labels 2–4 words, verb first.
- **Punctuation.** No exclamation marks. No em-dash drama in UI copy (fine in long-form prose).
  Buttons and labels never end in a period; sentences in body copy always do.
- **Numbers.** Always specific and always tabular: "1,284 workers cleared", "6-minute median response",
  "valid to 14 Mar 2027". Dates in `DD Mon YYYY`. Never "many", "leading", "world-class".
- **Clinical accuracy over marketing.** Say "fitness assessment", not "health check-up experience".
  Say "in accordance with the applicable requirements", not "fully compliant".
- **Emoji: never.** Not in product, not in marketing, not in internal tools. Status is carried by the
  Badge dot and colour, never by a glyph from a different visual language.
- **Arabic.** The company name is `التحالف الطبي`. In bilingual settings Arabic leads. Arabic copy is
  never letterspaced and is set one optical step larger than its Latin counterpart (see the *Bilingual
  lockup* card).

**Specific examples**

| Do | Don't |
|---|---|
| Medical cover, wherever the work is. | Your Trusted Healthcare Partner! |
| Request a site assessment | Get Started |
| Fit with restrictions | Conditionally Approved ⚠️ |
| Enter a valid work email | Invalid input |
| We reply within one working day. | We'll be in touch soon! |
| 4 certificates expire in the next 30 days | Some certificates are expiring |

---

## 3. Visual foundations

### Colour
The whole palette comes out of the mark. The crescents are **#801717** — `--ma-maroon-600`, the brand
primary. The wordmark ink is **#2A0E0D** — `--ma-maroon-900`, which is also the body text colour: the
system has no true black and no pure grey. Neutrals are warm, tinted toward the maroon, so a page of
greys never drifts blue. Support hues (teal, green, amber, signal red) are a **system extension** used
only for clinical status and system state — teal is never a second brand colour.

Maximum two ground colours per view beyond white: one `--surface-page-alt` band and one maroon or ink
block. Large maroon fields are used sparingly and deliberately — a closing CTA, a hero, a sidebar.

### Typography
- **Latin: Nunito Sans** — the closest Google Fonts match to the wordmark's geometric humanist letterforms
  (see *Substitutions*). Display 800, headings 700→600, body 400, labels 600.
- **Arabic: IBM Plex Sans Arabic**, 1.85 line height for body.
- **Mono: IBM Plex Mono** — worker IDs, certificate references, token names. Anything that is an
  identifier is set in mono.
- Scale: 11 → 76px, roughly a major third at display sizes tightening to 1.125 in the body range.
  Display sizes get `-0.015em`/`-0.03em` tracking; eyebrows get `+0.14em` and uppercase.
- Measure: `--prose-max: 68ch`. Headings get `text-wrap: balance`, body gets `pretty`.

### The one signature device
A **28×3px maroon rule** beside an uppercase, wide-tracked eyebrow, above the heading. It appears on
every marketing section and most panel headers (`SectionHeading`). It is the only decorative element
in the system — there is no pattern library, no texture, no illustration style.

### Backgrounds and imagery
- **No gradients.** Flat fields only. The single exception is the logo artwork's own internal shading,
  which is part of the supplied file and must not be recreated in CSS.
- **No patterns or textures.** Where a hero needs presence, the crescent **mark** is placed at
  **9–10% opacity**, oversized and bleeding off the right edge of an ink field. That is the only
  approved graphic treatment.
- **Photography** should be cool-neutral, documentary, and un-staged: real clinics, equipment, hands,
  documentation, site environments. No stock smiles, no blue-tinted "tech medical" imagery, no
  teal-and-orange grading. Full-bleed is allowed for a hero; elsewhere images sit in a 10px-radius frame.
  **This system ships no photography** — `PhotoSlot` in the website kit is a dashed placeholder marking
  where the client's own images belong. Do not substitute generated or stock-styled imagery.

### Shape, borders, shadows
- Radii are architectural and tight: 2 / 4 / 6 / 10 / 16px. Controls 4px, cards 10px, large surfaces 16px.
  **Nothing is pill-shaped except the status Badge** — that shape is reserved so a chip always reads as a status.
- Borders are hairlines: `--border-subtle` inside components, `--border-default` for control outlines,
  `--border-strong` for inputs that need to be found. The 3px coloured edge appears in exactly two places:
  the Alert leading bar and the Toast leading bar.
- Shadows are warm (`rgba(23,21,20,…)`), never black, and used to signal elevation rather than decorate:
  `xs` for a toggle knob, `md` for a raised card, `lg` for a hovered card, `xl` for a modal.
- **Transparency and blur** are used twice only: the sticky site header (88% white + `--blur-scrim`) and
  the modal scrim (56% ink + 2px blur). Nothing else is translucent.
- Protection: on ink and maroon grounds the system switches tokens via the `.ma-ink` scope rather than
  adding protection gradients or capsules behind text.

### Motion
One easing — `--ease-standard: cubic-bezier(.2,.8,.25,1)` — for everything. 140ms for control colour and
focus, 200ms for surfaces and toggles, 280ms for scrims and meter fills. **Nothing bounces and nothing
scales.** Hover lifts a card 2px; press drops a button 1px. Fades only for tooltips and toasts. All
durations collapse to 1ms under `prefers-reduced-motion`.

### States
- **Hover:** buttons darken one ramp step (600 → 700); secondary buttons take a `--surface-sunken` fill;
  ghost buttons take `--surface-brand-soft`; cards lift 2px and gain `--shadow-lg`; table rows tint to
  `--surface-card-hover` **only when the row is clickable**.
- **Press:** `translateY(1px)` plus one further ramp step (700 → 800). No scale, no ripple.
- **Focus:** 3px maroon-500 glow at 28% (`--shadow-focus`) on fields; 2px `--focus-ring` outline with 2px
  offset on everything else. Focus is never removed.
- **Disabled:** 42% opacity plus `not-allowed`. Never grey-on-grey text.
- **Selected:** maroon fill for checkbox/switch, 2px inset maroon underline for tabs, maroon left-fill for
  the portal sidebar.

### Layout
- Marketing: `--content-max` 1240px, `--gutter-inline-lg` 56px, `--section-y` 96px between sections.
- Product: `--sidebar-w` 264px fixed, `--topbar-h` 64px sticky, body padding `--space-8`, content capped
  around 1180px so tables do not stretch.
- Everything sits on the 4px grid. Component internals use 4–12px, card padding is 24px.
- Fixed elements: the site header (sticky), the portal sidebar and top bar (fixed within a 100vh shell),
  and toasts (bottom-inline-end, 24px inset).

---

## 4. Iconography

The supplied brand package contained **no icon set, no icon font and no sprite**. The system therefore
standardises on **Lucide** (`https://unpkg.com/lucide@0.470.0/dist/umd/lucide.js`), loaded from CDN and
wrapped by the `Icon` component. **This is a flagged substitution** — see below.

- **Why Lucide:** 24px grid, 2px round-cap stroke, geometric construction. It sits with the mark's clean
  arc geometry and with Nunito Sans' weight better than a filled or duotone set would.
- **Style rules:** stroke only, never filled. 2px stroke at every size. Icons inherit `currentColor` —
  usually `--text-brand` as a feature glyph, `--text-muted` in dense UI. Sizes: 16 inline with text,
  18–20 in controls, 22–26 as a card glyph, 32–40 as a section glyph.
- **Never:** two icon families on one screen; emoji as icons; Unicode dingbats as icons; hand-drawn SVG
  approximations of an icon that exists in Lucide; an icon without an accessible label when it is the only
  content of a control.
- **Unicode is used in exactly three places**, deliberately, because they are typographic marks rather
  than icons: `×` for dismiss affordances, `/` as the breadcrumb separator, `↑ ↓` for stat deltas.
- **Core glyph set:** `stethoscope`, `heart-pulse`, `activity`, `siren`, `ambulance`, `shield-check`,
  `clipboard-check`, `file-badge`, `hard-hat`, `building-2`, `map-pin`, `graduation-cap`, `users`,
  `package`, `microscope`, `syringe`, `calendar-check`, `calendar-clock`, `phone-call`, `printer`,
  `file-text`, `triangle-alert`.

### Logo assets
All logo files in `assets/logo/` are the client's own artwork, copied unmodified. `ma-mark-maroon.png`
and `ma-mark-white.png` are mechanical crops of the supplied horizontal lockups, isolating the crescent
symbol for favicon, uniform, livery and ground-graphic use. **Nothing in this system redraws or
reconstructs the mark** — always place it through the `Logo` component or an `<img>` pointing at these files.

---

## 5. Substitutions and gaps — please review

1. **Fonts are substituted.** No font binaries were supplied. The wordmark's Latin letterforms are a
   geometric humanist sans; **Nunito Sans** is the nearest Google Fonts match. The Arabic wordmark is a
   modern geometric naskh; **IBM Plex Sans Arabic** is the nearest match. Neither is the real family.
   *Please send the licensed font files (or the names) and `tokens/fonts.css` can be corrected in minutes.*
2. **Icons are substituted.** Lucide stands in for a brand icon set that does not exist yet.
3. **No photography.** `PhotoSlot` marks the gaps. Please supply real imagery.
4. **Support hues are invented.** Teal / green / amber / signal red were derived to sit with the maroon;
   they are not from a supplied palette. Confirm or replace.
5. **No product source.** Both UI kits are brand applications, not recreations.
6. **Arabic RTL is partial.** Tokens and `--font-arabic` are in place and components use logical
   properties (`insetInlineEnd`, `marginInlineStart`), but no fully mirrored RTL screen is built.

---

## 6. Index

### Root
| File | What it is |
|---|---|
| `styles.css` | Global entry point — `@import` lines only. Consumers link this one file. |
| `readme.md` | This document. |
| `SKILL.md` | Agent Skills front-matter wrapper, for use in Claude Code. |
| `thumbnail.html` | Homepage tile for the design system. |

### Tokens — `tokens/`
`fonts.css` (webfont loading + substitution notice) · `colors.css` (maroon, neutral and support ramps,
semantic text/surface/border aliases, the `.ma-ink` dark scope) · `typography.css` (families, weights,
size ramp, line heights, tracking, composed `--type-*` roles) · `spacing.css` (4px scale + named layout
rhythm) · `radius.css` · `elevation.css` · `motion.css` · `base.css` (element defaults).

### Components — `components/`
22 exports, all reachable as `window.MedicalAllianceDesignSystem_32f8e4.<Name>`. Each directory carries
a `@dsCard` HTML showing its states, and every component has a `.d.ts` props contract and a
`.prompt.md` usage note.

| Group | Components |
|---|---|
| `components/core/` | **Button**, **IconButton**, **Logo**, **Card**, **Badge**, **Tag** |
| `components/brand/` | **Icon**, **SectionHeading** |
| `components/forms/` | **TextField**, **SelectField**, **Checkbox**, **Radio**, **Switch** |
| `components/feedback/` | **Alert**, **Toast**, **Tooltip**, **ProgressMeter** |
| `components/navigation/` | **Tabs**, **Breadcrumb** |
| `components/data/` | **StatTile**, **DataTable** |
| `components/overlay/` | **Modal** |

**Intentional additions** (not implied by any supplied source, added because the system needs them):
- **Icon** — a wrapper for the substituted Lucide set, so the swap to a real brand set is one file.
- **Logo** — enforces the approved lockups and stops the mark being retyped or redrawn.
- **SectionHeading** — encodes the eyebrow-rule device so it is consistent everywhere.

### Foundation cards — `guidelines/`
20 specimen cards, grouped **Colors** (brand ramp, warm neutrals, clinical status, text tokens, surfaces,
approved pairings), **Type** (display, headings, body, utility roles, Arabic, bilingual lockup),
**Spacing** (4px scale, layout frame, spacing in use), and **Brand** (lockups, grounds, mark and clear
space, radius and elevation, motion).

### UI kits — `ui_kits/`
| Kit | Entry | Screens |
|---|---|---|
| Corporate website | `ui_kits/website/index.html` | Home, Services, Remote sites, Contact (+ shared chrome) |
| Occupational health portal | `ui_kits/portal/index.html` | Sign-in, Dashboard, Worker record, Certificate register |

Each kit has its own README with provenance, flow and conventions.

### Assets — `assets/logo/`
`ma-horizontal-crescent-{dark,white}.svg` · `ma-horizontal-s-{dark,white}.svg` ·
`ma-stacked-crescent-{dark,white}.svg` · `ma-stacked-s-{dark,white}.svg` ·
`ma-mark-{maroon,white}.png` (crescent symbol, cropped from the lockups) ·
`source/medical-alliance-logo.pdf` (vector master).
