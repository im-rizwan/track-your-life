# MUHASABAH: PRODUCT REQUIREMENTS DOCUMENT

---

## TABLE OF CONTENTS

1. Executive Summary
2. Product Overview
3. Scope Definition
4. User Authentication & Account Management
5. Onboarding & Profile Setup
6. Tracking System
7. Prayer Time System
8. Notifications System
9. Settings & Preferences
10. Data Export
11. Help & Support
12. Privacy & Ethics

---

## EXECUTIVE SUMMARY

**Product Name**  
Muhasabah

**Phase 1 Purpose**  
Muhasabah Phase 1 delivers a mobile-first Islamic life tracking application that enables individuals and families to practice self-accountability (muhasabah) and track their Ibadah, knowledge, health, and time through comprehensive logging and reflection.

---

## PRODUCT OVERVIEW

**Target Users**
- Muslims aged 6 and above
- Individuals tracking personal spiritual and worldly growth

**Platforms**
- Mobile (iOS and Android native apps)
- Web (responsive browser version)
- All users require active internet connection for functionality

**Language**
- English only

---

## SCOPE DEFINITION

### In Scope for Phase 1

**Core Tracking:**

#### Ibadah (Acts of Worship)

**5 Daily Prayers (Default)**
- Prayer Name: Fajr, Zuhr, Asr, Maghrib, Isha, and Jummah (Friday only)
- Status: Prayed on time, Prayed late, Qada, Missed
- Location: Masjid, Home (Jamaah), Home (Individual), Work, Other (customizable)
- Khushu Rating: 1-5 scale
- Date
- Notes

**Other Prayers (Default + Custom Types)**
- Prayer Name: Tahajjud, Duha, Witr, Eid, and custom sunnah prayer types
- Number of Rakahs: Only asks if required
- Date
- Notes

**Quran Tracking**
- Surah Name: Dropdown with search
- Type: Recitation, Memorization, Revision, Tafsir, Translation, Listening
- Number of verses: Slider
- Juzz Number: Dropdown with search
- Date
- Notes

**Dhikr & Dua Tracking**
- Azkar/Dhikr: Dropdown selection (customizable)
- Count/Duration
- Date
- Notes

**Fasting Tracking**
- Fasting: Checkbox
- Type of Fast: Ramadan, Ayyam Al Bidh, Arafah, Ashura (customizable)
- Date
- Notes

**Charity Tracking**
- Charity: Checkbox
- Type of Charity: Zakah, Sadaqah, Jariya (customizable)
- Date
- Notes

#### Knowledge & Learning

**Islamic Study Sessions**
- Subject: Aqeedah, Fiqh, Hadith Studies, Seerah, Islamic History, General Islamic Knowledge (customizable)
- Duration: Time duration in hours/minutes
- Mode of Learning: Reading book, Online Course, Lecture Video, One on One with teacher, Podcast, Other (customizable)
- Date
- Notes

**Dunya Skills**
- Skills: Dropdown showing all user's custom skills
- Pending Topics: Dropdown showing pending topics to select
- Progress: Slider to select progress
- Date
- Notes

#### Health & Lifestyle

**Physical Fitness**
- Activity Name: Running, Swimming, Horse Riding (customizable)
- Quantity: Either time duration or count
- Intensity: Low, Medium, High
- Date
- Notes

**Nutrition**
- Food: Dropdown showing all user-created foods (customizable)
- Consumed: Checkbox
- Quantity: Count/in grams etc
- Date
- Notes

**Sleep & Rest**
- Bedtime: Time user went to bed
- Wakeup Time: Time user woke up
- Sleep Quality: Rating/Scale
- Date
- Notes

**Fitrah Practices**
- Practice: Multiple checkboxes showing all practices (customizable)
- Date
- Notes

#### Time & Productivity

**Daily Tasks**
- Create a task
- Link to an intention
- Priority
- Status
- Date
- Notes

**Intention Tracking**
- Select or create an intention (customizable)
- Duration: Select range from calendar
- Date
- Notes

---

## USER AUTHENTICATION & ACCOUNT MANAGEMENT

### 1.1 User Registration

Users create an account to access the application.

#### Registration Flow

**Option: Email & Password Registration**

1. User enters email address

2. User enters password

