import { TrackingRepository } from './tracking.repository';
import { NotFoundError, BadRequestError } from '../../core/errors/app-error';
import { PaginationParams } from './types/tracking.types';
import { CreateDailyPrayerDto, UpdateDailyPrayerDto } from './dto/daily-prayer.dto';
import { CreateOtherPrayerDto, UpdateOtherPrayerDto } from './dto/other-prayer.dto';
import { CreateQuranLogDto, UpdateQuranLogDto } from './dto/quran-log.dto';
import { CreateDhikrLogDto, UpdateDhikrLogDto } from './dto/dhikr-log.dto';
import { CreateFastingLogDto, UpdateFastingLogDto } from './dto/fasting-log.dto';
import { CreateCharityLogDto, UpdateCharityLogDto } from './dto/charity-log.dto';
import { CreateIslamicStudyLogDto, UpdateIslamicStudyLogDto } from './dto/islamic-study-log.dto';
import { CreateSkillProgressLogDto, UpdateSkillProgressLogDto } from './dto/skill-progress-log.dto';
import { CreateFitnessLogDto, UpdateFitnessLogDto } from './dto/fitness-log.dto';
import { CreateNutritionLogDto, UpdateNutritionLogDto } from './dto/nutrition-log.dto';
import { CreateSleepLogDto, UpdateSleepLogDto } from './dto/sleep-log.dto';
import {
  CreateFitrahPracticeLogDto,
  UpdateFitrahPracticeLogDto,
} from './dto/fitrah-practice-log.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { CreateIntentionLogDto, UpdateIntentionLogDto } from './dto/intention-log.dto';

export class TrackingService {
  private repo: TrackingRepository;

  constructor() {
    this.repo = new TrackingRepository();
  }

  // ─── Daily Prayers ───────────────────────────────────────────────────────────

  listDailyPrayers(userId: string, params: PaginationParams) {
    return this.repo.findDailyPrayerLogs(userId, params);
  }

  async getDailyPrayer(id: string, userId: string) {
    const log = await this.repo.findDailyPrayerLogById(id, userId);
    if (!log) throw new NotFoundError('Daily prayer log not found');
    return log;
  }

  async createDailyPrayer(userId: string, data: CreateDailyPrayerDto) {
    const status = await this.repo.findAccessiblePrayerStatus(data.prayerStatusId);
    if (!status) throw new BadRequestError('Invalid prayer status ID');
    if (data.prayerLocationId) {
      const loc = await this.repo.findAccessiblePrayerLocation(data.prayerLocationId, userId);
      if (!loc) throw new BadRequestError('Invalid prayer location ID');
    }
    return this.repo.createDailyPrayerLog(userId, data);
  }

  async updateDailyPrayer(id: string, userId: string, data: UpdateDailyPrayerDto) {
    const log = await this.repo.findDailyPrayerLogById(id, userId);
    if (!log) throw new NotFoundError('Daily prayer log not found');
    if (data.prayerStatusId) {
      const status = await this.repo.findAccessiblePrayerStatus(data.prayerStatusId);
      if (!status) throw new BadRequestError('Invalid prayer status ID');
    }
    if (data.prayerLocationId) {
      const loc = await this.repo.findAccessiblePrayerLocation(data.prayerLocationId, userId);
      if (!loc) throw new BadRequestError('Invalid prayer location ID');
    }
    return this.repo.updateDailyPrayerLog(id, data);
  }

  async deleteDailyPrayer(id: string, userId: string) {
    const log = await this.repo.findDailyPrayerLogById(id, userId);
    if (!log) throw new NotFoundError('Daily prayer log not found');
    await this.repo.deleteDailyPrayerLog(id);
  }

  // ─── Other Prayers ───────────────────────────────────────────────────────────

  listOtherPrayers(userId: string, params: PaginationParams) {
    return this.repo.findOtherPrayerLogs(userId, params);
  }

  async getOtherPrayer(id: string, userId: string) {
    const log = await this.repo.findOtherPrayerLogById(id, userId);
    if (!log) throw new NotFoundError('Other prayer log not found');
    return log;
  }

