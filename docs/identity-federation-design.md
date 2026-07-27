# Identity Federation Design — Vidyaverse / PDLMS / DigiClassroom

**Status:** Design / scoping draft. No auth code changes yet.
**Author:** Generated 2026-05-30 from a verbatim read of the three live repos.
**Decision owner:** App owner.
**Pre-requisite for:** Phase 2 (IdP + Vidyaverse OIDC provider), Phase 3 (PDLMS client), Phase 4 (DCP client + dual-user consolidation).

---

## 0. Why this exists

Today the three apps each have their own Better Auth instance, their own user table, their own onboarding, and no way to know that `priya@school.edu` in PDLMS and `priya@school.edu` in DigiClassroom is the same person, let alone the same person who logged in to Vidyaverse five minutes ago. The deep-link/health-ping integration we just shipped is a launcher, not a federation; it carries no identity assertion across the boundary.

This document specifies the concrete schema, wiring, contracts, and migration steps to make Vidyaverse the **identity + institution control plane** for the trio, while keeping each app's domain database intact (federated data planes).

It is intentionally surgical: every named field, plugin, table, and endpoint below already exists or has a documented Better Auth API. Nothing is invented.

---

## 1. Goals & non-goals

### Goals
1. **One identity per human.** Logging into PDLMS or DCP starts at Vidyaverse and returns an OIDC ID token; the local app provisions a shadow user the first time and reuses it thereafter.
2. **Institution awareness travels with the token.** PDLMS/DCP know *which* institution (and which membership role within it) the user is acting under, without holding a copy of the institution registry.
3. **B2C unaffected.** PDLMS and DCP keep their independent (B2C) signup paths working; federation is only mandatory for institution-scoped (B2B) access.
4. **Entitlements stay centrally governed.** PDLMS/DCP read the user's entitlement claim from the token (or a back-channel) and decide what to expose; Vidyaverse's existing entitlements engine remains the source of truth.
5. **Zero data loss on existing users.** Email-based reconciliation with an explicit user-driven "link" step where ambiguity exists.

### Non-goals
1. Sharing a database across the trio. Each app keeps its Prisma/Drizzle schema and its own MySQL.
2. Replacing PDLMS's `Tenant` or DCP's `tenants`/`organization` tables. They keep them — JIT will sync values into them.
3. Federating *content* (books, lessons, marks). Only identity, membership, and entitlements.
4. Single sign-out across the trio in v1 (front-channel logout is a Phase 5+ stretch).

---

## 2. Architecture decision

```
                   ┌─────────────────────────────────────────┐
                   │           VIDYAVERSE (IdP)              │
                   │                                         │
                   │  Better Auth  +  oidcProvider plugin    │
                   │                                         │
                   │  authoritative for:                     │
                   │   • global identity (User)              │
                   │   • institution registry (Institution)  │
                   │   • memberships (UserInstitutionRole)   │
                   │   • entitlements (per-institution)      │
                   └──────────────┬──────────────────────────┘
                                  │  OIDC (auth-code + PKCE)
                                  │  id_token w/ custom claims
                  ┌───────────────┼────────────────┐
                  ▼                                ▼
       ┌──────────────────────┐         ┌──────────────────────┐
       │   PDLMS (RP)         │         │   DCP (RP)           │
       │  Better Auth client  │         │  Better Auth client  │
       │  + genericOAuth      │         │  + genericOAuth      │
       │                      │         │                      │
       │  local DB keeps:     │         │  local DB keeps:     │
       │   • User (shadow)    │         │   • user (shadow)    │
       │   • Tenant (synced)  │         │   • organization     │
       │   • books, ...       │         │   • lessons, ...     │
       └──────────────────────┘         └──────────────────────┘
```

Vidyaverse becomes a real OIDC Provider (OP). PDLMS and DCP become OIDC Relying Parties (RPs). The ID token carries enough payload that the RPs never need to call the institution registry on the hot path; entitlements they don't already cache are fetched via a back-channel `/api/v1/entitlements/me` call on Vidyaverse using the access token.

**Why not a shared user database?** It would tie deployment lifecycles together, force every schema migration to be coordinated across three repos, and break the existing B2C journeys on PDLMS/DCP. Federation gives us one logical identity with three independent data planes.

---

## 3. Current-state audit (verbatim from the live repos)

| App | Auth lib | Adapter / DB | Plugins enabled | User PK | Identifier on user |
|---|---|---|---|---|---|
| Vidyaverse | `better-auth` | `prismaAdapter` + MySQL | *(none)* | `User.id` Char(36) | `email` unique |
| PDLMS | `better-auth` | `prismaAdapter` + MySQL | `organization` (mapped to `Tenant`/`UserTenantMembership`), `bearer` | `User.id` uuid | `email` unique, `googleId` unique |
| DCP | `better-auth` | `drizzleAdapter` + MySQL | `organization`, `magicLink`, Google social | `user.id` varchar(255) | `email` unique |

