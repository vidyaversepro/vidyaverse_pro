# Claude Code Prompt — Implement the new Vidyaverse UI/UX across the whole app

> Paste everything below the line into Claude Code at the root of `vidyaverse_pro`.
> This is the **master handoff**: it compiles the full redesign (landing + app
> shell + auth + dashboards + module pages) into one implementation brief.
>
> **The target look, layout, spacing, motion and — critically — the responsive
> behaviour are defined by working HTML prototypes in `reference/`. Open each in
> a browser before you touch code, use the on-screen Phone / Tablet / Desktop
> switcher, and match them.** They are design references (self-contained
> prototypes), NOT production code to copy — recreate them as React + TypeScript
> in the existing app, reusing our established patterns and design system.

---

## Reference prototypes (open these first)

Each has a live **Phone / Tablet / Desktop** switcher and **Kumkum/Peacock +
light/dark** toggles — exercise all of them; the responsive transformation is the
whole point.

| Prototype | Covers | Real target files |
|---|---|---|
| `reference/App Shell.dc.html` | The responsive shell + a sample admin dashboard | `components/layout/DashboardLayout.tsx`, `App.tsx`, `stores/layout.store.ts`, `theme.store.ts` |
| `reference/Auth Pages.dc.html` | Login, Register, Admin setup, Forgot, Reset, Verify (all states) | `pages/auth/*`, `oauth/ConsentPage.tsx` |
| `reference/Dashboards.dc.html` | Institutions list + Student dashboard | `pages/dashboard/InstitutionsPage.tsx`, `pages/student-dashboard/StudentDashboardPage.tsx` |
| `reference/Module Pages.dc.html` | Students, Attendance, Fees, Admissions | `pages/{students,attendance,fees,admissions}/*` |
| `reference/Vidyaverse Landing.dc.html` | Marketing landing | `pages/landing/*` |

> The prototypes load a sibling `reference/support.js` runtime and
> `reference/uploads/mandala-floral.png` — both are in this folder, so every
> `.dc.html` opens and renders offline in a browser with no setup.

---

## ‼ NON-NEGOTIABLE — restyle real features only; introduce ZERO new data

**This is a visual/UX re-skin of the EXISTING app. Do not add features, and do not
add data.**

- Every screen you touch must keep sourcing its content from the **same real
  hooks, React Query queries, API endpoints, stores and props it already uses.**
  You are changing markup, layout, classes and responsive behaviour — not where
  data comes from.
- **The sample content in the prototypes (student names, invoice numbers, stats,
  kanban cards, marks, etc.) is placeholder for VISUAL REFERENCE ONLY.** Never
  copy any of it into the app. Never hardcode a name, number, badge, row or list.
- **Do not create new mock/dummy/seed data, fixtures, stub arrays, or placeholder
  API responses.** If a screen already renders live data, it must still render the
  exact same live data after the re-skin — just styled the new way.
- If the prototype shows a field/column/widget the real page doesn't have a data
  source for, **omit it** (or wire it only if a real API field already exists).
  Prefer dropping a decorative element over inventing data to fill it.
- Empty/loading/error states must use the app's **real** `EmptyState` /
  `PageLoader` / query states — restyled, not replaced with fake "sample" rows.
- Don't add new routes, modules, or nav items beyond what already exists and is
  entitlement-gated. Re-skin what's there.

Rule of thumb: after each screen, diff the data layer — **imports, hooks, query
keys and API calls should be unchanged; only JSX/styles/responsive branches
differ.** If you found yourself typing a literal person's name or a number into a
component, stop — that belongs to an API, not the UI.

---

## THE defining requirement — one codebase, two personalities

The new UI must **behave like a native mobile app on phone & tablet, and like a
full website on desktop.** This is not "responsive shrinking"; it is two distinct
interaction models sharing one component tree, chosen by width. There is exactly
**one JS breakpoint at 1024px** (`lg`); everything else is fluid `clamp()` /
`auto-fit`.

**Desktop (≥ 1024px) — website:**
- Persistent left **sidebar** (collapsible 262 ↔ 72px) with grouped nav.
- Glass **top bar**: page title, search, `InstitutionSwitcher`, notifications, theme, avatar.
- Data shown as **tables**, multi-column grids, kanban boards, split panels.
- Hover states, dropdown menus, right-click affordances.

