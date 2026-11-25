# Production API Testing — Progress Tracker

**Target:** `https://track-your-life.onrender.com`
**Method:** One API at a time, full edge-case pass against live production, bugs fixed and pushed before moving to the next. Each endpoint is marked `✅ PROD READY` only after every planned test case passes against production.

**Legend:** ⬜ Not started · 🔄 In progress · 🐛 Bug found (fixing) · ✅ Prod ready

---

## Endpoint Inventory (156 total)

### Auth (`/api/v1/auth`) — 11 endpoints
| Endpoint | Status |
|---|---|
| POST /register | ✅ |
| POST /verify-email | ⬜ |
| POST /resend-verification | ⬜ |
| POST /login | ⬜ |
| POST /forgot-password | ⬜ |
| POST /resend-reset-otp | ⬜ |
| POST /reset-password | ⬜ |
| POST /refresh | ⬜ |
| POST /logout | ⬜ |
| POST /logout-all | ⬜ |
| GET /session | ⬜ |

### Users (`/api/v1/users`) — 6 endpoints
| Endpoint | Status |
|---|---|
| GET /profile | ⬜ |
| PUT /profile | ⬜ |
| POST /onboarding | ⬜ |
| GET /onboarding/status | ⬜ |
| POST /email/request | ⬜ |
| POST /email/confirm | ⬜ |

### Prayer Times (`/api/v1/prayer-times`) — 4 endpoints
| Endpoint | Status |
|---|---|
| GET /config | ⬜ |
| PUT /config | ⬜ |
| GET /today | ⬜ |
| POST /refresh | ⬜ |

### Reference (`/api/v1/reference`) — 8 endpoints (read-only lookup data)
| Endpoint | Status |
|---|---|
| GET /prayer-statuses | ⬜ |
| GET /quran-activity-types | ⬜ |
| GET /task-priorities | ⬜ |
| GET /task-statuses | ⬜ |
| GET /fitness-intensities | ⬜ |
| GET /surahs | ⬜ |
| GET /juzz | ⬜ |
| GET /countries | ⬜ |

### Customization (`/api/v1/customization`) — 52 endpoints
| Entity | Endpoints | Status |
|---|---|---|
| Prayer Locations | GET/POST/PUT/DELETE | ⬜ |
| Other Prayer Types | GET/POST/PUT/DELETE | ⬜ |
| Dhikr Types | GET/POST/PUT/DELETE | ⬜ |
| Fasting Types | GET/POST/PUT/DELETE | ⬜ |
| Charity Types | GET/POST/PUT/DELETE | ⬜ |
| Islamic Study Subjects | GET/POST/PUT/DELETE | ⬜ |
| Study Modes | GET/POST/PUT/DELETE | ⬜ |
| Fitness Activities | GET/POST/PUT/DELETE | ⬜ |
| Nutrition Foods | GET/POST/PUT/DELETE | ⬜ |
| Fitrah Practices | GET/POST/PUT/DELETE | ⬜ |
| Skills (+ topics) | GET/POST/PUT/DELETE | ⬜ |
| Intentions | GET/POST/PUT/DELETE | ⬜ |

### Tracking (`/api/v1/tracking`) — 70 endpoints
| Domain | Status |
|---|---|
| Daily Prayers | ⬜ |
| Other Prayers | ⬜ |
| Quran Logs | ⬜ |
| Dhikr Logs | ⬜ |
| Fasting Logs | ⬜ |
| Charity Logs | ⬜ |
| Islamic Study Logs | ⬜ |
| Skill Progress Logs | ⬜ |
| Fitness Logs | ⬜ |
| Nutrition Logs | ⬜ |
| Sleep Logs | ⬜ |
| Fitrah Practice Logs | ⬜ |
| Tasks | ⬜ |
| Intention Logs | ⬜ |

### Health (`/health`, `/api/v1/health`) — 2 endpoints — already smoke-tested working ✅

---

## Current Focus

### 🔄 POST /api/v1/auth/register

**Test plan** (see checklist below). Testing against live production. Each test run via curl, result logged, timestamp UTC.

#### Test Cases