Quirks worth flagging up-front:

- **Vidyaverse** already has the membership concept: [`UserInstitutionRole`](backend/prisma/schema.prisma:221) with `(userId, institutionId)` unique, role enum, and per-class/section scoping. We don't need a new membership table — we need to expose it as OIDC claims.
- **Vidyaverse User** carries a single `globalRole: GlobalRole?` plus per-institution roles in `UserInstitutionRole`. The IdP must surface *both* in the token.
- **PDLMS** already has a B2B2C-aware `User` model with `accountType ∈ {INDEPENDENT, INSTITUTIONAL}`, B2C subscription fields, and `tenantMemberships` (one user → many tenants). Federation should *only* short-circuit the institutional path; independent users keep email/password + Google.
- **PDLMS Tenant** has a unique `domain` field (e.g. `"stanford.edu"`). That's our institution match key on the RP side.
- **DCP has two user tables:** the legacy `users` table (with `clerkId` deprecated and `tenantId`) and the Better Auth `user` table. Better Auth writes only to `user`. Domain code reads from `users`. This is the single biggest piece of consolidation debt and must be resolved before DCP can be a clean RP (see §8.3).
- **DCP databaseHook** in `src/auth/index.ts:80-105` force-overrides `role` on every user.create. Our JIT hook for federated logins must run *after* that hook or replace it.
- All three configs use `trustedOrigins` arrays that we'll need to add Vidyaverse's IdP origin to.

---

## 4. Target architecture (component view)

```
Vidyaverse backend
├── Better Auth core (existing)
├── oidcProvider plugin           ← NEW (Phase 2)
│     ├── /api/auth/oauth2/.well-known/openid-configuration   (discovery)
│     ├── /api/auth/oauth2/authorize
│     ├── /api/auth/oauth2/token
│     ├── /api/auth/oauth2/userinfo
│     └── /api/auth/oauth2/jwks
├── Client registry              ← new tables (managed by plugin)
│     ├── oauthApplication
│     ├── oauthAccessToken
│     └── oauthConsent
├── Custom claim resolver        ← NEW (Phase 2.5)
│     produces:  sub, email, name, picture, global_role,
│                memberships[], entitlements_url, active_institution
└── Existing entitlements API
      └── /api/v1/entitlements/me (already shipped)


PDLMS backend                              DCP backend
├── Better Auth core (existing)            ├── Better Auth core (existing)
├── genericOAuth plugin    ← NEW           ├── genericOAuth plugin    ← NEW
│     issuer = Vidyaverse                  │     issuer = Vidyaverse
├── JIT user/membership upsert ← NEW       ├── JIT user/org upsert    ← NEW
└── tenantDomain → Tenant.id resolver      └── tenantDomain → organization.id resolver
                                              + bridge to legacy users.tenant_id
```

---

## 5. Vidyaverse schema additions

The `oidcProvider` plugin from Better Auth ships its own tables (`oauthApplication`, `oauthAccessToken`, `oauthConsent`); they'll be created by Prisma migration when we enable the plugin and run `prisma generate`. The existing schema already has everything the *issuer* needs to mint tokens — we just expose claims that map from it.

There is **one** intentional addition we want to own ourselves, because clients will be registered out-of-band by an operator (not via dynamic client registration in v1):

```prisma
// backend/prisma/schema.prisma  (new model — Phase 2)

model FederatedClient {
  id                 String   @id @default(uuid()) @db.Char(36)
  clientId           String   @unique @map("client_id") @db.VarChar(255)
  clientSecretHash   String   @map("client_secret_hash") @db.VarChar(255)   // argon2 / bcrypt
  name               String   @db.VarChar(255)                              // e.g. "PDLMS", "DigiClassroom"
  redirectUris       Json     @map("redirect_uris")                         // string[]
  postLogoutUris     Json?    @map("post_logout_uris")                      // string[]
  scopes             Json     @map("scopes")                                // ["openid","email","profile","memberships","entitlements"]
  audience           String   @db.VarChar(255)                              // expected aud claim
  isFirstParty       Boolean  @default(true) @map("is_first_party")         // skip consent screen when true
  isActive           Boolean  @default(true) @map("is_active")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@map("federated_clients")
}
```

We deliberately do **not** add a new "global identity" table: `User` is already the global identity. We do **not** add a new "membership" table: `UserInstitutionRole` already is one. The federation work is wiring, not modeling.

One enrichment to `User` will help reconciliation (§11):

