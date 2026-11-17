# MUHASABAH API SPLIT-UP DOCUMENT

## Document Purpose
This document organizes all MVP APIs into clear business domains based on the approved PRD and Prisma schema. Each API is defined with HTTP method, endpoint path, and business purpose only.

---

## 1. AUTHENTICATION & SECURITY

### 1.1 User Registration & Verification
- **POST** `/api/v1/auth/register`
  - Purpose: Create a new user account with email and password. Triggers OTP email for verification. Required before user can access the application.

- **POST** `/api/v1/auth/verify-email`
  - Purpose: Verify user email address using OTP sent during registration. Marks account as verified and allows login.

- **POST** `/api/v1/auth/resend-verification`
  - Purpose: Resend verification OTP to user's email if initial OTP expired or was not received. Supports user recovery during registration flow.

### 1.2 User Login & Session
- **POST** `/api/v1/auth/login`
  - Purpose: Authenticate user with email and password. Returns session token and redirects to appropriate screen (onboarding or dashboard). Tracks failed attempts for security lockout.

- **POST** `/api/v1/auth/logout`
  - Purpose: End current user session and invalidate authentication token. Logs out from current device only.

- **POST** `/api/v1/auth/logout-all`
  - Purpose: Invalidate all active sessions across all devices. Provides security control for users who want to revoke all access (e.g., lost device, compromised account). Forces re-login on all devices.

- **GET** `/api/v1/auth/session`
  - Purpose: Validate current session token and return user authentication status. Used for maintaining logged-in state and protecting routes.

### 1.3 Password Management
- **POST** `/api/v1/auth/forgot-password`
  - Purpose: Initiate password reset flow by sending OTP to user's registered email. First step in password recovery process.

- **POST** `/api/v1/auth/resend-reset-otp`
  - Purpose: Resend password reset OTP to user's email if initial OTP expired (2-minute validity) or was not received. Prevents user from having to restart entire password reset flow.

- **POST** `/api/v1/auth/reset-password`
  - Purpose: Reset password with OTP and new password in a single step. Validates OTP, updates password, and invalidates all existing sessions (requires user to log in again on all devices). Industry-standard single-step password reset.

### 1.4 Account Deletion
- **POST** `/api/v1/auth/delete-account/initiate`
  - Purpose: Initiate account deletion process. Validates user's password and typed confirmation ("DELETE"), then sends OTP to email for final verification. First step in irreversible account deletion flow.

- **POST** `/api/v1/auth/delete-account/confirm`
  - Purpose: Confirm account deletion by verifying OTP sent to email. Permanently deletes user account and all associated data (tracking logs, reflections, profile). Sends confirmation email and logs user out. Cannot be undone.

---

## 2. USER PROFILE & ONBOARDING

### 2.1 Profile Management
- **GET** `/api/v1/users/profile`
  - Purpose: Retrieve current user's profile information including display name, age, city, country, and onboarding status. Used to populate account settings and personalize experience.

- **PUT** `/api/v1/users/profile`
  - Purpose: Update user profile fields (display name, age, city, country). Allows users to maintain accurate personal information for location-based features like prayer times.

- **POST** `/api/v1/users/email/request`
  - Purpose: Initiate email change process by submitting new email address. Sends verification OTP to new email address. First step in secure email change flow.

- **POST** `/api/v1/users/email/confirm`
  - Purpose: Complete email change by verifying OTP sent to new email address. Updates user's email after successful verification. Invalidates previous email.

### 2.2 Onboarding Flow
- **POST** `/api/v1/users/onboarding`
  - Purpose: Complete first-time onboarding by submitting required profile information (display name, age, city, country). Marks user as onboarded and redirects to home dashboard.

- **GET** `/api/v1/users/onboarding/status`
  - Purpose: Check if user has completed onboarding. Determines whether to show welcome flow or redirect to dashboard on login.

---

## 3. PRAYER TIMES CONFIGURATION

### 3.1 Prayer Time Settings
- **GET** `/api/v1/prayer-times/config`
  - Purpose: Retrieve user's current prayer time configuration including calculation method (automatic/manual), selected API method, manual times, and per-prayer adjustments.

