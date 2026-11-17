import { PrayerTimesRepository } from './prayer-times.repository';
import { CalculationMode, ApiCalculationMethod, PrayerTimeSource } from '@prisma/client';
import {
  NotFoundError,
  BadRequestError,
  ServiceUnavailableError,
} from '../../core/errors/app-error';
import {
  DailyPrayerTimes,
  PrayerTimesConfigData,
  AladhanTimingsResponse,
  ALADHAN_METHOD_MAP,
} from './types/prayer-times.types';
import { UpdateConfigDto } from './dto/update-config.dto';
import { UpdateAdjustmentsDto } from './dto/update-adjustments.dto';
import { UsersRepository } from '../users/users.repository';

export class PrayerTimesService {
  private repository: PrayerTimesRepository;
  private usersRepository: UsersRepository;
  private readonly ALADHAN_BASE_URL = 'https://api.aladhan.com/v1/timings';
  private readonly CACHE_VALIDITY_HOURS = 24;

  constructor() {
    this.repository = new PrayerTimesRepository();
    this.usersRepository = new UsersRepository();
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  /**
   * Get user's prayer time configuration
   */
  async getConfig(userId: string): Promise<PrayerTimesConfigData> {
    const config = await this.repository.findConfigByUserId(userId);

    if (!config) {
      throw new NotFoundError(
        'Prayer times not configured. Please enable prayer times with location access.'
      );
    }

    return config;
  }

  /**
   * Update user's prayer time configuration
   */
  async updateConfig(userId: string, data: UpdateConfigDto): Promise<PrayerTimesConfigData> {
    // Verify user has location set (required for automatic mode)
    if (data.calculationMode === CalculationMode.AUTOMATIC) {
      const user = await this.usersRepository.findById(userId);
      if (!user?.latitude || !user?.longitude) {
        throw new BadRequestError(
          'Location is required for automatic prayer times. Please enable location access.'
        );
      }
    }

    // Check if config exists
    const existingConfig = await this.repository.findConfigByUserId(userId);

    let updatedConfig: PrayerTimesConfigData;

    if (!existingConfig) {
      // Create new configuration
      updatedConfig = await this.repository.createConfig({
        userId,
        calculationMode: data.calculationMode,
        apiMethod: data.apiMethod || ApiCalculationMethod.MWL,
      });

      // Update manual times if provided
      if (data.calculationMode === CalculationMode.MANUAL && data.manualTimes) {
        updatedConfig = await this.repository.updateConfig(userId, {
          manualFajr: data.manualTimes.fajr,
          manualZuhr: data.manualTimes.zuhr,
          manualAsr: data.manualTimes.asr,
          manualMaghrib: data.manualTimes.maghrib,
          manualIsha: data.manualTimes.isha,
        });
      }
    } else {
      // Update existing configuration
      const updateData: Partial<PrayerTimesConfigData> = {
        calculationMode: data.calculationMode,
      };

      if (data.calculationMode === CalculationMode.AUTOMATIC) {
        updateData.apiMethod = data.apiMethod || ApiCalculationMethod.MWL;
        // Clear manual times when switching to automatic
        updateData.manualFajr = null;
        updateData.manualZuhr = null;
        updateData.manualAsr = null;
        updateData.manualMaghrib = null;
        updateData.manualIsha = null;
      } else if (data.calculationMode === CalculationMode.MANUAL && data.manualTimes) {
        updateData.manualFajr = data.manualTimes.fajr;
        updateData.manualZuhr = data.manualTimes.zuhr;
        updateData.manualAsr = data.manualTimes.asr;
        updateData.manualMaghrib = data.manualTimes.maghrib;
        updateData.manualIsha = data.manualTimes.isha;
        // Clear API method when switching to manual
        updateData.apiMethod = null;
      }

      updatedConfig = await this.repository.updateConfig(userId, updateData);
    }

    // Clear cached prayer times when config changes significantly
    if (
      !existingConfig ||
      existingConfig.calculationMode !== data.calculationMode ||
      (existingConfig.calculationMode === CalculationMode.AUTOMATIC &&
        existingConfig.apiMethod !== data.apiMethod)
    ) {
      await this.repository.deleteCachedPrayerTimes(userId);
    }

    return updatedConfig;
  }

  /**
   * Update prayer time adjustments (only for automatic mode)
   */
  async updateAdjustments(
    userId: string,
    adjustments: UpdateAdjustmentsDto
  ): Promise<PrayerTimesConfigData> {
    const config = await this.repository.findConfigByUserId(userId);

    if (!config) {
      throw new NotFoundError('Prayer times configuration not found. Please configure first.');
    }

    if (config.calculationMode !== CalculationMode.AUTOMATIC) {
      throw new BadRequestError('Adjustments can only be applied in automatic prayer time mode.');
    }

    const updatedConfig = await this.repository.updateAdjustments(userId, adjustments);

    // Clear cache when adjustments change
    await this.repository.deleteCachedPrayerTimes(userId);

    return updatedConfig;
  }

  // ============================================================================
  // PRAYER TIMES RETRIEVAL
  // ============================================================================

  /**
   * Get today's prayer times for a user
   */
  async getTodaysPrayerTimes(userId: string): Promise<DailyPrayerTimes> {
    // Get configuration
    const config = await this.repository.findConfigByUserId(userId);

    if (!config) {
      throw new NotFoundError(
        'Prayer times not configured. Please enable prayer times with location access.'
      );
    }

    // Get today's date (user's local date)
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    // Check if manual mode
    if (config.calculationMode === CalculationMode.MANUAL) {
      return this.getManualPrayerTimes(config, today);
    }

    // Automatic mode - check cache first
    const cachedTimes = await this.repository.findPrayerTimesByDate(userId, today);

    if (cachedTimes && this.isCacheValid(config.lastFetchedAt)) {
      return {
        date: this.formatDate(cachedTimes.date),
        fajr: cachedTimes.fajr,
        zuhr: cachedTimes.zuhr,
        asr: cachedTimes.asr,
        maghrib: cachedTimes.maghrib,
        isha: cachedTimes.isha,
        source: cachedTimes.source,
      };
    }

    // Fetch from API
    return this.fetchAndCachePrayerTimes(userId, user, config, today);
  }

  /**
   * Manually refresh prayer times (force API call)
   */
  async refreshPrayerTimes(userId: string): Promise<DailyPrayerTimes> {
    const config = await this.repository.findConfigByUserId(userId);

    if (!config) {
      throw new NotFoundError('Prayer times configuration not found.');
    }

    if (config.calculationMode === CalculationMode.MANUAL) {
      throw new BadRequestError('Manual prayer times cannot be refreshed from API.');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.fetchAndCachePrayerTimes(userId, user, config, today);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get manual prayer times
   */
  private getManualPrayerTimes(config: PrayerTimesConfigData, date: Date): DailyPrayerTimes {
    if (
      !config.manualFajr ||
      !config.manualZuhr ||
      !config.manualAsr ||
      !config.manualMaghrib ||
      !config.manualIsha
    ) {
      throw new BadRequestError(
        'Manual prayer times are incomplete. Please configure all 5 prayer times.'
      );
    }

    return {
      date: this.formatDate(date),
      fajr: config.manualFajr,
      zuhr: config.manualZuhr,
      asr: config.manualAsr,
      maghrib: config.manualMaghrib,
      isha: config.manualIsha,
      source: PrayerTimeSource.MANUAL,
    };
  }

  /**
   * Fetch prayer times from Aladhan API and cache them
   */
  private async fetchAndCachePrayerTimes(
    userId: string,
    user: { latitude: number | null; longitude: number | null; timezone: string | null },
    config: PrayerTimesConfigData,
    date: Date
  ): Promise<DailyPrayerTimes> {
    // Validate location
    if (!user.latitude || !user.longitude) {
      throw new BadRequestError('User location not set. Please enable location access.');
    }

    // Get timezone (use stored or derive from coordinates)
    // Note: Timezone is stored in user profile but not currently used for API calls
    // Aladhan API calculates times based on coordinates directly

    // Fetch from Aladhan API
    const prayerTimes = await this.fetchFromAladhan(
      user.latitude,
      user.longitude,
      config.apiMethod || ApiCalculationMethod.MWL,
      date
    );

    // Apply adjustments
    const adjustedTimes = this.applyAdjustments(prayerTimes, config);

    // Cache the result
    await this.repository.upsertPrayerTimes({
      userId,
      date,
      fajr: adjustedTimes.fajr,
      zuhr: adjustedTimes.zuhr,
      asr: adjustedTimes.asr,
      maghrib: adjustedTimes.maghrib,
      isha: adjustedTimes.isha,
      source: PrayerTimeSource.API,
    });

    // Update last fetched timestamp
    await this.repository.updateLastFetched(userId);

    return {
      date: this.formatDate(date),
      ...adjustedTimes,
      source: PrayerTimeSource.API,
    };
  }

  /**
   * Fetch prayer times from Aladhan API
   */
  private async fetchFromAladhan(
    latitude: number,
    longitude: number,
    method: ApiCalculationMethod,
    date: Date
  ): Promise<{
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  }> {
    const methodId = ALADHAN_METHOD_MAP[method];
    const timestamp = Math.floor(date.getTime() / 1000); // Unix timestamp

    const url = `${this.ALADHAN_BASE_URL}/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Aladhan API returned status ${response.status}`);
      }

      const data = (await response.json()) as AladhanTimingsResponse;

      if (data.code !== 200 || data.status !== 'OK') {
        throw new Error(`Aladhan API error: ${data.status}`);
      }

      // Extract and format times (remove timezone suffix if present)
      const timings = data.data.timings;

      return {
        fajr: this.extractTime(timings.Fajr),
        zuhr: this.extractTime(timings.Dhuhr),
        asr: this.extractTime(timings.Asr),
        maghrib: this.extractTime(timings.Maghrib),
        isha: this.extractTime(timings.Isha),
      };
    } catch (error) {
      console.error('Failed to fetch from Aladhan API:', {
        error: error instanceof Error ? error.message : error,
        latitude,
        longitude,
        method,
        date: this.formatDate(date),
      });

      throw new ServiceUnavailableError(
        'Unable to fetch prayer times from external service. Please try again later.'
      );
    }
  }