```prisma
model User {
  // ...existing fields...
  alternateEmails   Json?    @map("alternate_emails")    // string[] - emails the user has confirmed they also own
  externalSubjects  Json?    @map("external_subjects")   // { "pdlms": "<id>", "dcp": "<id>" } - back-mapping during migration
}
```

`externalSubjects` lets reconciliation be reversible: while we still trust the legacy local user rows on PDLMS/DCP, we record what we believe maps to what, and only after a clean grace window does the federation become the only path.

---

## 6. Vidyaverse Better Auth config — OIDC provider wiring

`backend/src/lib/auth.ts` becomes:

```ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { oidcProvider } from 'better-auth/plugins';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { entitlementsService } from '../modules/entitlements/entitlements.service.js';

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'mysql' }),
  emailAndPassword: { enabled: true, autoSignIn: true, /* unchanged */ },
  user: { additionalFields: { globalRole: { type: 'string', returned: true } } },
  trustedOrigins: [
    env.FRONTEND_URL,
    env.PDLMS_ORIGIN,        // NEW
    env.DCP_ORIGIN,          // NEW
    // ...existing
  ],

  plugins: [
    oidcProvider({
      // we issue: code, id_token, access_token, refresh_token
      loginPage: '/sign-in?federated=1',
      consentPage: '/oauth/consent',
      allowDynamicClientRegistration: false,           // we register clients via admin UI
      metadata: {
        issuer: env.BETTER_AUTH_URL,
      },

      // CUSTOM CLAIMS: this is where the institution payload travels
      getAdditionalUserInfoClaim: async (user, scopes) => {
        const claims: Record<string, unknown> = {};

        if (scopes.includes('memberships') || scopes.includes('profile')) {
          const memberships = await prisma.userInstitutionRole.findMany({
            where: { userId: user.id },
            include: {
              institution: {
                select: { id: true, name: true, code: true, institutionType: true,
                          subscriptionTier: true, subscriptionStatus: true,
                          contactEmail: true },
              },
            },
          });

          claims.memberships = memberships.map((m) => ({
            institution_id: m.institutionId,
            institution_code: m.institution.code,
            institution_name: m.institution.name,
            institution_type: m.institution.institutionType,
            role: m.role,
            assigned_classes: m.assignedClasses ?? null,
            assigned_sections: m.assignedSections ?? null,
            subscription_tier: m.institution.subscriptionTier,
            subscription_status: m.institution.subscriptionStatus,
          }));
          claims.global_role = (user as { globalRole?: string }).globalRole ?? null;
        }

        if (scopes.includes('entitlements')) {
          // We do NOT inline the full entitlement set (it can be ~40 keys).
          // We hand the client a stable URL + the active institution id so it
          // can pull from /api/v1/entitlements/me using the access token.
          claims.entitlements_url = `${env.BETTER_AUTH_URL}/api/v1/entitlements/me`;
        }

        return claims;
      },
    }),
  ],
});
```

**Notes on scope design.** We add two non-standard scopes:
- `memberships` — returns the array of `{institution_id, role, ...}` in the ID token and the `/userinfo` response.
- `entitlements` — returns a `entitlements_url`; the RP then pulls the live set with the issued access token (preferred over inlining, because entitlements change without re-issuing tokens).

**Custom token lifetime.** Defaults from the plugin are fine for v1 (auth code 10m, access token 1h, refresh 7d). We can tighten later.

**Active institution selection.** A user with multiple memberships needs to choose one per session. We add `prompt=select_institution` as a Vidyaverse-specific extension: when the RP sends it, the consent page renders the institution picker; the chosen one ends up in the `active_institution` claim (single object, not array). This is how PDLMS/DCP know which membership to scope queries to.

---

## 7. PDLMS — OIDC client wiring + JIT

`PDLMS/lib/auth.ts` gains:

