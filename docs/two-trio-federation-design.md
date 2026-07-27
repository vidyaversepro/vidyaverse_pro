# Two-Trio Federation — Vidyaverse trio + VDL trio over shared service layers

**Status:** Implemented (env-gated, inert until enabled). Extends `identity-federation-design.md`.
**Date:** 2026-06-06.

---

## 0. The shape

There are **two control planes** and **two shared service layers**:

```
  TRIO 1 — formal institutions (schools/colleges)   TRIO 2 — D2C (coaching / study-library)
  ┌───────────────────────────────┐                 ┌───────────────────────────────┐
  │ VIDYAVERSE  (OIDC IdP)        │                 │ VDL PRO  (OIDC IdP)           │
  │ owns: institutions, B2B subs  │                 │ owns: D2C accounts, subs      │
  └──────────────┬────────────────┘                 └──────────────┬────────────────┘
                 │ iss = vidyaverse                                │ iss = vdl
                 │  (identical token contract)                     │
                 └───────────────────┬─────────────────────────────┘
                                     ▼  both issuers registered
               ┌──────────────────────────────────────────────────┐
               │  SHARED SERVICE FABRIC (multi-issuer RPs)         │
               │   DigiClassroom Pro  — live class, AI tutor, RAG  │
               │   PDLMS Pro          — courses, ebooks, audiobooks│
               │   each tenant tagged: control_plane ∈ {vidyaverse, vdl}
               └──────────────────────────────────────────────────┘
```

**Design invariant:** *both IdPs emit the identical OIDC claim contract* (`global_role`,
`memberships[]`, `entitlements_url`). The ONLY thing that distinguishes the two trios on
the service side is the token **issuer** / Better Auth `providerId`. That keeps
DigiClassroom and PDLMS control-plane-agnostic — there is no per-trio `if/else` in the
hot path, which is what guarantees a glitch-free student experience.

All four apps run on **Better Auth**, so VDL becoming an IdP is a mirror of the Vidyaverse
IdP, not new architecture.

---

## 1. What changed in the codebase (this commit)

| Repo | File | Change |
|---|---|---|
| **VDL Pro** | `apps/backend/src/auth/oidc/client-secret-hash.ts` | NEW — HMAC client-secret hashing (mirrors Vidyaverse). |
| **VDL Pro** | `apps/backend/src/auth/oidc/claims-resolver.ts` | NEW — emits the shared contract from `UserTenantMembership`+`Tenant`. |
| **VDL Pro** | `apps/backend/src/auth/auth.ts` | Added `jwt`(EdDSA)+`oidcProvider` plugins, gated by `OIDC_ENABLED`; RP origins in `trustedOrigins`. |
| **PDLMS** | `lib/auth.ts` | `genericOAuth` now registers **both** `vidyaverse` and `vdl` (each inert until its env vars exist). |
| **PDLMS** | `lib/federation/types.ts` | Added `ControlPlane`, `FEDERATION_PROVIDER_IDS`, `controlPlaneFromProvider()`. |
| **PDLMS** | `lib/federation/jit.ts` | Session lookup spans both providers; tenants tagged with `control_plane` + `cp_subject_id` in `metadata` (**no DB migration** — JSON column). |
| **DCP** | `src/auth/index.ts` | `genericOAuth` now registers both issuers (same pattern). |

Nothing activates until env vars are set + (VDL only) a migration is run. With the vars
unset, runtime behaviour is byte-for-byte identical to before.

---

## 2. To turn on the VDL trio (operator runbook)

### 2a. VDL becomes an IdP
1. `cd apps/backend && pnpm prisma migrate dev --name oidc_provider` — creates the
   `oidcProvider` plugin tables (oauthApplication / oauthAccessToken / oauthConsent).
2. Set env on the VDL backend:
   ```
   OIDC_ENABLED=true
   VDL_ISSUER=https://vdl.<your-domain>      # pin this; changing iss invalidates tokens
   BETTER_AUTH_SECRET=<existing strong secret>
   PDLMS_ORIGIN=https://pdlms.<your-domain>
   DCP_ORIGIN=https://learn.<your-domain>
   ```
3. Register the two relying parties as OIDC clients in VDL (one row each, via the
   oidcProvider client API / admin route) with redirect URIs:
   - PDLMS: `https://pdlms.<domain>/api/auth/oauth2/callback/vdl`
   - DCP:   `https://learn.<domain>/api/auth/oauth2/callback/vdl`
   Capture each `client_id` / `client_secret`.

