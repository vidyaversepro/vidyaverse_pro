# Indic UI/UX upgrade — progress

Tracks execution of `CLAUDE_CODE_PROMPT.md` against `reference/*.dc.html`.
Read this before starting a new phase — it's the "what's already true" so you
don't re-derive it. Update it at the end of each phase.

**Status: ALL FIVE PHASES DONE + the wider Phase-4 module rollout, and
`main` IS LIVE ON ALL OF IT** (`5354155`, 2026-08-26 — the merge
fast-forwarded `main` from `33d8e2e` straight to the whole re-skin plus
the 6 stranded backend bug fixes). Includes the `templates/` canvas editor
(the one piece explicitly deferred — see "Templates canvas editor" below).
Landing page also fully reference-matched (not originally phase-scoped,
done as a follow-up ask). Everything is **committed and pushed** to
`origin/design/indic` — pushing this branch does NOT deploy (Coolify
watches `main`; confirmed via `origin/HEAD -> main`). The Indic re-skin of
Vidyaverse Pro is, as of this writing, feature-complete against the
5-phase plan. What's left is explicitly out of THIS plan's scope (see
"Not in scope" at the very bottom) — a wider Phase-4-style rollout to
non-doc-studio module pages, and a couple of pre-existing backend defects
found along the way.

**Phases 3 & 4 are now LIVE-VERIFIED (2026-08-16)** — first authenticated
click-through against a running backend + Postgres. Six pages exercised at
desktop (1280) and mobile (375). Three defects found and fixed; the transport
one then fixed too. See "Live verification 2026-08-16" below.