3. User clicks "Create Account"

4. System sends verification email with OTP to provided address

5. User enters the OTP sent in email to verify

6. User redirected to onboarding flow

#### Account Created Successfully
- User can now log in
- User proceeds to onboarding

### 1.2 User Login

Users log in to access their tracking data and accounts.

#### Login Flow

**Email & Password Login:**

1. User enters email address
2. User enters password
3. System validates credentials

### 1.3 Password Reset

Users can reset forgotten passwords via email OTP.

#### Password Reset Flow

1. User clicks "Forgot Password" on login screen
2. User enters email address
3. System sends OTP to email (valid for 2 minutes)
4. User enters OTP to verify
5. User enters new password
6. User confirms password (must match)
7. User clicks "Reset Password"
8. System updates password
9. All existing login sessions invalidated (user must log in on all devices)
10. Message: "Password reset successful. Please log in with your new password."

### 1.4 Account Deletion

Users can permanently delete their account and all associated data. This action is irreversible.

#### Account Deletion Flow

1. User navigates to Settings → Account Settings → Delete Account
2. System displays warning dialog explaining all data will be deleted
3. User must type the word "DELETE" (case-sensitive) to confirm understanding
4. User must re-enter their password
5. User clicks "Delete My Account Permanently"
6. System validates password and sends OTP to email
7. User enters OTP to verify
8. If correct and verified:
   - All tracking logs deleted
   - All reflections deleted
   - User profile deleted
   - Confirmation email sent to user
   - User logged out
9. If incorrect: Error message "Incorrect password / OTP. Please try again."

**Important Note:** Once deleted, data cannot be recovered. User must create new account if they want to return.

---

## ONBOARDING & PROFILE SETUP

### 2.1 Welcome Flow

First-time users see a 3-screen welcome experience immediately after successful registration.

**Screen 1: Welcome**
- Visual: Islamic geometric pattern, app logo
- Heading: "Assalamu Alaikum"
- Body Text: "Welcome to Muhasabah—your lifelong companion for self-accountability. Track your Ibadah, knowledge, health, and time. Grow consistently in Deen and Dunya."
- Navigation:
  - Button: "Next" (advance to Screen 2)
  - Button: "Skip" (skip to Screen 3)

**Screen 2: Privacy Commitment**
- Visual: Lock/shield icon illustration
- Heading: "Your Data is Private"
- Body Text: "Your data is secure in the cloud and will never be sold to third parties. You can export or delete your data anytime."
- Navigation:
  - Button: "Next" (advance to Screen 3)
  - Back arrow to return to Screen 1

**Screen 3: Ready to Begin**
- Visual: Person beginning journey illustration
- Heading: "Let's Get Started"
- Body Text: "Set up your profile in the next few steps, and you'll be ready to begin tracking what matters most to you."
- Navigation:
  - Button: "Continue to Profile Setup" (proceed to Module 2.2)
  - Back arrow to return to Screen 2

### 2.2 Profile Setup

Collect essential user information to personalize the application. All fields are mandatory.

#### User Information Form

**Field 1: Display Name**
- User sees: "What should we call you?"
- Input type: Text field
- Placeholder: "Enter your name"
- Rules:
  - Minimum 2 characters
  - Maximum 50 characters
  - Only letters, spaces, and hyphens allowed
- Error message if invalid: "Name must be 2-50 characters, letters/spaces/hyphens only"

**Field 2: Age**
- User sees: "How old are you?"
- Input type: Number field
- Rules:
  - Minimum age: 6 years
  - Maximum age: 120 years
  - Must be whole number (no decimals)
- Error message if invalid: "Please enter a valid age between 6 and 120"

**Field 3: Location - City**
- User sees: "Where are you located?"
- Input type: Text field with autocomplete
- Placeholder: "City"
- Rules:
  - Minimum 2 characters
  - Cannot be empty
  - Auto-suggestions appear as user types

**Field 4: Location - Country**
- Input type: Dropdown with search
- Shows all countries (195 countries) in alphabetical order
- User can search/filter by typing
- Must select one country
- Placeholder: "Select Country"

#### Form Submission
- Button: "Complete Profile"
- Validation:
  - System checks all fields are valid before allowing submission
  - If any field invalid: Error message displayed below that field, field border highlighted in red
  - If all valid: Data saved, user redirected to Home Dashboard

