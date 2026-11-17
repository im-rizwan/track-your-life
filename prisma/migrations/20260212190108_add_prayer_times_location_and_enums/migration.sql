/*
  Warnings:

  - You are about to drop the column `asrTime` on the `PrayerTimesConfig` table. All the data in the column will be lost.
  - You are about to drop the column `calculationMethod` on the `PrayerTimesConfig` table. All the data in the column will be lost.
  - You are about to drop the column `fajrTime` on the `PrayerTimesConfig` table. All the data in the column will be lost.
  - You are about to drop the column `ishaTime` on the `PrayerTimesConfig` table. All the data in the column will be lost.
  - You are about to drop the column `maghribTime` on the `PrayerTimesConfig` table. All the data in the column will be lost.
  - You are about to drop the column `zuhrTime` on the `PrayerTimesConfig` table. All the data in the column will be lost.
  - The `apiMethod` column on the `PrayerTimesConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CalculationMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "ApiCalculationMethod" AS ENUM ('MWL', 'ISNA', 'EGYPT', 'MAKKAH', 'KARACHI', 'TEHRAN');

-- CreateEnum
CREATE TYPE "PrayerTimeSource" AS ENUM ('API', 'MANUAL');

-- AlterTable
ALTER TABLE "PrayerTimesConfig" DROP COLUMN "asrTime",
DROP COLUMN "calculationMethod",
DROP COLUMN "fajrTime",
DROP COLUMN "ishaTime",
DROP COLUMN "maghribTime",
DROP COLUMN "zuhrTime",
ADD COLUMN     "calculationMode" "CalculationMode" NOT NULL DEFAULT 'AUTOMATIC',
ADD COLUMN     "manualAsr" TEXT,
ADD COLUMN     "manualFajr" TEXT,
ADD COLUMN     "manualIsha" TEXT,
ADD COLUMN     "manualMaghrib" TEXT,
ADD COLUMN     "manualZuhr" TEXT,
DROP COLUMN "apiMethod",
ADD COLUMN     "apiMethod" "ApiCalculationMethod" DEFAULT 'MWL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "PrayerTime" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "fajr" TEXT NOT NULL,
    "zuhr" TEXT NOT NULL,
    "asr" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "isha" TEXT NOT NULL,
    "source" "PrayerTimeSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrayerTime_userId_date_idx" ON "PrayerTime"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTime_userId_date_key" ON "PrayerTime"("userId", "date");

-- AddForeignKey
ALTER TABLE "PrayerTime" ADD CONSTRAINT "PrayerTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