**Phone & tablet (< 1024px) — native app:**
- **No sidebar.** Instead: a **top app bar** (avatar + greeting/title + notifications)
  and a fixed, floating **bottom tab bar** with 5 primary tabs
  (Home · Students · Docs · Chat · More) — active tab gets an accent pill.
- The **"More" tab opens a bottom-sheet** listing every module (grouped), with a
  grab handle and dim overlay — this replaces the full sidebar nav.
- A **status-bar-safe top inset**; hit targets ≥ 44px; thumb-reachable actions.
- Data as **stacked cards / lists**, not tables (see the Students & Attendance
  card transforms and the horizontally-scrolling Admissions kanban in the prototype).
- Forms go **full-screen** (auth aside collapses to a slim mandala header).
- Sheets/dialogs slide up from the bottom; transitions feel app-like.

Implement this in `DashboardLayout.tsx`: keep the existing `useLayoutStore`
(`mobileSidebar`) but add the bottom tab bar + module bottom-sheet for `< lg`, and
render the sidebar only for `lg`. The prototype's structure and the exact tab
set, icons, groupings, and sheet behaviour are the spec.

---

## Golden rule — the design system already exists; consume it, don't reinvent

Read these first; map the prototypes' CSS variables onto the **real** tokens.

- `frontend/src/design/indic/indic-tokens.css` — pigments + `--accent-*` tokens.
- `frontend/src/design/indic/indic-design-system.css` — class library
  (sidebar theme, mandala mark/watermark, stat-icon gradients, motion). **Do not edit** (generated/synced).
- `frontend/src/design/indic/indic-app.css` — this app's kumkum accent.
- `frontend/src/styles/indic-bridge.css` — maps the Indic accent onto shadcn
  `--primary`/`--ring`/`--accent`, so every `ui/` primitive is already accented.
- `frontend/src/design/indic/motifs/` — `MandalaMark`, mandala SVGs.

Ready-to-use classes: `sidebar-indic*`, `mandala-mark` / `<MandalaMark>`,
`mandala-watermark`, `stat-icon-saffron|teal|gold|indigo|lotus`,
`indic-card` / `indic-card-light`, `arch-section-header`, `indic-badge`,
`indic-reveal`/`indic-rise`/`indic-stagger`, `gradient-text-indic|indic-soft`,
`indic-scroll`, `indic-auth-aside`, `indic-tile`, `indic-icon-plinth`,
`indic-eyebrow`, `indic-spin-slow`.

### Token map (prototype → real)
The prototypes mirror `indic-tokens.css`. Source of truth if a token is missing:
```
saffron #FF6B35 · deep-saffron #FF9933 · turmeric #F5A623 · kumkum #C0392B
gold #FFD700 · temple-stone #B8860B · peacock #006A6E · teal-light #00897B
indigo #1A237E · lotus-pink #E91E8C · lotus-deep #AD1457
Light:  bg #FFFCF7 · surface #FFF8F0 · sand #FFF3E6 · elevated #fff
        text #241B0F · text2 #5A4E3C · text3 #9a8a72 · border rgb(184 134 11 / .22)
Dark:   bg #0A0F1E · surface #0B1233 · elevated #16213E · text #FFF8F0
        brand #E2685A · brand-2 #FFB27A
Accents: Kumkum (default) brand #C0392B / brand-2 #AD1457
         Peacock          brand #006A6E / brand-2 #00897B
Fonts:  display 'Yatra One' · body 'Plus Jakarta Sans' · devanagari 'Noto Sans Devanagari'
Radii:  chips 9px · tiles/cards 12–18px · pills 999px · phone screen 33px
Motion: reveal .45–.7s cubic-bezier(.16,1,.3,1); mandala spin 26–120s linear
```

## ⚠ Hard constraints (breaking these breaks the app silently)

1. **Never** redefine `--primary`, `--ring`, `--accent` as full colours. They MUST
   stay bare `H S% L%` channel triplets (see `indic-bridge.css`) — a full colour
   silently kills every `bg-primary/50` opacity utility with no build error.
2. **Yatra One ships weight 400 only.** Never `font-bold` an `h1/h2/h3`. Emphasis
   = size + colour. (`font-synthesis: none` is already set.)
3. Keep the sidebar's **module-gating** (`useMyEntitlements` → `visibleItems`),
   all **route guards**, and auth flows intact. Don't restructure `App.tsx` routes.
4. Preserve **multi-tenancy**: `usePageInstitution`, `x-institution-id`,
   `InstitutionSwitcher`. Don't regress React Query / Zustand data flow.