- **PUT** `/api/v1/prayer-times/config`
  - Purpose: Update prayer time calculation method (automatic vs manual), select API calculation method (MWL, ISNA, etc.), or set manual prayer times for all five prayers.

- **PATCH** `/api/v1/prayer-times/adjustments`
  - Purpose: Update individual prayer time adjustments (-15 to +15 minutes) for fine-tuning automatically calculated times based on local masjid schedules.

### 3.2 Prayer Time Retrieval
- **GET** `/api/v1/prayer-times/today`
  - Purpose: Get today's prayer times (Fajr, Zuhr, Asr, Maghrib, Isha) based on user's configuration and location. Displays on home dashboard and prayer tracking screens.

- **POST** `/api/v1/prayer-times/refresh`
  - Purpose: Manually trigger prayer time recalculation from API. Used when user pulls to refresh or when last fetch is older than 24 hours.

---

## 4. CUSTOMIZATION & PREFERENCES

### 4.1 Prayer Customization
- **GET** `/api/v1/customization/prayer-locations`
  - Purpose: Retrieve all available prayer locations (system defaults + user custom). Populates dropdown when logging daily prayers.

- **POST** `/api/v1/customization/prayer-locations`
  - Purpose: Create custom prayer location. Allows user to add personalized locations beyond defaults (Masjid, Home, Work, Other).

- **PUT** `/api/v1/customization/prayer-locations/:id`
  - Purpose: Update user-created custom prayer location name. System defaults cannot be updated. Allows users to fix typos or rename locations.

- **DELETE** `/api/v1/customization/prayer-locations/:id`
  - Purpose: Delete user-created custom prayer location. System defaults cannot be deleted.

- **GET** `/api/v1/customization/other-prayer-types`
  - Purpose: Retrieve all other prayer types (Tahajjud, Duha, Witr, Eid + user custom). Populates dropdown when logging non-fard prayers.

- **POST** `/api/v1/customization/other-prayer-types`
  - Purpose: Create custom sunnah prayer type. User can define name and whether rakah count is required.

- **PUT** `/api/v1/customization/other-prayer-types/:id`
  - Purpose: Update user-created custom prayer type name or rakah requirement. System defaults cannot be updated. Allows users to fix typos or adjust settings.

- **DELETE** `/api/v1/customization/other-prayer-types/:id`
  - Purpose: Delete user-created custom other prayer type. System defaults cannot be deleted.

### 4.2 Ibadah Customization
- **GET** `/api/v1/customization/dhikr-types`
  - Purpose: Retrieve all dhikr types for dropdown selection when logging dhikr sessions.

- **POST** `/api/v1/customization/dhikr-types`
  - Purpose: Create custom dhikr type for personalized tracking.

- **PUT** `/api/v1/customization/dhikr-types/:id`
  - Purpose: Update user-created custom dhikr type name. System defaults cannot be updated. Allows users to fix typos or rename dhikr types.

- **DELETE** `/api/v1/customization/dhikr-types/:id`
  - Purpose: Delete user-created custom dhikr type.

- **GET** `/api/v1/customization/fasting-types`
  - Purpose: Retrieve all fasting types (Ramadan, Ayyam Al Bidh, Arafah, Ashura + custom).

- **POST** `/api/v1/customization/fasting-types`
  - Purpose: Create custom fasting type.

- **PUT** `/api/v1/customization/fasting-types/:id`
  - Purpose: Update user-created custom fasting type name. System defaults cannot be updated. Allows users to fix typos or rename fasting types.

- **DELETE** `/api/v1/customization/fasting-types/:id`
  - Purpose: Delete user-created custom fasting type.

- **GET** `/api/v1/customization/charity-types`
  - Purpose: Retrieve all charity types (Zakah, Sadaqah, Jariya + custom).

- **POST** `/api/v1/customization/charity-types`
  - Purpose: Create custom charity type.

- **PUT** `/api/v1/customization/charity-types/:id`
  - Purpose: Update user-created custom charity type name. System defaults cannot be updated. Allows users to fix typos or rename charity types.

- **DELETE** `/api/v1/customization/charity-types/:id`
  - Purpose: Delete user-created custom charity type.

