# Vidyaverse — Authorization Test Plan (user / institution / chat guards)

Run **in the deploy window against the freshly deployed build**, before declaring the
batch verified. Covers every row of the guard matrix, not just the headline case.
A "typechecks clean" result does **not** prove authorization behaviour — these must go green.

## Fixtures (create once)
- `SUPER` — a `globalRole = super_admin` session.
- `ADMIN_A` — `main_admin` of institution **A** (only A).
- `ADMIN_B` — `main_admin` of institution **B** (only B).
- `STUDENT_A` — `student` in A.
- `USER_B` — any user whose only membership is B.
- `USER_A2` — a second user in A (for legitimate ops).

Each request carries that session's cookie. Institution-scoped calls send
`x-institution-id: <A|B>` where noted. Record actual status; **any mismatch blocks the batch.**

## Must-FAIL (expect 4xx) — these are the vulnerabilities being closed

| # | As | Request | Expect |
|---|----|---------|--------|
| 1 | STUDENT_A | `POST /api/v1/user/assign-role` `{userId:STUDENT_A, institutionId:A, role:"main_admin"}` | **403** |
| 2 | STUDENT_A | `DELETE /api/v1/institution/:A` | **403** |
| 3 | STUDENT_A | `GET /api/v1/user?institutionId=A` | **403** |
| 4 | ADMIN_A | `POST /api/v1/institution` `{...new school...}` | **403** (platform-only) |
| 5 | ADMIN_A | `GET /api/v1/institution` (list-all) | **403** |
| 6 | ADMIN_A | `POST /api/v1/user/assign-role` `{userId:USER_B, institutionId:B, role:"teacher"}` | **403** (not a member of B) |
| 7 | ADMIN_A | `POST /api/v1/user/assign-role` `{userId:USER_A2, institutionId:A, role:"super_admin"}` | **400** (global role rejected) |
| 8 | ADMIN_A | `GET /api/v1/user/:USER_B` (`x-institution-id:A`) | **403** (target not in A) |
| 9 | ADMIN_A | `PATCH /api/v1/institution/:B` | **403** |
| 10 | ADMIN_A | `DELETE /api/v1/institution/:A` | **403** (delete is platform-only, even own) |
| 11 | STUDENT_A | `POST /api/v1/chat/conversations` `{type:"direct", participantUserIds:[USER_B]}` | **403** (cross-institution) |

## Must-PASS (expect 2xx) — proves the guards didn't over-tighten

| # | As | Request | Expect |
|---|----|---------|--------|
| 12 | SUPER | `POST /api/v1/institution` → then `DELETE /api/v1/institution/:new` | **201** then **204** |
| 13 | SUPER | `GET /api/v1/institution` (list-all) | **200** |
| 14 | ADMIN_A | `GET /api/v1/user?institutionId=A` (`x-institution-id:A`) | **200**, results contain **only A** members |
| 15 | ADMIN_A | `POST /api/v1/user/assign-role` `{userId:USER_A2, institutionId:A, role:"teacher"}` | **200** |
| 16 | ADMIN_A | `PATCH /api/v1/institution/:A` (own settings) | **200** |
| 17 | ADMIN_A | `POST /api/v1/institution/:A/branding` (logo upload) | **200** |
| 18 | ADMIN_A | `GET /api/v1/user/:USER_A2` (`x-institution-id:A`) | **200** |
| 19 | STUDENT_A | `POST /api/v1/chat/conversations` `{type:"direct", participantUserIds:[USER_A2]}` | **201** (same institution) |

## Cross-check on #14
Confirm the returned user list for ADMIN_A cannot be widened by passing another
institution: `GET /api/v1/user?institutionId=B` as ADMIN_A must be **403** (rbac rejects
B before the controller runs), never a 200 listing B's users.