#### After Successful Setup
- User marked as "onboarded"
- User bypasses welcome flow on future logins
- User directed straight to Home Dashboard

---

## TRACKING SYSTEM

### 3.1 Tracking Architecture Overview

The application supports 4 primary tracking categories. All users have access to all categories. Users can hide categories they don't use via Settings.

**Four Primary Categories:**

1. **Ibadah (Acts of Worship)**
   - 5 Daily Prayers (Fajr, Zuhr, Asr, Maghrib, Isha, Jummah)
   - Other Prayers (Tahajjud, Duha, Witr, Eid, custom types)
   - Quran (Recitation, Memorization, Revision, Tafsir, Translation, Listening)
   - Dhikr & Dua
   - Fasting
   - Charity

2. **Knowledge & Learning**
   - Islamic Study Sessions
   - Dunya Skills

3. **Health & Lifestyle**
   - Physical Fitness
   - Nutrition
   - Sleep & Rest
   - Fitrah Practices

4. **Time & Productivity**
   - Daily Tasks
   - Intention Tracking

**General Tracking Principles**

**Date Association:**
- Every log entry associated with a specific date
- User can log for today OR backdate entries (up to 1 year in past)
- Default date is always today

**Editing and Deletion:**
- User can edit any log entry after creation
- User can delete any log entry

**Notes Field:**
- Most activities include optional notes field
- Character limits specified per activity
- Notes are private to user

---

### 3.2 IBADAH: PRAYERS

#### 3.2.1 Five Daily Prayers

**Prayers Tracked:**
1. Fajr
2. Zuhr
3. Asr
4. Maghrib
5. Isha
6. Jummah (Friday only)

**Logging Process:**

User accesses prayer logging from:
- Home Dashboard → Prayer card
- OR Tracking Tab → Ibadah → Prayers → Daily Prayers

**Fields:**

**Field 1: Prayer Name (required)**
- User chooses which prayer: Fajr, Zuhr, Asr, Maghrib, Isha, or Jummah (if Friday)

**Field 2: Status (required)**
- User selects ONE of four options:
  - "Prayed on time"
  - "Prayed late"
  - "Qada"
  - "Missed"

**Field 3: Location (optional)**
- Dropdown options: Masjid, Home (Jamaah), Home (Individual), Work, Other
- User customization: User can add custom locations in Settings
- Custom locations appear in dropdown for future logs

**Field 4: Khushu Rating (optional)**
- Slider from 1 to 5
- Label: "How focused were you in this prayer?"
- Scale:
  - 1 = Very distracted
  - 2 = Somewhat distracted
  - 3 = Neutral
  - 4 = Focused
  - 5 = Deeply focused

**Field 5: Date (required)**
- Date picker
- Default: Today's date
- User can backdate (up to 1 year in past)

**Field 6: Notes (optional)**
- Text field
- Label: "Any reflections on this prayer?"
- Character limit: 500 characters

**Save Action:**
- Button: "Log Prayer"
- After saving: Confirmation message, log appears in history

#### 3.2.2 Other Prayers

**Prayers Available:**
- Tahajjud (night prayer before Fajr)
- Duha (forenoon prayer, mid-morning)
- Witr (after Isha)
- Eid (Eid al-Fitr and Eid al-Adha)
- Custom sunnah prayer types (user-customizable)

**Logging Process:**

User accesses from: Tracking Tab → Ibadah → Prayers → Other Prayers

**Fields:**

**Field 1: Prayer Name (required)**
- Dropdown: Select Tahajjud, Duha, Witr, Eid, or custom type

**Field 2: Number of Rakahs (conditional)**
- Number field
- Label: "How many rakats?"
- Only appears if required for the selected prayer type
- Valid range: 2-12 rakats

**Field 3: Date (required)**
- Date picker, default today

**Field 4: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Prayer"

---

### 3.3 IBADAH: QURAN TRACKING

**Purpose:** Track Quran study across multiple types

**Logging Process:**

User accesses from: Tracking Tab → Ibadah → Quran

**Fields:**

**Field 1: Surah Name (required)**
- Dropdown with search
- All 114 Surahs

