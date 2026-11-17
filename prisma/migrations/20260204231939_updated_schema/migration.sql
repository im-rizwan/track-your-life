-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_DELETION');

-- CreateEnum
CREATE TYPE "DailyPrayerName" AS ENUM ('FAJR', 'ZUHR', 'ASR', 'MAGHRIB', 'ISHA', 'JUMMAH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "age" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailedLoginAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerTimesConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calculationMethod" TEXT NOT NULL DEFAULT 'AUTOMATIC',
    "apiMethod" TEXT,
    "lastFetchedAt" TIMESTAMP(3),
    "fajrTime" TEXT,
    "zuhrTime" TEXT,
    "asrTime" TEXT,
    "maghribTime" TEXT,
    "ishaTime" TEXT,
    "fajrAdjustment" INTEGER NOT NULL DEFAULT 0,
    "zuhrAdjustment" INTEGER NOT NULL DEFAULT 0,
    "asrAdjustment" INTEGER NOT NULL DEFAULT 0,
    "maghribAdjustment" INTEGER NOT NULL DEFAULT 0,
    "ishaAdjustment" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerTimesConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuranActivityType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuranActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskPriority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskPriority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessIntensity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessIntensity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherPrayerType" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "requiresRakahCount" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherPrayerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DhikrType" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DhikrType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FastingType" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FastingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharityType" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IslamicStudySubject" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IslamicStudySubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyMode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionFood" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitrahPractice" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitrahPractice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTopic" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPending" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intention" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPrayerLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prayerName" "DailyPrayerName" NOT NULL,
    "prayerStatusId" TEXT NOT NULL,
    "prayerLocationId" TEXT,
    "khushuRating" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPrayerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherPrayerLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otherPrayerTypeId" TEXT NOT NULL,
    "rakahs" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherPrayerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuranLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surahName" TEXT NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "quranActivityTypeId" TEXT NOT NULL,
    "versesCount" INTEGER NOT NULL,
    "juzzNumber" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuranLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DhikrLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dhikrTypeId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DhikrLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FastingLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fastingTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FastingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "charityTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IslamicStudyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "studyModeId" TEXT NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IslamicStudyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillProgressLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "skillTopicId" TEXT,
    "progress" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillProgressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fitnessActivityId" TEXT NOT NULL,
    "fitnessIntensityId" TEXT,
    "quantity" INTEGER NOT NULL,
    "quantityUnit" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nutritionFoodId" TEXT NOT NULL,
    "quantity" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bedtime" TIMESTAMP(3) NOT NULL,
    "wakeupTime" TIMESTAMP(3) NOT NULL,
    "sleepQuality" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitrahPracticeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitrahPracticeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitrahPracticeOnLog" (
    "id" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitrahPracticeOnLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intentionId" TEXT,
    "title" TEXT NOT NULL,
    "taskPriorityId" TEXT,
    "taskStatusId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntentionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intentionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntentionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "OtpToken_userId_purpose_isUsed_idx" ON "OtpToken"("userId", "purpose", "isUsed");

-- CreateIndex
CREATE INDEX "OtpToken_expiresAt_idx" ON "OtpToken"("expiresAt");

-- CreateIndex
CREATE INDEX "FailedLoginAttempt_userId_attemptedAt_idx" ON "FailedLoginAttempt"("userId", "attemptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTimesConfig_userId_key" ON "PrayerTimesConfig"("userId");

-- CreateIndex
CREATE INDEX "PrayerTimesConfig_userId_idx" ON "PrayerTimesConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerStatus_name_key" ON "PrayerStatus"("name");

-- CreateIndex
CREATE INDEX "PrayerStatus_isActive_sortOrder_idx" ON "PrayerStatus"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "QuranActivityType_name_key" ON "QuranActivityType"("name");

-- CreateIndex
CREATE INDEX "QuranActivityType_isActive_sortOrder_idx" ON "QuranActivityType"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TaskPriority_name_key" ON "TaskPriority"("name");

-- CreateIndex
CREATE INDEX "TaskPriority_isActive_sortOrder_idx" ON "TaskPriority"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStatus_name_key" ON "TaskStatus"("name");

-- CreateIndex
CREATE INDEX "TaskStatus_isActive_sortOrder_idx" ON "TaskStatus"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessIntensity_name_key" ON "FitnessIntensity"("name");

-- CreateIndex
CREATE INDEX "FitnessIntensity_isActive_sortOrder_idx" ON "FitnessIntensity"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "PrayerLocation_userId_isActive_idx" ON "PrayerLocation"("userId", "isActive");

-- CreateIndex
CREATE INDEX "PrayerLocation_isDefault_idx" ON "PrayerLocation"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLocation_userId_name_key" ON "PrayerLocation"("userId", "name");

-- CreateIndex
CREATE INDEX "OtherPrayerType_userId_isActive_idx" ON "OtherPrayerType"("userId", "isActive");

-- CreateIndex
CREATE INDEX "OtherPrayerType_isDefault_idx" ON "OtherPrayerType"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "OtherPrayerType_userId_name_key" ON "OtherPrayerType"("userId", "name");

-- CreateIndex
CREATE INDEX "DhikrType_userId_isActive_idx" ON "DhikrType"("userId", "isActive");

-- CreateIndex
CREATE INDEX "DhikrType_isDefault_idx" ON "DhikrType"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "DhikrType_userId_name_key" ON "DhikrType"("userId", "name");

-- CreateIndex
CREATE INDEX "FastingType_userId_isActive_idx" ON "FastingType"("userId", "isActive");

-- CreateIndex
CREATE INDEX "FastingType_isDefault_idx" ON "FastingType"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "FastingType_userId_name_key" ON "FastingType"("userId", "name");

-- CreateIndex
CREATE INDEX "CharityType_userId_isActive_idx" ON "CharityType"("userId", "isActive");

-- CreateIndex
CREATE INDEX "CharityType_isDefault_idx" ON "CharityType"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "CharityType_userId_name_key" ON "CharityType"("userId", "name");

-- CreateIndex
CREATE INDEX "IslamicStudySubject_userId_isActive_idx" ON "IslamicStudySubject"("userId", "isActive");

-- CreateIndex
CREATE INDEX "IslamicStudySubject_isDefault_idx" ON "IslamicStudySubject"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "IslamicStudySubject_userId_name_key" ON "IslamicStudySubject"("userId", "name");

-- CreateIndex
CREATE INDEX "StudyMode_userId_isActive_idx" ON "StudyMode"("userId", "isActive");

-- CreateIndex
CREATE INDEX "StudyMode_isDefault_idx" ON "StudyMode"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "StudyMode_userId_name_key" ON "StudyMode"("userId", "name");

-- CreateIndex
CREATE INDEX "FitnessActivity_userId_isActive_idx" ON "FitnessActivity"("userId", "isActive");

-- CreateIndex
CREATE INDEX "FitnessActivity_isDefault_idx" ON "FitnessActivity"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessActivity_userId_name_key" ON "FitnessActivity"("userId", "name");

-- CreateIndex
CREATE INDEX "NutritionFood_userId_isActive_idx" ON "NutritionFood"("userId", "isActive");

-- CreateIndex
CREATE INDEX "NutritionFood_isDefault_idx" ON "NutritionFood"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionFood_userId_name_key" ON "NutritionFood"("userId", "name");

-- CreateIndex
CREATE INDEX "FitrahPractice_userId_isActive_idx" ON "FitrahPractice"("userId", "isActive");

-- CreateIndex
CREATE INDEX "FitrahPractice_isDefault_idx" ON "FitrahPractice"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "FitrahPractice_userId_name_key" ON "FitrahPractice"("userId", "name");

-- CreateIndex
CREATE INDEX "Skill_userId_isActive_idx" ON "Skill"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_userId_name_key" ON "Skill"("userId", "name");

-- CreateIndex
CREATE INDEX "SkillTopic_skillId_isPending_idx" ON "SkillTopic"("skillId", "isPending");

-- CreateIndex
CREATE UNIQUE INDEX "SkillTopic_skillId_name_key" ON "SkillTopic"("skillId", "name");

-- CreateIndex
CREATE INDEX "Intention_userId_isActive_idx" ON "Intention"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Intention_userId_name_key" ON "Intention"("userId", "name");

-- CreateIndex
CREATE INDEX "DailyPrayerLog_userId_date_idx" ON "DailyPrayerLog"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyPrayerLog_userId_prayerName_date_idx" ON "DailyPrayerLog"("userId", "prayerName", "date");

-- CreateIndex
CREATE INDEX "DailyPrayerLog_userId_prayerStatusId_date_idx" ON "DailyPrayerLog"("userId", "prayerStatusId", "date");

-- CreateIndex
CREATE INDEX "DailyPrayerLog_prayerLocationId_idx" ON "DailyPrayerLog"("prayerLocationId");

-- CreateIndex
CREATE INDEX "DailyPrayerLog_prayerStatusId_idx" ON "DailyPrayerLog"("prayerStatusId");

-- CreateIndex
CREATE INDEX "OtherPrayerLog_userId_date_idx" ON "OtherPrayerLog"("userId", "date");

-- CreateIndex
CREATE INDEX "OtherPrayerLog_otherPrayerTypeId_date_idx" ON "OtherPrayerLog"("otherPrayerTypeId", "date");

-- CreateIndex
CREATE INDEX "QuranLog_userId_date_idx" ON "QuranLog"("userId", "date");

-- CreateIndex
CREATE INDEX "QuranLog_userId_quranActivityTypeId_date_idx" ON "QuranLog"("userId", "quranActivityTypeId", "date");

-- CreateIndex
CREATE INDEX "QuranLog_userId_surahNumber_date_idx" ON "QuranLog"("userId", "surahNumber", "date");

-- CreateIndex
CREATE INDEX "QuranLog_quranActivityTypeId_idx" ON "QuranLog"("quranActivityTypeId");

-- CreateIndex
CREATE INDEX "DhikrLog_userId_date_idx" ON "DhikrLog"("userId", "date");

-- CreateIndex
CREATE INDEX "DhikrLog_dhikrTypeId_date_idx" ON "DhikrLog"("dhikrTypeId", "date");

-- CreateIndex
CREATE INDEX "FastingLog_userId_date_idx" ON "FastingLog"("userId", "date");

-- CreateIndex
CREATE INDEX "FastingLog_fastingTypeId_date_idx" ON "FastingLog"("fastingTypeId", "date");

-- CreateIndex
CREATE INDEX "CharityLog_userId_date_idx" ON "CharityLog"("userId", "date");

-- CreateIndex
CREATE INDEX "CharityLog_charityTypeId_date_idx" ON "CharityLog"("charityTypeId", "date");

-- CreateIndex
CREATE INDEX "IslamicStudyLog_userId_date_idx" ON "IslamicStudyLog"("userId", "date");

-- CreateIndex
CREATE INDEX "IslamicStudyLog_subjectId_date_idx" ON "IslamicStudyLog"("subjectId", "date");

-- CreateIndex
CREATE INDEX "IslamicStudyLog_studyModeId_date_idx" ON "IslamicStudyLog"("studyModeId", "date");

-- CreateIndex
CREATE INDEX "SkillProgressLog_userId_date_idx" ON "SkillProgressLog"("userId", "date");

-- CreateIndex
CREATE INDEX "SkillProgressLog_skillId_date_idx" ON "SkillProgressLog"("skillId", "date");

-- CreateIndex
CREATE INDEX "SkillProgressLog_skillTopicId_idx" ON "SkillProgressLog"("skillTopicId");

-- CreateIndex
CREATE INDEX "FitnessLog_userId_date_idx" ON "FitnessLog"("userId", "date");

-- CreateIndex
CREATE INDEX "FitnessLog_fitnessActivityId_date_idx" ON "FitnessLog"("fitnessActivityId", "date");

-- CreateIndex
CREATE INDEX "FitnessLog_fitnessIntensityId_idx" ON "FitnessLog"("fitnessIntensityId");

-- CreateIndex
CREATE INDEX "NutritionLog_userId_date_idx" ON "NutritionLog"("userId", "date");

-- CreateIndex
CREATE INDEX "NutritionLog_nutritionFoodId_date_idx" ON "NutritionLog"("nutritionFoodId", "date");

-- CreateIndex
CREATE INDEX "SleepLog_userId_date_idx" ON "SleepLog"("userId", "date");

-- CreateIndex
CREATE INDEX "FitrahPracticeLog_userId_date_idx" ON "FitrahPracticeLog"("userId", "date");

-- CreateIndex
CREATE INDEX "FitrahPracticeOnLog_logId_idx" ON "FitrahPracticeOnLog"("logId");

-- CreateIndex
CREATE INDEX "FitrahPracticeOnLog_practiceId_idx" ON "FitrahPracticeOnLog"("practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "FitrahPracticeOnLog_logId_practiceId_key" ON "FitrahPracticeOnLog"("logId", "practiceId");

-- CreateIndex
CREATE INDEX "Task_userId_date_idx" ON "Task"("userId", "date");

-- CreateIndex
CREATE INDEX "Task_userId_taskStatusId_date_idx" ON "Task"("userId", "taskStatusId", "date");

-- CreateIndex
CREATE INDEX "Task_intentionId_idx" ON "Task"("intentionId");

-- CreateIndex
CREATE INDEX "Task_taskPriorityId_idx" ON "Task"("taskPriorityId");

-- CreateIndex
CREATE INDEX "Task_taskStatusId_idx" ON "Task"("taskStatusId");

-- CreateIndex
CREATE INDEX "IntentionLog_userId_date_idx" ON "IntentionLog"("userId", "date");

-- CreateIndex
CREATE INDEX "IntentionLog_intentionId_date_idx" ON "IntentionLog"("intentionId", "date");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "OtpToken" ADD CONSTRAINT "OtpToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FailedLoginAttempt" ADD CONSTRAINT "FailedLoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTimesConfig" ADD CONSTRAINT "PrayerTimesConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLocation" ADD CONSTRAINT "PrayerLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherPrayerType" ADD CONSTRAINT "OtherPrayerType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DhikrType" ADD CONSTRAINT "DhikrType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FastingType" ADD CONSTRAINT "FastingType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharityType" ADD CONSTRAINT "CharityType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslamicStudySubject" ADD CONSTRAINT "IslamicStudySubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMode" ADD CONSTRAINT "StudyMode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessActivity" ADD CONSTRAINT "FitnessActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionFood" ADD CONSTRAINT "NutritionFood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitrahPractice" ADD CONSTRAINT "FitrahPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillTopic" ADD CONSTRAINT "SkillTopic_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intention" ADD CONSTRAINT "Intention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPrayerLog" ADD CONSTRAINT "DailyPrayerLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPrayerLog" ADD CONSTRAINT "DailyPrayerLog_prayerStatusId_fkey" FOREIGN KEY ("prayerStatusId") REFERENCES "PrayerStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPrayerLog" ADD CONSTRAINT "DailyPrayerLog_prayerLocationId_fkey" FOREIGN KEY ("prayerLocationId") REFERENCES "PrayerLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherPrayerLog" ADD CONSTRAINT "OtherPrayerLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherPrayerLog" ADD CONSTRAINT "OtherPrayerLog_otherPrayerTypeId_fkey" FOREIGN KEY ("otherPrayerTypeId") REFERENCES "OtherPrayerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranLog" ADD CONSTRAINT "QuranLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranLog" ADD CONSTRAINT "QuranLog_quranActivityTypeId_fkey" FOREIGN KEY ("quranActivityTypeId") REFERENCES "QuranActivityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DhikrLog" ADD CONSTRAINT "DhikrLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DhikrLog" ADD CONSTRAINT "DhikrLog_dhikrTypeId_fkey" FOREIGN KEY ("dhikrTypeId") REFERENCES "DhikrType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FastingLog" ADD CONSTRAINT "FastingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FastingLog" ADD CONSTRAINT "FastingLog_fastingTypeId_fkey" FOREIGN KEY ("fastingTypeId") REFERENCES "FastingType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharityLog" ADD CONSTRAINT "CharityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharityLog" ADD CONSTRAINT "CharityLog_charityTypeId_fkey" FOREIGN KEY ("charityTypeId") REFERENCES "CharityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslamicStudyLog" ADD CONSTRAINT "IslamicStudyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslamicStudyLog" ADD CONSTRAINT "IslamicStudyLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "IslamicStudySubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslamicStudyLog" ADD CONSTRAINT "IslamicStudyLog_studyModeId_fkey" FOREIGN KEY ("studyModeId") REFERENCES "StudyMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgressLog" ADD CONSTRAINT "SkillProgressLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgressLog" ADD CONSTRAINT "SkillProgressLog_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgressLog" ADD CONSTRAINT "SkillProgressLog_skillTopicId_fkey" FOREIGN KEY ("skillTopicId") REFERENCES "SkillTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessLog" ADD CONSTRAINT "FitnessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessLog" ADD CONSTRAINT "FitnessLog_fitnessActivityId_fkey" FOREIGN KEY ("fitnessActivityId") REFERENCES "FitnessActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessLog" ADD CONSTRAINT "FitnessLog_fitnessIntensityId_fkey" FOREIGN KEY ("fitnessIntensityId") REFERENCES "FitnessIntensity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionLog" ADD CONSTRAINT "NutritionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionLog" ADD CONSTRAINT "NutritionLog_nutritionFoodId_fkey" FOREIGN KEY ("nutritionFoodId") REFERENCES "NutritionFood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitrahPracticeLog" ADD CONSTRAINT "FitrahPracticeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitrahPracticeOnLog" ADD CONSTRAINT "FitrahPracticeOnLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "FitrahPracticeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitrahPracticeOnLog" ADD CONSTRAINT "FitrahPracticeOnLog_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "FitrahPractice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_intentionId_fkey" FOREIGN KEY ("intentionId") REFERENCES "Intention"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskPriorityId_fkey" FOREIGN KEY ("taskPriorityId") REFERENCES "TaskPriority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskStatusId_fkey" FOREIGN KEY ("taskStatusId") REFERENCES "TaskStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntentionLog" ADD CONSTRAINT "IntentionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntentionLog" ADD CONSTRAINT "IntentionLog_intentionId_fkey" FOREIGN KEY ("intentionId") REFERENCES "Intention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