  /**
   * Extract time from Aladhan format (removes timezone suffix)
   */
  private extractTime(timeString: string): string {
    // Aladhan returns format like "05:30 (UTC)" or "05:30"
    return timeString.split(' ')[0];
  }

  /**
   * Apply user's adjustments to prayer times
   */
  private applyAdjustments(
    times: {
      fajr: string;
      zuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
    },
    config: PrayerTimesConfigData
  ): {
    fajr: string;
    zuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  } {
    return {
      fajr: this.adjustTime(times.fajr, config.fajrAdjustment),
      zuhr: this.adjustTime(times.zuhr, config.zuhrAdjustment),
      asr: this.adjustTime(times.asr, config.asrAdjustment),
      maghrib: this.adjustTime(times.maghrib, config.maghribAdjustment),
      isha: this.adjustTime(times.isha, config.ishaAdjustment),
    };
  }

  /**
   * Adjust a time by adding/subtracting minutes
   */
  private adjustTime(timeStr: string, adjustmentMins: number): string {
    if (adjustmentMins === 0) return timeStr;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + adjustmentMins);

    const adjustedHours = String(date.getHours()).padStart(2, '0');
    const adjustedMinutes = String(date.getMinutes()).padStart(2, '0');

    return `${adjustedHours}:${adjustedMinutes}`;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(lastFetchedAt: Date | null): boolean {
    if (!lastFetchedAt) return false;

    const now = new Date();
    const hoursSinceLastFetch = (now.getTime() - lastFetchedAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastFetch < this.CACHE_VALIDITY_HOURS;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