  async createOtherPrayer(userId: string, data: CreateOtherPrayerDto) {
    const type = await this.repo.findAccessibleOtherPrayerType(data.otherPrayerTypeId, userId);
    if (!type) throw new BadRequestError('Invalid other prayer type ID');
    return this.repo.createOtherPrayerLog(userId, data);
  }

  async updateOtherPrayer(id: string, userId: string, data: UpdateOtherPrayerDto) {
    const log = await this.repo.findOtherPrayerLogById(id, userId);
    if (!log) throw new NotFoundError('Other prayer log not found');
    if (data.otherPrayerTypeId) {
      const type = await this.repo.findAccessibleOtherPrayerType(data.otherPrayerTypeId, userId);
      if (!type) throw new BadRequestError('Invalid other prayer type ID');
    }
    return this.repo.updateOtherPrayerLog(id, data);
  }

  async deleteOtherPrayer(id: string, userId: string) {
    const log = await this.repo.findOtherPrayerLogById(id, userId);
    if (!log) throw new NotFoundError('Other prayer log not found');
    await this.repo.deleteOtherPrayerLog(id);
  }

  // ─── Quran Logs ──────────────────────────────────────────────────────────────

  listQuranLogs(userId: string, params: PaginationParams) {
    return this.repo.findQuranLogs(userId, params);
  }

  async getQuranLog(id: string, userId: string) {
    const log = await this.repo.findQuranLogById(id, userId);
    if (!log) throw new NotFoundError('Quran log not found');
    return log;
  }

  async createQuranLog(userId: string, data: CreateQuranLogDto) {
    const type = await this.repo.findAccessibleQuranActivityType(data.quranActivityTypeId);
    if (!type) throw new BadRequestError('Invalid Quran activity type ID');
    return this.repo.createQuranLog(userId, data);
  }

  async updateQuranLog(id: string, userId: string, data: UpdateQuranLogDto) {
    const log = await this.repo.findQuranLogById(id, userId);
    if (!log) throw new NotFoundError('Quran log not found');
    if (data.quranActivityTypeId) {
      const type = await this.repo.findAccessibleQuranActivityType(data.quranActivityTypeId);
      if (!type) throw new BadRequestError('Invalid Quran activity type ID');
    }
    return this.repo.updateQuranLog(id, data);
  }

  async deleteQuranLog(id: string, userId: string) {
    const log = await this.repo.findQuranLogById(id, userId);
    if (!log) throw new NotFoundError('Quran log not found');
    await this.repo.deleteQuranLog(id);
  }

  // ─── Dhikr Logs ──────────────────────────────────────────────────────────────

  listDhikrLogs(userId: string, params: PaginationParams) {
    return this.repo.findDhikrLogs(userId, params);
  }

  async getDhikrLog(id: string, userId: string) {
    const log = await this.repo.findDhikrLogById(id, userId);
    if (!log) throw new NotFoundError('Dhikr log not found');
    return log;
  }

  async createDhikrLog(userId: string, data: CreateDhikrLogDto) {
    const type = await this.repo.findAccessibleDhikrType(data.dhikrTypeId, userId);
    if (!type) throw new BadRequestError('Invalid dhikr type ID');
    return this.repo.createDhikrLog(userId, data);
  }

  async updateDhikrLog(id: string, userId: string, data: UpdateDhikrLogDto) {
    const log = await this.repo.findDhikrLogById(id, userId);
    if (!log) throw new NotFoundError('Dhikr log not found');
    if (data.dhikrTypeId) {
      const type = await this.repo.findAccessibleDhikrType(data.dhikrTypeId, userId);
      if (!type) throw new BadRequestError('Invalid dhikr type ID');
    }
    return this.repo.updateDhikrLog(id, data);
  }

  async deleteDhikrLog(id: string, userId: string) {
    const log = await this.repo.findDhikrLogById(id, userId);
    if (!log) throw new NotFoundError('Dhikr log not found');
    await this.repo.deleteDhikrLog(id);
  }

  // ─── Fasting Logs ────────────────────────────────────────────────────────────

  listFastingLogs(userId: string, params: PaginationParams) {
    return this.repo.findFastingLogs(userId, params);
  }