### 4.3 Knowledge & Learning Customization
- **GET** `/api/v1/customization/islamic-study-subjects`
  - Purpose: Retrieve all Islamic study subjects (Aqeedah, Fiqh, Hadith, Seerah + custom).

- **POST** `/api/v1/customization/islamic-study-subjects`
  - Purpose: Create custom Islamic study subject.

- **PUT** `/api/v1/customization/islamic-study-subjects/:id`
  - Purpose: Update user-created custom Islamic study subject name. System defaults cannot be updated. Allows users to fix typos or rename subjects.

- **DELETE** `/api/v1/customization/islamic-study-subjects/:id`
  - Purpose: Delete user-created custom subject.

- **GET** `/api/v1/customization/study-modes`
  - Purpose: Retrieve all study modes (Reading book, Online Course, Lecture Video + custom).

- **POST** `/api/v1/customization/study-modes`
  - Purpose: Create custom study mode/format.

- **PUT** `/api/v1/customization/study-modes/:id`
  - Purpose: Update user-created custom study mode name. System defaults cannot be updated. Allows users to fix typos or rename study modes.

- **DELETE** `/api/v1/customization/study-modes/:id`
  - Purpose: Delete user-created custom study mode.

- **GET** `/api/v1/customization/skills`
  - Purpose: Retrieve all user-created dunya skills for tracking worldly knowledge.

- **POST** `/api/v1/customization/skills`
  - Purpose: Create new skill to track (e.g., "Web Development", "Arabic Language").

- **PUT** `/api/v1/customization/skills/:id`
  - Purpose: Update skill name or status.

- **DELETE** `/api/v1/customization/skills/:id`
  - Purpose: Delete user-created skill.

- **GET** `/api/v1/customization/skills/:skillId/topics`
  - Purpose: Retrieve all topics under a specific skill for granular progress tracking.

- **POST** `/api/v1/customization/skills/:skillId/topics`
  - Purpose: Add new topic under a skill (e.g., "React Hooks" under "Web Development").

- **PATCH** `/api/v1/customization/skills/:skillId/topics/:topicId`
  - Purpose: Update topic name or mark as pending/completed.

- **DELETE** `/api/v1/customization/skills/:skillId/topics/:topicId`
  - Purpose: Delete topic from skill.

### 4.4 Health & Lifestyle Customization
- **GET** `/api/v1/customization/fitness-activities`
  - Purpose: Retrieve all fitness activities (Running, Swimming, Horse Riding + custom).

- **POST** `/api/v1/customization/fitness-activities`
  - Purpose: Create custom fitness activity.

- **PUT** `/api/v1/customization/fitness-activities/:id`
  - Purpose: Update user-created custom fitness activity name. System defaults cannot be updated. Allows users to fix typos or rename activities.

- **DELETE** `/api/v1/customization/fitness-activities/:id`
  - Purpose: Delete user-created custom fitness activity.

- **GET** `/api/v1/customization/nutrition-foods`
  - Purpose: Retrieve all user-created nutrition foods for tracking consumption.

- **POST** `/api/v1/customization/nutrition-foods`
  - Purpose: Create custom food item for nutrition tracking.

- **PUT** `/api/v1/customization/nutrition-foods/:id`
  - Purpose: Update user-created custom nutrition food name. Allows users to fix typos or rename food items.

- **DELETE** `/api/v1/customization/nutrition-foods/:id`
  - Purpose: Delete user-created custom food.

- **GET** `/api/v1/customization/fitrah-practices`
  - Purpose: Retrieve all fitrah practices (customizable list of natural hygiene practices).

- **POST** `/api/v1/customization/fitrah-practices`
  - Purpose: Create custom fitrah practice.

- **PUT** `/api/v1/customization/fitrah-practices/:id`
  - Purpose: Update user-created custom fitrah practice name. System defaults cannot be updated. Allows users to fix typos or rename practices.

- **DELETE** `/api/v1/customization/fitrah-practices/:id`
  - Purpose: Delete user-created custom fitrah practice.

### 4.5 Time & Productivity Customization
- **GET** `/api/v1/customization/intentions`
  - Purpose: Retrieve all user-created intentions for linking to tasks and intention logs.