**Field 2: Type (required)**
- Dropdown: Recitation, Memorization, Revision, Tafsir, Translation, Listening

**Field 3: Number of Verses (required)**
- Slider or number input
- Label: "How many verses?"

**Field 4: Juzz Number (optional)**
- Dropdown with search
- Numbers 1-30
- For user convenience

**Field 5: Date (required)**
- Date picker, default today

**Field 6: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Quran"

---

### 3.4 IBADAH: DHIKR & DUA TRACKING

**Logging Process:**

User accesses from: Tracking Tab → Ibadah → Dhikr & Dua

**Fields:**

**Field 1: Azkar/Dhikr (required)**
- Dropdown selection
- User can add custom dhikr types in Settings
- Custom types appear in dropdown

**Field 2: Count/Duration (required)**
- Number field
- Flexible: Can represent count or duration depending on dhikr type
- Label: "Count or Duration"

**Field 3: Date (required)**
- Date picker, default today

**Field 4: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Dhikr & Dua"

---

### 3.5 IBADAH: FASTING TRACKING

**Logging Process:**

User accesses from: Tracking Tab → Ibadah → Fasting

**Fields:**

**Field 1: Fasting (required)**
- Checkbox
- Label: "I fasted today"
- Must be checked to submit

**Field 2: Type of Fast (required)**
- Dropdown
- Options: Ramadan, Ayyam Al Bidh, Arafah, Ashura
- User customization: User can add custom fasting types in Settings
- Custom types appear in dropdown

**Field 3: Date (required)**
- Date picker, default today

**Field 4: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Fast"

---

### 3.6 IBADAH: CHARITY TRACKING

**Logging Process:**

User accesses from: Tracking Tab → Ibadah → Charity

**Fields:**

**Field 1: Charity (required)**
- Checkbox
- Label: "I gave charity today"
- Must be checked to submit

**Field 2: Type of Charity (required)**
- Dropdown
- Options: Zakah, Sadaqah, Jariya
- User customization: User can add custom charity types in Settings
- Custom types appear in dropdown

**Field 3: Date (required)**
- Date picker, default today

**Field 4: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Charity"

---

### 3.7 KNOWLEDGE & LEARNING: ISLAMIC STUDY SESSIONS

**Logging Process:**

User accesses from: Tracking Tab → Knowledge → Islamic Study Sessions

**Fields:**

**Field 1: Subject (required)**
- Dropdown
- Default options: Aqeedah, Fiqh, Hadith Studies, Seerah, Islamic History, General Islamic Knowledge
- User customization: User can add custom subjects in Settings
- Custom subjects appear in dropdown

**Field 2: Duration (required)**
- Number field
- Label: "How long did you study?"
- Format: Hours and/or minutes

**Field 3: Mode of Learning (required)**
- Dropdown
- Default options: Reading book, Online Course, Lecture Video, One on One with teacher, Podcast, Other
- User customization: User can add custom modes in Settings
- Custom modes appear in dropdown

**Field 4: Date (required)**
- Date picker, default today

**Field 5: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Study Session"

---

### 3.8 KNOWLEDGE & LEARNING: DUNYA SKILLS

**Purpose:** Allow users to track customizable skills

**Customization Process:**

User adds custom skills in Settings → Tracking Preferences → Dunya Skills:
1. User clicks "+ Add New Skill"
2. User enters skill name (required, max 100 characters)
3. Skill saved and ready for logging

**Logging Skills:**

User accesses from: Tracking Tab → Knowledge → Dunya Skills

**Fields:**

**Field 1: Skills (required)**
- Dropdown showing all user's custom skills

**Field 2: Pending Topics (optional)**
- Dropdown showing pending topics to select

**Field 3: Progress (required)**
- Slider to select progress
- Scale: 0-100%

**Field 4: Date (required)**
- Date picker, default today

**Field 5: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Skill"

---

### 3.9 HEALTH & LIFESTYLE: PHYSICAL FITNESS

**Purpose:** Allow users to track customizable exercises

**Customization Process:**

User adds custom exercises in Settings → Tracking Preferences → Physical Fitness:
1. User clicks "+ Add Exercise"
2. User enters activity name (required, max 100 characters)
3. Exercise saved and ready for logging

**Logging Exercises:**

