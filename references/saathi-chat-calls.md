# Vidyaverse Pro - Saathi Chat & Calls Implementation

## Backend Modules
The 54 modules are now 56. Add to the module list:
- **chat** — REST + WebSocket, prefix /chat
- **calls** — LiveKit token generation, prefix /calls

## New files documented
- `backend\src\modules\chat\chat.ws.ts`
- `backend\src\modules\chat\chat.service.ts`
- `backend\src\modules\chat\chat.controller.ts`
- `backend\src\modules\chat\chat.routes.ts`
- `backend\src\modules\calls\calls.service.ts`
- `backend\src\modules\calls\calls.controller.ts`
- `backend\src\modules\calls\calls.routes.ts`
- `frontend\src\lib\queries\chat-queries.ts`
- `frontend\src\stores\chatStore.ts`
- `frontend\src\hooks\useChatWebSocket.ts`
- `frontend\src\pages\saathi\components\SaathiChatPanel.tsx`
- `frontend\src\pages\saathi\SaathiCallPage.tsx`

## New Prisma models
- `ChatConversation`, `ChatParticipant`, `ChatMessage`, `CallSession`

## New environment variables
- **Backend**: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_HOST`, `LIVEKIT_WS_URL`
- **Frontend**: `VITE_WS_URL`, `VITE_LIVEKIT_WS_URL`

## New infrastructure
- LiveKit server — `livekit.yml` + `livekit.yaml`
- Docker ports: `7880/tcp`, `7881/tcp`, `50100-50200/udp`

## WebSocket pattern (new convention)
The `/chat/ws` route uses `@fastify/websocket@^11.2.0` with `{ websocket: true }`.
Auth on WS upgrade is done via `?token=` query param verified with
`auth.api.getSession({ headers: new Headers({ authorization: \`Bearer ${token}\` }) })`.
Room management: server-side `Map<string, Set<WsClient>>` + Redis pub/sub
on channel pattern `ws:saathi:*` for multi-instance broadcast.
Redis subscriber is initialised via `initChatWsSubscriber()` after `fastify.listen()`.

## SaathiFeedPage.tsx — new pattern
This page now mounts `useChatWebSocket(sessionToken)` at the top level.
The return JSX wraps content in shadcn/ui `<Tabs>` with two tabs:
"Feed" (existing content unchanged) and "Chat" (`SaathiChatPanel`).
The WebSocket connection stays alive across both tabs.

## Locked decisions — additions
`@fastify/websocket` must be registered BEFORE all route module registrations
and AFTER `fastify.setValidatorCompiler()`. This order is non-negotiable.
LiveKit room names follow the pattern: `saathi-{institutionId}-{conversationId}`.
This enforces multi-tenant isolation at the WebRTC layer.

## Student Dashboard ERP Sprint

New endpoints added to auth.routes.ts:
  GET /me/attendance      — proxies attendanceService.getStudentAttendance
  GET /me/timetable/today — DayOfWeek enum is lowercase, filters isBreak=false
  GET /me/notices         — published, audience all|students, isPinned first
  GET /me/transport       — 404 if no active StudentTransport assignment
  GET /me/hostel          — 404 if no active HostelAllotment
  GET /me/documents       — parallel queries across 4 printable models

Attendance module is now registered in backend/src/index.ts at /api/v1/attendance.
It was previously dead code — it is now live.

Frontend hooks added to:
  frontend/src/lib/queries/student/student-queries.ts
  useMyAttendanceSummary, useMyTodayTimetable, useMyNotices,
  useMyTransport, useMyHostel, useMyDocuments
  All use retry: false — 404 = graceful hide.

StudentDashboardPage.tsx widget insertion order:
  Profile header → Identity row → Attendance | Timetable →
  Fee status → Notices → Transport | Hostel (hidden if both 404) →
  Documents → Quick links

DayOfWeek enum confirmed lowercase: monday, tuesday, wednesday,
thursday, friday, saturday, sunday.

isPinned boolean confirmed exists on Notice model.