| # | Case | Expected | Result |
|---|---|---|---|
| 1 | Valid registration, strong password | 201, user created | ✅ |
| 2 | Duplicate email (exact) | 409 | ✅ |
| 3 | Duplicate email (different case) | 409 | ✅ |
| 4 | Email with leading/trailing whitespace | 201, trimmed | ✅ |
| 5 | Email uppercased | 201, lowercased in response | ✅ |
| 6 | Missing email field | 422 | ✅ |
| 7 | Missing password field | 422 | ✅ |
| 8 | Empty body `{}` | 422 | ✅ |
| 9 | Empty string email | 422 | ✅ |
| 10 | Empty string password | 422 | ✅ |
| 11 | Invalid email format (no @) | 422 | ✅ |
| 12 | Invalid email format (no domain) | 422 | ✅ |
| 13 | Invalid email format (double @) | 422 | ✅ |
| 14 | Email with spaces inside | 422 | ✅ |
| 15 | Very long email (300+ chars) | 422 | 🐛→✅ fixed, see below |
| 16 | SQL injection in email | blocked at Render edge/WAF (403) before reaching app | ✅ (infra-level) |
| 17 | XSS payload in email | 422 | ✅ |
| 18 | Password too short (<8) | 422 | ✅ |
| 19 | Password exactly 8 chars, valid | 201 | ✅ |
| 20 | Password no uppercase | 422 | ✅ |
| 21 | Password no lowercase | 422 | ✅ |
| 22 | Password no number | 422 | ✅ |
| 23 | Password no special char | 422 | ✅ |
| 24 | Password too long (>100) | 422 | ✅ |
| 25 | Password exactly 100 chars, valid | 201 | ✅ |
| 26 | Password with unicode/emoji | 201 (allowed, no issue) | ✅ |
| 27 | Password = email value | 422 (rejected, incidentally missing uppercase) | ✅ |
| 28 | Null email / null password | 422 | ✅ |
| 29 | Email as number type | 422 | ✅ |
| 30 | Password as number type | 422 | ✅ |
| 31 | Extra unexpected fields in body | 201, extra fields ignored | ✅ |
| 32 | Malformed JSON body | 400 | 🐛→✅ fixed, see below |
| 33 | Missing Content-Type header | 422 (body parsed as empty, handled gracefully) | ✅ |
| 34 | Wrong Content-Type (text/plain) | 422 (handled gracefully) | ✅ |
| 35 | Response never leaks password/hash | confirmed clean | ✅ |
| 36 | Rapid duplicate concurrent requests (race) | exactly one 201, rest 409, no 500s | 🐛→✅ fixed, see below |
| 37 | Password with only special chars + rules met | 201 | ✅ |
| 38 | Email with "+" tag (gmail-style) | 201 | ✅ |
| 39 | Email with subdomain (user@mail.example.co.uk) | 201 | ✅ |
| 40 | Unicode in email local part | 422 (rejected, non-ASCII local part not RFC-permitted by validator) | ✅ |

**Bugs found & fixed:**
1. 🐛→✅ **FIXED** (`3a5a256`) — `emailSchema` had no max-length bound. A 300+ char email passed
   validation, got written to DB, only failed downstream at EmailJS send with an opaque 503.
   Added `.max(254)` per RFC 5321.
2. 🐛→✅ **FIXED** (`7aef407`) — Malformed JSON request body returned `500 Internal Server Error`
   instead of `400`. express.json()'s SyntaxError fell through to the generic unexpected-error
   branch. Now caught explicitly, returns `400 INVALID_JSON`.
3. 🐛→✅ **FIXED** (`7de2e97`) — **Concurrency bug**: 10 parallel register requests with the same
   email returned 8×`500`, 1×`409`, 1×`201` (found via local load test against prod DB). The
   existence-check-then-insert isn't atomic, so racing requests both passed validation and raced
   on the DB insert; the loser's raw Prisma `P2002` unique-constraint error wasn't mapped to a
   client error. Fixed globally in `error-handler.ts` so every endpoint with a `@unique` field is
   protected, not just register. Retested: now exactly 1×`201`, 9×`409`, zero `500`s.

**All 40 planned test cases + the concurrency check pass, confirmed on live production** (not
just local) after resolving a transient deploy failure — see infra note below.
✅ **POST /api/v1/auth/register is declared PROD READY.**

**Deploy infra note:** mid-campaign, a deploy (`7b79c46`) failed at the `prisma migrate deploy`
step with `P1002` (timed out acquiring the Postgres advisory lock against Neon), and Render
silently fell back to serving the last successful build — meaning the P2002 race-condition fix
was NOT actually live for a period even though the push succeeded. Root cause: likely Neon
serverless autosuspend/cold-start exceeding Prisma's 10s lock-acquisition window. Resolved by
retriggering a deploy (`cce15e6`) after keeping the DB warm via `/api/v1/health/db`. Lesson:
**a successful `git push` does not guarantee the fix is live** — always do a final behavioral
confirmation against the actual production response, not just deploy logs.

**Infra note:** `/auth/register` and `/auth/login` share a limiter of 5 req/15min per IP in
production (counts failures too). Temporarily raised to 1000 (commit `34a58a7`) to allow this
test campaign to run across the rest of the auth module without waiting out windows per endpoint.
**Will be reverted to 5 once the entire auth module (11 endpoints) is done.**

**Data note:** a few junk/throwaway test users (including one with a 300+ char email, created
before the fix) now exist in the production DB from this campaign. No admin/delete-user endpoint
exists to clean them up via API; harmless (unverified, unusable accounts) but flagging for
awareness. Will compile a full cleanup list once the campaign concludes.

**Methodology note:** switched from testing exclusively against live production (slow — rate
limits, deploy wait per fix) to running the app locally (`npm run dev`) pointed at the same
production database, per user instruction. Fix→retest loop is now instant via nodemon
auto-restart; every fix is still committed and pushed to GitHub/Render, and a final confirmation
pass is run against the live URL before an endpoint is marked prod ready.

---

## Completed APIs

| Endpoint | Status | Bugs found & fixed |
|---|---|---|
| POST /api/v1/auth/register | ✅ PROD READY | 3 (max-length validation, malformed JSON 500→400, race-condition 500→409) |
