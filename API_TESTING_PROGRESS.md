# Production API Testing — Progress Tracker

**Target:** `https://track-your-life.onrender.com`
**Method:** One API at a time, full edge-case pass against live production, bugs fixed and pushed before moving to the next. Each endpoint is marked `✅ PROD READY` only after every planned test case passes against production.

**Legend:** ⬜ Not started · 🔄 In progress · 🐛 Bug found (fixing) · ✅ Prod ready

---

## Endpoint Inventory (156 total)

### Auth (`/api/v1/auth`) — 11 endpoints
| Endpoint | Status |
|---|---|
| POST /register | 🔄 |
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
| 1 | Valid registration, strong password | 201, user created | ⬜ |
| 2 | Duplicate email (exact) | 409 | ⬜ |
| 3 | Duplicate email (different case) | 409 | ⬜ |
| 4 | Email with leading/trailing whitespace | 201, trimmed | ⬜ |
| 5 | Email uppercased | 201, lowercased in response | ⬜ |
| 6 | Missing email field | 422 | ⬜ |
| 7 | Missing password field | 422 | ⬜ |
| 8 | Empty body `{}` | 422 | ⬜ |
| 9 | Empty string email | 422 | ⬜ |
| 10 | Empty string password | 422 | ⬜ |
| 11 | Invalid email format (no @) | 422 | ⬜ |
| 12 | Invalid email format (no domain) | 422 | ⬜ |
| 13 | Invalid email format (double @) | 422 | ⬜ |
| 14 | Email with spaces inside | 422 | ⬜ |
| 15 | Very long email (300+ chars) | 422 or 201 (check limit) | ⬜ |
| 16 | SQL injection in email | 422 (rejected as invalid email) | ⬜ |
| 17 | XSS payload in email | 422 | ⬜ |
| 18 | Password too short (<8) | 422 | ⬜ |
| 19 | Password exactly 8 chars, valid | 201 | ⬜ |
| 20 | Password no uppercase | 422 | ⬜ |
| 21 | Password no lowercase | 422 | ⬜ |
| 22 | Password no number | 422 | ⬜ |
| 23 | Password no special char | 422 | ⬜ |
| 24 | Password too long (>100) | 422 | ⬜ |
| 25 | Password exactly 100 chars, valid | 201 | ⬜ |
| 26 | Password with unicode/emoji | 201 or 422 (check handling) | ⬜ |
| 27 | Password = email value | 201 (no rule against it, unless app forbids) | ⬜ |
| 28 | Null email / null password | 422 | ⬜ |
| 29 | Email as number type | 422 | ⬜ |
| 30 | Password as number type | 422 | ⬜ |
| 31 | Extra unexpected fields in body | 201, extra fields ignored (not reflected) | ⬜ |
| 32 | Malformed JSON body | 400/422 | ⬜ |
| 33 | Missing Content-Type header | handled gracefully | ⬜ |
| 34 | Wrong Content-Type (text/plain) | 400/422 | ⬜ |
| 35 | Response never leaks password/hash | 201, no password field in response | ⬜ |
| 36 | Rapid duplicate concurrent requests (race) | exactly one 201, rest 409, no duplicate rows | ⬜ |
| 37 | Password with only special chars + rules met | 201 | ⬜ |
| 38 | Email with "+" tag (gmail-style) | 201 | ⬜ |
| 39 | Email with subdomain (user@mail.example.co.uk) | 201 | ⬜ |
| 40 | Unicode in email local part | 422 or 201 depending on RFC strictness | ⬜ |

**Bugs found:** (none yet)

---

## Completed APIs

_(none yet — register in progress)_