### 2b. PDLMS + DCP accept VDL
Set on each relying party (alongside any existing Vidyaverse vars):
```
FEDERATION_ENABLED=true
VDL_ISSUER=https://vdl.<your-domain>
VDL_CLIENT_ID=<from step 2a.3>
VDL_CLIENT_SECRET=<from step 2a.3>
```

That is the whole switch-on. A tenant created from a VDL login is tagged
`control_plane: "vdl"`; a Vidyaverse login stays `vidyaverse`. They never collide
(fallback domains are namespaced `*.vdl.local` vs `*.vidyaverse.local`, slugs prefixed).

---

## 3. Single sign-on behaviour (the student's experience)

**One login per browser/app session, not per app.** The control plane (Vidyaverse or
VDL) is the identity authority. When a student opens DigiClassroom or PDLMS:

- **Arriving from their control-plane app** (the normal path — school portal → "AI Tutor",
  or VDL app → "Recorded Courses"): the OIDC redirect runs silently. If they have a live
  session at the IdP, Better Auth completes the round-trip with **no second password
  prompt**. They land authenticated. This is true SSO.
- **First time on a service app**, a one-time JIT shadow user + membership is created from
  the token. Subsequent visits reuse it.
- **They do NOT type a password three times.** They authenticate once at the control plane;
  the service apps trust the signed token.

**The one exception:** a *fresh* browser/device with no IdP cookie will do one silent
redirect to the IdP (and if the IdP session also expired, one login there). After that,
all three apps in the trio are authenticated. v1 does not do single-*logout* — logging out
of a service app ends only its local session (documented gap, not a bug).

---

## 4. "Can it be hacked / can a modded APK bypass it?" — security model

The trust boundary is **server-side token verification**, never the client. A modified
APK, a patched web bundle, or a tampered request cannot mint authority because:

- **Tokens are cryptographically signed (EdDSA/Ed25519)** by the IdP and verified against
  its JWKS on every service app. A modded app cannot forge a token without the IdP's
  private key, which never leaves the control-plane server.
- **PKCE + short token TTLs** bound replay; `iss`/`aud`/`exp` are checked server-side.
- **Role can't be self-assigned.** DCP marks `role` as `input:false` and strips any
  `super_admin` that arrives from a forged payload or claim; PDLMS/DCP JIT downgrade
  unauthorized elevation. So a hacked client sending `role:"admin"` is ignored.
- **Authorization is enforced on the server** (entitlements + memberships), so even a fully
  rooted device with a modded APK only changes what's drawn on *that* screen — it cannot
  read another tenant's data or unlock unpaid content, because the API re-checks every call.

A modded APK can tamper only with the local UI of the device it runs on. To harden the
*client* against that class of abuse (piracy, fake "premium" UI, scraping), add when you
build the Android app:

1. **Play Integrity API** — server rejects requests from uncertified / tampered app builds.
2. **Certificate / public-key pinning** — defeats man-in-the-middle token capture.
3. **Signed, expiring CDN URLs (+ optional Widevine/HLS-AES) for video/audiobooks** — the
   actual content bytes aren't reachable just by patching the UI.
4. **No secrets in the APK** — client_id only; never a client_secret in a mobile binary
   (mobile uses the public PKCE flow, not a confidential client).
5. **Device-bound refresh + server-side rate limits / anomaly detection** on entitlement
   calls.

Net: the federation itself is not weakened by client modding. Client hardening is a
separate, additive layer for the mobile build.

---

## 5. Follow-ups (not in this commit)

- **DCP JIT contract:** DCP's `lib/federation/jit.ts` still reads an older
  `org_id/org_role/global_role` claim shape rather than `memberships[]`. Reconcile it to
  the shared contract before relying on DCP institutional provisioning for *either* trio.
  Kept out of this change because DCP's dual-user-table area is fragile (see
  `identity-federation-design.md` §8.3).
- **Entitlements endpoint on VDL:** `GET /api/v1/entitlements/me` must exist on VDL for the
  `entitlements_url` claim to resolve live values (RPs already back-channel to it).
- **`control_plane` read-side usage:** service domain code can now branch on
  `Tenant.metadata.control_plane` where a trio-specific behaviour is ever needed.