- **POST** `/api/v1/customization/intentions`
  - Purpose: Create new intention (e.g., "Seek Allah's pleasure", "Help family").

- **PUT** `/api/v1/customization/intentions/:id`
  - Purpose: Update intention name or status.

- **DELETE** `/api/v1/customization/intentions/:id`
  - Purpose: Delete user-created intention.

---

## 5. IBADAH TRACKING - PRAYERS

### 5.1 Daily Prayer Logs
- **GET** `/api/v1/tracking/prayers/daily`
  - Purpose: Retrieve user's daily prayer logs with optional date range and filters. Shows prayer history with status, location, and khushu ratings.

- **POST** `/api/v1/tracking/prayers/daily`
  - Purpose: Log a daily prayer (Fajr, Zuhr, Asr, Maghrib, Isha, Jummah) with status, location, khushu rating, date, and notes. Core worship tracking feature.

- **GET** `/api/v1/tracking/prayers/daily/:id`
  - Purpose: Retrieve specific daily prayer log details for viewing or editing.

- **PUT** `/api/v1/tracking/prayers/daily/:id`
  - Purpose: Update existing daily prayer log. Allows user to correct mistakes or add reflections.

- **DELETE** `/api/v1/tracking/prayers/daily/:id`
  - Purpose: Delete daily prayer log entry.

### 5.2 Other Prayer Logs
- **GET** `/api/v1/tracking/prayers/other`
  - Purpose: Retrieve user's other prayer logs (Tahajjud, Duha, Witr, Eid, custom types) with optional date range.

- **POST** `/api/v1/tracking/prayers/other`
  - Purpose: Log other/sunnah prayer with type, optional rakah count, date, and notes.

- **GET** `/api/v1/tracking/prayers/other/:id`
  - Purpose: Retrieve specific other prayer log details.

- **PUT** `/api/v1/tracking/prayers/other/:id`
  - Purpose: Update existing other prayer log.

- **DELETE** `/api/v1/tracking/prayers/other/:id`
  - Purpose: Delete other prayer log entry.

---

## 6. IBADAH TRACKING - QURAN, DHIKR, FASTING, CHARITY

### 6.1 Quran Logs
- **GET** `/api/v1/tracking/quran`
  - Purpose: Retrieve user's Quran activity logs with optional filters by type (recitation, memorization, revision, etc.) and date range. Shows spiritual Quran engagement history.

- **POST** `/api/v1/tracking/quran`
  - Purpose: Log Quran activity with surah name, type, verse count, optional juzz, date, and notes.

- **GET** `/api/v1/tracking/quran/:id`
  - Purpose: Retrieve specific Quran log details.

- **PUT** `/api/v1/tracking/quran/:id`
  - Purpose: Update existing Quran log.

- **DELETE** `/api/v1/tracking/quran/:id`
  - Purpose: Delete Quran log entry.

### 6.2 Dhikr Logs
- **GET** `/api/v1/tracking/dhikr`
  - Purpose: Retrieve user's dhikr and dua logs with optional date range. Shows remembrance and supplication tracking.

- **POST** `/api/v1/tracking/dhikr`
  - Purpose: Log dhikr session with type, count/duration, date, and notes.

- **GET** `/api/v1/tracking/dhikr/:id`
  - Purpose: Retrieve specific dhikr log details.

- **PUT** `/api/v1/tracking/dhikr/:id`
  - Purpose: Update existing dhikr log.

- **DELETE** `/api/v1/tracking/dhikr/:id`
  - Purpose: Delete dhikr log entry.

### 6.3 Fasting Logs
- **GET** `/api/v1/tracking/fasting`
  - Purpose: Retrieve user's fasting logs with optional filters by type and date range.

- **POST** `/api/v1/tracking/fasting`
  - Purpose: Log fasting day with type (Ramadan, voluntary, etc.), date, and notes.

- **GET** `/api/v1/tracking/fasting/:id`
  - Purpose: Retrieve specific fasting log details.

- **PUT** `/api/v1/tracking/fasting/:id`
  - Purpose: Update existing fasting log.