  async getFastingLog(id: string, userId: string) {
    const log = await this.repo.findFastingLogById(id, userId);
    if (!log) throw new NotFoundError('Fasting log not found');
    return log;
  }

  async createFastingLog(userId: string, data: CreateFastingLogDto) {
    const type = await this.repo.findAccessibleFastingType(data.fastingTypeId, userId);
    if (!type) throw new BadRequestError('Invalid fasting type ID');
    return this.repo.createFastingLog(userId, data);
  }

  async updateFastingLog(id: string, userId: string, data: UpdateFastingLogDto) {
    const log = await this.repo.findFastingLogById(id, userId);
    if (!log) throw new NotFoundError('Fasting log not found');
    if (data.fastingTypeId) {
      const type = await this.repo.findAccessibleFastingType(data.fastingTypeId, userId);
      if (!type) throw new BadRequestError('Invalid fasting type ID');
    }
    return this.repo.updateFastingLog(id, data);
  }

  async deleteFastingLog(id: string, userId: string) {
    const log = await this.repo.findFastingLogById(id, userId);
    if (!log) throw new NotFoundError('Fasting log not found');
    await this.repo.deleteFastingLog(id);
  }

  // ─── Charity Logs ────────────────────────────────────────────────────────────

  listCharityLogs(userId: string, params: PaginationParams) {
    return this.repo.findCharityLogs(userId, params);
  }

  async getCharityLog(id: string, userId: string) {
    const log = await this.repo.findCharityLogById(id, userId);
    if (!log) throw new NotFoundError('Charity log not found');
    return log;
  }

  async createCharityLog(userId: string, data: CreateCharityLogDto) {
    const type = await this.repo.findAccessibleCharityType(data.charityTypeId, userId);
    if (!type) throw new BadRequestError('Invalid charity type ID');
    return this.repo.createCharityLog(userId, data);
  }

  async updateCharityLog(id: string, userId: string, data: UpdateCharityLogDto) {
    const log = await this.repo.findCharityLogById(id, userId);
    if (!log) throw new NotFoundError('Charity log not found');
    if (data.charityTypeId) {
      const type = await this.repo.findAccessibleCharityType(data.charityTypeId, userId);
      if (!type) throw new BadRequestError('Invalid charity type ID');
    }
    return this.repo.updateCharityLog(id, data);
  }

  async deleteCharityLog(id: string, userId: string) {
    const log = await this.repo.findCharityLogById(id, userId);
    if (!log) throw new NotFoundError('Charity log not found');
    await this.repo.deleteCharityLog(id);
  }

  // ─── Islamic Study Logs ──────────────────────────────────────────────────────

  listIslamicStudyLogs(userId: string, params: PaginationParams) {
    return this.repo.findIslamicStudyLogs(userId, params);
  }

  async getIslamicStudyLog(id: string, userId: string) {
    const log = await this.repo.findIslamicStudyLogById(id, userId);
    if (!log) throw new NotFoundError('Islamic study log not found');
    return log;
  }

  async createIslamicStudyLog(userId: string, data: CreateIslamicStudyLogDto) {
    const subject = await this.repo.findAccessibleIslamicStudySubject(data.subjectId, userId);
    if (!subject) throw new BadRequestError('Invalid Islamic study subject ID');
    const mode = await this.repo.findAccessibleStudyMode(data.studyModeId, userId);
    if (!mode) throw new BadRequestError('Invalid study mode ID');
    return this.repo.createIslamicStudyLog(userId, data);
  }

  async updateIslamicStudyLog(id: string, userId: string, data: UpdateIslamicStudyLogDto) {
    const log = await this.repo.findIslamicStudyLogById(id, userId);
    if (!log) throw new NotFoundError('Islamic study log not found');
    if (data.subjectId) {
      const subject = await this.repo.findAccessibleIslamicStudySubject(data.subjectId, userId);
      if (!subject) throw new BadRequestError('Invalid Islamic study subject ID');
    }
    if (data.studyModeId) {
      const mode = await this.repo.findAccessibleStudyMode(data.studyModeId, userId);
      if (!mode) throw new BadRequestError('Invalid study mode ID');
    }
    return this.repo.updateIslamicStudyLog(id, data);
  }

