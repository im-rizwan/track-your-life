import { prisma } from '../../core/database/prisma.client';
import {
  PrayerTimesConfig,
  PrayerTime,
  CalculationMode,
  ApiCalculationMethod,
  PrayerTimeSource,
} from '@prisma/client';

export class PrayerTimesRepository {
  // ============================================================================
  // PRAYER TIMES CONFIGURATION
  // ============================================================================

  /**
   * Find user's prayer time configuration
   */
  async findConfigByUserId(userId: string): Promise<PrayerTimesConfig | null> {
    return prisma.prayerTimesConfig.findUnique({
      where: { userId },
    });
  }

  /**
   * Create initial prayer time configuration for user
   */
  async createConfig(data: {
    userId: string;
    calculationMode: CalculationMode;
    apiMethod?: ApiCalculationMethod;
  }): Promise<PrayerTimesConfig> {
    return prisma.prayerTimesConfig.create({
      data: {
        userId: data.userId,
        calculationMode: data.calculationMode,
        apiMethod: data.apiMethod || null,
      },
    });
  }

  /**
   * Update prayer time configuration
   */
  async updateConfig(
    userId: string,
    data: Partial<Omit<PrayerTimesConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<PrayerTimesConfig> {
    return prisma.prayerTimesConfig.update({
      where: { userId },
      data,
    });
  }

  /**
   * Update only the adjustments
   */
  async updateAdjustments(
    userId: string,
    adjustments: {
      fajrAdjustment?: number;
      zuhrAdjustment?: number;
      asrAdjustment?: number;
      maghribAdjustment?: number;
      ishaAdjustment?: number;
    }
  ): Promise<PrayerTimesConfig> {
    return prisma.prayerTimesConfig.update({
      where: { userId },
      data: adjustments,
    });
  }

  /**
   * Update last fetched timestamp
   */
  async updateLastFetched(userId: string): Promise<PrayerTimesConfig> {
    return prisma.prayerTimesConfig.update({
      where: { userId },
      data: { lastFetchedAt: new Date() },
    });
  }

  // ============================================================================
  // CACHED PRAYER TIMES
  // ============================================================================

  /**
   * Find cached prayer times for a specific date
   */
  async findPrayerTimesByDate(userId: string, date: Date): Promise<PrayerTime | null> {
    return prisma.prayerTime.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
  }

  /**
   * Create or update cached prayer times for a date
   */
  async upsertPrayerTimes(data: {
    userId: string;
    date: Date;
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    source: PrayerTimeSource;
  }): Promise<PrayerTime> {
    return prisma.prayerTime.upsert({
      where: {
        userId_date: {
          userId: data.userId,
          date: data.date,
        },
      },
      create: data,
      update: {
        fajr: data.fajr,
        zuhr: data.zuhr,
        asr: data.asr,
        maghrib: data.maghrib,
        isha: data.isha,
        source: data.source,
      },
    });
  }

  /**
   * Delete all cached prayer times for a user
   * (used when user changes location or calculation method)
   */
  async deleteCachedPrayerTimes(userId: string): Promise<void> {
    await prisma.prayerTime.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete old cached prayer times (cleanup - optional)
   */
  async deleteOldCachedTimes(daysOld: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await prisma.prayerTime.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    });
  }
}
