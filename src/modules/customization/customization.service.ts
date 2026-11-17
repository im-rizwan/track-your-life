import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomizationRepository } from './customization.repository';
import { ForbiddenError, NotFoundError, ConflictError } from '../../core/errors/app-error';
import { CreateSimpleItemDto } from './dto/create-simple-item.dto';
import { CreateOtherPrayerTypeDto } from './dto/create-other-prayer-type.dto';
import { UpdateOtherPrayerTypeDto } from './dto/update-other-prayer-type.dto';
import { CreateSkillTopicDto } from './dto/create-skill-topic.dto';
import { UpdateSkillTopicDto } from './dto/update-skill-topic.dto';

const CONFLICT_MSG = 'Cannot delete: item is referenced in existing tracking logs';
const DUPLICATE_MSG = 'An item with this name already exists';

function handleDeleteError(error: unknown): never {
  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
    throw new ConflictError(CONFLICT_MSG);
  }
  throw error;
}

function handleUniqueError(error: unknown): never {
  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictError(DUPLICATE_MSG);
  }
  throw error;
}

export class CustomizationService {
  private repo: CustomizationRepository;

  constructor() {
    this.repo = new CustomizationRepository();
  }

  // ─── Generic helpers for system-default entities ─────────────────────────────

  private async checkOwnership(
    item: { isDefault: boolean } | null,
    entityName: string
  ): Promise<void> {
    if (!item) throw new NotFoundError(`${entityName} not found`);
    if (item.isDefault) throw new ForbiddenError('Cannot modify system defaults');
  }

  // ─── Prayer Locations ────────────────────────────────────────────────────────

  listPrayerLocations(userId: string) {
    return this.repo.findAllPrayerLocations(userId);
  }

