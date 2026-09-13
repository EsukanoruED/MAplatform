# UI kit — Occupational health portal

Click-through internal portal for Medical Alliance clinical staff, composed from the design-system
components (`window.MedicalAllianceDesignSystem_32f8e4`).

> **Provenance.** No product, Figma file or codebase was supplied — only logo artwork. These screens
> are a *brand application reference* showing how the system behaves in a dense, data-heavy interface.
> They are not a recreation of an existing Medical Alliance product. Views with no defined source
> (Site clinics, Stock, Settings) are deliberately left blank with a disclaimer rather than invented.

## Flow
```
LoginScreen → DashboardScreen → (row click) → WorkerScreen → Issue certificate modal → toast
                    ↕ sidebar
             CertificatesScreen
```

## Screens
| File | What it shows |
|---|---|
| `LoginScreen.jsx` | Split sign-in: form left, maroon-950 panel right with the mark at 10% opacity |
| `DashboardScreen.jsx` | Expiry alert, four stat tiles, tabbed review queue, coverage meters, clinic schedule |
| `WorkerScreen.jsx` | Worker record: four tabs, outcome radio group, attachments, issue-certificate modal + toast |
| `CertificatesScreen.jsx` | Filterable certificate register with register-health meters and notification switches |
| `PortalChrome.jsx` | Maroon-950 sidebar (`.ma-ink` scope), top bar with breadcrumb + search, body scroller |

## Conventions used
- Sidebar `--sidebar-w` 264px, top bar `--topbar-h` 64px, body padding `--space-8`.
- Dense tables (`dense`) for lists; `mono` on every ID and reference column, `numeric` on dates.
- Fitness outcome → Badge tone is fixed: fit = success, restricted = warning, unfit = danger, pending = neutral.
- The only dark surface is the sidebar (plus the login panel). Content area stays on `--surface-page-alt`.

## Running it
Open `index.html`. Sign in with the pre-filled credentials (any submit works).