```ts
import { genericOAuth } from 'better-auth/plugins';

export const auth = betterAuth({
  // ...existing prisma + emailAndPassword + bearer + organization config...

  plugins: [
    bearer(),
    organization({ /* unchanged */ }),

    genericOAuth({
      config: [
        {
          providerId: 'vidyaverse',
          clientId: process.env.VIDYAVERSE_CLIENT_ID!,
          clientSecret: process.env.VIDYAVERSE_CLIENT_SECRET!,
          discoveryUrl: `${process.env.VIDYAVERSE_ISSUER}/api/auth/oauth2/.well-known/openid-configuration`,
          scopes: ['openid', 'email', 'profile', 'memberships', 'entitlements'],
          redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/oauth2/callback/vidyaverse`,
          mapProfileToUser: (profile) => ({
            // What ends up in PDLMS's local `User` row at JIT-create time.
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            // Defaults — overridden by the post-signin JIT hook below.
            accountType: 'INSTITUTIONAL',
            role: 'STUDENT',
          }),
        },
      ],
    }),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          // Runs for federated and non-federated sign-ups. Only act when federated.
          const providerData = (ctx as { providerProfile?: VidyaverseClaims }).providerProfile;
          if (!providerData) return;

          await jitProvisionPdlmsUser(user, providerData);   // see §9
        },
      },
    },
    session: {
      create: {
        after: async (session, ctx) => {
          // Every federated login refreshes membership in case it changed in Vidyaverse.
          const claims = (ctx as { providerProfile?: VidyaverseClaims }).providerProfile;
          if (!claims) return;
          await syncPdlmsMemberships(session.userId, claims);  // see §10
        },
      },
    },
  },
});
```

**Tenant mapping (PDLMS-specific).** PDLMS's `Tenant.domain` is the join key. The JIT logic:
1. For each `claims.memberships[]` item, look up `Tenant` by `domain = institution.contactEmail.split('@')[1]` OR (preferred) `Tenant.metadata.vidyaverse_institution_id = institution_id`.
2. If no Tenant matches, **auto-create one** with `domain = <institution.code>.vidyaverse.local` and `metadata = { vidyaverse_institution_id: ... }`.
3. Upsert `UserTenantMembership` with role mapped per §10.

This means PDLMS's `Tenant` table becomes a *cache* of the subset of Vidyaverse institutions where the federated user has membership. Independent (B2C) PDLMS users continue to use their existing tenant or no tenant at all.

**Backward compatibility.** Existing PDLMS email/password sign-in stays exactly as is. We add a "Sign in with Vidyaverse" button on the PDLMS sign-in page — it's an additional path, not a replacement, until cutover (see §11.4).

---

## 8. DigiClassroom Pro — OIDC client + dual-user consolidation

### 8.1. The client wiring (the easy part)

Same shape as PDLMS, but in DCP's `src/auth/index.ts`:

```ts
import { genericOAuth } from 'better-auth/plugins';