  async createPrayerLocation(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createPrayerLocation(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updatePrayerLocation(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findPrayerLocationById(id, userId);
    await this.checkOwnership(item, 'Prayer location');
    try {
      return await this.repo.updatePrayerLocation(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deletePrayerLocation(id: string, userId: string) {
    const item = await this.repo.findPrayerLocationById(id, userId);
    await this.checkOwnership(item, 'Prayer location');
    try {
      await this.repo.deletePrayerLocation(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Other Prayer Types ──────────────────────────────────────────────────────

  listOtherPrayerTypes(userId: string) {
    return this.repo.findAllOtherPrayerTypes(userId);
  }

  async createOtherPrayerType(userId: string, data: CreateOtherPrayerTypeDto) {
    try {
      return await this.repo.createOtherPrayerType(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateOtherPrayerType(id: string, userId: string, data: UpdateOtherPrayerTypeDto) {
    const item = await this.repo.findOtherPrayerTypeById(id, userId);
    await this.checkOwnership(item, 'Other prayer type');
    try {
      return await this.repo.updateOtherPrayerType(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteOtherPrayerType(id: string, userId: string) {
    const item = await this.repo.findOtherPrayerTypeById(id, userId);
    await this.checkOwnership(item, 'Other prayer type');
    try {
      await this.repo.deleteOtherPrayerType(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Dhikr Types ─────────────────────────────────────────────────────────────

  listDhikrTypes(userId: string) {
    return this.repo.findAllDhikrTypes(userId);
  }

  async createDhikrType(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createDhikrType(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateDhikrType(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findDhikrTypeById(id, userId);
    await this.checkOwnership(item, 'Dhikr type');
    try {
      return await this.repo.updateDhikrType(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteDhikrType(id: string, userId: string) {
    const item = await this.repo.findDhikrTypeById(id, userId);
    await this.checkOwnership(item, 'Dhikr type');
    try {
      await this.repo.deleteDhikrType(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Fasting Types ───────────────────────────────────────────────────────────

  listFastingTypes(userId: string) {
    return this.repo.findAllFastingTypes(userId);
  }

  async createFastingType(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createFastingType(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateFastingType(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findFastingTypeById(id, userId);
    await this.checkOwnership(item, 'Fasting type');
    try {
      return await this.repo.updateFastingType(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteFastingType(id: string, userId: string) {
    const item = await this.repo.findFastingTypeById(id, userId);
    await this.checkOwnership(item, 'Fasting type');
    try {
      await this.repo.deleteFastingType(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Charity Types ───────────────────────────────────────────────────────────

  listCharityTypes(userId: string) {
    return this.repo.findAllCharityTypes(userId);
  }

  async createCharityType(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createCharityType(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateCharityType(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findCharityTypeById(id, userId);
    await this.checkOwnership(item, 'Charity type');
    try {
      return await this.repo.updateCharityType(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteCharityType(id: string, userId: string) {
    const item = await this.repo.findCharityTypeById(id, userId);
    await this.checkOwnership(item, 'Charity type');
    try {
      await this.repo.deleteCharityType(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Islamic Study Subjects ──────────────────────────────────────────────────

  listIslamicStudySubjects(userId: string) {
    return this.repo.findAllIslamicStudySubjects(userId);
  }

  async createIslamicStudySubject(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createIslamicStudySubject(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateIslamicStudySubject(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findIslamicStudySubjectById(id, userId);
    await this.checkOwnership(item, 'Islamic study subject');
    try {
      return await this.repo.updateIslamicStudySubject(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteIslamicStudySubject(id: string, userId: string) {
    const item = await this.repo.findIslamicStudySubjectById(id, userId);
    await this.checkOwnership(item, 'Islamic study subject');
    try {
      await this.repo.deleteIslamicStudySubject(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Study Modes ─────────────────────────────────────────────────────────────

  listStudyModes(userId: string) {
    return this.repo.findAllStudyModes(userId);
  }

  async createStudyMode(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createStudyMode(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateStudyMode(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findStudyModeById(id, userId);
    await this.checkOwnership(item, 'Study mode');
    try {
      return await this.repo.updateStudyMode(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteStudyMode(id: string, userId: string) {
    const item = await this.repo.findStudyModeById(id, userId);
    await this.checkOwnership(item, 'Study mode');
    try {
      await this.repo.deleteStudyMode(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Fitness Activities ──────────────────────────────────────────────────────

  listFitnessActivities(userId: string) {
    return this.repo.findAllFitnessActivities(userId);
  }

  async createFitnessActivity(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createFitnessActivity(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateFitnessActivity(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findFitnessActivityById(id, userId);
    await this.checkOwnership(item, 'Fitness activity');
    try {
      return await this.repo.updateFitnessActivity(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteFitnessActivity(id: string, userId: string) {
    const item = await this.repo.findFitnessActivityById(id, userId);
    await this.checkOwnership(item, 'Fitness activity');
    try {
      await this.repo.deleteFitnessActivity(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Nutrition Foods ─────────────────────────────────────────────────────────

  listNutritionFoods(userId: string) {
    return this.repo.findAllNutritionFoods(userId);
  }

  async createNutritionFood(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createNutritionFood(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateNutritionFood(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findNutritionFoodById(id, userId);
    await this.checkOwnership(item, 'Nutrition food');
    try {
      return await this.repo.updateNutritionFood(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteNutritionFood(id: string, userId: string) {
    const item = await this.repo.findNutritionFoodById(id, userId);
    await this.checkOwnership(item, 'Nutrition food');
    try {
      await this.repo.deleteNutritionFood(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Fitrah Practices ────────────────────────────────────────────────────────

  listFitrahPractices(userId: string) {
    return this.repo.findAllFitrahPractices(userId);
  }

  async createFitrahPractice(userId: string, data: CreateSimpleItemDto) {
    try {
      return await this.repo.createFitrahPractice(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateFitrahPractice(id: string, userId: string, data: CreateSimpleItemDto) {
    const item = await this.repo.findFitrahPracticeById(id, userId);
    await this.checkOwnership(item, 'Fitrah practice');
    try {
      return await this.repo.updateFitrahPractice(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteFitrahPractice(id: string, userId: string) {
    const item = await this.repo.findFitrahPracticeById(id, userId);
    await this.checkOwnership(item, 'Fitrah practice');
    try {
      await this.repo.deleteFitrahPractice(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Skills ──────────────────────────────────────────────────────────────────

  listSkills(userId: string) {
    return this.repo.findAllSkills(userId);
  }

  async createSkill(userId: string, data: { name: string }) {
    try {
      return await this.repo.createSkill(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateSkill(id: string, userId: string, data: { name: string }) {
    const item = await this.repo.findSkillById(id, userId);
    if (!item) throw new NotFoundError('Skill not found');
    try {
      return await this.repo.updateSkill(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteSkill(id: string, userId: string) {
    const item = await this.repo.findSkillById(id, userId);
    if (!item) throw new NotFoundError('Skill not found');
    try {
      await this.repo.deleteSkill(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Skill Topics ────────────────────────────────────────────────────────────

  async listTopics(skillId: string, userId: string) {
    const skill = await this.repo.findSkillById(skillId, userId);
    if (!skill) throw new NotFoundError('Skill not found');
    return this.repo.findTopicsBySkill(skillId);
  }

  async createTopic(skillId: string, userId: string, data: CreateSkillTopicDto) {
    const skill = await this.repo.findSkillById(skillId, userId);
    if (!skill) throw new NotFoundError('Skill not found');
    try {
      return await this.repo.createTopic(skillId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateTopic(skillId: string, topicId: string, userId: string, data: UpdateSkillTopicDto) {
    const skill = await this.repo.findSkillById(skillId, userId);
    if (!skill) throw new NotFoundError('Skill not found');
    const topic = await this.repo.findTopicById(topicId, skillId);
    if (!topic) throw new NotFoundError('Skill topic not found');
    try {
      return await this.repo.updateTopic(topicId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteTopic(skillId: string, topicId: string, userId: string) {
    const skill = await this.repo.findSkillById(skillId, userId);
    if (!skill) throw new NotFoundError('Skill not found');
    const topic = await this.repo.findTopicById(topicId, skillId);
    if (!topic) throw new NotFoundError('Skill topic not found');
    try {
      await this.repo.deleteTopic(topicId);
    } catch (error) {
      handleDeleteError(error);
    }
  }

  // ─── Intentions ──────────────────────────────────────────────────────────────

  listIntentions(userId: string) {
    return this.repo.findAllIntentions(userId);
  }

  async createIntention(userId: string, data: { name: string }) {
    try {
      return await this.repo.createIntention(userId, data);
    } catch (error) { handleUniqueError(error); }
  }

  async updateIntention(id: string, userId: string, data: { name: string }) {
    const item = await this.repo.findIntentionById(id, userId);
    if (!item) throw new NotFoundError('Intention not found');
    try {
      return await this.repo.updateIntention(id, data);
    } catch (error) { handleUniqueError(error); }
  }

  async deleteIntention(id: string, userId: string) {
    const item = await this.repo.findIntentionById(id, userId);
    if (!item) throw new NotFoundError('Intention not found');
    try {
      await this.repo.deleteIntention(id);
    } catch (error) {
      handleDeleteError(error);
    }
  }
}