  async deleteIslamicStudyLog(id: string, userId: string) {
    const log = await this.repo.findIslamicStudyLogById(id, userId);
    if (!log) throw new NotFoundError('Islamic study log not found');
    await this.repo.deleteIslamicStudyLog(id);
  }

  // ─── Skill Progress Logs ─────────────────────────────────────────────────────

  listSkillProgressLogs(userId: string, params: PaginationParams) {
    return this.repo.findSkillProgressLogs(userId, params);
  }

  async getSkillProgressLog(id: string, userId: string) {
    const log = await this.repo.findSkillProgressLogById(id, userId);
    if (!log) throw new NotFoundError('Skill progress log not found');
    return log;
  }

  async createSkillProgressLog(userId: string, data: CreateSkillProgressLogDto) {
    const skill = await this.repo.findUserSkill(data.skillId, userId);
    if (!skill) throw new BadRequestError('Skill not found or not owned by user');
    if (data.skillTopicId) {
      const topic = await this.repo.findSkillTopic(data.skillTopicId, data.skillId);
      if (!topic) throw new BadRequestError('Skill topic does not belong to the specified skill');
    }
    return this.repo.createSkillProgressLog(userId, data);
  }

  async updateSkillProgressLog(id: string, userId: string, data: UpdateSkillProgressLogDto) {
    const log = await this.repo.findSkillProgressLogById(id, userId);
    if (!log) throw new NotFoundError('Skill progress log not found');
    const skillId = data.skillId ?? log.skillId;
    if (data.skillId) {
      const skill = await this.repo.findUserSkill(data.skillId, userId);
      if (!skill) throw new BadRequestError('Skill not found or not owned by user');
    }
    if (data.skillTopicId) {
      const topic = await this.repo.findSkillTopic(data.skillTopicId, skillId);
      if (!topic) throw new BadRequestError('Skill topic does not belong to the specified skill');
    }
    return this.repo.updateSkillProgressLog(id, data);
  }

  async deleteSkillProgressLog(id: string, userId: string) {
    const log = await this.repo.findSkillProgressLogById(id, userId);
    if (!log) throw new NotFoundError('Skill progress log not found');
    await this.repo.deleteSkillProgressLog(id);
  }

  // ─── Fitness Logs ────────────────────────────────────────────────────────────

  listFitnessLogs(userId: string, params: PaginationParams) {
    return this.repo.findFitnessLogs(userId, params);
  }

  async getFitnessLog(id: string, userId: string) {
    const log = await this.repo.findFitnessLogById(id, userId);
    if (!log) throw new NotFoundError('Fitness log not found');
    return log;
  }

  async createFitnessLog(userId: string, data: CreateFitnessLogDto) {
    const activity = await this.repo.findAccessibleFitnessActivity(data.fitnessActivityId, userId);
    if (!activity) throw new BadRequestError('Invalid fitness activity ID');
    if (data.fitnessIntensityId) {
      const intensity = await this.repo.findAccessibleFitnessIntensity(data.fitnessIntensityId);
      if (!intensity) throw new BadRequestError('Invalid fitness intensity ID');
    }
    return this.repo.createFitnessLog(userId, data);
  }

  async updateFitnessLog(id: string, userId: string, data: UpdateFitnessLogDto) {
    const log = await this.repo.findFitnessLogById(id, userId);
    if (!log) throw new NotFoundError('Fitness log not found');
    if (data.fitnessActivityId) {
      const activity = await this.repo.findAccessibleFitnessActivity(
        data.fitnessActivityId,
        userId
      );
      if (!activity) throw new BadRequestError('Invalid fitness activity ID');
    }
    if (data.fitnessIntensityId) {
      const intensity = await this.repo.findAccessibleFitnessIntensity(data.fitnessIntensityId);
      if (!intensity) throw new BadRequestError('Invalid fitness intensity ID');
    }
    return this.repo.updateFitnessLog(id, data);
  }

  async deleteFitnessLog(id: string, userId: string) {
    const log = await this.repo.findFitnessLogById(id, userId);
    if (!log) throw new NotFoundError('Fitness log not found');
    await this.repo.deleteFitnessLog(id);
  }