plugins: [
  organization({ /* unchanged */ }),
  magicLink({ /* unchanged */ }),
  genericOAuth({
    config: [{
      providerId: 'vidyaverse',
      clientId: process.env.VIDYAVERSE_CLIENT_ID!,
      clientSecret: process.env.VIDYAVERSE_CLIENT_SECRET!,
      discoveryUrl: `${process.env.VIDYAVERSE_ISSUER}/api/auth/oauth2/.well-known/openid-configuration`,
      scopes: ['openid', 'email', 'profile', 'memberships', 'entitlements'],
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/oauth2/callback/vidyaverse`,
    }],
  }),
],
```

### 8.2. The role-override hook problem

DCP's existing `databaseHooks.user.create.before` ([src/auth/index.ts:80-105](J:/Apps/DigiClassroomPro/src/auth/index.ts:80)) hard-codes role to `'student'` (or admin for one specific email). It will silently downgrade every federated institutional teacher and admin.

Fix: change the hook so that *federated* users have their role taken from the OIDC claims; *email-signup* users keep the existing safe default:

```ts
databaseHooks: {
  user: {
    create: {
      before: async (user, ctx) => {
        const providerData = (ctx as { providerProfile?: VidyaverseClaims }).providerProfile;

        if (providerData) {
          // Federated path: trust the IdP's mapping (see §9 role table).
          return { data: { ...user, role: mapRoleFromClaims(providerData) } };
        }

        // Existing non-federated path (preserved verbatim):
        if (user.email === 'thevinstitution@gmail.com') {
          return { data: { ...user, role: 'admin' } };
        }
        return { data: { ...user, role: 'student' } };
      },
    },
  },
},
```

### 8.3. The dual-user-table problem

DCP has **two** user tables today:

- `users` (legacy domain table, with `tenantId`, deprecated `clerkId`, full domain relations to lessons/progress/etc.)
- `user` (Better Auth core, written by all auth flows)

Federation cannot land cleanly until these are consolidated. Three options, in order of preference:

| Option | Effort | Risk | Recommendation |
|---|---|---|---|
| **A. Migrate domain code to read from `user`.** Add columns we need (`tenant_id`, `role`) to `user`; backfill from `users`; rewrite domain queries; drop `users`. | High (weeks) | Medium — touching hot domain code | **Preferred** for v2 |
| **B. Keep both; sync `users` from `user` via a Drizzle `afterUpsert`-style application hook.** Treat `users` as a denormalised view of `user` + domain extras. | Medium | Low if hook is in one place | **Recommended for Phase 4 cutover** |
| **C. Federation only writes to `user`, ignore `users`.** Pretend the legacy table doesn't exist. | Low | High — every existing query against `users` breaks for federated logins | Do not do this |

We will go with **B for Phase 4** (ship federation behind a flag with the sync hook), then schedule A as a follow-up (a separate, well-bounded migration project). Option A is too big to bundle with federation; mixing them risks regressing both.

The Phase 4 sync hook (illustrative):

```ts
// DCP — runs after every user create/update from Better Auth
async function syncLegacyUserRow(authUser: { id: string; email: string; name?: string }) {
  await db.insert(users).values({
    id: authUser.id,                    // SAME id — this is the contract that keeps both tables in lockstep
    email: authUser.email,
    name: authUser.name ?? null,
    // tenantId is set later by syncDcpOrgMemberships()
  }).onDuplicateKeyUpdate({ set: { email: authUser.email, name: authUser.name ?? null } });
}
```

The `id` parity is the single load-bearing invariant. Any drift between the two tables' `id` columns will silently break domain queries; we add a smoke test (`smoke-dual-user-parity.ts`) that fails CI if a `user` row exists without a matching `users` row.

---

## 9. JIT provisioning contract (ID-token claims → local shadow rows)

The wire format issued by Vidyaverse on every successful federated login:

```json
{
  "iss": "https://vidyaverse.example.com",
  "aud": "pdlms",
  "sub": "8f3a-...-vidyaverse-user-id",
  "iat": 1735603200,
  "exp": 1735603500,

  "email": "priya.singh@oakridge.in",
  "email_verified": true,
  "name": "Priya Singh",
  "picture": "https://...",
  "global_role": "student",

  "memberships": [
    {
      "institution_id": "0c4b...",
      "institution_code": "ORK-DEL",
      "institution_name": "Oakridge International, Delhi",
      "institution_type": "SCHOOL",
      "role": "STUDENT",
      "assigned_classes": ["grade-9-a"],
      "assigned_sections": null,
      "subscription_tier": "professional",
      "subscription_status": "active"
    }
  ],

  "active_institution": {
    "institution_id": "0c4b...",
    "role": "STUDENT"
  },

  "entitlements_url": "https://vidyaverse.example.com/api/v1/entitlements/me"
}
```

### 9.1. Role mapping

| Vidyaverse `InstitutionRole` (claim) | PDLMS `TenantRole` | DCP `member.role` |
|---|---|---|
| `OWNER` | `admin` | `owner` |
| `ADMIN` | `admin` | `admin` |
| `PRINCIPAL` | `admin` | `admin` |
| `TEACHER` | `teacher` | `teacher` |
| `LIBRARIAN` | `librarian` | `librarian` |
| `STUDENT` | `student` | `student` |
| `PARENT` | `student` (read-only books only) | `student` (read-only) |
| `STAFF` | `librarian` | `teacher` |

Vidyaverse `globalRole = 'super_admin'` becomes PDLMS `role: 'super-admin'` / DCP `role: 'admin'`, but **only in the user row, never in a membership row** — super-admin is platform-level by convention in both apps.

### 9.2. Provisioning order (atomic per login)

```
1. Validate ID token signature against /jwks.
2. Look up local user by:
     a. accounts.providerId='vidyaverse' AND accounts.accountId=sub  →  found: reuse
     b. else by email (case-insensitive)                              →  found: link (record account row)
     c. else: create new user row + account row
3. Sync user fields from claims (name, image, email_verified).
4. For each membership in claims.memberships:
     a. Resolve institution → local tenant id (see §10).
     b. Upsert membership row (unique key: userId+tenantId).
     c. Set role using table above.
     d. If a previous membership exists in local DB that is NOT in the claims:
          mark it status='suspended' (do NOT delete — keeps audit history).
5. Set the session's "active institution" from active_institution claim.
6. (DCP only) Run syncLegacyUserRow() to mirror to legacy users table.
```

Step 4d is important: it means "leaving an institution in Vidyaverse" eventually revokes access in PDLMS/DCP without an explicit deprovision call. The lag is one login. For instant revocation we add a webhook in Phase 3.5 (out of scope of this doc).

### 9.3. Token validation contract

PDLMS/DCP MUST:
- Verify `iss` against the configured Vidyaverse issuer.
- Verify `aud` matches their own `clientId`.
- Verify `exp > now`.
- Verify signature against the JWKS endpoint with key rotation cache (Better Auth's `genericOAuth` does this for us).
- Reject tokens older than 5 minutes (`iat` skew) to bound replay window.

---

## 10. Tenant mapping contract

The tricky bit: each RP has its own institution analog. The mapping rules:

### PDLMS
- **Key:** `Tenant.metadata` → JSON field, lookup by `metadata.vidyaverse_institution_id == claim.institution_id`.
- **Fallback:** `Tenant.domain == claim.institution_code + '.vidyaverse.local'` (only used during initial backfill).
- **Auto-create on first reference:** Yes. Created Tenant has `isActive: true`, `allowJoinRequests: false`, `type` mapped from `institution_type`.
- **Manual override:** A Vidyaverse admin can pre-register a PDLMS `Tenant` mapping via the `/admin/integrations/pdlms/link-tenant` UI (Phase 3 deliverable) — this prevents auto-create and lets the operator point an existing PDLMS tenant at a Vidyaverse institution.

### DCP
- DCP's `organization` table (Better Auth org plugin) is the moral equivalent.
- **Key:** `organization.metadata` → JSON, lookup by `metadata.vidyaverse_institution_id == claim.institution_id`.
- DCP also has the legacy `tenants` table separate from `organization`. Phase 4 sync writes to *both*, keyed by parallel ids, until consolidation (§8.3 option A) finishes.

### Vidyaverse side responsibility
Vidyaverse never sees PDLMS Tenant ids or DCP organization ids. The mapping lives on the RP side; this is intentional, because it keeps Vidyaverse's IdP unaware of RP internals.

### What if a user's institution doesn't exist in Vidyaverse?
Then no membership claim is issued, the federated sign-in still works (the user lands in PDLMS/DCP as a B2C/independent user), and a banner offers to "Link a school." This is the principle: federation is additive, never blocking.

---

## 11. Account-reconciliation migration plan

The hard problem: PDLMS and DCP already have `priya.singh@oakridge.in` as a local user. When she signs in via Vidyaverse for the first time, we must link, not duplicate.

### 11.1. Pre-migration discovery (offline, dry-run)

A one-time job runs on each RP:

```ts
// PDLMS/scripts/reconcile-with-vidyaverse.ts  (dry-run by default)
//
// 1. Fetch all Vidyaverse users via a one-time export endpoint:
//      GET /api/v1/admin/users/export    (super-admin only, paginated, returns {id, email, alternate_emails, memberships[]})
// 2. For each PDLMS User, find Vidyaverse User by:
//      email exact match  → confidence: HIGH
//      email in alternate_emails → confidence: HIGH
//      no match → confidence: NEW (will JIT on first login)
// 3. Output to stdout: CSV of {pdlms_user_id, pdlms_email, vidyaverse_user_id, confidence, action}
//      action ∈ {AUTO_LINK, MANUAL_REVIEW, NEW, AMBIGUOUS}
// 4. AMBIGUOUS = two PDLMS users share an email that maps to one Vidyaverse user (real life: deleted users, test accounts).
```

We commit the CSV output, review with the operator, then run the same script with `--commit` to write the link rows (creating `accounts` rows with `providerId='vidyaverse'` and `accountId=vidyaverse_user_id`).

After this:
- HIGH-confidence users sign in via Vidyaverse → land in their existing PDLMS row, no duplication.
- AMBIGUOUS users see an in-app modal on first federated login: "We see two accounts for this email. Which one is you?" (one-time pick).
- NEW users get a fresh JIT row.

### 11.2. Account-link UI

Even after the dry-run, a user might claim multiple emails over time. We expose `/account/linked-identities` on each RP:
- Shows currently linked Vidyaverse identity (if any).
- "Link Vidyaverse account" button → kicks off OIDC flow but with `prompt=link` so the IdP returns the linkage without creating a session.
- "Unlink" button is hidden for institutional users (their access depends on the federation).

### 11.3. Email collision policy

If a federated user's IdP email exactly matches an existing local user's email AND no `accounts` row links them, we link automatically and log an audit entry. Rationale: the IdP has already verified the email (`email_verified: true`); a local non-OAuth password user with the same email is overwhelmingly the same person, not an impersonator. We will revisit this if we ever support unverified IdP emails (we don't plan to).

### 11.4. Cutover phases

| Phase | PDLMS state | DCP state |
|---|---|---|
| 11.4.a | Both auth paths enabled. "Sign in with Vidyaverse" button shown. Email/password still works. | Same. |
| 11.4.b | After 30 days of stable federation: institutional users (`accountType=INSTITUTIONAL`) can ONLY sign in via Vidyaverse. B2C unchanged. | After 30 days: users with non-null tenant binding can ONLY sign in via Vidyaverse. B2C unchanged. |
| 11.4.c (optional) | Disable local password reset for institutional users; route to Vidyaverse. | Same. |

There is no phase where we delete local password hashes — we keep them as inert columns until 11.4.c, then null them with a single migration.

### 11.5. Rollback

If Phase 4 federation produces incidents, the feature flag (`FEDERATION_ENABLED=false`) on each RP reverts to local-only sign-in. Already-linked `accounts` rows do no harm in inert state. Already-created shadow users are real users; rollback does not delete them.

---

## 12. Phased rollout (revised, post-design)

| Phase | Scope | Touches | Risk | Gate |
|---|---|---|---|---|
| **2.0** Vidyaverse IdP | Add `oidcProvider` plugin, FederatedClient model, custom-claim resolver, consent + institution-picker UI. Smoke against a local test client. | Vidyaverse only | Low — additive | All existing Vidyaverse smoke tests pass; new `smoke-oidc.ts` issues a token and validates claims. |
| **2.5** Vidyaverse admin UX | Super-admin UI to register/rotate FederatedClient credentials, view consent audit log. | Vidyaverse only | Low | Manual QA on register/rotate. |
| **3.0** PDLMS RP | Add `genericOAuth` config, JIT hook, tenant resolver, reconciliation dry-run. Behind `FEDERATION_ENABLED` flag. | PDLMS | **Medium — touches PDLMS auth.** | Reconciliation CSV reviewed by operator; staging cutover; 7-day soak. |
| **3.5** PDLMS go-live | Flip flag to ON in production. Sign-in-with-Vidyaverse button visible. | PDLMS | Medium | Error budget: <1% failed federated sign-ins over 7 days. |
| **4.0** DCP dual-user-table audit | Inventory every domain query against `users` vs `user`. Map them in a doc. No code change. | DCP read-only | Zero | Audit doc reviewed. |
| **4.1** DCP RP (option B) | Add `genericOAuth`, JIT hook, sync-legacy-user hook, org resolver. Behind `FEDERATION_ENABLED` flag. Dual-user parity smoke test. | DCP | **High** — dual-table sync is the riskiest single piece | Smoke green on every CI run; staging cutover; 14-day soak (longer due to dual-table risk). |
| **4.2** DCP go-live | Flip flag ON. | DCP | High | Error budget: <0.5% sign-in failures + zero parity-test failures over 14 days. |
| **5.0** Hard cutover | Institutional users on PDLMS/DCP can only auth via Vidyaverse (§11.4.b). | PDLMS + DCP | Medium | Operator-approved per-RP. |

Phases 2 and 3 can run in parallel; 4 is sequenced after 3 because dual-table consolidation deserves dedicated focus.

---

## 13. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | DCP dual-user-table parity breaks silently | Medium | High (data corruption) | CI smoke test; alarm on row-count divergence; option-A migration scheduled before federation becomes mandatory |
| R2 | Vidyaverse downtime takes PDLMS/DCP down for institutional users | Medium | High | Cache JWKS aggressively; allow last-known-good token to grant a degraded read-only session for up to 15 min |
| R3 | A user changes role in Vidyaverse, RPs lag by one login | High | Low | Webhook from Vidyaverse to RPs on role/membership change (Phase 3.5+) |
| R4 | Email collision links two distinct humans into one identity | Low | High | Email must be `email_verified=true`; AMBIGUOUS resolution requires user confirmation |
| R5 | Federated user signs in but has no Vidyaverse membership matching the RP | Medium | Low | Land them as a B2C user with a "link school" banner (§10) |
| R6 | PDLMS's `organization` plugin's `allowUserToCreateOrganization: false` blocks JIT tenant creation | Medium | Medium | JIT path uses raw Prisma write, bypassing the plugin's create constraint; plugin still owns runtime membership management |
| R7 | DCP's force-set-role hook downgrades institutional teachers to 'student' | High (if not fixed) | High | §8.2 hook rewrite is a hard pre-requisite for Phase 4.1 |
| R8 | Reconciliation script links a deleted/test account into a real user | Low | Medium | Dry-run review + AMBIGUOUS flag for any case with `deletedAt != null` on either side |
| R9 | Token leakage (XSS on RP) grants attacker IdP-issued session | Low | High | Standard PKCE + short access-token TTL + httpOnly cookies + CSP audit pre-go-live |

---

## 14. What we are explicitly NOT doing

- **No shared database.** Stated, restated.
- **No SCIM** in v1. Provisioning is JIT-on-login + last-login-wins de-provisioning, with the optional webhook for instant revocation as a follow-up.
- **No federated logout.** RPs log the user out locally; the Vidyaverse session continues until its own TTL expires. We accept this UX gap to ship v1.
- **No mobile-app deep linking** in this design. RPs are web; mobile flows are out of scope until both apps have stable mobile clients.
- **No replacement of PDLMS's B2C subscription model.** Federation is additive; independent users keep Razorpay subscriptions on PDLMS as today.
- **No touching DigiClassroom's RAG pipeline, Qdrant, or Sarvagya microservice.** Federation is auth-only.

---

## 15. Open questions to resolve before Phase 2 starts

1. **Issuer URL.** What's the production hostname Vidyaverse will issue tokens from? (Currently `BETTER_AUTH_URL` is unset in `.env`.) Pin this before the first FederatedClient is registered, because changing `iss` later invalidates issued tokens.
2. **Active-institution UX.** When a user has 3 memberships (e.g., a parent with 3 children across 2 schools), where do they pick the active one — on Vidyaverse's consent screen, or on the RP's landing page after sign-in? Recommendation: Vidyaverse's consent screen for the cleanest UX, with an "Switch institution" affordance on the RP that re-runs the OIDC flow with `prompt=select_institution`.
3. **Webhook protocol for instant revocation.** If we commit to this in Phase 3.5, we need a signature scheme (HMAC-SHA256 with a shared secret per FederatedClient) and a retry policy. Defer to Phase 3.5 design doc.
4. **DCP's `clerkId` legacy column.** Truly dead, or still read by anything? An audit pass is owed before option-A migration begins.
5. **Parent role.** Vidyaverse has `PARENT` and the Urmi integration assumes it; PDLMS and DCP have no equivalent. Currently mapping to read-only student (§9.1) — confirm with operator that this is the right product behavior, or pick a richer mapping.

---

## Appendix A — Endpoint inventory (after Phase 2)

Vidyaverse (new):
```
GET  /api/auth/oauth2/.well-known/openid-configuration   (public)
GET  /api/auth/oauth2/jwks                               (public)
GET  /api/auth/oauth2/authorize                          (browser)
POST /api/auth/oauth2/token                              (backchannel, client-auth)
GET  /api/auth/oauth2/userinfo                           (bearer)
POST /api/auth/oauth2/revoke                             (bearer)
GET  /oauth/consent                                      (browser UI)
POST /api/v1/admin/oauth-clients                         (super-admin)  ← FederatedClient CRUD
GET  /api/v1/admin/users/export                          (super-admin)  ← reconciliation source
```

Vidyaverse (already shipped, becomes load-bearing under federation):
```
GET  /api/v1/entitlements/me                             (bearer)       ← called by RPs
```

PDLMS / DCP (new, mirrored):
```
GET  /api/auth/oauth2/callback/vidyaverse                (browser, set by Better Auth)
GET  /account/linked-identities                          (auth'd UI)
POST /api/internal/federation/refresh-claims             (cron / webhook target — Phase 3.5)
```

## Appendix B — File-by-file change inventory (for sizing)

| File | Change | LoC est. |
|---|---|---|
| `backend/src/lib/auth.ts` | Add `oidcProvider` plugin, `getAdditionalUserInfoClaim` resolver | +80 |
| `backend/prisma/schema.prisma` | Add `FederatedClient`, `User.alternateEmails`, `User.externalSubjects` | +40 |
| `backend/prisma/migrations/<ts>_oidc_provider/` | Generated tables for oauthApplication/oauthAccessToken/oauthConsent + FederatedClient | +120 (generated) |
| `backend/src/modules/admin/oauth-clients.{service,routes}.ts` | CRUD for FederatedClient | +250 |
| `backend/src/modules/admin/users-export.routes.ts` | Reconciliation source endpoint | +80 |
| `frontend/src/pages/oauth/ConsentPage.tsx` | Consent + institution-picker UI | +180 |
| `frontend/src/pages/SignInPage.tsx` | "Federated sign-in" branding when `?federated=1` | +20 |
| `backend/src/scripts/smoke-oidc.ts` | Issue token, validate claims, exercise refresh | +150 |
| **Vidyaverse subtotal** | | **~920 LoC + migrations** |
| `PDLMS/lib/auth.ts` | Add `genericOAuth` + JIT hook | +100 |
| `PDLMS/scripts/reconcile-with-vidyaverse.ts` | Dry-run + commit modes | +200 |
| `PDLMS/app/account/linked-identities/page.tsx` | Link UI | +120 |
| **PDLMS subtotal** | | **~420 LoC** |
| `DCP/src/auth/index.ts` | Add `genericOAuth` + rewrite databaseHook | +90 |
| `DCP/src/lib/sync-legacy-user.ts` | Dual-table sync helper | +60 |
| `DCP/src/db/migrations/*` | Add `metadata.vidyaverse_institution_id` index | +20 |
| `DCP/scripts/reconcile-with-vidyaverse.ts` | Same shape as PDLMS | +200 |
| `DCP/scripts/smoke-dual-user-parity.ts` | Parity CI guard | +80 |
| **DCP subtotal** | | **~450 LoC** |

**Total v1 federation work:** ~1,800 LoC + 2 generated migrations + 2 admin UIs + 1 consent UI.

---

*End of design.*
