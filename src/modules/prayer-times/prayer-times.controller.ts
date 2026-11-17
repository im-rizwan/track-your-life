import { Request, Response, NextFunction } from 'express';
import { PrayerTimesService } from './prayer-times.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess } from '../../core/utils/response';
import { UpdateConfigDto } from './dto/update-config.dto';
import { UpdateAdjustmentsDto } from './dto/update-adjustments.dto';

export class PrayerTimesController {
  private service: PrayerTimesService;

  constructor() {
    this.service = new PrayerTimesService();
  }

  /**
   * GET /api/v1/prayer-times/config
   * Get user's prayer time configuration
   */
  getConfig = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const config = await this.service.getConfig(userId);
    sendSuccess(res, config, 'Prayer time configuration retrieved successfully');
  });

  /**
   * PUT /api/v1/prayer-times/config
   * Update prayer time configuration
   */
  updateConfig = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const data = req.body as UpdateConfigDto;
    const config = await this.service.updateConfig(userId, data);
    sendSuccess(res, config, 'Prayer time configuration updated successfully');
  });

  /**
   * PATCH /api/v1/prayer-times/adjustments
   * Update prayer time adjustments
   */
  updateAdjustments = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const adjustments = req.body as UpdateAdjustmentsDto;
    const config = await this.service.updateAdjustments(userId, adjustments);
    sendSuccess(res, config, 'Prayer time adjustments updated successfully');
  });

  /**
   * GET /api/v1/prayer-times/today
   * Get today's prayer times
   */
  getTodaysPrayerTimes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const prayerTimes = await this.service.getTodaysPrayerTimes(userId);
    sendSuccess(res, prayerTimes, "Today's prayer times retrieved successfully");
  });

  /**
   * POST /api/v1/prayer-times/refresh
   * Manually refresh prayer times from API
   */
  refreshPrayerTimes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const prayerTimes = await this.service.refreshPrayerTimes(userId);
    sendSuccess(res, prayerTimes, 'Prayer times refreshed successfully');
  });
}