5. **Do not touch generation/print pipelines** (BullMQ, MinIO, server templates,
   `photoProcessor.worker`). Document work is **visual only**.
6. `npm run build` (vite + tsc) passes, zero TS errors. `prefers-reduced-motion`
   disables all animation (system classes already do; gate any new framer-motion).

---

## Phase 0 — App-wide accent + theme (do first; lifts everything)

Carry the prototypes' Kumkum ⇄ Peacock + light/dark app-wide.
- Extend `stores/theme.store.ts` (already has `isDarkMode`) with
  `accent: 'kumkum'|'peacock'` + `setAccent`, persisted.
- In `App.tsx` `ThemeSync`, also toggle `document.documentElement.classList`:
  `dark` and `acc-peacock` (kumkum = no class).
- Add a `.acc-peacock` block (in `indic-app.css` or an app-local sheet — **not**
  the generated system file) overriding the `--accent-primary*` family (+ every
  `*-hsl` / `*-rgb` triplet) with peacock values. The bridge derives
  `--primary`/`--ring`/`--accent` from these, so the whole app re-accents with
  zero component edits.
- Surface the control in **Settings → Appearance** and the super-admin per-tenant
  appearance settings; persist per tenant where that store exists.

## Phase 1 — Responsive shell (`components/layout/DashboardLayout.tsx`)
Match `reference/App Shell.dc.html` exactly.
- **Desktop:** grouped sidebar (Overview / Document Studio / Engage / Operate /
  System — see prototype groupings), collapse toggle, glass top bar with title +
  search + `InstitutionSwitcher` + `NotificationBell` + theme + `UserProfileDropdown`.
- **Mobile/tablet (< lg):** top app bar + fixed bottom tab bar (Home · Students ·
  Docs · Chat · More) + "More" bottom-sheet of all modules (grouped, grab handle,
  dim overlay). Keep `mobileSidebar` store but drive the sheet from it.
- Content region: fluid padding, `max-width` centering, `auto-fit` grids.
- Sample dashboard content in the prototype = the shape for the admin home
  (`views/*DashboardView` + `components/dashboard/*`): stat cards with
  `stat-icon-*`, quick actions on a single `indic-icon-plinth` (no rainbow),
  activity feed, chart with pigment series colours, review CTA band.

## Phase 2 — Auth (`pages/auth/*`, `oauth/ConsentPage`)
Match `reference/Auth Pages.dc.html`. The current `LoginPage` hardcodes off-brand
`#E63946 / #8B5CF6 / #2563EB` — **replace with tokens.**
- **Desktop:** split screen — left `indic-auth-aside` (night-ink→indigo→accent)
  with rotating `MandalaMark`, tagline "विद्या · एक मंच, समग्र संस्थान", 3 value
  bullets; right = form card (`indic-card-light`).
- **Phone/tablet:** single full-screen column, centred mandala + wordmark on top,
  large fields, no card chrome.
- Headline `gradient-text-indic-soft`; primary button = accented `Button` default
  (drop the red gradient). Keep react-hook-form + zod + toasts. Port every state
  the prototype shows: password-strength chips, Forgot "sent", Reset
  success/invalid, Verify waiting/confirmed/error, Admin-setup institution card.

## Phase 3 — Dashboards (`pages/dashboard/InstitutionsPage.tsx`, `pages/student-dashboard/*`)
Match `reference/Dashboards.dc.html`.
- **Institutions:** `PageHeader` (toran underline) → stat cards → search + status
  & tier filter chips → **table on desktop, tappable card list on phone/tablet** →
  pagination. Status/tier via `Badge`/`indic-badge`. Row actions in a dropdown.
- **Student dashboard:** profile header (MandalaMark avatar ring), identity mini
  cards, attendance **donut**, today's timetable (current-period highlight), fee
  status + pay CTA, notices, transport, documents (download), quick links. 2-col
  on desktop, single column on mobile — all via `auto-fit` grids.

## Phase 4 — Module pages (`pages/{students,attendance,fees,admissions}/*`)
Match `reference/Module Pages.dc.html`. This is the **table archetype**; once
Students is right, roll the same treatment to Users, HR, Transport, Inventory,
Health, Hostel, Alumni, Placement, Notices, Assignments, Gradebook, OnlineTests, etc.
- **Students:** stats → search + status chips → selectable **table (desktop) /
  card list (mobile)** with per-row checkbox, linked/no-account badge, data-status
  badge, bulk-action bar when rows selected; keep sort, pagination, volunteer mode,
  bulk import, all modals.
