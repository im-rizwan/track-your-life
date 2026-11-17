import { prisma } from '../../core/database/prisma.client';
import { PaginationParams, PaginatedResult } from './types/tracking.types';

function buildDateWhere(startDate?: string, endDate?: string) {
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.gte = new Date(startDate + 'T00:00:00.000Z');
  if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59.999Z');
  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
}

async function paginate<T>(
  findMany: (skip: number, take: number) => Promise<T[]>,
  count: () => Promise<number>,
  page: number,
  limit: number
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([findMany(skip, limit), count()]);
  return { items, total, page, totalPages: Math.ceil(total / limit), limit };
}

export class TrackingRepository {
  // ─── Daily Prayer Logs ───────────────────────────────────────────────────────

  findDailyPrayerLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.dailyPrayerLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { prayerStatus: true, prayerLocation: true },
        }),
      () => prisma.dailyPrayerLog.count({ where }),
      page,
      limit
    );
  }

  findDailyPrayerLogById(id: string, userId: string) {
    return prisma.dailyPrayerLog.findFirst({
      where: { id, userId },
      include: { prayerStatus: true, prayerLocation: true },
    });
  }

  createDailyPrayerLog(
    userId: string,
    data: {
      prayerName: string;
      prayerStatusId: string;
      prayerLocationId?: string;
      khushuRating?: number;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.dailyPrayerLog.create({
      data: {
        userId,
        prayerName: data.prayerName as 'FAJR' | 'ZUHR' | 'ASR' | 'MAGHRIB' | 'ISHA' | 'JUMMAH',
        prayerStatusId: data.prayerStatusId,
        prayerLocationId: data.prayerLocationId,
        khushuRating: data.khushuRating,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { prayerStatus: true, prayerLocation: true },
    });
  }

  updateDailyPrayerLog(
    id: string,
    data: {
      prayerName?: string;
      prayerStatusId?: string;
      prayerLocationId?: string;
      khushuRating?: number;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.dailyPrayerLog.update({
      where: { id },
      data: {
        ...(data.prayerName && {
          prayerName: data.prayerName as 'FAJR' | 'ZUHR' | 'ASR' | 'MAGHRIB' | 'ISHA' | 'JUMMAH',
        }),
        ...(data.prayerStatusId && { prayerStatusId: data.prayerStatusId }),
        ...(data.prayerLocationId !== undefined && { prayerLocationId: data.prayerLocationId }),
        ...(data.khushuRating !== undefined && { khushuRating: data.khushuRating }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { prayerStatus: true, prayerLocation: true },
    });
  }

  deleteDailyPrayerLog(id: string) {
    return prisma.dailyPrayerLog.delete({ where: { id } });
  }

  // ─── Other Prayer Logs ───────────────────────────────────────────────────────

  findOtherPrayerLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.otherPrayerLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { otherPrayerType: true },
        }),
      () => prisma.otherPrayerLog.count({ where }),
      page,
      limit
    );
  }

  findOtherPrayerLogById(id: string, userId: string) {
    return prisma.otherPrayerLog.findFirst({
      where: { id, userId },
      include: { otherPrayerType: true },
    });
  }

  createOtherPrayerLog(
    userId: string,
    data: {
      otherPrayerTypeId: string;
      rakahs?: number;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.otherPrayerLog.create({
      data: {
        userId,
        otherPrayerTypeId: data.otherPrayerTypeId,
        rakahs: data.rakahs,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { otherPrayerType: true },
    });
  }

  updateOtherPrayerLog(
    id: string,
    data: {
      otherPrayerTypeId?: string;
      rakahs?: number;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.otherPrayerLog.update({
      where: { id },
      data: {
        ...(data.otherPrayerTypeId && { otherPrayerTypeId: data.otherPrayerTypeId }),
        ...(data.rakahs !== undefined && { rakahs: data.rakahs }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { otherPrayerType: true },
    });
  }

  deleteOtherPrayerLog(id: string) {
    return prisma.otherPrayerLog.delete({ where: { id } });
  }

  // ─── Quran Logs ──────────────────────────────────────────────────────────────

  findQuranLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.quranLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { quranActivityType: true },
        }),
      () => prisma.quranLog.count({ where }),
      page,
      limit
    );
  }

  findQuranLogById(id: string, userId: string) {
    return prisma.quranLog.findFirst({
      where: { id, userId },
      include: { quranActivityType: true },
    });
  }

  createQuranLog(
    userId: string,
    data: {
      surahName: string;
      surahNumber: number;
      quranActivityTypeId: string;
      versesCount: number;
      juzzNumber?: number;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.quranLog.create({
      data: {
        userId,
        surahName: data.surahName,
        surahNumber: data.surahNumber,
        quranActivityTypeId: data.quranActivityTypeId,
        versesCount: data.versesCount,
        juzzNumber: data.juzzNumber,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { quranActivityType: true },
    });
  }

  updateQuranLog(
    id: string,
    data: {
      surahName?: string;
      surahNumber?: number;
      quranActivityTypeId?: string;
      versesCount?: number;
      juzzNumber?: number;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.quranLog.update({
      where: { id },
      data: {
        ...(data.surahName && { surahName: data.surahName }),
        ...(data.surahNumber !== undefined && { surahNumber: data.surahNumber }),
        ...(data.quranActivityTypeId && { quranActivityTypeId: data.quranActivityTypeId }),
        ...(data.versesCount !== undefined && { versesCount: data.versesCount }),
        ...(data.juzzNumber !== undefined && { juzzNumber: data.juzzNumber }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { quranActivityType: true },
    });
  }

  deleteQuranLog(id: string) {
    return prisma.quranLog.delete({ where: { id } });
  }

  // ─── Dhikr Logs ──────────────────────────────────────────────────────────────

  findDhikrLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.dhikrLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { dhikrType: true },
        }),
      () => prisma.dhikrLog.count({ where }),
      page,
      limit
    );
  }

  findDhikrLogById(id: string, userId: string) {
    return prisma.dhikrLog.findFirst({ where: { id, userId }, include: { dhikrType: true } });
  }

  createDhikrLog(
    userId: string,
    data: {
      dhikrTypeId: string;
      count: number;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.dhikrLog.create({
      data: {
        userId,
        dhikrTypeId: data.dhikrTypeId,
        count: data.count,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { dhikrType: true },
    });
  }

  updateDhikrLog(
    id: string,
    data: {
      dhikrTypeId?: string;
      count?: number;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.dhikrLog.update({
      where: { id },
      data: {
        ...(data.dhikrTypeId && { dhikrTypeId: data.dhikrTypeId }),
        ...(data.count !== undefined && { count: data.count }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { dhikrType: true },
    });
  }

  deleteDhikrLog(id: string) {
    return prisma.dhikrLog.delete({ where: { id } });
  }

  // ─── Fasting Logs ────────────────────────────────────────────────────────────

  findFastingLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.fastingLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { fastingType: true },
        }),
      () => prisma.fastingLog.count({ where }),
      page,
      limit
    );
  }

  findFastingLogById(id: string, userId: string) {
    return prisma.fastingLog.findFirst({ where: { id, userId }, include: { fastingType: true } });
  }

  createFastingLog(userId: string, data: { fastingTypeId: string; date: string; notes?: string }) {
    return prisma.fastingLog.create({
      data: {
        userId,
        fastingTypeId: data.fastingTypeId,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { fastingType: true },
    });
  }

  updateFastingLog(id: string, data: { fastingTypeId?: string; date?: string; notes?: string }) {
    return prisma.fastingLog.update({
      where: { id },
      data: {
        ...(data.fastingTypeId && { fastingTypeId: data.fastingTypeId }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { fastingType: true },
    });
  }

  deleteFastingLog(id: string) {
    return prisma.fastingLog.delete({ where: { id } });
  }

  // ─── Charity Logs ────────────────────────────────────────────────────────────

  findCharityLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.charityLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { charityType: true },
        }),
      () => prisma.charityLog.count({ where }),
      page,
      limit
    );
  }

  findCharityLogById(id: string, userId: string) {
    return prisma.charityLog.findFirst({ where: { id, userId }, include: { charityType: true } });
  }

  createCharityLog(userId: string, data: { charityTypeId: string; date: string; notes?: string }) {
    return prisma.charityLog.create({
      data: {
        userId,
        charityTypeId: data.charityTypeId,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { charityType: true },
    });
  }

  updateCharityLog(id: string, data: { charityTypeId?: string; date?: string; notes?: string }) {
    return prisma.charityLog.update({
      where: { id },
      data: {
        ...(data.charityTypeId && { charityTypeId: data.charityTypeId }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { charityType: true },
    });
  }

  deleteCharityLog(id: string) {
    return prisma.charityLog.delete({ where: { id } });
  }

  // ─── Islamic Study Logs ──────────────────────────────────────────────────────

  findIslamicStudyLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.islamicStudyLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { subject: true, studyMode: true },
        }),
      () => prisma.islamicStudyLog.count({ where }),
      page,
      limit
    );
  }

  findIslamicStudyLogById(id: string, userId: string) {
    return prisma.islamicStudyLog.findFirst({
      where: { id, userId },
      include: { subject: true, studyMode: true },
    });
  }

  createIslamicStudyLog(
    userId: string,
    data: {
      subjectId: string;
      studyModeId: string;
      durationMins: number;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.islamicStudyLog.create({
      data: {
        userId,
        subjectId: data.subjectId,
        studyModeId: data.studyModeId,
        durationMins: data.durationMins,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { subject: true, studyMode: true },
    });
  }

  updateIslamicStudyLog(
    id: string,
    data: {
      subjectId?: string;
      studyModeId?: string;
      durationMins?: number;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.islamicStudyLog.update({
      where: { id },
      data: {
        ...(data.subjectId && { subjectId: data.subjectId }),
        ...(data.studyModeId && { studyModeId: data.studyModeId }),
        ...(data.durationMins !== undefined && { durationMins: data.durationMins }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { subject: true, studyMode: true },
    });
  }

  deleteIslamicStudyLog(id: string) {
    return prisma.islamicStudyLog.delete({ where: { id } });
  }

  // ─── Skill Progress Logs ─────────────────────────────────────────────────────

  findSkillProgressLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.skillProgressLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { skill: true, skillTopic: true },
        }),
      () => prisma.skillProgressLog.count({ where }),
      page,
      limit
    );
  }

  findSkillProgressLogById(id: string, userId: string) {
    return prisma.skillProgressLog.findFirst({
      where: { id, userId },
      include: { skill: true, skillTopic: true },
    });
  }

  createSkillProgressLog(
    userId: string,
    data: {
      skillId: string;
      skillTopicId?: string;
      progress: number;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.skillProgressLog.create({
      data: {
        userId,
        skillId: data.skillId,
        skillTopicId: data.skillTopicId,
        progress: data.progress,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { skill: true, skillTopic: true },
    });
  }

  updateSkillProgressLog(
    id: string,
    data: {
      skillId?: string;
      skillTopicId?: string;
      progress?: number;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.skillProgressLog.update({
      where: { id },
      data: {
        ...(data.skillId && { skillId: data.skillId }),
        ...(data.skillTopicId !== undefined && { skillTopicId: data.skillTopicId }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { skill: true, skillTopic: true },
    });
  }

  deleteSkillProgressLog(id: string) {
    return prisma.skillProgressLog.delete({ where: { id } });
  }

  // ─── Fitness Logs ────────────────────────────────────────────────────────────

  findFitnessLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.fitnessLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { fitnessActivity: true, fitnessIntensity: true },
        }),
      () => prisma.fitnessLog.count({ where }),
      page,
      limit
    );
  }

  findFitnessLogById(id: string, userId: string) {
    return prisma.fitnessLog.findFirst({
      where: { id, userId },
      include: { fitnessActivity: true, fitnessIntensity: true },
    });
  }

  createFitnessLog(
    userId: string,
    data: {
      fitnessActivityId: string;
      fitnessIntensityId?: string;
      quantity: number;
      quantityUnit?: string;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.fitnessLog.create({
      data: {
        userId,
        fitnessActivityId: data.fitnessActivityId,
        fitnessIntensityId: data.fitnessIntensityId,
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { fitnessActivity: true, fitnessIntensity: true },
    });
  }

  updateFitnessLog(
    id: string,
    data: {
      fitnessActivityId?: string;
      fitnessIntensityId?: string;
      quantity?: number;
      quantityUnit?: string;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.fitnessLog.update({
      where: { id },
      data: {
        ...(data.fitnessActivityId && { fitnessActivityId: data.fitnessActivityId }),
        ...(data.fitnessIntensityId !== undefined && {
          fitnessIntensityId: data.fitnessIntensityId,
        }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.quantityUnit !== undefined && { quantityUnit: data.quantityUnit }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { fitnessActivity: true, fitnessIntensity: true },
    });
  }

  deleteFitnessLog(id: string) {
    return prisma.fitnessLog.delete({ where: { id } });
  }

  // ─── Nutrition Logs ──────────────────────────────────────────────────────────

  findNutritionLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.nutritionLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { nutritionFood: true },
        }),
      () => prisma.nutritionLog.count({ where }),
      page,
      limit
    );
  }

  findNutritionLogById(id: string, userId: string) {
    return prisma.nutritionLog.findFirst({
      where: { id, userId },
      include: { nutritionFood: true },
    });
  }

  createNutritionLog(
    userId: string,
    data: {
      nutritionFoodId: string;
      quantity?: string;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.nutritionLog.create({
      data: {
        userId,
        nutritionFoodId: data.nutritionFoodId,
        quantity: data.quantity,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { nutritionFood: true },
    });
  }

  updateNutritionLog(
    id: string,
    data: {
      nutritionFoodId?: string;
      quantity?: string;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.nutritionLog.update({
      where: { id },
      data: {
        ...(data.nutritionFoodId && { nutritionFoodId: data.nutritionFoodId }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { nutritionFood: true },
    });
  }

  deleteNutritionLog(id: string) {
    return prisma.nutritionLog.delete({ where: { id } });
  }

  // ─── Sleep Logs ──────────────────────────────────────────────────────────────

  findSleepLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) => prisma.sleepLog.findMany({ where, skip, take, orderBy: { date: 'desc' } }),
      () => prisma.sleepLog.count({ where }),
      page,
      limit
    );
  }

  findSleepLogById(id: string, userId: string) {
    return prisma.sleepLog.findFirst({ where: { id, userId } });
  }

  createSleepLog(
    userId: string,
    data: {
      bedtime: string;
      wakeupTime: string;
      sleepQuality?: number;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.sleepLog.create({
      data: {
        userId,
        bedtime: new Date(data.bedtime),
        wakeupTime: new Date(data.wakeupTime),
        sleepQuality: data.sleepQuality,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
    });
  }

  updateSleepLog(
    id: string,
    data: {
      bedtime?: string;
      wakeupTime?: string;
      sleepQuality?: number;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.sleepLog.update({
      where: { id },
      data: {
        ...(data.bedtime && { bedtime: new Date(data.bedtime) }),
        ...(data.wakeupTime && { wakeupTime: new Date(data.wakeupTime) }),
        ...(data.sleepQuality !== undefined && { sleepQuality: data.sleepQuality }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  deleteSleepLog(id: string) {
    return prisma.sleepLog.delete({ where: { id } });
  }

  // ─── Fitrah Practice Logs ────────────────────────────────────────────────────

  findFitrahPracticeLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.fitrahPracticeLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { practices: { include: { practice: true } } },
        }),
      () => prisma.fitrahPracticeLog.count({ where }),
      page,
      limit
    );
  }

  findFitrahPracticeLogById(id: string, userId: string) {
    return prisma.fitrahPracticeLog.findFirst({
      where: { id, userId },
      include: { practices: { include: { practice: true } } },
    });
  }

  async createFitrahPracticeLog(
    userId: string,
    data: {
      practices: string[];
      date: string;
      notes?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const log = await tx.fitrahPracticeLog.create({
        data: {
          userId,
          date: new Date(data.date + 'T00:00:00.000Z'),
          notes: data.notes,
        },
      });
      await tx.fitrahPracticeOnLog.createMany({
        data: data.practices.map((practiceId) => ({ logId: log.id, practiceId })),
      });
      return tx.fitrahPracticeLog.findUnique({
        where: { id: log.id },
        include: { practices: { include: { practice: true } } },
      });
    });
  }

  async updateFitrahPracticeLog(
    id: string,
    data: {
      practices?: string[];
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.fitrahPracticeLog.update({
        where: { id },
        data: {
          ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });
      if (data.practices) {
        await tx.fitrahPracticeOnLog.deleteMany({ where: { logId: id } });
        await tx.fitrahPracticeOnLog.createMany({
          data: data.practices.map((practiceId) => ({ logId: id, practiceId })),
        });
      }
      return tx.fitrahPracticeLog.findUnique({
        where: { id },
        include: { practices: { include: { practice: true } } },
      });
    });
  }

  deleteFitrahPracticeLog(id: string) {
    return prisma.fitrahPracticeLog.delete({ where: { id } });
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  findTasks(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.task.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { intention: true, taskPriority: true, taskStatus: true },
        }),
      () => prisma.task.count({ where }),
      page,
      limit
    );
  }

  findTaskById(id: string, userId: string) {
    return prisma.task.findFirst({
      where: { id, userId },
      include: { intention: true, taskPriority: true, taskStatus: true },
    });
  }

  createTask(
    userId: string,
    data: {
      title: string;
      intentionId?: string;
      taskPriorityId?: string;
      taskStatusId?: string;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.task.create({
      data: {
        userId,
        title: data.title,
        intentionId: data.intentionId,
        taskPriorityId: data.taskPriorityId,
        taskStatusId: data.taskStatusId,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { intention: true, taskPriority: true, taskStatus: true },
    });
  }

  updateTask(
    id: string,
    data: {
      title?: string;
      intentionId?: string;
      taskPriorityId?: string;
      taskStatusId?: string;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.task.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.intentionId !== undefined && { intentionId: data.intentionId }),
        ...(data.taskPriorityId !== undefined && { taskPriorityId: data.taskPriorityId }),
        ...(data.taskStatusId !== undefined && { taskStatusId: data.taskStatusId }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { intention: true, taskPriority: true, taskStatus: true },
    });
  }

  deleteTask(id: string) {
    return prisma.task.delete({ where: { id } });
  }

  // ─── Intention Logs ──────────────────────────────────────────────────────────

  findIntentionLogs(userId: string, params: PaginationParams) {
    const { page, limit, startDate, endDate } = params;
    const dateWhere = buildDateWhere(startDate, endDate);
    const where = { userId, ...(dateWhere && { date: dateWhere }) };
    return paginate(
      (skip, take) =>
        prisma.intentionLog.findMany({
          where,
          skip,
          take,
          orderBy: { date: 'desc' },
          include: { intention: true },
        }),
      () => prisma.intentionLog.count({ where }),
      page,
      limit
    );
  }

  findIntentionLogById(id: string, userId: string) {
    return prisma.intentionLog.findFirst({
      where: { id, userId },
      include: { intention: true },
    });
  }

  createIntentionLog(
    userId: string,
    data: {
      intentionId: string;
      startDate?: string;
      endDate?: string;
      date: string;
      notes?: string;
    }
  ) {
    return prisma.intentionLog.create({
      data: {
        userId,
        intentionId: data.intentionId,
        startDate: data.startDate ? new Date(data.startDate + 'T00:00:00.000Z') : undefined,
        endDate: data.endDate ? new Date(data.endDate + 'T00:00:00.000Z') : undefined,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
      include: { intention: true },
    });
  }

  updateIntentionLog(
    id: string,
    data: {
      intentionId?: string;
      startDate?: string;
      endDate?: string;
      date?: string;
      notes?: string;
    }
  ) {
    return prisma.intentionLog.update({
      where: { id },
      data: {
        ...(data.intentionId && { intentionId: data.intentionId }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate + 'T00:00:00.000Z') : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate + 'T00:00:00.000Z') : null,
        }),
        ...(data.date && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { intention: true },
    });
  }

  deleteIntentionLog(id: string) {
    return prisma.intentionLog.delete({ where: { id } });
  }

  // ─── FK Validation Helpers ───────────────────────────────────────────────────

  findAccessiblePrayerStatus(id: string) {
    return prisma.prayerStatus.findFirst({ where: { id, isActive: true } });
  }

  findAccessiblePrayerLocation(id: string, userId: string) {
    return prisma.prayerLocation.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleOtherPrayerType(id: string, userId: string) {
    return prisma.otherPrayerType.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleQuranActivityType(id: string) {
    return prisma.quranActivityType.findFirst({ where: { id, isActive: true } });
  }

  findAccessibleDhikrType(id: string, userId: string) {
    return prisma.dhikrType.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleFastingType(id: string, userId: string) {
    return prisma.fastingType.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleCharityType(id: string, userId: string) {
    return prisma.charityType.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleIslamicStudySubject(id: string, userId: string) {
    return prisma.islamicStudySubject.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleStudyMode(id: string, userId: string) {
    return prisma.studyMode.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findUserSkill(skillId: string, userId: string) {
    return prisma.skill.findFirst({ where: { id: skillId, userId } });
  }

  findSkillTopic(topicId: string, skillId: string) {
    return prisma.skillTopic.findFirst({ where: { id: topicId, skillId } });
  }

  findAccessibleFitnessActivity(id: string, userId: string) {
    return prisma.fitnessActivity.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleFitnessIntensity(id: string) {
    return prisma.fitnessIntensity.findFirst({ where: { id, isActive: true } });
  }

  findAccessibleNutritionFood(id: string, userId: string) {
    return prisma.nutritionFood.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findAccessibleFitrahPractice(id: string, userId: string) {
    return prisma.fitrahPractice.findFirst({
      where: { id, isActive: true, OR: [{ userId: null }, { userId }] },
    });
  }

  findUserIntention(intentionId: string, userId: string) {
    return prisma.intention.findFirst({ where: { id: intentionId, userId } });
  }

  findUserTaskPriority(id: string) {
    return prisma.taskPriority.findFirst({ where: { id, isActive: true } });
  }

  findUserTaskStatus(id: string) {
    return prisma.taskStatus.findFirst({ where: { id, isActive: true } });
  }
}
