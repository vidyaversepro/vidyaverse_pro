# Printables Pipeline

The document-generation system for the 7 student/staff printables. This doc covers the
architecture, the data each type needs, multi-tenant provisioning, and how to verify.

## The 7 printables

| Type | Service | Data it needs | Number is unique per |
|---|---|---|---|
| `id_card` | `modules/id-cards` (BullMQ worker) | student master | institution |
| `marksheet` | `modules/marksheets` | subjects + exam schedule + **marks** + calc engine | (no number col) |
| `certificate` | `modules/certificates` | student + form fields (title/description) | institution |
| `hall_ticket` | `modules/hall-tickets` | **published** exam schedule + exam subjects | institution |
| `transfer_certificate` | `modules/transfer-certificates` | student + form fields; attendance from `attendance_records` | institution |
| `library_card` | `modules/library-cards` | student + issuance params | institution |
| `visiting_card` | `modules/visiting-card` | student **or** staff user + contact fields | institution |

## Architecture

1. **Branding** — every service builds its template data from `buildBrandingContext()`
   (`lib/branding-context.ts`): institution name/address/logo + principal name/title/signature
   + seal, all inlined as data URIs. Plus a per-type set of flat keys the curated template binds to.
2. **Template resolution** — all services resolve through **`templateResolver`**
   (`modules/templates/template-resolver.ts`). Its waterfall ends in **Strategy 4: auto-seed**,
   which lazily creates the curated default template from the registry for any institution that
   doesn't have one yet. So **every institution generates out of the box** — no manual template setup.
3. **Registry** — `lib/default-templates/index.ts` holds the curated HTML/Handlebars template +
   sample data for all 7 types (`id-card.ts`, `marksheet.ts`, …). Used for auto-seed, the in-app
   preview endpoint, and lint.
4. **Render → PDF → storage** — `templateService.render()` (Handlebars + bundled bilingual fonts via
   `document-base`) → `generatePDFFromHTML()` (Puppeteer) → uploaded to R2 (`storage.vgraphics.in`).

> **Important:** marksheet, transfer_certificate, and library_card used to call
> `templateService.getDefault()` (which does **not** auto-seed) — that split-brain was fixed; all 7
> now go through `templateResolver`.

## Multi-tenancy

Document numbers (e.g. `CERT2026000001`) are sequenced **per institution**, so the unique
constraints are **composite `@@unique([institutionId, number])`**, not global. Generating the same
sequence number for two institutions is allowed and expected. (Before this fix, the global unique
constraints made every institution after the first collide.)

## Data prerequisites & how to seed

`certificate`, `library_card`, `visiting_card`, `transfer_certificate` need only a student (+ the
operator's form inputs at generate time). `marksheet` and `hall_ticket` need the academics chain:
**subject master → published exam schedule → exam subjects (timetable) → marks** (+ a calculation
engine, which marksheet creates lazily). Enter that via the Marks Entry / Exam Schedules screens, or
seed a realistic demo set:

```bash
# from backend/
npm run seed:academics            # defaults to Virat Gurukul 2
npm run seed:academics <institutionId>
```

## Verify (smoke)

```bash
# from backend/  — generates one of each (6 synchronous types) and prints a pass/fail table
npm run smoke:printables                       # Virat Gurukul 2
npm run smoke:printables <institutionId>        # any institution
npm run smoke:printables <institutionId> --bulk # also runs a 3-student bulk pass
```

The smoke calls the services directly (no HTTP/auth), exercising resolve+auto-seed → branding →
render → PDF → R2. `transfer_certificate` is generated then fully reverted (it flips student status),
so the smoke is repeatable and non-destructive. `id_card` is **not** in the smoke (it runs through the
async BullMQ worker) — it's verified by its own bulk pipeline.

## Verified status (2026-06-15)

| Type | Single | Bulk | 2nd institution |
|---|---|---|---|
| id_card | ✅ (worker) | ✅ 40/40 | auto-seed ready |
| marksheet | ✅ (e.g. 71.5% → B+) | ✅ 3/3 | ✅ |
| certificate | ✅ | ✅ | ✅ |
| hall_ticket | ✅ | ✅ 3/3 | ✅ |
| transfer_certificate | ✅ | ✅ | ✅ |
| library_card | ✅ | ✅ | ✅ |
| visiting_card | ✅ | ✅ | ✅ |

## Follow-ups / notes

- After this change, run `prisma generate` on a clean (backend-not-running) checkout so the client
  matches the composite-unique schema. The DB is already in sync (`prisma db push` applied).
- `scripts/install-idcard-template.ts` is now redundant with the registry auto-seed; kept for back-compat.
- `Student.admissionNumber` is still globally `@unique` — a separate (non-printables) multi-tenancy
  consideration if the same admission number must be reusable across institutions.
