import { prisma } from '../../core/database/prisma.client';

// Helper: WHERE clause for user-accessible customization items (system defaults + user's own)
const accessibleWhere = (userId: string) => ({
  isActive: true,
  OR: [{ userId: null }, { userId }],
});

const accessibleOrderBy = [{ isDefault: 'desc' as const }, { name: 'asc' as const }];

export class CustomizationRepository {
  // ─── Prayer Locations ───────────────────────────────────────────────────────

  findAllPrayerLocations(userId: string) {
    return prisma.prayerLocation.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createPrayerLocation(userId: string, data: { name: string }) {
    return prisma.prayerLocation.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findPrayerLocationById(id: string, userId: string) {
    return prisma.prayerLocation.findFirst({ where: { id, userId } });
  }

  updatePrayerLocation(id: string, data: { name: string }) {
    return prisma.prayerLocation.update({ where: { id }, data: { name: data.name } });
  }

  deletePrayerLocation(id: string) {
    return prisma.prayerLocation.delete({ where: { id } });
  }

  // ─── Other Prayer Types ──────────────────────────────────────────────────────

  findAllOtherPrayerTypes(userId: string) {
    return prisma.otherPrayerType.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createOtherPrayerType(userId: string, data: { name: string; requiresRakahCount: boolean }) {
    return prisma.otherPrayerType.create({
      data: {
        userId,
        name: data.name,
        requiresRakahCount: data.requiresRakahCount,
        isDefault: false,
        isActive: true,
      },
    });
  }

  findOtherPrayerTypeById(id: string, userId: string) {
    return prisma.otherPrayerType.findFirst({ where: { id, userId } });
  }

  updateOtherPrayerType(id: string, data: { name?: string; requiresRakahCount?: boolean }) {
    return prisma.otherPrayerType.update({ where: { id }, data });
  }

  deleteOtherPrayerType(id: string) {
    return prisma.otherPrayerType.delete({ where: { id } });
  }

  // ─── Dhikr Types ────────────────────────────────────────────────────────────

  findAllDhikrTypes(userId: string) {
    return prisma.dhikrType.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createDhikrType(userId: string, data: { name: string }) {
    return prisma.dhikrType.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findDhikrTypeById(id: string, userId: string) {
    return prisma.dhikrType.findFirst({ where: { id, userId } });
  }

  updateDhikrType(id: string, data: { name: string }) {
    return prisma.dhikrType.update({ where: { id }, data: { name: data.name } });
  }

  deleteDhikrType(id: string) {
    return prisma.dhikrType.delete({ where: { id } });
  }

  // ─── Fasting Types ──────────────────────────────────────────────────────────

  findAllFastingTypes(userId: string) {
    return prisma.fastingType.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createFastingType(userId: string, data: { name: string }) {
    return prisma.fastingType.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findFastingTypeById(id: string, userId: string) {
    return prisma.fastingType.findFirst({ where: { id, userId } });
  }

  updateFastingType(id: string, data: { name: string }) {
    return prisma.fastingType.update({ where: { id }, data: { name: data.name } });
  }

  deleteFastingType(id: string) {
    return prisma.fastingType.delete({ where: { id } });
  }

  // ─── Charity Types ──────────────────────────────────────────────────────────

  findAllCharityTypes(userId: string) {
    return prisma.charityType.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createCharityType(userId: string, data: { name: string }) {
    return prisma.charityType.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findCharityTypeById(id: string, userId: string) {
    return prisma.charityType.findFirst({ where: { id, userId } });
  }

  updateCharityType(id: string, data: { name: string }) {
    return prisma.charityType.update({ where: { id }, data: { name: data.name } });
  }

  deleteCharityType(id: string) {
    return prisma.charityType.delete({ where: { id } });
  }

  // ─── Islamic Study Subjects ──────────────────────────────────────────────────

  findAllIslamicStudySubjects(userId: string) {
    return prisma.islamicStudySubject.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createIslamicStudySubject(userId: string, data: { name: string }) {
    return prisma.islamicStudySubject.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findIslamicStudySubjectById(id: string, userId: string) {
    return prisma.islamicStudySubject.findFirst({ where: { id, userId } });
  }

  updateIslamicStudySubject(id: string, data: { name: string }) {
    return prisma.islamicStudySubject.update({ where: { id }, data: { name: data.name } });
  }

  deleteIslamicStudySubject(id: string) {
    return prisma.islamicStudySubject.delete({ where: { id } });
  }

  // ─── Study Modes ─────────────────────────────────────────────────────────────

  findAllStudyModes(userId: string) {
    return prisma.studyMode.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createStudyMode(userId: string, data: { name: string }) {
    return prisma.studyMode.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findStudyModeById(id: string, userId: string) {
    return prisma.studyMode.findFirst({ where: { id, userId } });
  }

  updateStudyMode(id: string, data: { name: string }) {
    return prisma.studyMode.update({ where: { id }, data: { name: data.name } });
  }

  deleteStudyMode(id: string) {
    return prisma.studyMode.delete({ where: { id } });
  }

  // ─── Fitness Activities ──────────────────────────────────────────────────────

  findAllFitnessActivities(userId: string) {
    return prisma.fitnessActivity.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createFitnessActivity(userId: string, data: { name: string }) {
    return prisma.fitnessActivity.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findFitnessActivityById(id: string, userId: string) {
    return prisma.fitnessActivity.findFirst({ where: { id, userId } });
  }

  updateFitnessActivity(id: string, data: { name: string }) {
    return prisma.fitnessActivity.update({ where: { id }, data: { name: data.name } });
  }

  deleteFitnessActivity(id: string) {
    return prisma.fitnessActivity.delete({ where: { id } });
  }

  // ─── Nutrition Foods ─────────────────────────────────────────────────────────

  findAllNutritionFoods(userId: string) {
    return prisma.nutritionFood.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createNutritionFood(userId: string, data: { name: string }) {
    return prisma.nutritionFood.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findNutritionFoodById(id: string, userId: string) {
    return prisma.nutritionFood.findFirst({ where: { id, userId } });
  }

  updateNutritionFood(id: string, data: { name: string }) {
    return prisma.nutritionFood.update({ where: { id }, data: { name: data.name } });
  }

  deleteNutritionFood(id: string) {
    return prisma.nutritionFood.delete({ where: { id } });
  }

  // ─── Fitrah Practices ────────────────────────────────────────────────────────

  findAllFitrahPractices(userId: string) {
    return prisma.fitrahPractice.findMany({
      where: accessibleWhere(userId),
      orderBy: accessibleOrderBy,
    });
  }

  createFitrahPractice(userId: string, data: { name: string }) {
    return prisma.fitrahPractice.create({
      data: { userId, name: data.name, isDefault: false, isActive: true },
    });
  }

  findFitrahPracticeById(id: string, userId: string) {
    return prisma.fitrahPractice.findFirst({ where: { id, userId } });
  }

  updateFitrahPractice(id: string, data: { name: string }) {
    return prisma.fitrahPractice.update({ where: { id }, data: { name: data.name } });
  }

  deleteFitrahPractice(id: string) {
    return prisma.fitrahPractice.delete({ where: { id } });
  }

  // ─── Skills ──────────────────────────────────────────────────────────────────

  findAllSkills(userId: string) {
    return prisma.skill.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  createSkill(userId: string, data: { name: string }) {
    return prisma.skill.create({
      data: { userId, name: data.name, isActive: true },
    });
  }

  findSkillById(id: string, userId: string) {
    return prisma.skill.findFirst({ where: { id, userId } });
  }

  updateSkill(id: string, data: { name: string }) {
    return prisma.skill.update({ where: { id }, data: { name: data.name } });
  }

  deleteSkill(id: string) {
    return prisma.skill.delete({ where: { id } });
  }

  // ─── Skill Topics ────────────────────────────────────────────────────────────

  findTopicsBySkill(skillId: string) {
    return prisma.skillTopic.findMany({
      where: { skillId },
      orderBy: { name: 'asc' },
    });
  }

  createTopic(skillId: string, data: { name: string }) {
    return prisma.skillTopic.create({
      data: { skillId, name: data.name },
    });
  }

  findTopicById(topicId: string, skillId: string) {
    return prisma.skillTopic.findFirst({ where: { id: topicId, skillId } });
  }

  updateTopic(topicId: string, data: { name?: string; isPending?: boolean }) {
    return prisma.skillTopic.update({ where: { id: topicId }, data });
  }

  deleteTopic(topicId: string) {
    return prisma.skillTopic.delete({ where: { id: topicId } });
  }

  // ─── Intentions ──────────────────────────────────────────────────────────────

  findAllIntentions(userId: string) {
    return prisma.intention.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  createIntention(userId: string, data: { name: string }) {
    return prisma.intention.create({
      data: { userId, name: data.name, isActive: true },
    });
  }

  findIntentionById(id: string, userId: string) {
    return prisma.intention.findFirst({ where: { id, userId } });
  }

  updateIntention(id: string, data: { name: string }) {
    return prisma.intention.update({ where: { id }, data: { name: data.name } });
  }

  deleteIntention(id: string) {
    return prisma.intention.delete({ where: { id } });
  }
}