**Phase 5 STARTED (2026-08-16)** — shared-primitives sweep (PageLoader +
EmptyState) and Settings done; **all 8 Document Studio galleries now restyled to
the archetype** (shared `DocumentPreviewCrest`, `GenerateDocsModal` + stepper;
`Certificates`/`Marksheets`/`LibraryCards` live-verified; `IdCards`/`GroupPhotos`/
`HallTickets`/`VisitingCards`/`TransferCertificates` done + tsc/eslint/residual-
scan clean, not yet live-verified). **Student-facing saathi + visionarium also
now archetyped** (7 files, tsc/eslint/residual clean, not yet live-verified).
**Institution detail also archetyped** (InstitutionDetailPage + 3 institutions/*
components, tsc/eslint/residual clean, not yet live-verified). Remaining Phase 5:
only the `templates/` canvas editor (flagged "treat separately"). See "Phase 5 —
STARTED" and "Document Studio" below.

**6 bug-fix commits (2026-08-16, unpushed):** `fix(attendance)`,
`fix(transport)` (also added the missing `StudentTransport.stop` schema
relation), `fix(fees)`, `fix(certificates)`, and one batch `fix(printables)`
covering 7 more doc-studio list endpoints (id-card/marksheet/hall-ticket/
library-card/group-photo/transfer-certificate/visiting-card) — the SYSTEMIC
`take: <string>` 500 is now cleared across all of Document Studio. The
InstitutionsPage duplicate-key fix stays uncommitted because it's inseparable
from the uncommitted Phase 3 rewrite.

---

## Phase 0 — Accent/theme foundation (done)

- `stores/theme.store.ts`: `accent: 'kumkum' | 'peacock'` + `setAccent`,
  persisted under `vp-dashboard-theme`.
- `App.tsx` `ThemeSync`: toggles `acc-peacock` on `<html>` alongside `dark`.
- New `styles/accent-peacock.css` (app-local, NOT the generated
  `indic-app.css`): peacock's `--accent-primary*`/`--accent-strong*`/
  `--accent-soft*`/`--accent-contrast*`/`--accent-primary-dark*` as bare HSL/
  RGB triplets — never redefine `--primary`/`--ring`/`--accent` as full
  colours, that silently kills every `bg-primary/50`-style opacity utility.
  Imported last in `main.tsx` (must win a same-specificity tie against every
  earlier `:root` block).
- Settings → Appearance (`pages/settings/SettingsPage.tsx`): added a Kumkum/
  Peacock picker next to the existing light/dark cards; also fixed a
  hardcoded `#E63946` there to use `--primary` instead.
- **Not done, deliberately**: per-tenant appearance persistence. No
  super-admin appearance store/endpoint exists — building one would violate
  the "introduce zero new data" rule. Flag if this becomes a real ask.

## Phase 1 — Responsive shell (done)

- New `components/layout/nav-config.ts`: all **43** admin nav items (not 39
  — recounted from source) grouped into 7 categories — Overview /
  Document Studio / Engage / Academics / Operate / Insights / System — zero
  items added or dropped, same `{label, icon, href, module?}` shape so
  entitlement filtering is unchanged. `studentSidebarItems` (5 items) stays
  flat.
- `components/layout/DashboardLayout.tsx` rewritten: desktop (`lg:`+) keeps
  the grouped sidebar; below 1024px there's no sidebar at all — replaced by
  a top app bar (avatar/greeting/notifications) + a fixed 5-tab bottom bar
  (Home · Students · Docs · Chat · More) + a "More" bottom-sheet. The sheet
  and the sidebar are fed by the **same** entitlement-filtered `navGroups`,
  so they can't diverge. Reused the existing `mobileSidebar` store flag
  (`stores/layout.store.ts`) — repurposed from "drawer open" to "sheet open".
- `HamburgerButton.tsx` simplified: it's desktop-only now (mobile no longer
  has anything for it to toggle), so the old
  `window.innerWidth < 1024 ? toggleMobileSidebar() : toggleSidebar()`
  branch — a real latent bug, since it only checked width on click, not on
  resize — is gone entirely rather than patched.
- `components/shared/StatCard.tsx` got a `tone?: 'saffron'|'teal'|'gold'|
  'indigo'|'lotus'` prop wired to the `stat-icon-*` design-system classes.
  `components/dashboard/QuickActionsPanel.tsx`'s per-item rainbow Tailwind
  gradients (from `pages/dashboard/dashboard.config.ts`'s `QUICK_ACTIONS`)
  replaced with one consistent `indic-icon-plinth` — this was an explicit,
  literal violation of the master doc's "no rainbow" line.
  `MainAdminDashboardView` / `SchoolAdminDashboardView` /
  `TeacherDashboardView` (previously hand-rolled headers + raw stat `Card`s,
  bypassing shared components) brought onto `PageHeader` + `StatCard`, same
  as `SuperAdminDashboardView` already was.

## Landing page — reference-matched (done, follow-up ask)

Not in the original Phase 0–5 scope but the master doc's reference table
does list `Vidyaverse Landing.dc.html` → `pages/landing/*`, so treat it as
covered. Two rounds:

**Round 1** — structural gaps: two fully-built orphaned components
(`LiveCommandCentre.tsx`, `DocumentStudio.tsx`) existed but were never
imported into `LandingPage.tsx`; built `ROICalculator.tsx` from scratch
(reference's exact formula — hours = students×0.6, messages = ×14,
docs = ×9); consolidated the old `ComparisonSection.tsx` (a mismatched
table layout) and `ProblemSection.tsx` (similar content, wrong position/
styling) into one dark two-card "old way / Vidyaverse way" section matching
the reference's `#compare`, then deleted `ProblemSection.tsx` (fully
superseded); reordered `LandingPage.tsx` to the reference's sequence.

**Round 2** — "exact similarity" pass, per explicit user request: audited
every remaining section against the reference line-by-line.
`HowItWorks.tsx` had **entirely wrong content** (a leftover 4-step "upload →
template → AI → download" flow instead of the reference's 3-step "set up →
toggle modules → go live" flow) — rewritten. `EcosystemSection.tsx`
rebuilt to use the actual `mandala-floral.png` asset at the reference's
exact orbital node positions (was a hand-built SVG hub/satellite system).
`StatsSection.tsx`: **the reference has no testimonial section at all** —
removed the rotating 3-testimonial carousel entirely, rebuilt as the
reference's plain light 4-stat counter band. `CTASection.tsx`: exact
heading/copy/gradient/mandala decoration, dropped a 3-icon assurance strip
that isn't in the reference. Also fixed several spots that hardcoded
`var(--kumkum)` where the reference (and this app's own `landing.css`) uses
the accent-swappable `var(--brand)`/`var(--brand-2)` — matters for
kumkum⇄peacock switching to stay consistent.

**Round 3** — mandala fixes, per explicit user request:
- Hero mandala: found and fixed a real regression — I'd merged the
  positioning transform (`translateX(-50%)`) and the `lg-breathe` animation
  (which itself animates `transform: scale()`) onto the same div, so the
  animation silently clobbered the static centering transform, throwing the
  mandala ~450px off-center. Fixed by splitting back into two nested divs
  (outer = position only, inner = breathe only) — **this pattern
  (position and CSS-`transform`-animation must live on separate elements)
  is worth remembering for any other animated/positioned decoration.**
- User then clarified they want the mandala **not centered** — specifically,
  its left edge should sit at the "Vidyaverse" headline's horizontal centre,
  so the flower's left half drapes over the headline's right half and the
  rest is clipped by the section's `overflow-hidden`. Implemented via
  `left: '50%'` with **no** `translateX` (the wrapper's left edge, not its
  centre, lands at the 50% point) — confirmed with live `getBoundingClientRect`
  measurements, not just visual inspection (screenshots were unreliable this
  session — see gotchas below).
- New shared `pages/landing/components/CardMandala.tsx` — small (88px),
  low-opacity (0.16), single-colour rotating 12-petal decoration (same
  shape as `CTASection.tsx`'s corner mandala, not the `mandala-floral.png`
  photo). Wired into all 15 cards that needed it: `ModuleUniverse` (6),
  `UseCases` (6), `EcosystemSection`'s app cards (3). Tinted to each card's
  own accent colour.
- `UseCases.tsx` also got a general restyle to match the cleaner elevated-
  card language used everywhere else on the page (was using the busier
  `indic-tile` treatment with gold-glow icon plinths and visible background
  watermark patterns).

---

## Phase 2 — Auth (done)

Matches `reference/Auth Pages.dc.html`. Every page kept its existing hooks,
react-hook-form + zod schemas, and API calls untouched — only markup/styling
changed.

- New shared `pages/auth/components/AuthShell.tsx`: the split-screen frame
  used by every auth page. Desktop (`lg:`+) renders `.indic-auth-aside` (the
  design system's pre-existing dark brand panel class — exactly the class the
  master doc named, no new CSS needed) as a 44%-width left column with a
  giant low-opacity rotating `<MandalaMark>` background decoration, a small
  foreground mark + "Vidyaverse" wordmark, the reference's headline +
  Devanagari tagline + 3 brand-point bullets + trust line. Below `lg` the
  aside is hidden entirely and a compact mandala+wordmark header sits above
  the form instead — matches the reference's phone/tablet behaviour exactly.
  Takes `heading`/`sub`/`statusIcon`/`infoCard`/`footer`/`children` props so
  every page slots its own real form or status content in.
- New shared `pages/auth/components/PasswordRules.tsx`: the live
  8-chars/uppercase/number strength chips, extracted once and reused by
  Register/Reset/AdminSignup (previously three separate copies of the same
  array+map).
- `LoginPage` / `RegisterPage` / `ForgotPasswordPage` / `ResetPasswordPage` /
  `VerifyEmailPage`: all rebuilt on `AuthShell`, all off-brand hex
  (`#E63946`/`#8B5CF6`/`#2563EB`) replaced with tokens (`gradient-text-indic-
  soft` headline, default accent `Button`, `text-primary` links). Every state
  the prototype defines is present: Forgot's sent state, Reset's success/
  invalid states, Verify's waiting/confirmed/error states (confirmed still
  reads the real session + role to pick the post-verify destination, exactly
  as before).
- `AdminSignupPage`: also rebuilt on `AuthShell`, using the `infoCard` slot
  for the institution-name + admin-email summary — still sourced from the
  real `useValidateInvitation` query, not hardcoded. No-token / validating /
  invalid-token / success states all present.
- `oauth/ConsentPage`: left as its own centred-card layout rather than forced
  into `AuthShell` — it's a mid-session permission grant (already
  authenticated), not a pre-auth screen, and the reference prototype defines
  no state for it. Only light-touched: the generic `Shield` icon swapped for
  `<MandalaMark>` for brand consistency; already-token-driven `bg-primary`/
  `text-primary` usage left as is.
- Deliberately **not** touched: `AuthBackdrop` / `authCardClassName` in
  `design/indic/motifs/auth-backdrop.tsx` — that component is a *centred*
  mandala-behind-card pattern (confirmed by reading PDLMS's `/login`, which
  uses it that way), not the *split brand-panel* pattern the reference and
  the master doc's `.indic-auth-aside` class specify. The two are different
  shapes; building a dedicated `AuthShell` around `.indic-auth-aside` was the
  match to the reference, not a duplicate of existing work.

**Verified**: `tsc --noEmit` zero errors, `eslint` zero warnings, `npm run
build` succeeds. Dev server (already running on :5173 from another session)
checked live — desktop split layout measured at exactly 44% aside width via
`getBoundingClientRect`, mobile (375px) collapses the aside and shows the
compact header, password-strength chips update live on input, and every
status-screen variant (forgot-sent, reset-invalid, verify-sent, admin-setup-
invalid-link, consent-sign-in-required) renders with real content via direct
URL/query-param navigation. Screenshot tool was unavailable this session (same
gotcha as before — see below); verification used `read_page`/`get_page_text`/
`javascript_tool` instead, not visual screenshots.

### Follow-up fixes after the user's own screenshots (post-Phase-2)

Two rounds of correction once the user actually looked at a phone-width
render — worth recording since neither showed up in tsc/build/DOM checks:

1. **Removed a background mandala decoration I'd added to the mobile/tablet
   compact header.** The user asked for "a small rotating floral mandala" on
   mobile/tablet; without a working screenshot I over-interpreted this as
   "add a new low-opacity 220px background element" instead of recognising
   the existing 52px header icon already satisfied the ask. At 0.14 opacity
   a red disc with white petals on a cream page reads as a smudge, not a
   flower — the user's screenshot caught it immediately. Reverted; the
   reference (`Auth Pages.dc.html` line 111-114) has no such element, only
   the plain spinning icon.
2. **Found and fixed a real cross-app rendering bug** — the small header
   icons (both desktop-aside 34px and mobile 52px) were rendering as a
   hollow ring + centre dot with no disc fill or visible petals at all. Root
   cause: the canonical `MandalaMark` (`PDLMS_Pro/components/auth/
   mandala-mark.tsx`, synced into all 3 apps) hardcoded `id="mm-core"` on
   its `<radialGradient>`. `AuthShell` is the first page in the whole trio
   to mount 3+ `MandalaMark` instances on one page at once (giant aside
   background + small aside icon + small mobile icon), and one of them
   sits inside a `display:none` subtree at the opposite breakpoint. SVG
   `url(#id)` resolution is document-global, not scoped per `<svg>` root, so
   the duplicate id resolved to a gradient living in non-rendered content
   and silently failed to paint — leaving only the direct-colour stroke
   ring and centre dot (no gradient reference) visible, exactly what the
   user's screenshot showed. **Fixed at the canonical source**
   (`components/auth/mandala-mark.tsx` in PDLMS_Pro, not the vendored
   copies) with a module-level counter giving every render its own
   `mm-core-N` id — no hooks used, so the portability contract (no hooks,
   works in Vite + both Next runtimes) still holds. Synced via
   `node shared/design/indic/sync-indic.mjs` to Vidyaverse and
   DigiClassroom; `--check` now reports no drift. `tsc --noEmit` re-run
   clean in all three repos (PDLMS 539 pre-existing errors unrelated, DCP
   339 pre-existing unrelated, Vidyaverse zero), confirmed live via
   computed-style checks that gradient stops now resolve real colours and
   each instance's `fill` references its own id.
   **This bug can recur on any page that mounts 2+ `MandalaMark`s at once**
   — it was latent everywhere before, just never triggered. Worth a
   deliberate check next time a screen (e.g. a dashboard with a sidebar
   crest + a card watermark + a loader) stacks multiple marks
   simultaneously.

---

## Phase 3 — Dashboards (done)

Matches `reference/Dashboards.dc.html`'s two screens: Institutions and
Student. Same rule as every phase — hooks, React Query keys, and API calls
untouched; only markup/styling changed.

- `pages/dashboard/InstitutionsPage.tsx`: rewritten in full. `PageHeader` →
  stat-card row (real `total` from `useInstitutions`'s pagination; Active/
  Trial/Suspended stay the pre-existing `"-"` placeholder — there is still no
  stats endpoint, and computing them client-side from one paginated page of
  `useInstitutions` would silently undercount, which is worse than an honest
  dash) → search input + status/tier filter **chips** replacing the old
  `Select` dropdowns (same `statusFilter`/`tierFilter` state, same
  `useInstitutions` filter params — purely a control-type swap, matches the
  reference's touch-friendly chip row) → **table at `lg:`+ / tappable card
  list below `lg`**, one breakpoint, same as the shell. Status/tier badges
  are small local `StatusPill`/`TierPill` components using the same literal
  tone palette (`#15803d` green / `#B8860B` temple / `#C0392B` red /
  `#006A6E` peacock) established in Phase 2's `AuthShell` status icons —
  intentionally not the 5-tone `stat-icon-*` plinth set, since that's for
  icon plinths and has no red/green; semantic status pills carrying literal
  semantic colour is the same pattern the reference itself uses. Delete
  confirmation's destructive button switched from hardcoded
  `bg-red-600 hover:bg-red-700` to `bg-destructive` tokens (found
  `AlertDialogAction` has no `variant` prop, unlike `Button` — fixed with
  className instead of the CVA-style prop that seemed obvious).
- `pages/student-dashboard/StudentDashboardPage.tsx`: rewritten in full —
  profile header, 3 identity mini-cards, then an `auto-fit minmax(300px,1fr)`
  widget grid (attendance donut, today's classes, fee status, notices,
  transport, **hostel** — a real card the reference doesn't show at all,
  kept since removing working functionality just because the reference
  didn't happen to include it would be a regression, not a re-skin), quick
  links. One real addition beyond pure restyling: **wired a "Pay now"
  button** the old page never had, using `FeeInvoice.paymentLinkUrl` — a
  field that already exists on every invoice returned by
  `useStudentInvoices` — rather than inventing an endpoint; the button only
  renders when an unpaid invoice actually carries a link.
- `components/shared/PageHeader.tsx` (shared primitive, one line): title
  `<h1>` gained `arch-section-header` (the toran-underline class) and lost
  `font-bold`. The doc's own Phase 3 line explicitly names "PageHeader
  (toran underline)" as part of this phase, and the `font-bold` removal
  isn't optional styling — it was a live violation of the master doc's hard
  constraint #2 (Yatra One is 400-weight-only) sitting on every single page
  that renders a `PageHeader`, not just these two. Fixing it here lifts
  every other page's header for free, which is the explicit point of a
  shared primitive.

**Verified**: `tsc --noEmit` zero errors, `eslint` zero warnings on all
touched files, `npm run build` succeeds. **Not verified live** — both pages
sit behind `AdminRoute`/`ProtectedRoute` and there is still no local backend
or Postgres running this session (same limitation Phase 1 hit; see the
Verification pattern section below, point 6). Structural correctness only:
no DOM/computed-style check, no responsive breakpoint measurement, no click-
through of the filter chips or the mobile card list. **A real authenticated
pass through `/app/institutions` and `/student/dashboard` — both breakpoints
— is the first thing to do next session if the backend gets started**, before
trusting this phase the way Phase 1/2 have now been trusted.

---

## Phase 4 — Module pages (done)

Matches `reference/Module Pages.dc.html`'s four screens: Students,
Attendance, Fees, Admissions. Same rule as every phase — hooks, React Query
keys, and API calls untouched; only markup/styling changed. Scoped to
exactly the four files the master doc names
(`pages/{students,attendance,fees,admissions}/*`); the doc's wider
"then roll the same treatment to Users, HR, Transport, Inventory, Health,
Hostel, Alumni, Placement, Notices, Assignments, Gradebook, OnlineTests"
list is **not** covered — that's a much larger follow-on, not part of this
pass.

- `pages/students/StudentsPage.tsx`: the "table archetype" reference page —
  this is the one to look at first for the pattern applied everywhere else
  this phase. Stats → 4-tone `StatCard`s (teal/gold/saffron/indigo, same
  rotation as Phase 3's Institutions page). The old inline bulk-action
  buttons stuffed into the header (`Delete Selected (N)` / `Request Photos
  (N)`) are now a proper floating gradient selection bar that appears above
  the table when `selectedIds.size > 0` — matches the reference's
  `showSelBar` element exactly and cleans up the header, which still keeps
  Approval Queue / Bulk Import / Add Student (real features the reference
  doesn't show, kept because dropping them isn't a re-skin). **Added a
  mobile/tablet card list — this page had no responsive variant at all
  before**, only ever a table; new local `Pill`/`NeutralPill` helpers
  (same literal-tone-hex convention as every other page this phase) render
  the data-status and linked/no-account badges in both the table and the
  new cards. `StudentFilterBar`'s cascading Institution→Class→Stream→
  Section→Status selects were **kept as real Selects, not converted to
  chips** — the reference's simpler search+chip row doesn't have an
  equivalent for a dynamic, cascading, potentially-long option list; only
  the container's hardcoded `bg-white dark:bg-gray-900` became `bg-card`.
- `pages/attendance/AttendancePage.tsx`: Overview/Sessions/Reports tabs
  (already existed) got `PageHeader`, tone-driven `StatTile`s with the
  present/late/absent VALUES themselves carrying literal semantic colour
  (green/amber/red) as the reference's `valTone` does — `StatCard` doesn't
  support a coloured value, so this page (and Fees) use a small local
  `StatTile` instead of forcing the shared component. Both the Overview's
  per-section breakdown and the Sessions tab got table→card responsive
  splits; Reports' generated table was left desktop-table-only (with
  horizontal scroll) since the reference itself defines no card layout for
  it — it only shows the filter form for that tab, not results.
- `pages/fees/FeesPage.tsx`: summary tiles (billed/collected/outstanding/
  rate) on the same `StatTile` pattern. Structures tab got a table→card
  split; **Invoices tab was rebuilt as a single unified card-row list at
  every breakpoint**, matching the reference exactly — unlike every other
  screen this phase, the reference's own Invoices section has no separate
  desktop-table variant at all, just one card layout throughout. Copy-
  payment-link and WhatsApp-reminder icon buttons were already real
  (`useCreatePaymentLink`, `useSendFeeReminder`) — kept as-is, just
  restyled. Status filter buttons switched from `Button` toggle to the
  established chip-button convention.
- `pages/admissions/AdmissionsPage.tsx`: needed the least structural work —
  the kanban pipeline, "All Enquiries" table tab, detail `Sheet` with
  activity timeline, and convert-to-student flow all already existed and
  already matched the reference's shape. Restyling surfaced **several real
  hardcoded `bg-white` / `dark:bg-gray-900` instances that were silent dark-
  mode bugs** (search input, filter selects, sticky table header, the
  detail sheet and its cards, the convert-to-student footer bar) — all
  replaced with `bg-card`/`bg-background`/`bg-muted` tokens. Status pills
  across the kanban cards, table, and sheet switched from a 6-colour raw-
  Tailwind rainbow (`bg-blue-100`, `bg-purple-100`, etc., unrelated to the
  Indic palette) to the same `STATUS_TONE` hex map used everywhere else
  (new→indigo, contacted→peacock, visited→lotus, application→temple,
  admitted→green, lost→red — matches the reference's own `ESTAT`). Added a
  mobile/tablet card list for "All Enquiries" (previously table-only); the
  kanban itself was already the reference's horizontally-scrolling pattern,
  untouched.

**Verified**: `tsc --noEmit` zero new errors across all four pages, `eslint`
zero new warnings (the 2 warnings reported pre-exist untouched in
`StudentFilterBar`'s `useEffect` deps and `StudentsPage`'s `hasStreamColumn`
`useMemo` deps — same hook bodies as before this phase, not introduced by
it), `npm run build` succeeds. **Not verified live** — same backend/Postgres
gap as Phase 3; all four pages sit behind route guards. Structural
correctness only.

---

## Live verification 2026-08-16 — Phases 3 & 4 finally seen running

First session with a real backend. Started `pnpm dev:backend` (tsx, :3002,
Postgres `vv_gate` on :5439) + `pnpm dev:frontend` (vite, :5173). The local
`vv_gate` DB was reset to owner-only, so the super-admin password no longer
matched the seed; reset it locally (better-auth scrypt hash, same params as
`seed.ts`) to `Admin@123` to log in. Logged in as `thevinstitution@gmail.com`
(super_admin) for the AdminRoute pages, and as `study0644@gmail.com` (the ONE
student user linked to a real student profile — Aarav Sharma, Virat Gurukul 2)
for the student dashboard, after locally flipping its `email_verified`.
Screenshots were down again (same "pane not displayed"); verified via
`read_page`/`get_page_text`/`javascript_tool` + computed styles + network bodies.

**All six pages render with REAL data and the table↔card breakpoint works:**
- **Institutions** (Phase 3): desktop table (4 real institutions) ↔ mobile card
  list, honest `-` stat placeholders, 5-tab bottom bar (Home·Students·Docs·
  Chat·More) at <lg. Real `total` from pagination.
- **Student dashboard** (Phase 3): full real profile for Aarav Sharma — identity
  cards (11th—A, admission VG0-2620-0001), attendance donut, fee status
  "All clear", 9 ID cards + hall ticket + 5 certificates from `/auth/me/documents`.
  Single-column at mobile, no horizontal overflow.
- **Students** (Phase 4): desktop table (10 of 40 real rows) ↔ mobile cards,
  per-row checkboxes, floating selection bar ("1 selected" + Delete + Request
  Photos) appears on selection, restyled EmptyState when unscoped.
- **Attendance** (Phase 4): stat tiles + Overview/Sessions/Reports tabs render.
- **Fees** (Phase 4): 4 summary tiles + Structures/Invoices tabs render.
- **Admissions** (Phase 4): kanban is a real `overflow-x-auto` container
  (scrollWidth 1620 > clientWidth 672), all 6 pipeline columns present.

**Fixed this session (3):**
1. `pages/dashboard/InstitutionsPage.tsx` — **re-skin regression.** The status
   filter chips and tier filter chips are siblings in one flex row and both
   emitted `key="All"` → React "two children with the same key" warning on every
   render. Namespaced the keys (`status-${value}` / `tier-${value}`). Only a
   live render surfaced this; tsc/build/DOM never would.
2. `backend/.../attendance/attendance.routes.ts` — **pre-existing backend bug,
   blocked verification.** `GET /attendance/sessions` 500'd
   (`Argument take: Expected Int, provided String`): the handler read
   `request.query` raw and never ran it through `attendanceQuerySchema`, so the
   schema's `.transform(Number)` on `page`/`limit` never fired. Fixed by parsing
   the query through the (already-imported) schema. Required a backend restart
   (tsx has no watch).
3. `frontend/.../lib/queries/payments-queries.ts` — **pre-existing bug.** Fees
   "Outstanding" tile showed **₹NaN**: the API returns `totalOutstanding` but
   `FeeSummary`/FeesPage read `outstanding` (undefined). Normalised in the
   query's `queryFn` (`outstanding ?? totalOutstanding ?? 0`) — no invented data.
   The old pre-reskin FeesPage had the same bug, so the re-skin correctly
   preserved the (broken) mapping; this just fixes it.

All three are tsc-clean (frontend exit 0, backend attendance.routes.ts clean).

**Found, NOT fixed — pre-existing backend defects on secondary student-dashboard
cards (report, don't drive-by patch):**
- `GET /auth/me/transport` **500** — `auth.routes.ts:172` does
  `include: { route: true, stop: true }`, but `StudentTransport` has only a
  `stopId` scalar and **no `stop` relation** (schema line ~2359). The handler
  then reads `assignment.stop.name/pickupTime/dropTime`, so this endpoint has
  never worked. Real fix needs a schema relation + migration (or dropping stop
  details) — a deliberate decision, not a UI-verification patch.
- `GET /auth/me/hostel` **404** — likely "no allotment" (benign) or a missing
  route; the card degrades gracefully.
- A global **Chat WebSocket** error (livekit/chat), unrelated to these pages.
  The dashboard renders correctly around all three.

**Local-only setup changes (NOT app code, do not commit):** super-admin +
`study0644` passwords reset in `vv_gate`; `study0644.email_verified=true`; a new
`.claude/launch.json` (backend+frontend configs). Prod is untouched.

## Phase 5 — STARTED 2026-08-16 (shared primitives + Settings done)

Phase 5 is the broad "remainder" phase. Began with the two highest-leverage,
well-scoped pieces; the big surfaces (Document Studio, student-facing
saathi/visionarium, Institution detail) are NOT started.

**Done + live-verified:**
- **Shared-primitives sweep** (touch once, lifts all):
  - `lib/lazy-page.tsx` `PageLoader` — the plain border-spinner is now a
    spinning `<MandalaMark size={56}>`; app-wide loading identity.
  - `components/shared/EmptyState.tsx` — icon now sits on an
    `indic-icon-plinth` (white icon on the accent gradient) with a faint
    rotating `MandalaMark` crest behind it; dropped the `font-semibold` on the
    `<h3>` (a live constraint-#2 violation — `h1/h2/h3` are globally Yatra One
    400-only, confirmed in `indic-design-system.css:98-100`). Verified live on
    `/app/students` unscoped: plinth bg = kumkum `rgb(192,57,43)`, icon white,
    h3 weight 400, mandala SVG present, zero console errors.
  - `StatCard`/`PageHeader` were already brought onto the system in Phase 1/3.
- **Settings** (`pages/settings/SettingsPage.tsx`):
  - Page `<h1>` and the three section `<h2>`s now use `arch-section-header`
    (toran underline) and dropped `font-bold`/`font-semibold` — verified h1
    renders Yatra One **weight 400** with 2 arch headers on the page.
  - Off-brand `#E63946`/`#C41E3A` removed: the avatar gradient now uses the
    accent (`--accent-primary`→`--accent-strong`, verified kumkum
    `rgb(192,57,43)`), and the two submit buttons dropped the hardcoded red so
    the default accent `Button` shows.
  - Hardcoded `text-gray-900 dark:text-white` (×9) → `text-foreground`;
    `bg-white dark:bg-gray-900` card containers (×3) → `bg-card`.
  - The Phase-0 Appearance accent/theme control is unchanged.

`tsc --noEmit` exit 0 after all Phase 5 edits. These are re-skin changes, left
UNCOMMITTED with the rest of the redesign (only the 3 standalone bug fixes were
committed — see the git log: `fix(attendance)`, `fix(transport)`, `fix(fees)`).

**Document Studio — ARCHETYPE done + verified (2026-08-16); 8 galleries remain:**
- **New shared `components/printables/DocumentPreviewCrest.tsx`** — the
  "preview is the hero" identity: gold (temple-stone) hairline frame + faint
  mandala watermark + `MandalaMark` crest + optional Yatra One label. This is
  the fallback every doc-type card shows when there's no rendered thumbnail.
- **`components/printables/GenerateDocsModal.tsx`** (shared by all 9 pages —
  lifts everything): removed all off-brand `#b7102a`/`#8f0c21` (submit button →
  default accent `Button`, focus rings → `ring`/`primary`, select-all/checkbox
  accents → `primary`); slate/gray inputs → `bg-muted`/`border-border` tokens;
  result `<h3>` dropped `font-semibold`; **added a 3-step header stepper
  (Scope → Details → Generate) derived from real state (`scopeReady`,
  `canSubmit`) — it reflects progress, never gates.** Verified live: stepper
  renders, active step ringed kumkum `rgb(192,57,43)`, submit bg = accent, zero
  `#b7102a` left in the dialog.
- **`pages/certificates/CertificatesPage.tsx`** — the Document Studio archetype
  (do the other 8 the same way). `PageHeader` (toran h1), search + accent filter
  chips (was off-brand amber gradient), cards → `indic-card` with the
  `DocumentPreviewCrest` fallback, type badge → single accent chip (was a
  6-colour rainbow map, deleted), shared `EmptyState`, all `text-gray-*`/
  `bg-white dark:bg-gray-900` → tokens. Verified live on Virat Gurukul 2: 12
  real cards, crest SVGs present, titles Yatra One 400, `/certificates` 200.

**Galleries restyled to the archetype (2026-08-16):** `CertificatesPage`
(archetype), **`MarksheetsPage`**, **`LibraryCardsPage`** — all live-verified
(PageHeader toran h1 at weight 400, `indic-card` grid, shared `EmptyState`, all
off-brand hex/`brand-*`/gray → tokens, endpoints 200). MarksheetsPage: 4 real
cards. LibraryCardsPage: no `brand-*` classes remain, selection/indicator now
`primary` tokens.

**ALL 5 remaining Document Studio galleries — DONE (2026-08-16)**, archetype
applied and structurally verified: **`IdCardsPage`**, **`GroupPhotosPage`**,
**`HallTicketsPage`**, **`VisitingCardsPage`**, **`TransferCertificatesPage`**.
Every one now uses `PageHeader` (toran h1) + shared `EmptyState`, with all
off-brand hex (`#E63946`/`#b7102a`/`#8f0c21`), `brand-*`, raw gray, `bg-white
dark:bg-gray-*`, and rainbow gradients converted to tokens. Card treatment
follows the **verified LibraryCards preview-card pattern** — `rounded-lg
border-2` with `border-primary ring-primary/20` selection over `bg-card`/
`bg-muted`, NOT the `indic-card` list-surface class (that's for the Certificates/
GroupPhotos list shape; GroupPhotos additionally uses `indic-card` for its stat
cards, and its rainbow stat cards were folded into `StatCard`). No `<h3>` carries
`font-bold`/`font-semibold`.

**Verified (structural, this session):** `npx tsc --noEmit` **exit 0**, `npx
eslint` on all 5 **exit 0**, and a residual grep for off-brand hex / `brand-*` /
raw gray / `bg-white` / rainbow gradients across all 5 returns **zero hits**.
**NOT live-verified** — same as Phases 3/4 originally: no authenticated
click-through / screenshot pass yet (screenshots were down last session; these
pages sit behind route guards). A real run of `/app/{id-cards,group-photos,
hall-tickets,visiting-cards,transfer-certificates}` at both breakpoints is the
outstanding trust step. Left UNCOMMITTED with the rest of the redesign.

**Still remaining in Document Studio:** the `templates/` editor — a complex
canvas tool (CanvasEditor, LayersPanel, PropertiesInspector, Ruler) — **treat
separately, not a gallery re-skin.** **Print/generation pipeline stays untouched
— visual only.**

**✅ SYSTEMIC backend bug — `take: <string>` 500s — BATCH-FIXED + committed.**
Several list endpoints read `request.query` raw instead of parsing through their
zod schema, so `.transform(Number)` on `page`/`limit` never fired and Prisma
rejected `take: "12"`. Fixed + committed: `attendance/sessions`, `certificates`,
and (one batch commit `a32c954`) `id-card`, `marksheet`, `hall-ticket`,
`library-card`, `group-photo`, `transfer-certificate`, `visiting-card`. All seven
doc-studio list endpoints verified 200 (with `x-institution-id`). The fix is
always `const query = <x>QuerySchema.parse(request.query)`. If OTHER app areas
show the same 500 (social, portfolios, notifications, etc. also read raw query),
apply the same one-liner — not yet done, out of the doc-studio scope.
- **Student-facing — DONE (2026-08-16)**, archetype applied + structurally
  verified (tsc 0, eslint 0, residual off-brand scan clean, no `<h1/h2/h3>`
  carries a bold weight). Files: `saathi/{SaathiFeedPage,SaathiConnectionsPage}`
  + `saathi/components/SaathiChatPanel`, and `visionarium/{VisionariumPage,
  TestSeriesPage,SubmissionsPage,MagazineTab}`. All inline empty states replaced
  with the shared `EmptyState`; every page h1 now `arch-section-header` (toran,
  Yatra One 400); the per-feature decorative colours (rose/orange/emerald/indigo/
  blue + gradient avatars) folded to `primary`/accent tokens, gray surfaces/text
  → `bg-card`/`bg-muted`/`border-border`/`text-foreground`/`text-muted-foreground`.
  **Genuine status colours kept semantic** (Accept green, Decline → `destructive`,
  submission status map, "Saathi ✓" / "Published" pills) — same rule the galleries
  used. `SaathiCallPage` left minimal per plan (its dark full-screen video-call
  loader is correct as-is). **NOT live-verified** — same caveat as the doc
  galleries; a real student-session click-through is the outstanding trust step.
- **Institution detail — DONE (2026-08-16)**, archetype applied + structurally
  verified (tsc 0, eslint 0 apart from 2 pre-existing `activeStreams`/useMemo
  hook-dep warnings, structural off-brand scan clean, no `<h1/h2/h3>` bold).
  Files: `dashboard/InstitutionDetailPage.tsx` (1115 lines — Overview/Academics/
  Students/Modules/Branding tabs) + `components/institutions/{ModulesSubscription
  Panel,BrandingPanel,SectionStudentOnboarding}`. The page already used
  `PageHeader`; converted the TabsList + all cards to `bg-card`/`bg-muted`/
  `border-border` tokens, folded the slate three-card academics layout and the
  emerald/blue class·stream·section **selection** accents to `primary`, dropped
  the 4 hardcoded `#E63946`/`#C41E3A` dialog buttons + Save/Add-Signatory/Export
  buttons to the default accent `Button`, tokenised the blue branding info banner,
  and dropped `font-semibold` off every section `<h2>/<h3>`. **Semantic status
  colours deliberately kept** (student-slot filled=green / invited=amber /
  empty-expired=red, token active/expired, the "override" and info amber
  callouts) — same rule the galleries + student-facing pages used. Onboarding
  wizard logic untouched (only className strings changed). **NOT live-verified**
  — same caveat as the rest of Phase 5.

## Live verification 2026-08-16 (session 3) — the 7 remaining Phase 5 areas

Backend/frontend/Postgres from the prior session were still running
(`netstat` confirmed :3002/:5173/:5439 all listening) — used that rather than
starting a fresh stack. Logged in as `thevinstitution@gmail.com` (super_admin)
for the doc-studio galleries and Institution detail, then logged out and back
in as `study0644@gmail.com` for the student-facing pages, both `Admin@123`
per the prior session's local password reset.

**All 7 areas confirmed rendering with real data, zero new console errors:**
IdCards, GroupPhotos, HallTickets, LibraryCards, TransferCertificates
(empty states / real pagination as appropriate), InstitutionDetailPage's
Overview/Modules/Branding tabs (real subscription tier, full module catalogue
with tier gating, branding upload UI), and all 5 student-facing files
(SaathiFeed, SaathiConnections, Visionarium magazine/test-series/submissions).
`arch-section-header` + weight-400 confirmed live on IdCardsPage's `PageHeader`
title (the shell's own top-bar titles are separate, pre-existing, out of
Phase-5 scope — don't mistake those for the PageHeader when spot-checking;
`document.querySelectorAll('h1')` returns 3 on these pages, only the last is
the real one).

**Found and FIXED — a real infinite-render-loop bug**, live on
`TransferCertificatesPage` (the console showed "Maximum update depth
exceeded" immediately on page load, not just when the modal opens):
`GenerateDocsModal.tsx` derived `students`/`staff` as `queryData ?? []` —
a fresh array literal every render whenever the query is disabled (the
default state before a class is picked). The `manual-students` mode's
`useEffect` depends on that array, so it fired every render → `setSelectedIds`
→ re-render → new `[]` again → forever. Only `selectionMode="manual-students"`
pages hit it (TransferCertificates is the one that does; IdCards/HallTickets/
LibraryCards use the default `bulk-section` and never hit the effect) — but
`GenerateDocsModal` is shared by all 9 printable pages, so this was silently
live wherever manual-students mode is used, not just here. Fixed with
`useMemo` keyed on the query data. **Verifying the fix took an extra step**:
the already-open tab's `read_console_messages` kept showing the same stale
error after the fix landed (Vite HMR *had* served the new module — confirmed
via `read_network_requests` showing a new `?t=` timestamp — but the tool
appears to return an accumulating buffer, not a live view). Opening a fresh
tab and navigating there directly showed zero loop errors, confirming the fix.
**If a fix looks like it didn't take effect in an already-open tab, open a
new tab before concluding it's broken.**

**Found, NOT fixed — two pre-existing defects, out of Phase-5 re-skin scope:**
- `group-photo-queries.ts`'s frontend hooks call routes
  (`PATCH /group-photo/:id`, `GET /group-photo/:id/faces`,
  `POST /group-photo/:id/extract`) that don't exist on the backend at all —
  the actual registered routes (`group-photo.routes.ts`) use a completely
  different shape: multipart upload on `POST /`, `POST /:id/extract-faces`,
  `POST /:id/match-students`, `PATCH /extractions/:extractionId`, no `PATCH
  /:id` at all. This is deeper than the systemic `take:<string>` pattern —
  it's a feature-level mismatch (possibly the frontend hooks were written
  against an older API shape) needing real reconciliation, not a query-parse
  one-liner. The list `GET /` at least is closer (`/api/v1/group-photos` vs.
  the frontend's singular `/group-photo` — but list is a 404-not-found kind
  of broken, and create/update/extract are all broken in their own,
  different ways). Left alone pending a decision.
- `GET /api/v1/entitlements/me` returns 403 for the student role on every
  student-facing page (visible in every page's network log this session).
  Doesn't block any page — all the actual content queries return 200 — but
  worth a look; may be an institution-scoping gap specific to students.

**Verified**: `tsc --noEmit` exit 0 after the `GenerateDocsModal` fix.
Committed (`80484a4`) and pushed. All prior Phase 5 work (shared primitives,
Settings, all 8 doc-studio galleries, student-facing, institution detail) is
also now committed and pushed as of this session, in `62711e8`
("feat(indic): re-skin auth, module pages, and doc studio galleries") — a
single large batch commit covering everything from Phase 2 through this
verification pass, since it had all accumulated uncommitted across sessions
before now.

## Templates canvas editor — DONE (2026-08-16, session 4)

The one piece of Phase 5 explicitly deferred ("treat separately, not a
gallery re-skin") since it's a Figma/Canva-style tool
(`CanvasEditor`/`LayersPanel`/`PropertiesInspector`/`Ruler`, Konva-based),
not a list/gallery page, and has no reference screen in the master doc's
prototype set to work from. Handled in its own session as the final
piece of the 5-phase plan, worked through 8 files with a task list to
stay disciplined given the size (~3,500 lines across the editor).

**The whole studio was on a completely foreign palette** — not the
reference's off-brand hex from elsewhere in the project, a *different*
one: literal Material Design 3 tonal values (`#b7102a`/`#191c1d`/
`#ffdad8`/`#410007`/`#db313f`/`#a60e26`/`#ba1a1a`) plus slate-* grays and
a blue-tinted summary box, used as the primary/text/surface colours
throughout the gallery, the 3-step creation wizard, and the entire studio
shell (top navbar, left tool rail, Elements/Layers/Properties side
panels, floating page-manager/context/zoom toolbars). None of it touched
Indic tokens anywhere.

**The governing distinction, applied consistently across all 8 files:**
colour that is *app chrome* (buttons, panels, active states, focus
rings) went to Indic tokens; colour that is *document content* (Konva
element fill/stroke defaults, the background-swatch presets, the
color-picker's own fallback value) was left alone — that's what actually
prints, the same "print pipeline stays untouched" rule the doc-studio
galleries followed. Two deliberate exceptions, where the colour was
clearly *intended* to be "our brand" rather than a generic default: the
Dynamic-Fields panel's "insert a bound variable" text now defaults to
kumkum instead of the foreign red (same functional purpose — make bound
text visibly distinct — just correctly sourced), and the Properties
panel's `BRAND_COLORS` quick-pick array (literally named for brand
intent, previously `['#b7102a', '#191c1d', '#64748b', '#006860',
'#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']`) now offers our actual eight
pigments instead of a foreign palette + a rainbow of unrelated web
colours.

- **`TemplatesPage.tsx`** (gallery): swapped the hand-rolled header for
  `PageHeader`, converted the service-type/audience filter buttons to the
  established chip pattern, moved the card container from a raw `Card`
  to `indic-card` matching the doc-studio archetype exactly. The
  gradient card header and status dot were already accent-token-driven
  from before — only the default-template star icon and active/inactive
  dot got explicit token colours.
- **`TemplateNewPage.tsx`** (3-step creation wizard, a `Dialog`): full
  token pass, MD3 red → primary throughout. Kept the wizard's own
  colour-blocked dialog header as a deliberate design pattern (unique in
  this app — every other dialog is plain) rather than restructuring it to
  match, since recolouring existing chrome in place is what every other
  page this project did; restructuring would have been scope creep. Zod
  schemas, step validation, unit conversion, and the create-template
  payload are byte-identical to before.
- **`TemplateEditorPage.tsx`** (the studio shell): every chrome surface
  — navbar, tool rail, floating toolbars (page manager, element context
  bar, zoom control), right panel — moved to tokens. The canvas
  workspace backdrop (dot-grid pattern) moved from literal cool grays to
  `hsl(var(--border))`/`hsl(var(--muted))` so it stops clashing with the
  now-token-driven surrounding chrome. Keyboard shortcuts (Ctrl+S/Z/Y),
  save/undo/redo, and the page-load/hydrate `useEffect` are untouched.
- **`ElementsLibrary.tsx`** / **`LayersPanel.tsx`** / **`PropertiesInspector.tsx`**:
  same systematic pass. `LayersPanel` turned out to already be
  token-driven from an earlier pass (likely written well from the
  start) — only needed a stray `fontFamily: 'Inter'` override removed so
  Plus Jakarta Sans cascades correctly; that same override existed in
  all the other files too and came out everywhere.
- **`Ruler.tsx`**: upgraded to real CSS custom properties
  (`hsl(var(--card))`, `hsl(var(--border))`, etc.) rather than literal
  hex — unlike the Konva canvas, this renders plain inline `<svg>`, which
  *can* reference `var(--x)` directly since it's DOM/CSS-cascaded, not a
  one-shot canvas rasterisation. The major-tick colour was already
  `hsl(var(--primary))` from some earlier point — left as-is.
- **`CanvasEditor.tsx`**: the **only** literal-hex change in the whole
  pass — the non-printing grid-guide `<Line>` colour (`#b7102a` →
  `#C0392B`, kumkum). This one genuinely cannot use a CSS custom
  property: Konva draws to `<canvas>` via the Canvas 2D API, which
  resolves colour strings once at draw time and has no live binding to
  the CSS cascade. Nothing else in this file was touched — every other
  colour here (text fill, shape fill/stroke, line colour, QR/barcode
  placeholder fills) is the *document being designed*, not app chrome.

**Verified end-to-end, not just structurally**: `tsc --noEmit` and
`eslint` both exit 0 across all 8 files; a residual grep for every
off-brand hex/slate-*/Inter-override across the whole `templates/`
directory returned zero hits outside the deliberately-kept document-
content defaults. Then a real authenticated session against the running
dev backend: opened the Templates gallery (confirmed `arch-section-header`
weight-400 title, `indic-card` gradient resolving to kumkum
`rgb(192,57,43)`), opened a real template into the studio, added a text
element via the Elements panel (confirmed the Properties Inspector
correctly switched to the element view and its active-tab underline
resolved to kumkum), toggled the grid on and confirmed the ruler's major
ticks read `rgb(192,57,43)` through the live `hsl(var(--primary))`
reference, then saved and confirmed via the network response that the
`PATCH` persisted the new element with its correct default fill
(`#191c1d`, the document-content default — proving the app-chrome/
document-content boundary held in practice, not just in the source).

**Gotcha worth recording**: the Browser tool's coordinate/ref-based click
was unreliable against this page specifically — clicks that should have
landed on the Elements panel's buttons kept resolving to nothing, and a
`getBoundingClientRect()` check showed the target button sitting
partially off-screen (`left: -52`) despite `get_page_text` reading its
content normally. Likely an interaction between the tool's hit-testing
and the panel's `framer-motion` width-animation-in. Worked around by
calling `.click()` directly on the located DOM element via
`javascript_tool` — this still exercises the real `onClick` handler (it's
not a store-mutation shortcut), just bypasses the tool's pixel-position
click. If this recurs on other `AnimatePresence`/motion-animated panels,
try the same workaround before concluding the underlying feature is
broken.

## Phase 4 rollout — the 24 remaining module pages (DONE, 2026-08-26)

The master doc's wider Phase-4 ask, executed and **shipped to `main`**
(`5354155`, 29 files, +1299/-964). This is the first time `main` has
carried any of the Indic work — the merge fast-forwarded `main` from
`33d8e2e` (2026-08-08) straight to the full 5-phase re-skin plus this
rollout, 11 commits including the 6 backend bug fixes that had been
stranded on `design/indic`.

**Covered (24 page areas):** admin(OAuthClients), alumni, assignments,
biometric, communications, fees-advanced, finance, gradebook, health,
hostel, hr, integrations(via `IntegrationLaunchPanel`), inventory,
live-classes, mobile-app, notices, onboard(2 public pages), online-tests,
ops, placement, reports, timetable, transport, visitor.

**The archetype applied to each:** shared `PageHeader`, root
`p-4 sm:p-6 space-y-4`, `grid-cols-2 lg:grid-cols-N` stat rows on the
shared toned `StatCard`, `rounded-2xl border bg-card` panels,
`flex-wrap` action rows with `flex-1 sm:flex-none` buttons, and
`min-w-0`/`truncate` on every flex row that previously pushed the page
wide. Data layer untouched — same hooks, query keys, endpoints.

**Table -> card at `lg`** where a real table existed: HR staff roster,
Finance trial balance, Ops job dashboard. **Timetable** is the one screen
that couldn't take the standard treatment — a 6-day x N-period grid is
unreadable at 375px even scrolled, so it keeps the scrollable week grid
at `sm+` and gets a day-chip picker + stacked period list on phones.

**Three real bugs fixed in passing, none of them re-skin regressions:**
- `ops/JobDashboardPage` was on a **foreign dark-glass design system**
  (`brand-primary`/`brand-surface`/`brand-muted`/`text-white`/
  `border-white/5`) — a different palette again from the templates
  studio's MD3 one. In the Indic light theme it rendered white text on
  white. Fully rewritten onto tokens.
- `components/ui/dialog.tsx` had `max-h-[90vh]` with **no
  `overflow-y-auto`**, so any dialog taller than the viewport clipped its
  own submit button with no way to scroll. App-wide, every dialog.
- Several **dark-mode bugs from light-only Tailwind pairs**
  (`bg-amber-50`, `bg-green-50`, `bg-blue-100`, `border-red-200`) that had
  no `dark:` counterpart — replaced with tone-derived tints.

**The status palette is now theme-aware — this was a real accessibility
defect.** The single-value pigment set used since Phase 4 renders as
`color: TONE.x` on `background: TONE.x + '1f'`. Measured against the live
dark background that gives **indigo 1.48:1 — invisible**, plus peacock
2.95, lotus 3.00, red 3.47, green 3.69, all below the 4.5:1 AA floor for
11px bold text; light mode failed too (saffron 2.66, temple 2.86). New
`styles/status-tones.css` defines measured light/dark pairs and
`components/shared/Pill.tsx` resolves a known pigment to a `.pill-*`
class instead of an inline style. **All 14 values now measure >= 4.5:1
against live rendered CSS** (indigo dark: 6.81). `TONE` still exports raw
hex for non-text uses (icon strokes, borders, tinted panels) where the
3:1 threshold applies.

**Verified:** `tsc --noEmit` 0, `eslint` 0 across all 28 touched files,
`npm run build` 0, and a live authenticated pass (super-admin, real
backend + `vv_gate` Postgres) at **375 / 768 / 1280**:
- **zero horizontal overflow** on all 22 admin routes *and* the 4
  existing Phase-4 pages, at all three widths;
- 375 & 768: sidebar `display:none`, bottom tab bar present, card lists
  shown, tables hidden, stats 2-up;
- 1280: sidebar 256px, bottom bar hidden, tables shown, cards hidden,
  stats 3-up;
- contrast ratios computed from `getComputedStyle` on probe elements
  injected into the live DOM, in both themes.
- CI: the repo's designated **Typecheck gate passed**. `CI Pipeline`,
  `CI/CD Pipeline` and `E2E Tests` are red — but they were red on every
  main commit back to 2026-07-31, on backend files this work never
  touched (missing `@vidyaverse/shared-validation` build, ungenerated
  Prisma enums, `smoke-*.ts` implicit anys). Pre-existing, not caused here.

**Gotcha that nearly caused a wrong diagnosis:** the Browser tool's
viewport presets do **not** re-apply to an already-loaded SPA — after
`resize_window` the first measurements showed every page overflowing by
55-166px, with `<main>` at `w=119 left=256`, i.e. the desktop `lg:pl-64`
still applied at 375px while `matchMedia('(min-width:1024px)')` already
reported false. A hard `navigate` after the resize fixed it and every
route measured 0. **Always reload after resizing before trusting a
measurement**, and treat a "bug" that appears on every single page at
once as a measurement artifact until proven otherwise.

## Known debt introduced/uncovered by this pass

- `student_transport.stop_id` now has a Prisma `@relation` (from the
  earlier `fix(transport)` commit) but **no foreign key in the database** —
  `0_init` creates the column with no constraint and no migration adds
  one. Harmless at runtime (Prisma joins on the column) and `migrate
  deploy` had nothing to apply, so the deploy was safe. But `prisma
  migrate dev` will want to create that FK, and doing so on prod could
  fail on orphaned `stop_id` values. Vet the data before generating it.
- The 4 original Phase-4 pages still hold local `TONE`/`Pill` copies, so
  their pills keep the failing single-value palette. Migrate them to
  `components/shared/Pill.tsx`.

## Not in scope (flagged, not started)

Two things noticed across this whole project that are explicitly outside
the 5-phase plan as scoped, not overlooked:
1. ~~The master doc's Phase 4 text asks to roll the table/card archetype
   out to Users, HR, Transport, Inventory, Health, Hostel, Alumni,
   Placement, Notices, Assignments, Gradebook, OnlineTests.~~ **DONE
   2026-08-26** — see "Phase 4 rollout" below. All 24 remaining module
   page areas now carry the archetype.
2. Two pre-existing backend defects found during live verification (not
   re-skin regressions) need an owner decision, not a UI patch:
   `group-photo-queries.ts`'s frontend hooks call routes that don't exist
   on the backend at all (a deeper mismatch than a typo — a different API
   shape entirely, `PATCH /:id`/`GET /:id/faces`/`POST /:id/extract` vs.
   the backend's actual `POST /:id/extract-faces`/`POST /:id/match-students`/
   `PATCH /extractions/:id`), and `GET /entitlements/me` 403s for the
   student role on every student-facing page (non-blocking, but real).

## Research already done — use this, don't re-derive it

From three Explore-agent passes at the start of this work (still accurate
unless someone else has touched these files):

- **Auth (Phase 2)**: a ready-built `design/indic/motifs/auth-backdrop.tsx`
  (`AuthBackdrop` component) exists and is **completely unused** in
  Vidyaverse — built exactly for a split-screen auth layout, and a comment
  in its CSS module implies the sibling DCP app already uses it this way.
  Very likely the right building block. Hardcoded off-brand colours
  (`#E63946`/`#8B5CF6`/`#2563EB`) are confined to Login/Register/Forgot/
  Reset — `AdminSignupPage`/`VerifyEmailPage`/`ConsentPage` are already
  token-driven or plain (different visual families, read them before
  assuming one pattern fits all).
- **Dashboards/module pages (Phase 3–4)**: shared primitives (`StatCard`,
  `PageHeader`, `EmptyState`, `PageLoader` in `lib/lazy-page.tsx`) exist but
  are **inconsistently adopted** — `AttendancePage`/`FeesPage`/
  `SettingsPage` hand-roll their own headers and stat tiles instead of
  using them. Closing that gap is likely phase-0-equivalent prep work
  before any visual restyling there.
- **Admissions kanban** already exists structurally — `AdmissionsPage.tsx`
  renders fixed-width scrollable columns per status with `Select`-based
  status changes (no drag-and-drop library). The "horizontally-scrolling
  kanban" requirement in the master doc is mostly a scroll-container
  styling change, not new engineering.
- **Multi-tenancy**: `usePageInstitution()` / `useActiveInstitution` /
  `x-institution-id` header (injected centrally in `lib/api.ts`'s axios
  interceptor) — don't bypass the shared `api` instance when restyling.

## Session gotchas worth knowing

- **Inline diagnostics lag behind sequential edits** — repeatedly showed
  stale "cannot find name X" errors for imports/usages that were already
  correct in the file. Always confirm with a real `npx tsc --noEmit` run
  before trusting an inline diagnostic.
- **The Browser-tool screenshot was unreliable for long stretches** this
  session ("Browser pane is not displayed"). When that happens, fall back to
  `javascript_tool` + `getBoundingClientRect()`/`getComputedStyle()` for
  precise, provable positioning checks instead of guessing from a
  description — this caught a real bug (the mandala centering regression)
  that a screenshot alone might have papered over.
- **A UI element visible in a user's screenshot can reveal which build
  they're actually looking at.** A "Super Admin" floating badge in two
  supposedly-different screenshots (one claimed to be the reference file)
  was the tell that both were actually the same stale localhost tab.
- **Positioning transform + CSS-animation transform on the same element is
  a recurring trap** — if an animation's keyframes touch `transform` at
  all, any static `transform` on that same element gets silently replaced
  for the animation's duration. Always split into outer (position) / inner
  (animated) wrappers.
- Deleting a file while Vite's dev server is running leaves stale HMR state
  in already-open tabs — a hard reload (not just navigate) clears it.
- The Browser-tool screenshot stayed unavailable this session too (same
  "pane is not displayed" error, every attempt). `read_page`/`get_page_text`/
  `javascript_tool` fully substituted — every auth-page state was confirmed
  via `getBoundingClientRect`/computed styles/page text rather than a visual
  screenshot. Note if a future session gets working screenshots again: this
  work has never actually been *seen*, only measured.
- Inline diagnostics lagged again — an edit to `oauth/ConsentPage.tsx` that
  removed the `Shield` import showed a stale "Cannot find name 'Shield'"
  error pointing at a line that, on read, contained no such reference. Same
  fix as before: trust `tsc`, not the inline squiggle.
- **The screenshot outage above bit for real, not just hypothetically.**
  Asked to add "a small rotating floral mandala" to mobile/tablet auth
  screens, I couldn't see a render and over-interpreted it as "add a new
  decorative background element" — a 220px low-opacity `MandalaMark` behind
  the compact header. `tsc`/`getBoundingClientRect` both said it was
  "working" (present, positioned, spinning), and none of that caught what a
  screenshot would have shown instantly: at 0.14 opacity a red disc with
  white petals on a cream background reads as a washed-out smudge, not a
  flower. The user's actual screenshot caught it; re-reading
  `reference/Auth Pages.dc.html` line 111-114 confirmed the reference's
  compact header has **no** background decoration at all — just the plain
  52px spinning icon, which already *was* "small, rotating, floral" and
  needed nothing added. Reverted. Lesson: when screenshots are down, treat
  any "add a decorative/visual element" request as unverifiable-by-measurement
  and lean harder on the reference file's literal markup instead of
  inventing a plausible-sounding addition — geometry checks don't catch
  legibility/contrast failures.

## Verification pattern used (repeat this per phase)

1. `npx tsc --noEmit` in `frontend/` — zero new errors.
2. `npx eslint <touched files>` — zero warnings/errors.
3. `npm run build` in `frontend/` — must succeed.
4. Dev-server check: **there is no `.claude/launch.json` in this repo**
   despite an earlier write-up implying one was registered — that claim was
   wrong. Check `netstat -ano | grep 5173` first; another session's `vite`
   is often already running (frontend-only, `pnpm run dev:frontend` from
   the repo root), in which case just `preview_start` with `{url:
   "http://localhost:5173/<path>"}` and skip starting a second server.
5. For layout/positioning claims, prefer `javascript_tool` +
   `getBoundingClientRect()` over screenshots when precision matters.
6. Backend + local Postgres (`vv_gate` DB on port 5439) were **not**
   started this session — Phase 1's shell was only verified structurally
   (build/tsc) plus DOM inspection of the public landing page. A real
   authenticated click-through of the new sidebar/bottom-tab-bar/sheet
   (behind `AdminRoute`) is still outstanding — seed credentials are in
   `backend/prisma/seed.ts`: `thevinstitution@gmail.com` / `Admin@123`.

## Next step

**The 5-phase plan AND the wider Phase-4 module rollout are both complete,
and `main` is live on them (`5354155`, 2026-08-26).** What is genuinely
left is small and listed under "Not in scope" / "Known debt":

1. The two pre-existing backend defects (`group-photo-queries.ts` route
   mismatch; `GET /entitlements/me` 403 for students) — owner decision,
   not a UI patch.
2. The 4 original Phase-4 pages (Students/Attendance/Fees/Admissions)
   still carry their own local `TONE`/`Pill` copies with the single-value
   palette, so their pills still fail dark-mode contrast. Migrating them
   to `components/shared/Pill.tsx` is mechanical and tsc-checked.
3. `student_transport.stop_id` has a Prisma relation but no DB foreign
   key (see "Known debt" below).
4. **Nothing in this project has ever been seen in a screenshot** — the
   Browser tool's screenshot has been down across every session. All
   verification is measurement-based. Contrast is now measured rather than
   eyeballed, which closes the specific hole that bit in the mandala
   incident, but a human eyeball pass on prod is still worth doing.

## Uncommitted files

None. As of 2026-08-26 `main` == `origin/main` == `design/indic` ==
`5354155`; the branches are no longer divergent. `git status` should be
clean apart from this file; if it isn't, something changed after this
write-up — trust `git status` over this file.
