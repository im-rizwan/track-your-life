import { Request, Response, NextFunction } from 'express';
import { CustomizationService } from './customization.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../core/utils/response';

export class CustomizationController {
  private service: CustomizationService;

  constructor() {
    this.service = new CustomizationService();
  }

  // ─── Prayer Locations ────────────────────────────────────────────────────────

  listPrayerLocations = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listPrayerLocations(req.user!.id);
    sendSuccess(res, data, 'Prayer locations retrieved successfully');
  });

  createPrayerLocation = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createPrayerLocation(req.user!.id, req.body);
    sendCreated(res, data, 'Prayer location created successfully');
  });

  updatePrayerLocation = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updatePrayerLocation(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Prayer location updated successfully');
  });

  deletePrayerLocation = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deletePrayerLocation(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Other Prayer Types ──────────────────────────────────────────────────────

  listOtherPrayerTypes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listOtherPrayerTypes(req.user!.id);
    sendSuccess(res, data, 'Other prayer types retrieved successfully');
  });

  createOtherPrayerType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createOtherPrayerType(req.user!.id, req.body);
    sendCreated(res, data, 'Other prayer type created successfully');
  });

  updateOtherPrayerType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateOtherPrayerType(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Other prayer type updated successfully');
  });

  deleteOtherPrayerType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteOtherPrayerType(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Dhikr Types ─────────────────────────────────────────────────────────────

  listDhikrTypes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listDhikrTypes(req.user!.id);
    sendSuccess(res, data, 'Dhikr types retrieved successfully');
  });

  createDhikrType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createDhikrType(req.user!.id, req.body);
    sendCreated(res, data, 'Dhikr type created successfully');
  });

  updateDhikrType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateDhikrType(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Dhikr type updated successfully');
  });

  deleteDhikrType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteDhikrType(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Fasting Types ───────────────────────────────────────────────────────────

  listFastingTypes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listFastingTypes(req.user!.id);
    sendSuccess(res, data, 'Fasting types retrieved successfully');
  });

  createFastingType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createFastingType(req.user!.id, req.body);
    sendCreated(res, data, 'Fasting type created successfully');
  });

  updateFastingType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateFastingType(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Fasting type updated successfully');
  });

  deleteFastingType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteFastingType(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Charity Types ───────────────────────────────────────────────────────────

  listCharityTypes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listCharityTypes(req.user!.id);
    sendSuccess(res, data, 'Charity types retrieved successfully');
  });

  createCharityType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createCharityType(req.user!.id, req.body);
    sendCreated(res, data, 'Charity type created successfully');
  });

  updateCharityType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateCharityType(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Charity type updated successfully');
  });

  deleteCharityType = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteCharityType(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Islamic Study Subjects ──────────────────────────────────────────────────

  listIslamicStudySubjects = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.listIslamicStudySubjects(req.user!.id);
      sendSuccess(res, data, 'Islamic study subjects retrieved successfully');
    }
  );

  createIslamicStudySubject = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.createIslamicStudySubject(req.user!.id, req.body);
      sendCreated(res, data, 'Islamic study subject created successfully');
    }
  );

  updateIslamicStudySubject = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = await this.service.updateIslamicStudySubject(
        req.params.id as string,
        req.user!.id,
        req.body
      );
      sendSuccess(res, data, 'Islamic study subject updated successfully');
    }
  );

  deleteIslamicStudySubject = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      await this.service.deleteIslamicStudySubject(req.params.id as string, req.user!.id);
      sendNoContent(res);
    }
  );

  // ─── Study Modes ─────────────────────────────────────────────────────────────

  listStudyModes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listStudyModes(req.user!.id);
    sendSuccess(res, data, 'Study modes retrieved successfully');
  });

  createStudyMode = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createStudyMode(req.user!.id, req.body);
    sendCreated(res, data, 'Study mode created successfully');
  });

  updateStudyMode = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateStudyMode(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Study mode updated successfully');
  });

  deleteStudyMode = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteStudyMode(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Fitness Activities ──────────────────────────────────────────────────────

  listFitnessActivities = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listFitnessActivities(req.user!.id);
    sendSuccess(res, data, 'Fitness activities retrieved successfully');
  });

  createFitnessActivity = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createFitnessActivity(req.user!.id, req.body);
    sendCreated(res, data, 'Fitness activity created successfully');
  });

  updateFitnessActivity = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateFitnessActivity(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Fitness activity updated successfully');
  });

  deleteFitnessActivity = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteFitnessActivity(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Nutrition Foods ─────────────────────────────────────────────────────────

  listNutritionFoods = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listNutritionFoods(req.user!.id);
    sendSuccess(res, data, 'Nutrition foods retrieved successfully');
  });

  createNutritionFood = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createNutritionFood(req.user!.id, req.body);
    sendCreated(res, data, 'Nutrition food created successfully');
  });

  updateNutritionFood = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateNutritionFood(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Nutrition food updated successfully');
  });

  deleteNutritionFood = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteNutritionFood(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Fitrah Practices ────────────────────────────────────────────────────────

  listFitrahPractices = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listFitrahPractices(req.user!.id);
    sendSuccess(res, data, 'Fitrah practices retrieved successfully');
  });

  createFitrahPractice = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createFitrahPractice(req.user!.id, req.body);
    sendCreated(res, data, 'Fitrah practice created successfully');
  });

  updateFitrahPractice = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateFitrahPractice(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Fitrah practice updated successfully');
  });

  deleteFitrahPractice = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteFitrahPractice(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Skills ──────────────────────────────────────────────────────────────────

  listSkills = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listSkills(req.user!.id);
    sendSuccess(res, data, 'Skills retrieved successfully');
  });

  createSkill = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createSkill(req.user!.id, req.body);
    sendCreated(res, data, 'Skill created successfully');
  });

  updateSkill = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateSkill(req.params.id as string, req.user!.id, req.body);
    sendSuccess(res, data, 'Skill updated successfully');
  });

  deleteSkill = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteSkill(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });

  // ─── Skill Topics ────────────────────────────────────────────────────────────

  listTopics = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listTopics(req.params.skillId as string, req.user!.id);
    sendSuccess(res, data, 'Skill topics retrieved successfully');
  });

  createTopic = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createTopic(
      req.params.skillId as string,
      req.user!.id,
      req.body
    );
    sendCreated(res, data, 'Skill topic created successfully');
  });

  updateTopic = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateTopic(
      req.params.skillId as string,
      req.params.topicId as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Skill topic updated successfully');
  });

  deleteTopic = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteTopic(
      req.params.skillId as string,
      req.params.topicId as string,
      req.user!.id
    );
    sendNoContent(res);
  });

  // ─── Intentions ──────────────────────────────────────────────────────────────

  listIntentions = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.listIntentions(req.user!.id);
    sendSuccess(res, data, 'Intentions retrieved successfully');
  });

  createIntention = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.createIntention(req.user!.id, req.body);
    sendCreated(res, data, 'Intention created successfully');
  });

  updateIntention = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await this.service.updateIntention(
      req.params.id as string,
      req.user!.id,
      req.body
    );
    sendSuccess(res, data, 'Intention updated successfully');
  });

  deleteIntention = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    await this.service.deleteIntention(req.params.id as string, req.user!.id);
    sendNoContent(res);
  });
}
