import { Request, Response, NextFunction } from 'express';
import { TrackingService } from './tracking.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/utils/response';
import { PaginationParams } from './types/tracking.types';

function getPagination(query: Record<string, unknown>): PaginationParams {
  return {
    page: Number(query.page) || 1,
    limit: Math.min(Number(query.limit) || 20, 100),
    startDate: query.startDate as string | undefined,
    endDate: query.endDate as string | undefined,
  };
}

export class TrackingController {
  private service: TrackingService;

  constructor() {
    this.service = new TrackingService();
  }

  // ─── Daily Prayers ───────────────────────────────────────────────────────────

  listDailyPrayers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listDailyPrayers(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Daily prayer logs retrieved successfully');
  });

  getDailyPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getDailyPrayer(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Daily prayer log retrieved successfully');
  });

  createDailyPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createDailyPrayer(req.user!.id, req.body);
    sendCreated(res, data, 'Daily prayer log created successfully');
  });

  updateDailyPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateDailyPrayer(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Daily prayer log updated successfully');
  });

  deleteDailyPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteDailyPrayer(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Other Prayers ───────────────────────────────────────────────────────────

  listOtherPrayers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listOtherPrayers(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Other prayer logs retrieved successfully');
  });

  getOtherPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getOtherPrayer(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Other prayer log retrieved successfully');
  });

  createOtherPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createOtherPrayer(req.user!.id, req.body);
    sendCreated(res, data, 'Other prayer log created successfully');
  });

  updateOtherPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateOtherPrayer(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Other prayer log updated successfully');
  });

  deleteOtherPrayer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteOtherPrayer(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Quran Logs ──────────────────────────────────────────────────────────────

  listQuranLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listQuranLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Quran logs retrieved successfully');
  });

  getQuranLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getQuranLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Quran log retrieved successfully');
  });

  createQuranLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createQuranLog(req.user!.id, req.body);
    sendCreated(res, data, 'Quran log created successfully');
  });

  updateQuranLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateQuranLog(req.params.id as string, req.user!.id, req.body);
    sendSuccess(res, data, 'Quran log updated successfully');
  });

  deleteQuranLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteQuranLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Dhikr Logs ──────────────────────────────────────────────────────────────

  listDhikrLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listDhikrLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Dhikr logs retrieved successfully');
  });

  getDhikrLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getDhikrLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Dhikr log retrieved successfully');
  });

  createDhikrLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createDhikrLog(req.user!.id, req.body);
    sendCreated(res, data, 'Dhikr log created successfully');
  });

  updateDhikrLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateDhikrLog(req.params.id as string, req.user!.id, req.body);
    sendSuccess(res, data, 'Dhikr log updated successfully');
  });

  deleteDhikrLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteDhikrLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Fasting Logs ────────────────────────────────────────────────────────────

  listFastingLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listFastingLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Fasting logs retrieved successfully');
  });

  getFastingLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getFastingLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Fasting log retrieved successfully');
  });

  createFastingLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createFastingLog(req.user!.id, req.body);
    sendCreated(res, data, 'Fasting log created successfully');
  });

  updateFastingLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateFastingLog(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Fasting log updated successfully');
  });

  deleteFastingLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteFastingLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Charity Logs ────────────────────────────────────────────────────────────

  listCharityLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listCharityLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Charity logs retrieved successfully');
  });

  getCharityLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getCharityLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Charity log retrieved successfully');
  });

  createCharityLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createCharityLog(req.user!.id, req.body);
    sendCreated(res, data, 'Charity log created successfully');
  });

  updateCharityLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateCharityLog(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Charity log updated successfully');
  });

  deleteCharityLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteCharityLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Islamic Study Logs ──────────────────────────────────────────────────────

  listIslamicStudyLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listIslamicStudyLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Islamic study logs retrieved successfully');
  });

  getIslamicStudyLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getIslamicStudyLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Islamic study log retrieved successfully');
  });

  createIslamicStudyLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createIslamicStudyLog(req.user!.id, req.body);
    sendCreated(res, data, 'Islamic study log created successfully');
  });

  updateIslamicStudyLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateIslamicStudyLog(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Islamic study log updated successfully');
  });

  deleteIslamicStudyLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteIslamicStudyLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Skill Progress Logs ─────────────────────────────────────────────────────

  listSkillProgressLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listSkillProgressLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Skill progress logs retrieved successfully');
  });

  getSkillProgressLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getSkillProgressLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Skill progress log retrieved successfully');
  });

  createSkillProgressLog = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.createSkillProgressLog(req.user!.id, req.body);
      sendCreated(res, data, 'Skill progress log created successfully');
    }
  );

  updateSkillProgressLog = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.updateSkillProgressLog(
        req.params.id as string,
        req.user!.id,
        req.body
      );
      sendSuccess(res, data, 'Skill progress log updated successfully');
    }
  );

  deleteSkillProgressLog = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      await this.service.deleteSkillProgressLog(req.params.id as string, req.user!.id);
      sendNoContent(res);
    }
  );

  // ─── Fitness Logs ────────────────────────────────────────────────────────────

  listFitnessLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listFitnessLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Fitness logs retrieved successfully');
  });

  getFitnessLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getFitnessLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Fitness log retrieved successfully');
  });

  createFitnessLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createFitnessLog(req.user!.id, req.body);
    sendCreated(res, data, 'Fitness log created successfully');
  });

  updateFitnessLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateFitnessLog(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Fitness log updated successfully');
  });

  deleteFitnessLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteFitnessLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Nutrition Logs ──────────────────────────────────────────────────────────

  listNutritionLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listNutritionLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Nutrition logs retrieved successfully');
  });

  getNutritionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getNutritionLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Nutrition log retrieved successfully');
  });

  createNutritionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createNutritionLog(req.user!.id, req.body);
    sendCreated(res, data, 'Nutrition log created successfully');
  });

  updateNutritionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateNutritionLog(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Nutrition log updated successfully');
  });

  deleteNutritionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteNutritionLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Sleep Logs ──────────────────────────────────────────────────────────────

  listSleepLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listSleepLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Sleep logs retrieved successfully');
  });

  getSleepLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getSleepLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Sleep log retrieved successfully');
  });

  createSleepLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createSleepLog(req.user!.id, req.body);
    sendCreated(res, data, 'Sleep log created successfully');
  });

  updateSleepLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateSleepLog(req.params.id as string, req.user!.id, req.body);
    sendSuccess(res, data, 'Sleep log updated successfully');
  });

  deleteSleepLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteSleepLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Fitrah Practice Logs ────────────────────────────────────────────────────

  listFitrahPracticeLogs = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.listFitrahPracticeLogs(
        req.user!.id,
        getPagination(req.query)
      );
      sendSuccess(res, data, 'Fitrah practice logs retrieved successfully');
    }
  );

  getFitrahPracticeLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getFitrahPracticeLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Fitrah practice log retrieved successfully');
  });

  createFitrahPracticeLog = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.createFitrahPracticeLog(req.user!.id, req.body);
      sendCreated(res, data, 'Fitrah practice log created successfully');
    }
  );

  updateFitrahPracticeLog = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.updateFitrahPracticeLog(
        req.params.id as string,
        req.user!.id,
        req.body
      );
      sendSuccess(res, data, 'Fitrah practice log updated successfully');
    }
  );

  deleteFitrahPracticeLog = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      await this.service.deleteFitrahPracticeLog(req.params.id as string, req.user!.id);
      sendNoContent(res);
    }
  );

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  listTasks = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listTasks(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Tasks retrieved successfully');
  });

  getTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getTask(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Task retrieved successfully');
  });

  createTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createTask(req.user!.id, req.body);
    sendCreated(res, data, 'Task created successfully');
  });

  updateTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateTask(req.params.id as string, req.user!.id, req.body);
    sendSuccess(res, data, 'Task updated successfully');
  });

  deleteTask = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteTask(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Intention Logs ──────────────────────────────────────────────────────────

  listIntentionLogs = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listIntentionLogs(req.user!.id, getPagination(req.query));
    sendSuccess(res, data, 'Intention logs retrieved successfully');
  });

  getIntentionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.getIntentionLog(req.params.id as string, req.user!.id);
    sendSuccess(res, data, 'Intention log retrieved successfully');
  });

  createIntentionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createIntentionLog(req.user!.id, req.body);
    sendCreated(res, data, 'Intention log created successfully');
  });

  updateIntentionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateIntentionLog(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Intention log updated successfully');
  });

  deleteIntentionLog = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteIntentionLog(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });
}
