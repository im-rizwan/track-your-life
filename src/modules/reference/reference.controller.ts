import { Request, Response, NextFunction } from 'express';
import { ReferenceService } from './reference.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess } from '../../core/utils/response';

export class ReferenceController {
  private service: ReferenceService;

  constructor() {
    this.service = new ReferenceService();
  }

  getPrayerStatuses = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getPrayerStatuses();
    sendSuccess(res, data, 'Prayer statuses retrieved successfully');
  });

  getQuranActivityTypes = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.getQuranActivityTypes();
      sendSuccess(res, data, 'Quran activity types retrieved successfully');
    }
  );

  getTaskPriorities = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getTaskPriorities();
    sendSuccess(res, data, 'Task priorities retrieved successfully');
  });

  getTaskStatuses = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getTaskStatuses();
    sendSuccess(res, data, 'Task statuses retrieved successfully');
  });

  getFitnessIntensities = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.getFitnessIntensities();
      sendSuccess(res, data, 'Fitness intensities retrieved successfully');
    }
  );

  getSurahs = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = this.service.getSurahs();
    sendSuccess(res, data, 'Surahs retrieved successfully');
  });

  getJuzz = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = this.service.getJuzz();
    sendSuccess(res, data, 'Juzz retrieved successfully');
  });

  getCountries = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = this.service.getCountries();
    sendSuccess(res, data, 'Countries retrieved successfully');
  });
}