  // ─── Nutrition Logs ──────────────────────────────────────────────────────────

  listNutritionLogs(userId: string, params: PaginationParams) {
    return this.repo.findNutritionLogs(userId, params);
  }

  async getNutritionLog(id: string, userId: string) {
    const log = await this.repo.findNutritionLogById(id, userId);
    if (!log) throw new NotFoundError('Nutrition log not found');
    return log;
  }

  async createNutritionLog(userId: string, data: CreateNutritionLogDto) {
    const food = await this.repo.findAccessibleNutritionFood(data.nutritionFoodId, userId);
    if (!food) throw new BadRequestError('Invalid nutrition food ID');
    return this.repo.createNutritionLog(userId, data);
  }

  async updateNutritionLog(id: string, userId: string, data: UpdateNutritionLogDto) {
    const log = await this.repo.findNutritionLogById(id, userId);
    if (!log) throw new NotFoundError('Nutrition log not found');
    if (data.nutritionFoodId) {
      const food = await this.repo.findAccessibleNutritionFood(data.nutritionFoodId, userId);
      if (!food) throw new BadRequestError('Invalid nutrition food ID');
    }
    return this.repo.updateNutritionLog(id, data);
  }

  async deleteNutritionLog(id: string, userId: string) {
    const log = await this.repo.findNutritionLogById(id, userId);
    if (!log) throw new NotFoundError('Nutrition log not found');
    await this.repo.deleteNutritionLog(id);
  }

  // ─── Sleep Logs ──────────────────────────────────────────────────────────────

  listSleepLogs(userId: string, params: PaginationParams) {
    return this.repo.findSleepLogs(userId, params);
  }

  async getSleepLog(id: string, userId: string) {
    const log = await this.repo.findSleepLogById(id, userId);
    if (!log) throw new NotFoundError('Sleep log not found');
    return log;
  }

  async createSleepLog(userId: string, data: CreateSleepLogDto) {
    if (new Date(data.wakeupTime) <= new Date(data.bedtime)) {
      throw new BadRequestError('Wake up time must be after bedtime');
    }
    return this.repo.createSleepLog(userId, data);
  }

  async updateSleepLog(id: string, userId: string, data: UpdateSleepLogDto) {
    const log = await this.repo.findSleepLogById(id, userId);
    if (!log) throw new NotFoundError('Sleep log not found');
    const bedtime = data.bedtime ?? log.bedtime.toISOString();
    const wakeupTime = data.wakeupTime ?? log.wakeupTime.toISOString();
    if (new Date(wakeupTime) <= new Date(bedtime)) {
      throw new BadRequestError('Wake up time must be after bedtime');
    }
    return this.repo.updateSleepLog(id, data);
  }

  async deleteSleepLog(id: string, userId: string) {
    const log = await this.repo.findSleepLogById(id, userId);
    if (!log) throw new NotFoundError('Sleep log not found');
    await this.repo.deleteSleepLog(id);
  }

  // ─── Fitrah Practice Logs ────────────────────────────────────────────────────

  listFitrahPracticeLogs(userId: string, params: PaginationParams) {
    return this.repo.findFitrahPracticeLogs(userId, params);
  }

  async getFitrahPracticeLog(id: string, userId: string) {
    const log = await this.repo.findFitrahPracticeLogById(id, userId);
    if (!log) throw new NotFoundError('Fitrah practice log not found');
    return log;
  }

  async createFitrahPracticeLog(userId: string, data: CreateFitrahPracticeLogDto) {
    for (const practiceId of data.practices) {
      const practice = await this.repo.findAccessibleFitrahPractice(practiceId, userId);
      if (!practice) throw new BadRequestError(`Invalid fitrah practice ID: ${practiceId}`);
    }
    return this.repo.createFitrahPracticeLog(userId, data);
  }

  async updateFitrahPracticeLog(id: string, userId: string, data: UpdateFitrahPracticeLogDto) {
    const log = await this.repo.findFitrahPracticeLogById(id, userId);
    if (!log) throw new NotFoundError('Fitrah practice log not found');
    if (data.practices) {
      for (const practiceId of data.practices) {
        const practice = await this.repo.findAccessibleFitrahPractice(practiceId, userId);
        if (!practice) throw new BadRequestError(`Invalid fitrah practice ID: ${practiceId}`);
      }
    }
    return this.repo.updateFitrahPracticeLog(id, data);
  }