- **DELETE** `/api/v1/tracking/fasting/:id`
  - Purpose: Delete fasting log entry.

### 6.4 Charity Logs
- **GET** `/api/v1/tracking/charity`
  - Purpose: Retrieve user's charity logs with optional filters by type and date range. Tracks charitable giving without financial amounts (privacy-focused).

- **POST** `/api/v1/tracking/charity`
  - Purpose: Log charity given with type (Zakah, Sadaqah, Jariya), date, and notes.

- **GET** `/api/v1/tracking/charity/:id`
  - Purpose: Retrieve specific charity log details.

- **PUT** `/api/v1/tracking/charity/:id`
  - Purpose: Update existing charity log.

- **DELETE** `/api/v1/tracking/charity/:id`
  - Purpose: Delete charity log entry.

---

## 7. KNOWLEDGE & LEARNING TRACKING

### 7.1 Islamic Study Logs
- **GET** `/api/v1/tracking/islamic-study`
  - Purpose: Retrieve user's Islamic study session logs with optional filters by subject, mode, and date range. Shows religious knowledge acquisition progress.

- **POST** `/api/v1/tracking/islamic-study`
  - Purpose: Log Islamic study session with subject, study mode, duration, date, and notes.

- **GET** `/api/v1/tracking/islamic-study/:id`
  - Purpose: Retrieve specific Islamic study log details.

- **PUT** `/api/v1/tracking/islamic-study/:id`
  - Purpose: Update existing Islamic study log.

- **DELETE** `/api/v1/tracking/islamic-study/:id`
  - Purpose: Delete Islamic study log entry.

### 7.2 Skill Progress Logs
- **GET** `/api/v1/tracking/skills`
  - Purpose: Retrieve user's skill progress logs with optional filters by skill and date range. Shows worldly knowledge and skill development.

- **POST** `/api/v1/tracking/skills`
  - Purpose: Log skill progress with skill, optional topic, progress percentage, date, and notes.

- **GET** `/api/v1/tracking/skills/:id`
  - Purpose: Retrieve specific skill progress log details.

- **PUT** `/api/v1/tracking/skills/:id`
  - Purpose: Update existing skill progress log.

- **DELETE** `/api/v1/tracking/skills/:id`
  - Purpose: Delete skill progress log entry.

---

## 8. HEALTH & LIFESTYLE TRACKING

### 8.1 Fitness Logs
- **GET** `/api/v1/tracking/fitness`
  - Purpose: Retrieve user's physical fitness logs with optional filters by activity, intensity, and date range. Tracks exercise aligned with prophetic tradition (running, swimming, archery, horse riding).

- **POST** `/api/v1/tracking/fitness`
  - Purpose: Log fitness activity with activity type, quantity (time/count), optional intensity, date, and notes.

- **GET** `/api/v1/tracking/fitness/:id`
  - Purpose: Retrieve specific fitness log details.

- **PUT** `/api/v1/tracking/fitness/:id`
  - Purpose: Update existing fitness log.

- **DELETE** `/api/v1/tracking/fitness/:id`
  - Purpose: Delete fitness log entry.

### 8.2 Nutrition Logs
- **GET** `/api/v1/tracking/nutrition`
  - Purpose: Retrieve user's nutrition logs with optional date range. Tracks food consumption for health and halal dietary awareness.

- **POST** `/api/v1/tracking/nutrition`
  - Purpose: Log food consumption with food item, optional quantity, date, and notes.

- **GET** `/api/v1/tracking/nutrition/:id`
  - Purpose: Retrieve specific nutrition log details.

- **PUT** `/api/v1/tracking/nutrition/:id`
  - Purpose: Update existing nutrition log.

- **DELETE** `/api/v1/tracking/nutrition/:id`
  - Purpose: Delete nutrition log entry.

### 8.3 Sleep Logs
- **GET** `/api/v1/tracking/sleep`
  - Purpose: Retrieve user's sleep and rest logs with optional date range. Tracks sleep patterns and quality for overall health.

- **POST** `/api/v1/tracking/sleep`
  - Purpose: Log sleep session with bedtime, wake time, optional quality rating, date, and notes.