User accesses from: Tracking Tab → Health → Physical Fitness

**Fields:**

**Field 1: Activity Name (required)**
- Dropdown showing all user's custom activities

**Field 2: Quantity (required)**
- Number field
- Either time duration (minutes) or count (repetitions)
- Flexible based on activity type

**Field 3: Intensity (optional)**
- Dropdown
- Options: Low, Medium, High

**Field 4: Date (required)**
- Date picker, default today

**Field 5: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Exercise"

---

### 3.10 HEALTH & LIFESTYLE: NUTRITION

**Logging Process:**

User accesses from: Tracking Tab → Health → Nutrition

**Fields:**

**Field 1: Food (required)**
- Dropdown showing all user-created foods
- User can add custom foods in Settings
- Custom foods appear in dropdown

**Field 2: Consumed (required)**
- Checkbox
- Label: "I consumed this food"
- Must be checked to submit

**Field 3: Quantity (optional)**
- Text field
- Label: "How much? (e.g., 1 cup, handful, 100g)"
- Character limit: 50 characters

**Field 4: Date (required)**
- Date picker, default today

**Field 5: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Food"

---

### 3.11 HEALTH & LIFESTYLE: SLEEP & REST

**Logging Process:**

User accesses from: Tracking Tab → Health → Sleep & Rest

**Fields:**

**Field 1: Bedtime (required)**
- Time picker
- Label: "What time did you go to bed?"

**Field 2: Wakeup Time (required)**
- Time picker
- Label: "What time did you wake up?"

**Field 3: Sleep Quality (optional)**
- Rating/Scale (e.g., 1-5 slider)
- Label: "How was your sleep quality?"

**Field 4: Date (required)**
- Date picker, default today

**Field 5: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Sleep"

---

### 3.12 HEALTH & LIFESTYLE: FITRAH PRACTICES

**Logging Process:**

User accesses from: Tracking Tab → Health → Fitrah Practices

**Fields:**

**Field 1: Practice (required)**
- Multiple checkboxes showing all practices
- User can add custom practices in Settings
- Custom practices appear in checkboxes
- At least one must be checked to submit

**Field 2: Date (required)**
- Date picker, default today

**Field 3: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Fitrah Practices"

---

### 3.13 TIME & PRODUCTIVITY: DAILY TASKS

**Logging Process:**

User accesses from: Tracking Tab → Time & Productivity → Daily Tasks

**Fields:**

**Field 1: Create a Task (required)**
- Text field
- Label: "What do you need to do?"

**Field 2: Link to an Intention (optional)**
- Dropdown or search
- Connect task to an intention

**Field 3: Priority (optional)**
- Dropdown
- Options: High, Medium, Low

**Field 4: Status (optional)**
- Dropdown or toggle
- Options: Not Started, In Progress, Completed

**Field 5: Date (required)**
- Date picker, default today

**Field 6: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Task"

---

### 3.14 TIME & PRODUCTIVITY: INTENTION TRACKING

**Logging Process:**

User accesses from: Tracking Tab → Time & Productivity → Intention Tracking

**Fields:**

**Field 1: Select or Create an Intention (required)**
- Dropdown or text field
- User can add custom intentions in Settings
- Custom intentions appear in dropdown

**Field 2: Duration (optional)**
- Select range from calendar
- Label: "Duration for this intention"

**Field 3: Date (required)**
- Date picker, default today

**Field 4: Notes (optional)**
- Text field
- Character limit: 500 characters

**Save Action:**
- Button: "Log Intention"

---

## PRAYER TIME SYSTEM

### 6.1 Prayer Time Calculation Methods

Users choose between two calculation methods:

#### Method 1: Automatic Prayer Times (API-Based)

**Default method**

**How it works:**
- System fetches prayer times from third-party API based on user's location
- User's city and country (set during onboarding) used for coordinates
- Prayer times calculated daily using standard Islamic calculation methods
- Times stored in database for current day

**User Configuration:**

User navigates to Settings → Prayer Times → Calculation Method
- Selects "Automatic"
- Selects calculation method from dropdown:
  - Muslim World League
  - Islamic Society of North America (ISNA)
  - Egyptian General Authority of Survey
  - Umm Al-Qura University (Makkah)
  - University of Islamic Sciences, Karachi
  - Institute of Geophysics, University of Tehran