  async deleteFitrahPracticeLog(id: string, userId: string) {
    const log = await this.repo.findFitrahPracticeLogById(id, userId);
    if (!log) throw new NotFoundError('Fitrah practice log not found');
    await this.repo.deleteFitrahPracticeLog(id);
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  listTasks(userId: string, params: PaginationParams) {
    return this.repo.findTasks(userId, params);
  }

  async getTask(id: string, userId: string) {
    const task = await this.repo.findTaskById(id, userId);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  async createTask(userId: string, data: CreateTaskDto) {
    if (data.intentionId) {
      const intention = await this.repo.findUserIntention(data.intentionId, userId);
      if (!intention) throw new BadRequestError('Intention not found or not owned by user');
    }
    if (data.taskPriorityId) {
      const priority = await this.repo.findUserTaskPriority(data.taskPriorityId);
      if (!priority) throw new BadRequestError('Invalid task priority ID');
    }
    if (data.taskStatusId) {
      const status = await this.repo.findUserTaskStatus(data.taskStatusId);
      if (!status) throw new BadRequestError('Invalid task status ID');
    }
    return this.repo.createTask(userId, data);
  }

  async updateTask(id: string, userId: string, data: UpdateTaskDto) {
    const task = await this.repo.findTaskById(id, userId);
    if (!task) throw new NotFoundError('Task not found');
    if (data.intentionId) {
      const intention = await this.repo.findUserIntention(data.intentionId, userId);
      if (!intention) throw new BadRequestError('Intention not found or not owned by user');
    }
    if (data.taskPriorityId) {
      const priority = await this.repo.findUserTaskPriority(data.taskPriorityId);
      if (!priority) throw new BadRequestError('Invalid task priority ID');
    }
    if (data.taskStatusId) {
      const status = await this.repo.findUserTaskStatus(data.taskStatusId);
      if (!status) throw new BadRequestError('Invalid task status ID');
    }
    return this.repo.updateTask(id, data);
  }

  async deleteTask(id: string, userId: string) {
    const task = await this.repo.findTaskById(id, userId);
    if (!task) throw new NotFoundError('Task not found');
    await this.repo.deleteTask(id);
  }

  // ─── Intention Logs ──────────────────────────────────────────────────────────

  listIntentionLogs(userId: string, params: PaginationParams) {
    return this.repo.findIntentionLogs(userId, params);
  }

  async getIntentionLog(id: string, userId: string) {
    const log = await this.repo.findIntentionLogById(id, userId);
    if (!log) throw new NotFoundError('Intention log not found');
    return log;
  }

  async createIntentionLog(userId: string, data: CreateIntentionLogDto) {
    const intention = await this.repo.findUserIntention(data.intentionId, userId);
    if (!intention) throw new BadRequestError('Intention not found or not owned by user');
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      throw new BadRequestError('endDate must be on or after startDate');
    }
    return this.repo.createIntentionLog(userId, data);
  }

  async updateIntentionLog(id: string, userId: string, data: UpdateIntentionLogDto) {
    const log = await this.repo.findIntentionLogById(id, userId);
    if (!log) throw new NotFoundError('Intention log not found');
    if (data.intentionId) {
      const intention = await this.repo.findUserIntention(data.intentionId, userId);
      if (!intention) throw new BadRequestError('Intention not found or not owned by user');
    }
    const startDate = data.startDate ?? log.startDate?.toISOString().split('T')[0];
    const endDate = data.endDate ?? log.endDate?.toISOString().split('T')[0];
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestError('endDate must be on or after startDate');
    }
    return this.repo.updateIntentionLog(id, data);
  }

  async deleteIntentionLog(id: string, userId: string) {
    const log = await this.repo.findIntentionLogById(id, userId);
    if (!log) throw new NotFoundError('Intention log not found');
    await this.repo.deleteIntentionLog(id);
  }
}