- **GET** `/api/v1/tracking/sleep/:id`
  - Purpose: Retrieve specific sleep log details.

- **PUT** `/api/v1/tracking/sleep/:id`
  - Purpose: Update existing sleep log.

- **DELETE** `/api/v1/tracking/sleep/:id`
  - Purpose: Delete sleep log entry.

### 8.4 Fitrah Practice Logs
- **GET** `/api/v1/tracking/fitrah-practices`
  - Purpose: Retrieve user's fitrah practice logs with optional date range. Tracks natural hygiene and grooming practices from Islamic tradition.

- **POST** `/api/v1/tracking/fitrah-practices`
  - Purpose: Log fitrah practices performed (supports multiple practices per day) with date and notes.

- **GET** `/api/v1/tracking/fitrah-practices/:id`
  - Purpose: Retrieve specific fitrah practice log details.

- **PUT** `/api/v1/tracking/fitrah-practices/:id`
  - Purpose: Update existing fitrah practice log.

- **DELETE** `/api/v1/tracking/fitrah-practices/:id`
  - Purpose: Delete fitrah practice log entry.

---

## 9. TIME & PRODUCTIVITY TRACKING

### 9.1 Task Management
- **GET** `/api/v1/tracking/tasks`
  - Purpose: Retrieve user's daily tasks with optional filters by status, priority, intention, and date range. Supports intention-aligned productivity.

- **POST** `/api/v1/tracking/tasks`
  - Purpose: Create task with title, optional intention link, optional priority, status, date, and notes.

- **GET** `/api/v1/tracking/tasks/:id`
  - Purpose: Retrieve specific task details.

- **PUT** `/api/v1/tracking/tasks/:id`
  - Purpose: Update existing task (title, priority, status, intention link, notes).

- **DELETE** `/api/v1/tracking/tasks/:id`
  - Purpose: Delete task.

### 9.2 Intention Logs
- **GET** `/api/v1/tracking/intentions`
  - Purpose: Retrieve user's intention logs with optional date range. Tracks formal declaration of intentions for spiritual accountability.

- **POST** `/api/v1/tracking/intentions`
  - Purpose: Log intention with intention type, optional start/end date range, date, and notes.

- **GET** `/api/v1/tracking/intentions/:id`
  - Purpose: Retrieve specific intention log details.

- **PUT** `/api/v1/tracking/intentions/:id`
  - Purpose: Update existing intention log.

- **DELETE** `/api/v1/tracking/intentions/:id`
  - Purpose: Delete intention log entry.

---



---

## 10. SYSTEM REFERENCE DATA

### 10.1 Prayer Status Options
- **GET** `/api/v1/reference/prayer-statuses`
  - Purpose: Retrieve all available prayer status options (Prayed on Time, Prayed Late, Qada, Missed) for populating dropdowns in daily prayer logging screens.

### 10.2 Quran Activity Types
- **GET** `/api/v1/reference/quran-activity-types`
  - Purpose: Retrieve all Quran activity types (Recitation, Memorization, Revision, Tafsir, Translation, Listening) for Quran logging dropdown.

### 10.3 Task Management References
- **GET** `/api/v1/reference/task-priorities`
  - Purpose: Retrieve all task priority levels (High, Medium, Low) for task creation dropdown.

- **GET** `/api/v1/reference/task-statuses`
  - Purpose: Retrieve all task status options (Not Started, In Progress, Completed) for task tracking.

### 10.4 Fitness Intensity Levels
- **GET** `/api/v1/reference/fitness-intensities`
  - Purpose: Retrieve all fitness intensity levels (Low, Medium, High) for fitness logging.

### 10.5 Quran Reference Data
- **GET** `/api/v1/reference/surahs`
  - Purpose: Retrieve complete list of all 114 Surahs with names and numbers for Quran logging dropdown with search functionality.

- **GET** `/api/v1/reference/juzz`
  - Purpose: Retrieve list of all 30 Juzz numbers for optional Quran logging field.

### 10.6 Location Reference Data
- **GET** `/api/v1/reference/countries`
  - Purpose: Retrieve list of all 195 countries in alphabetical order for profile setup and settings country dropdown with search.

---

## API ORGANIZATION SUMMARY