- **Attendance:** Overview / Sessions / Reports tabs; present/late/absent/total
  stat cards (pigment-coloured); session **table → cards**; Create Session dialog.
- **Fees:** billed/collected/outstanding/collection-rate summary; Structures /
  Invoices tabs; invoice status filter chips; invoice rows with copy-payment-link
  + WhatsApp-reminder actions.
- **Admissions:** horizontally-scrolling **kanban pipeline**
  (new→contacted→visited→application→admitted→lost) with status-coloured cards,
  follow-up (overdue in red), New Enquiry dialog, detail sheet, convert-to-student.

## Phase 5 — Remaining pages (apply the archetypes)
- **Document Studio** (`id-cards`, `marksheets`, `certificates`, `hall-tickets`,
  `library-cards`, `visiting-cards`, `transfer-certificates`, `group-photos`,
  `templates` + `components/printables/GenerateDocsModal`): the **document
  previews are the hero** — MandalaMark crest, faint `mandala-watermark`, gold
  hairline, school name in Yatra One, realistic layouts (marksheet =
  crest+watermark+marks table+percentage/CGPA/result+signatures). Gallery cards →
  `indic-tile` + `indic-icon-plinth`. Style `GenerateDocsModal` with a clear
  stepper. **Pipeline untouched.**
- **Student-facing** (`saathi/*`, `visionarium/*`): warmer decoration OK; feed &
  connection cards `indic-card-light` with `indic-rise` stagger; keep the isolated
  full-screen `SaathiCallPage` minimal.
- **Settings** (`settings/SettingsPage.tsx`): `arch-section-header` per group;
  Appearance hosts the accent + light/dark controls (Phase 0).
- **Institution detail** (`dashboard/InstitutionDetailPage.tsx` +
  `components/institutions/*`): tabbed; module toggles grouped by category as an
  `indic-tile`/switch grid (mirror the landing's "47 modules" grouping). Keep the
  onboarding wizard intact.
- **Shared primitives** (touch once, lifts all): `StatCard` (accent plinths),
  `PageHeader` (toran underline + optional corner watermark), `EmptyState`
  (MandalaMark), `PageLoader` (spinning MandalaMark), tables (accent-tinted header,
  `indic-scroll`, mobile horizontal scroll + column hiding).

Decoration intensity: **subtle** on dense admin screens (mandala on headers /
empty states / loaders / auth / doc previews only — never behind tables/forms);
warmer on student-facing screens.

## Rollout order
Phase 0 → 1 (shell) → 2 (auth) → 3 (dashboards) → 4 (Students as the table
template, then siblings) → 5. Verify the build after each phase.

## Acceptance checklist
- [ ] **No new data introduced.** Every re-skinned screen sources content from the
      same real hooks/queries/APIs/props as before; no hardcoded names, numbers,
      rows, fixtures, mock arrays or seed data anywhere; the data-layer diff
      (imports, hooks, query keys, API calls) is empty — only JSX/styles differ.
- [ ] Under 1024px the app presents as a native app: top app bar + bottom tab bar
      + "More" module bottom-sheet, cards/lists instead of tables, full-screen
      forms, bottom-sheet dialogs. At/above 1024px it's the sidebar website. One
      breakpoint; no layout breaks between phone / tablet / desktop.
- [ ] Kumkum ⇄ Peacock + light/dark switch app-wide, persist, and re-accent
      buttons/rings/sidebar/tabs with **no** per-component edits.
- [ ] Auth uses Indic tokens (no `#E63946/#8B5CF6/#2563EB`), split on desktop /
      full-screen on mobile, all states present, and still logs in/registers/resets.
- [ ] Dashboard stat cards use `stat-icon-*`; quick actions one accent plinth (no
      rainbow); charts use pigment colours; Institutions & Students switch
      table↔cards by width; Admissions kanban scrolls horizontally.
- [ ] Document previews carry crest + watermark + realistic layouts; generation
      pipeline unchanged.
- [ ] `--primary/--ring/--accent` stay `H S% L%` triplets; no `font-bold`
      headings; module-gating, routes, auth, multi-tenancy all intact.
- [ ] `prefers-reduced-motion` respected; `npm run build` passes with no TS errors.
