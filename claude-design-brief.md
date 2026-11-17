# Muhasabah — Product Brief for UI Design

## What it is
Muhasabah ("self-accounting") is a **web dashboard** for tracking daily Islamic worship
and personal-development practices. Users log and review their activity across many
life domains in one place, guided by accurate prayer times for their location.

## Core domains tracked (each has its own log + customizable types)
- **Prayers** — 5 daily prayers + custom/other prayer types, with per-user prayer-time
  config (location-based) and a "today's prayer times" view
- **Quran** — reading/memorization activity logs (by surah/juz)
- **Dhikr** — remembrance/invocation logs, with user-defined dhikr types
- **Fasting** — fasting logs, with user-defined fasting types (e.g. Monday/Thursday, Ashura)
- **Charity** — giving logs, with user-defined charity types
- **Islamic study** — study session logs by subject and study mode
- **Skills** — user-created skills/habits (e.g. "memorize Surah Yasin") with progress logs
- **Fitness** — activity logs by fitness activity type and intensity
- **Nutrition** — food/meal logs
- **Sleep** — sleep logs
- **Tasks** — a general to-do list with priority/status
- **Intentions** — daily personal intention-setting, tracked as its own log

## Key UX pattern: "types" vs "logs"
Almost every domain has two layers:
1. **Customization (setup)** — the user defines *what* they track (e.g. adds a custom
   fasting type "Ayyam al-Bidh", a skill "Learn Tajweed", a dhikr type). Full CRUD
   (create/edit/delete) screens needed for each of: prayer locations, other-prayer-types,
   dhikr-types, fasting-types, charity-types, islamic-study-subjects, study-modes,
   fitness-activities, nutrition-foods, fitrah-practices, skills, intentions.
2. **Tracking (daily use)** — the user logs an entry against one of their configured
   types, day to day (e.g. "logged 20 min dhikr using type X today"). Full CRUD list +
   detail screens for each domain's logs.
   Design pattern: think of customization screens as "manage my habit library" and
   tracking screens as "my daily log/journal", similar to how a habit-tracker app
   separates habit setup from daily check-ins.

## Auth & onboarding flow
- Register → email OTP verification → login
- Forgot password → OTP → reset
- JWT session + refresh token (silent refresh, no UX needed beyond login state)
- Post-signup **onboarding flow** (there's a dedicated onboarding-status/complete
  endpoint) — likely: set location for prayer times, pick initial habits/types to track
- Profile screen: view/update profile, request email change (OTP-confirmed)

## Screens needed — Round 1 (narrow scope)
1. **Auth flow**: Register, Verify OTP, Login, Forgot Password, Reset Password
2. **Onboarding**: short guided setup (location + pick initial tracked items)
3. **Home / Dashboard**: today's prayer times, quick daily check-in summary across
   domains (prayers done, tasks pending, intentions set, etc.) — this is the main
   daily-use screen

Tracking (per-domain logs) and Customization (habit/type management) screens are
deliberately **out of scope for this round** — will follow once the direction from
auth/onboarding/dashboard is confirmed.

## Data shape conventions (for realistic mock content)
- Paginated lists return `{ items: [...], page, total, totalPages, limit }`
- All tracking/customization data is scoped to the logged-in user (nothing shared
  between users except read-only reference data like Surahs, Juz, countries, and
  default prayer statuses/priorities)
- Reference/lookup data used as dropdowns: prayer statuses, Quran activity types, task
  priorities, task statuses, fitness intensities, Surahs, Juz, countries

## Visual direction
Calm, minimal, wellness/spiritual-app aesthetic — not clinical or corporate. No
brand colors defined yet, so propose a palette (suggest muted greens/neutrals, avoid
anything gaudy). Optimize for a dashboard-style desktop layout with a left nav or
sidebar covering: Home, Tracking (per domain), Customization, Profile.
