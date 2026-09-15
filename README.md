# Medical Alliance Platform

**التحالف الطبي** — occupational health platform: a public website and an
authenticated, tenant-isolated portal for companies to request worker medical
examinations and fitness certificates.

This is an npm-workspaces monorepo:

| Workspace | Stack | What it is |
|---|---|---|
| `apps/web` | Vite · React 18 · TypeScript · React Router · React Query | The public site and the occupational health portal |
| `apps/api` | Node · Express 5 · TypeScript · Prisma · PostgreSQL | REST API, sessions, authorization, tenant scoping |

The design system (tokens + 22 components) lives in `apps/web/src/styles/tokens`
and `apps/web/src/components`, migrated from the original prototype. The
prototype itself (`components/`, `tokens/`, `ui_kits/`, `_ds_bundle.js`) is kept
at the repository root as design reference and is **not** used by the running
application — see [`docs/design-system.md`](docs/design-system.md).

---

## Prerequisites

- **Node.js ≥ 20.11** (developed and tested on 22.x) and npm 10+
- **PostgreSQL 14+** running locally (developed and tested against 16.13)

Check both:

```bash
node -v && npm -v && psql --version
```

## 1. Install

From the repository root — this installs both workspaces:

```bash
npm install
```

## 2. Create the databases

Two databases: one for development, one the test suite truncates. Adjust the
role name and password to taste, then use the same values in `.env` below.

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE ma_dev LOGIN PASSWORD 'choose-a-local-password' CREATEDB;
SQL
sudo -u postgres createdb -O ma_dev medical_alliance_dev
sudo -u postgres createdb -O ma_dev medical_alliance_test
```

> The test database is migrated and **truncated** by the API test suite. Never
> point `TEST_DATABASE_URL` at a database holding real data.

## 3. Configure the environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Then edit `apps/api/.env`:

- `DATABASE_URL` / `TEST_DATABASE_URL` — the two databases from step 2
- `SESSION_SECRET` — generate a real random value:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Every variable is documented inline in `apps/api/.env.example`. Both `.env`
files are git-ignored; **never commit one**. The API refuses to start in
production if `SESSION_SECRET` is still the placeholder.

## 4. Migrate and seed

```bash
npm run db:migrate     # apply prisma/migrations to the dev database
npm run db:seed        # create the demo companies, users, labs and employees
npm run db:verify      # assert the seeded graph resolves correctly
```

The seed creates **two companies** on purpose — the platform's core guarantee is
that one company can never read another's worker health data, and proving that
needs two real tenants. Demo accounts (all sharing `SEED_DEMO_PASSWORD` from
`apps/api/.env`, default `DemoPassw0rd!`):

| Account | Email | Role |
|---|---|---|
| Northgate Industrial Services | `ops@northgate-industrial.example` | `COMPANY_ADMIN` |
| Northgate Industrial Services | `requests@northgate-industrial.example` | `COMPANY_REQUESTER` |
| Harbourline Logistics | `ops@harbourline-logistics.example` | `COMPANY_ADMIN` |
| Medical Alliance staff | `admin@medicalalliance.example` | `ADMIN` |
| Medical Alliance staff | `reviewer@medicalalliance.example` | `REVIEWER` |

These are development fixtures. A production database must never be seeded with
them.

## 5. Run it

```bash
npm run dev            # API on :4000 and web on :5173, together
```

Or separately:

```bash
npm run dev:api        # http://localhost:4000  (GET /health)
npm run dev:web        # http://localhost:5173
```

Open <http://localhost:5173>, then sign in at
<http://localhost:5173/portal/login> with one of the company accounts above.

The Vite dev server proxies `/api` and `/health` to the API, so the browser sees
a single origin: the session cookie is first-party and no CORS configuration or
`SameSite` relaxation is needed in development.

---

## Commands

All are run from the repository root.

| Command | What it does |
|---|---|
| `npm run dev` | Both workspaces in watch mode |
| `npm run build` | Typecheck and build the API (`tsc`) then the web app (`vite build`) |
| `npm test` | API unit + integration tests, then web component tests |
| `npm run test:api` | API suite only (needs `TEST_DATABASE_URL`) |
| `npm run test:web` | Web suite only (jsdom, no database needed) |
| `npm run typecheck` | TypeScript across both workspaces, no emit |
| `npm run lint` | oxlint (migrated adherence config) + the design-token check |
| `npm run db:migrate` | `prisma migrate dev` — create/apply a migration locally |
| `npm run db:deploy` | `prisma migrate deploy` — apply migrations in a pipeline |
| `npm run db:seed` | Run the development seed |
| `npm run db:reset` | Drop, re-migrate and re-seed the dev database |
| `npm run db:studio` | Prisma Studio, to browse the data |
| `npm run db:verify` | Assert the seeded graph is correct |

End-to-end tests (real Chromium against the real stack) live in
`apps/web/e2e`. They start the API and web servers themselves:

```bash
npm run test:e2e --workspace=apps/web
```

### Database migrations

Schema changes ship as committed Prisma migrations — never by hand-editing a
database:

```bash
# edit apps/api/prisma/schema.prisma, then:
npm run db:migrate -- --name describe_the_change
```

In staging/production the deploy pipeline runs `npm run db:deploy`
(`prisma migrate deploy`), which applies committed migrations and never
generates new ones.

---

## How it fits together

```
apps/web/src
  components/          22 design-system components (.tsx) + index.ts barrel
  styles/tokens/       the design tokens, plus self-hosted webfonts
  layouts/             SiteLayout (public), PortalLayout (company), AdminLayout (staff)
  pages/site/          Home, Services, RemoteSite, Contact
  pages/portal/        Login, Dashboard, Workers, Worker, Requests, RequestDetail,
                       Certificates, StatusTimeline, EmployeeFormModal, NewRequestModal
  pages/admin/         AdminRequests, AdminRequestDetail
  lib/api.ts           the only HTTP client — always credentials: 'include'
  lib/auth.tsx         session state, sourced from GET /api/auth/me
  lib/queries/         React Query hooks (requests, employees, workflow)
  components/RequireAuth.tsx   the /portal/* route guard
  layouts/AdminLayout.tsx      RequireAdmin, the /admin/* route guard

apps/api
  prisma/schema.prisma Company, CompanyUser, AdminUser, Employee, Lab, Request,
                       RequestStatusEvent, Document, Payment, LabNotification
  prisma/seed.ts       two tenants, users, labs, employees, requests across every
                       status, documents, payments and lab dispatches
  src/routes/          auth, requests, employees, labs, documents, certificates,
                       payments, dashboard, admin
  src/middleware/      requireAuth, requireRole, validate, upload, errorHandler,
                       rateLimiter
  src/services/        auth, requestWorkflow (state machine + actor matrix),
                       requests, employees, documents, storage, payments, labs,
                       labNotification
  src/validation/      zod schemas per resource
  tests/               unit, integration, and the tenant-isolation suite
```

### API surface (Phase 1)

**Auth**

| Method | Path | Auth |
|---|---|---|
| `GET` | `/health` | public |
| `POST` | `/api/auth/company/login` | public, rate-limited |
| `POST` | `/api/auth/admin/login` | public, rate-limited |
| `POST` | `/api/auth/logout` | public |
| `GET` | `/api/auth/me` | any session |

**Company portal** — every route below is tenant-scoped from the session

| Method | Path | Notes |
|---|---|---|
| `GET` `POST` | `/api/employees` | list (search, site and active filters, paging) / register |
| `GET` `PATCH` | `/api/employees/:id` | detail + that worker's requests / edit (`COMPANY_ADMIN`) |
| `GET` `POST` | `/api/requests` | queue (status, type, employee, search) / file a request |
| `GET` | `/api/requests/:id` | detail, timeline, documents, payments, dispatches |
| `PATCH` | `/api/requests/:id/status` | request a workflow move (a company may only withdraw) |
| `GET` `POST` | `/api/requests/:id/documents` | list / attach a supporting file (`ATTACHMENT` only) |
| `GET` | `/api/requests/:id/payments` | the ledger rows for one request |
| `GET` | `/api/documents/:id` | metadata |
| `GET` | `/api/documents/:id/download` | streams the bytes behind a tenant check |
| `GET` | `/api/certificates` | the certificate register |
| `GET` | `/api/payments` | the tenant ledger, with totals |
| `GET` | `/api/dashboard/company/summary` | every dashboard figure, aggregated server-side |
| `GET` | `/api/labs`, `/api/labs/:id` | selectable laboratories (any session; read-only) |

**Medical Alliance staff console** — deliberately cross-company, behind the separate `AdminUser` identity

| Method | Path | Role |
|---|---|---|
| `GET` | `/api/admin/companies` | `ADMIN`, `REVIEWER` |
| `GET` | `/api/admin/requests` | `ADMIN`, `REVIEWER` |
| `GET` | `/api/admin/requests/:id` | `ADMIN`, `REVIEWER` |
| `PATCH` | `/api/admin/requests/:id/status` | `ADMIN`, `REVIEWER` |
| `PATCH` | `/api/admin/requests/:id/lab` | `ADMIN`, `REVIEWER` |
| `POST` | `/api/admin/requests/:id/documents` | `ADMIN`, `REVIEWER` — issues `RESULT` / `CERTIFICATE` |
| `GET` | `/api/admin/labs` | `ADMIN`, `REVIEWER` |
| `GET` | `/api/admin/dashboard/summary` | `ADMIN`, `REVIEWER` |
| `POST` | `/api/admin/payments/:id/settle` | **`ADMIN` only** — a reviewer cannot mark money received |

Errors always come back as `{ "error": { "code", "message" } }`. Stack traces
and raw database errors are logged server-side and never sent to a client.

---

## The request workflow

A request moves through one state machine, implemented in
`apps/api/src/services/requestWorkflow.ts` and applied by
`services/requests.ts`:

```
SUBMITTED → PENDING_PAYMENT → APPROVED → AT_LAB → RESULTS_RECEIVED
          → UNDER_REVIEW → COMPLETE
```

`REJECTED` is reachable from any non-terminal state. `COMPLETE` and `REJECTED`
are terminal.

**Clients never set a status.** `PATCH .../status` names a *target*; the service
re-reads the current status inside its transaction and validates the move
against both the state machine and an actor-permission matrix. An impossible
move is `422`; a move this actor may not make is `403`. Every accepted change
appends a `RequestStatusEvent` in the same transaction, so a status can never
change without its audit row.

Who may do what:

- **Medical Alliance staff** drive the clinical pipeline — every forward move.
- **Company users** may do exactly one thing to a request they filed: withdraw
  it, and only while it is `SUBMITTED` or `PENDING_PAYMENT`.

Side effects are preconditions, checked before anything is written: moving to
`AT_LAB` requires an active laboratory (and queues a `LabNotification`), and a
`PER_REQUEST` company cannot have a request approved out of `PENDING_PAYMENT`
while its payment is outstanding.

The API returns `availableTransitions` on every request-detail response — the
same matrix the write endpoint enforces — so the buttons a screen offers and the
permissions the server applies cannot drift apart.

## Documents and storage

Documents (`RESULT`, `CERTIFICATE`, `ATTACHMENT`) hang off a request and carry
their own `companyId`, copied from the parent at write time, so a tenant check
is a plain column predicate rather than a join that could be forgotten.

- Uploads are multipart, capped at `MAX_UPLOAD_BYTES`, and validated against a
  **content-type allow-list** (PDF, PNG, JPEG, WebP, plain text). SVG and every
  active/executable type are refused.
- The stored key is server-generated (`companyId/requestId/uuid.ext`). A client
  filename never becomes a path, so a crafted name cannot escape the storage
  root; it is sanitised separately for display.
- Ownership and content are validated **before** any bytes are written, so a
  rejected upload leaves nothing behind.
- Bytes live behind `StorageAdapter` (`services/storage.ts`) and are streamed by
  `GET /api/documents/:id/download` after a tenant check, with
  `Content-Disposition: attachment`, `Cache-Control: private, no-store` and
  `nosniff`. They are **never** written under `apps/web/public`.
- A company may upload supporting `ATTACHMENT` files only. `RESULT` and
  `CERTIFICATE` are issued by Medical Alliance through the admin route.

**Development limitation:** the only adapter is `LocalDiskStorage`, writing to
`apps/api/var/` (git-ignored). It is per-instance and not replicated — fine for
development, not for production or for more than one API instance. Swapping in
object storage means implementing the interface and changing one factory.

## Billing

**No payment provider is integrated.** Phase 2 models the money without moving
any. A `Payment` row records what is owed, in which currency, under which
arrangement, and whether it has been settled. Amounts are integer **minor
units** (halalas), because integers are exact and serialise to JSON losslessly
where Prisma's `Decimal` does not.

- `PER_REQUEST` companies get a payable request: it enters the pipeline gated on
  payment, and cannot be approved until the charge is settled.
- `SETTLEMENT` companies are invoiced periodically: the request is not gated,
  but a ledger row is still written for the settlement run.

`POST /api/admin/payments/:id/settle` records a settlement that happened
elsewhere (bank transfer, invoice run). It is `ADMIN`-only, so a company cannot
mark its own invoice paid, and it does not pretend a gateway confirmed anything.
A real provider's webhook would call the same service function.

## Laboratories

Laboratories are shared reference data, not tenant-owned. `GET /api/labs` is
readable by any authenticated principal but returns only active labs; writes
live under `/api/admin`, so a company account has no route to modify the shared
list. Assigning one distinguishes its two failure modes: a lab that does not
exist is `404`, while one that exists but has been deactivated is `400` naming
it, so the user can pick another.

## Security model

**Tenant isolation is enforced in the database query, not in the UI.** Every
company-scoped handler takes `companyId` from `tenantScope(req)`, which reads
the authenticated server-side session and throws if there is no company
principal. It goes straight into the Prisma `where` clause:

```ts
const { companyId } = tenantScope(req);          // from the session, never the client
const rows = await prisma.request.findMany({
  where: { companyId, ...(status ? { status } : {}) },
  select: requestSelect,
});
```

A client cannot widen that scope: the create schema is `.strict()` and has no
`companyId` field, so sending one is a `400` rather than being silently ignored;
single-record reads use `findFirst({ where: { id, companyId } })` and answer
`404` for another tenant's id, so the API never confirms that the id exists
elsewhere. The same rule covers every Phase 2 resource — employees, requests,
documents (which carry their own `companyId`), payments and the dashboard
aggregates. `apps/api/tests/tenant-isolation.test.ts` authenticates as one
company and attempts each of these against another's data, including reading,
editing, downloading and transitioning.

Also in place:

- **Passwords** — bcrypt at cost 12 (cost 4 under `NODE_ENV=test` only, for
  suite speed). Hashes are never included in any response.
- **Sessions** — server-side, stored in PostgreSQL (`connect-pg-simple`). The
  browser holds only a signed session id in an `httpOnly`, `SameSite=Lax`
  cookie, `Secure` in production. **No authentication token is ever written to
  `localStorage` or `sessionStorage`.** The session id is regenerated on login,
  so a fixated session cannot become an authenticated one. Admin sessions
  expire sooner than company sessions.
- **Separate identity tables** — `CompanyUser` and `AdminUser` are distinct
  models with distinct login endpoints and distinct code paths, so no bug can
  grant a tenant account admin-console access. Tests assert neither can
  authenticate through the other's endpoint.
- **Authentication failures** are generic: an unknown email, a wrong password
  and a deactivated account return byte-identical responses, and an unknown
  email is still compared against a dummy hash so the timing matches.
- **Rate limiting** — 5 login attempts per 15 minutes per IP + email
  (configurable), IPv6-normalised.
- **Input validation** — zod on every body, query and path parameter.
- **Security headers** — `helmet` on every response.
- **Logging hygiene** — `pino` with request/response bodies never logged, and
  `passwordHash`, `nationalId`, `dateOfBirth`, `notes`, cookies and
  authorization headers redacted.

### Known gaps, deliberately left to later phases

Documented rather than silently in scope:

- **No CSRF token.** Cookie auth with `SameSite=Lax` blocks cross-site form
  POSTs, but a token (or double-submit cookie) on state-changing routes is
  Phase 4 and should land before any public launch.
- **No payment provider.** Billing is modelled and settlements are recorded, but
  nothing captures funds. See *Billing* above.
- **No lab email delivery.** Moving a request to `AT_LAB` records a
  `LabNotification` in `PENDING` — an honest "queued, not delivered". Wiring a
  provider (and the inbound-parse webhook that fills in `inboundReceivedAt`) is
  the remaining half of the Phase 2 lab integration.
- **Local disk storage only.** See *Documents and storage* above.
- **No `/api/contact` endpoint.** The public contact form still shows a local
  success toast without sending anything, exactly as the prototype did.
- **No clinical-notes model.** The worker screen shows the record and its
  examination history; per-visit clinical notes are not modelled.
- **No staff document-upload screen.** Results and certificates are issued
  through `POST /api/admin/requests/:id/documents`; the admin UI shows what is
  attached but does not upload.
- **Layouts are only partly responsive.** The prototype's fixed grids became
  `auto-fit` tracks, but a full responsive and accessibility pass against real
  variable-length data is Phase 3.
- **Lint warnings remain.** `npm run lint` reports non-blocking React-purity and
  `set-state-in-effect` warnings (form-reset effects, relative-date maths) plus
  the prototype's inherited raw px/hex literals. Phase 3 cleanup.

## Troubleshooting

**`Missing required environment variable DATABASE_URL`** — `apps/api/.env` does
not exist or is empty. Re-do step 3.

**`TEST_DATABASE_URL is not set`** when running `npm test` — the API suite needs
its own database; see steps 2 and 3.

**`429 TOO_MANY_ATTEMPTS` on login during development** — the rate limiter is
working. Wait out the window, use a different demo account, or raise
`AUTH_RATE_LIMIT_MAX_ATTEMPTS` in `apps/api/.env`.

**Login succeeds in curl but the browser stays signed out** — make sure the app
is reached through the Vite dev server (`:5173`), not the API port directly. The
cookie is first-party only on the proxied origin.