- Default: Muslim World League

**Prayer Time Adjustments:**

User can adjust each prayer time by -15 to +15 minutes
- Adjustments applied on top of calculated times
- Adjustments saved per prayer, not globally

**Refresh Behavior:**

Prayer times refresh automatically when user opens app (if last fetch > 24 hours ago)
- User can manually refresh by pulling down on prayer times screen

#### Method 2: Manual Prayer Times

**Alternative method**

**How it works:**
- User manually enters prayer times for each prayer
- Times remain fixed until user changes them
- No API calls made

**User Configuration:**

User navigates to Settings → Prayer Times → Calculation Method
- Selects "Manual"
- System displays time picker for each prayer:
  - Fajr
  - Zuhr
  - Asr
  - Maghrib
  - Isha
- User sets each prayer time
- User clicks "Save Prayer Times"

**Updates:**

User must manually update times when seasons change
- System does NOT automatically adjust for daylight saving time

## SETTINGS & PREFERENCES

### 9.1 Account Settings

**Location:** Settings → Account Settings

**Fields:**
- Display Name (editable)
- Email (view-only, with "Change Email" link)
- Age (editable)
- Location - City (editable)
- Location - Country (editable)
- Language (dropdown, currently "English" only)

### 9.2 Tracking Preferences

**Location:** Settings → Tracking Preferences

Users can customize tracking options for:

**Ibadah:**
- Custom prayer locations
- Custom dhikr types
- Custom fasting types
- Custom charity types
- Custom other prayer types

**Knowledge:**
- Custom Islamic study subjects
- Custom study modes/formats
- Custom dunya skills

**Health:**
- Custom physical fitness activities
- Custom nutrition foods
- Custom fitrah practices

**Time & Productivity:**
- Custom intention types

**Each customization allows:**
- "+ Add New [item]"
- Edit existing items
- Delete custom items (default items cannot be deleted)

### 9.3 Prayer Time Settings

**Location:** Settings → Prayer Times

**Options:**
- Calculation Method (Automatic or Manual)
- If Automatic:
  - Prayer time calculation method (dropdown)
  - Manual adjustments per prayer (-15 to +15 minutes)
  - "Refresh Prayer Times" button
- If Manual:
  - Time picker for each of 5 prayers
  - "Save Prayer Times" button

### 9.5 Privacy & Data Settings

**Location:** Settings → Privacy & Data

**Options:**
- "View my data" - View all stored data in JSON format
- "Download my data" - Export all data as CSV
- "Delete my account" - Permanently delete account and all data (see Section 1.4)

---

## DATA EXPORT

### 10.1 CSV Export

**Purpose:** Allow users to export all tracking logs in CSV format

**Access:** Settings → Privacy & Data → Download My Data

**What's Included:**
- All tracking logs across all categories
- Date and time of each log entry
- All fields for each tracking type
- Notes for each entry

**File Format:**
- Filename: `muhasabah_export_[date].csv`
- Contains separate sections for each tracking category
- CSV headers clearly label each column

**User Access:**
- User receives downloadable file link
- File downloaded to device storage
- User can open in Excel, Google Sheets, or any spreadsheet application
- User can further process or backup the data

---

## HELP & SUPPORT

### 11.1 Help Center

**Location:** Settings → Help & Support → Help Center

**Content:**
- FAQ section with common questions
- Feature explanations for each tracking category
- How-to guides for logging activities
- Glossary of Islamic terms used in app
- Screenshots and examples

### 11.2 Contact Support

**Location:** Settings → Help & Support → Contact Support

**Options:**
- Email support form (in-app)
- Support email address for direct contact
- Bug report submission
- Feature request submission

---

## PRIVACY & ETHICS

### 12.1 Data Privacy

- User data stored securely on cloud servers
- Data encrypted in transit (HTTPS/TLS)
- User data never sold to third parties
- Users can export or delete data anytime
- Compliance with privacy regulations (GDPR, etc.)

### 12.2 Ethical Principles

- No judgment-based language or shame-inducing features
- Emphasis on mercy and return (not streak obsession)
- No comparative analytics between users
- No social features or leaderboards
- User privacy prioritized over data collection
- Islamic values and ethics preserved throughout design

---