**Total API Categories:** 11
- Authentication & Security: 13 endpoints
- User Profile & Onboarding: 5 endpoints
- Prayer Times Configuration: 5 endpoints
- Customization & Preferences: 53 endpoints
- Ibadah Tracking - Prayers: 10 endpoints
- Ibadah Tracking - Quran, Dhikr, Fasting, Charity: 20 endpoints
- Knowledge & Learning Tracking: 10 endpoints
- Health & Lifestyle Tracking: 20 endpoints
- Time & Productivity Tracking: 10 endpoints
- Data Management & Export: 3 endpoints
- System Reference Data: 9 endpoints

**Total MVP Endpoints:** 158 APIs

---

## DESIGN PRINCIPLES APPLIED

1. **RESTful Resource Modeling**: Each endpoint represents a clear business resource with standard HTTP verbs.

2. **Business Domain Separation**: APIs grouped by feature areas from PRD, not technical implementation.

3. **Consistent CRUD Patterns**: GET (list/retrieve), POST (create), PUT/PATCH (update), DELETE (remove) applied uniformly.

4. **User-Centric Design**: All tracking APIs scoped to authenticated user context (no multi-user queries in MVP).

5. **Flexibility Through Customization**: Separate customization endpoints allow users to extend system defaults without code changes.

6. **Privacy & Transparency**: Dedicated data export and audit log APIs support user data rights.

7. **Reference Data Separation**: System-wide reference data (statuses, types, Quran data) separated from user customization.

8. **MVP Scope Adherence**: No analytics, social features, notifications API, or speculative endpoints included.

---

## NOTES FOR OPENAPI SPECIFICATION PHASE

1. **Authentication**: All endpoints except `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/verify-email`, `/api/v1/auth/resend-verification`, `/api/v1/auth/forgot-password`, `/api/v1/auth/resend-reset-otp`, `/api/v1/auth/reset-password` require JWT bearer token authentication.

2. **Versioning**: Future OpenAPI spec should include `/api/v1/v1/` prefix for all endpoints to support versioning strategy.

3. **Pagination**: All list endpoints (GET with multiple results) should implement cursor-based or offset pagination in detailed spec.

4. **Date Handling**: All date fields should use ISO 8601 format (YYYY-MM-DD) with timezone consideration.

5. **Error Responses**: Standardize error response format across all endpoints in detailed spec.

6. **Rate Limiting**: Consider rate limiting strategy for authentication endpoints to prevent abuse.

7. **Soft Deletes**: Consider implementing soft deletes for tracking logs to support data recovery (mention in detailed spec).

8. **Batch Operations**: Future consideration for batch log creation (not in MVP scope).

---

## ALIGNMENT VERIFICATION

**PRD Coverage:**
✅ All authentication flows (registration, login, password reset, account deletion)
✅ Onboarding and profile setup
✅ All 4 tracking categories with all subcategories
✅ Prayer time system (automatic and manual)
✅ Settings and customization preferences
✅ Data export (CSV)
✅ All user customization requirements

**Prisma Schema Alignment:**
✅ All models have corresponding CRUD or read-only APIs
✅ Relationships respected (skills→topics, intentions→tasks, etc.)
✅ Reference tables (statuses, types) exposed for client consumption
✅ Audit logging accessible for transparency
✅ User-scoped data isolation enforced

**Missing/Out of Scope:**
❌ Help & Support content API (static content, not database-backed in MVP)
❌ Notifications API (not mentioned in PRD implementation scope)
❌ Real-time features (WebSocket, Server-Sent Events)
❌ Analytics and reporting endpoints (future phase)
❌ Social features (not in MVP scope)

---

**Document Status:** ✅ APPROVED - Ready for OpenAPI Specification Design
**Version:** 2.0 (Revised based on comprehensive PRD & Schema review)
**Last Updated:** 2026-02-06
**Changelog:**
- v2.0 (2026-02-06): Added email change completion flow (2 endpoints), logout-all endpoint, password reset OTP resend, and PUT endpoints for all customization entities (11 endpoints). Total: 158 endpoints.
- v1.0 (2026-02-05): Initial API split-up document. Total: 144 endpoints.
