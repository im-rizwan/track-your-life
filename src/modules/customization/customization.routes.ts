import { Router } from 'express';
import { CustomizationController } from './customization.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validator';
import { createSimpleItemSchema } from './dto/create-simple-item.dto';
import { updateSimpleItemSchema } from './dto/update-simple-item.dto';
import { createOtherPrayerTypeSchema } from './dto/create-other-prayer-type.dto';
import { updateOtherPrayerTypeSchema } from './dto/update-other-prayer-type.dto';
import { createSkillSchema } from './dto/create-skill.dto';
import { updateSkillSchema } from './dto/update-skill.dto';
import { createSkillTopicSchema } from './dto/create-skill-topic.dto';
import { updateSkillTopicSchema } from './dto/update-skill-topic.dto';
import { createIntentionSchema } from './dto/create-intention.dto';
import { updateIntentionSchema } from './dto/update-intention.dto';
import { z } from 'zod';
import { cuidSchema } from '../../core/utils/common-schemas';

const router = Router();
const controller = new CustomizationController();

const idParamSchema = z.object({ params: z.object({ id: cuidSchema }) });
const skillIdParamSchema = z.object({ params: z.object({ skillId: cuidSchema }) });

// ─── Prayer Locations ──────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/customization/prayer-locations:
 *   get:
 *     tags: [Customization - Prayer Locations]
 *     summary: List prayer locations
 *     description: Returns system defaults (isDefault=true) merged with user's custom items
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Prayer locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CustomizationItem' }
 *       401: { description: Unauthorized }
 */
router.get('/prayer-locations', authenticate, controller.listPrayerLocations);

/**
 * @openapi
 * /v1/customization/prayer-locations:
 *   post:
 *     tags: [Customization - Prayer Locations]
 *     summary: Create a custom prayer location
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: University Prayer Room }
 *     responses:
 *       201: { description: Created successfully }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/prayer-locations',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createPrayerLocation
);

/**
 * @openapi
 * /v1/customization/prayer-locations/{id}:
 *   put:
 *     tags: [Customization - Prayer Locations]
 *     summary: Update a custom prayer location
 *     description: Only user-created items can be updated. System defaults return 403.
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/prayer-locations/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updatePrayerLocation
);

/**
 * @openapi
 * /v1/customization/prayer-locations/{id}:
 *   delete:
 *     tags: [Customization - Prayer Locations]
 *     summary: Delete a custom prayer location
 *     description: Only user-created items can be deleted. Items referenced in tracking logs return 409.
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/prayer-locations/:id',
  authenticate,
  validate(idParamSchema),
  controller.deletePrayerLocation
);

// ─── Other Prayer Types ────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/customization/other-prayer-types:
 *   get:
 *     tags: [Customization - Other Prayer Types]
 *     summary: List other prayer types
 *     description: Returns system defaults (Tahajjud, Duha, Witr, etc.) merged with user's custom types
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Other prayer types retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string, example: Tahajjud }
 *                       requiresRakahCount: { type: boolean }
 *                       isDefault: { type: boolean }
 *                       isActive: { type: boolean }
 *       401: { description: Unauthorized }
 */
router.get('/other-prayer-types', authenticate, controller.listOtherPrayerTypes);

/**
 * @openapi
 * /v1/customization/other-prayer-types:
 *   post:
 *     tags: [Customization - Other Prayer Types]
 *     summary: Create a custom other prayer type
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, requiresRakahCount]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Istikhara }
 *               requiresRakahCount: { type: boolean, example: true }
 *     responses:
 *       201: { description: Created successfully }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/other-prayer-types',
  authenticate,
  validate(createOtherPrayerTypeSchema),
  controller.createOtherPrayerType
);

/**
 * @openapi
 * /v1/customization/other-prayer-types/{id}:
 *   put:
 *     tags: [Customization - Other Prayer Types]
 *     summary: Update a custom other prayer type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               requiresRakahCount: { type: boolean }
 *     responses:
 *       200: { description: Updated successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/other-prayer-types/:id',
  authenticate,
  validate(updateOtherPrayerTypeSchema),
  controller.updateOtherPrayerType
);

/**
 * @openapi
 * /v1/customization/other-prayer-types/{id}:
 *   delete:
 *     tags: [Customization - Other Prayer Types]
 *     summary: Delete a custom other prayer type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted successfully }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/other-prayer-types/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteOtherPrayerType
);

// ─── Dhikr Types ───────────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/dhikr-types:
 *   get:
 *     tags: [Customization - Dhikr Types]
 *     summary: List dhikr types
 *     description: Returns system defaults merged with user's custom dhikr types
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Dhikr types retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/dhikr-types', authenticate, controller.listDhikrTypes);

/** @openapi
 * /v1/customization/dhikr-types:
 *   post:
 *     tags: [Customization - Dhikr Types]
 *     summary: Create a custom dhikr type
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Istighfar }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/dhikr-types',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createDhikrType
);

/** @openapi
 * /v1/customization/dhikr-types/{id}:
 *   put:
 *     tags: [Customization - Dhikr Types]
 *     summary: Update a custom dhikr type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/dhikr-types/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateDhikrType
);

/** @openapi
 * /v1/customization/dhikr-types/{id}:
 *   delete:
 *     tags: [Customization - Dhikr Types]
 *     summary: Delete a custom dhikr type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/dhikr-types/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteDhikrType
);

// ─── Fasting Types ─────────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/fasting-types:
 *   get:
 *     tags: [Customization - Fasting Types]
 *     summary: List fasting types
 *     description: Returns system defaults merged with user's custom fasting types
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Fasting types retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/fasting-types', authenticate, controller.listFastingTypes);

/** @openapi
 * /v1/customization/fasting-types:
 *   post:
 *     tags: [Customization - Fasting Types]
 *     summary: Create a custom fasting type
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Shawwal Fasting }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/fasting-types',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createFastingType
);

/** @openapi
 * /v1/customization/fasting-types/{id}:
 *   put:
 *     tags: [Customization - Fasting Types]
 *     summary: Update a custom fasting type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/fasting-types/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateFastingType
);

/** @openapi
 * /v1/customization/fasting-types/{id}:
 *   delete:
 *     tags: [Customization - Fasting Types]
 *     summary: Delete a custom fasting type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/fasting-types/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteFastingType
);

// ─── Charity Types ─────────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/charity-types:
 *   get:
 *     tags: [Customization - Charity Types]
 *     summary: List charity types
 *     description: Returns system defaults merged with user's custom charity types
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Charity types retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/charity-types', authenticate, controller.listCharityTypes);

/** @openapi
 * /v1/customization/charity-types:
 *   post:
 *     tags: [Customization - Charity Types]
 *     summary: Create a custom charity type
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Waqf }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/charity-types',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createCharityType
);

/** @openapi
 * /v1/customization/charity-types/{id}:
 *   put:
 *     tags: [Customization - Charity Types]
 *     summary: Update a custom charity type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/charity-types/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateCharityType
);

/** @openapi
 * /v1/customization/charity-types/{id}:
 *   delete:
 *     tags: [Customization - Charity Types]
 *     summary: Delete a custom charity type
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/charity-types/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteCharityType
);

// ─── Islamic Study Subjects ────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/islamic-study-subjects:
 *   get:
 *     tags: [Customization - Islamic Study Subjects]
 *     summary: List Islamic study subjects
 *     description: Returns system defaults merged with user's custom subjects
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Islamic study subjects retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/islamic-study-subjects', authenticate, controller.listIslamicStudySubjects);

/** @openapi
 * /v1/customization/islamic-study-subjects:
 *   post:
 *     tags: [Customization - Islamic Study Subjects]
 *     summary: Create a custom Islamic study subject
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Usul al-Fiqh }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/islamic-study-subjects',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createIslamicStudySubject
);

/** @openapi
 * /v1/customization/islamic-study-subjects/{id}:
 *   put:
 *     tags: [Customization - Islamic Study Subjects]
 *     summary: Update a custom Islamic study subject
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/islamic-study-subjects/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateIslamicStudySubject
);

/** @openapi
 * /v1/customization/islamic-study-subjects/{id}:
 *   delete:
 *     tags: [Customization - Islamic Study Subjects]
 *     summary: Delete a custom Islamic study subject
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/islamic-study-subjects/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteIslamicStudySubject
);

// ─── Study Modes ───────────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/study-modes:
 *   get:
 *     tags: [Customization - Study Modes]
 *     summary: List study modes
 *     description: Returns system defaults merged with user's custom study modes
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Study modes retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/study-modes', authenticate, controller.listStudyModes);

/** @openapi
 * /v1/customization/study-modes:
 *   post:
 *     tags: [Customization - Study Modes]
 *     summary: Create a custom study mode
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Online Course }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/study-modes',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createStudyMode
);

/** @openapi
 * /v1/customization/study-modes/{id}:
 *   put:
 *     tags: [Customization - Study Modes]
 *     summary: Update a custom study mode
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/study-modes/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateStudyMode
);

/** @openapi
 * /v1/customization/study-modes/{id}:
 *   delete:
 *     tags: [Customization - Study Modes]
 *     summary: Delete a custom study mode
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/study-modes/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteStudyMode
);

// ─── Fitness Activities ────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/fitness-activities:
 *   get:
 *     tags: [Customization - Fitness Activities]
 *     summary: List fitness activities
 *     description: Returns system defaults merged with user's custom fitness activities
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Fitness activities retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/fitness-activities', authenticate, controller.listFitnessActivities);

/** @openapi
 * /v1/customization/fitness-activities:
 *   post:
 *     tags: [Customization - Fitness Activities]
 *     summary: Create a custom fitness activity
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Swimming }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/fitness-activities',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createFitnessActivity
);

/** @openapi
 * /v1/customization/fitness-activities/{id}:
 *   put:
 *     tags: [Customization - Fitness Activities]
 *     summary: Update a custom fitness activity
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/fitness-activities/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateFitnessActivity
);

/** @openapi
 * /v1/customization/fitness-activities/{id}:
 *   delete:
 *     tags: [Customization - Fitness Activities]
 *     summary: Delete a custom fitness activity
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/fitness-activities/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteFitnessActivity
);

// ─── Nutrition Foods ───────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/nutrition-foods:
 *   get:
 *     tags: [Customization - Nutrition Foods]
 *     summary: List nutrition foods
 *     description: Returns system defaults merged with user's custom nutrition foods
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Nutrition foods retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/nutrition-foods', authenticate, controller.listNutritionFoods);

/** @openapi
 * /v1/customization/nutrition-foods:
 *   post:
 *     tags: [Customization - Nutrition Foods]
 *     summary: Create a custom nutrition food
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Dates }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/nutrition-foods',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createNutritionFood
);

/** @openapi
 * /v1/customization/nutrition-foods/{id}:
 *   put:
 *     tags: [Customization - Nutrition Foods]
 *     summary: Update a custom nutrition food
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/nutrition-foods/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateNutritionFood
);

/** @openapi
 * /v1/customization/nutrition-foods/{id}:
 *   delete:
 *     tags: [Customization - Nutrition Foods]
 *     summary: Delete a custom nutrition food
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/nutrition-foods/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteNutritionFood
);

// ─── Fitrah Practices ──────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/fitrah-practices:
 *   get:
 *     tags: [Customization - Fitrah Practices]
 *     summary: List fitrah practices
 *     description: Returns system defaults merged with user's custom fitrah practices
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Fitrah practices retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/fitrah-practices', authenticate, controller.listFitrahPractices);

/** @openapi
 * /v1/customization/fitrah-practices:
 *   post:
 *     tags: [Customization - Fitrah Practices]
 *     summary: Create a custom fitrah practice
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Miswak }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/fitrah-practices',
  authenticate,
  validate(createSimpleItemSchema),
  controller.createFitrahPractice
);

/** @openapi
 * /v1/customization/fitrah-practices/{id}:
 *   put:
 *     tags: [Customization - Fitrah Practices]
 *     summary: Update a custom fitrah practice
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot modify system defaults }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/fitrah-practices/:id',
  authenticate,
  validate(updateSimpleItemSchema),
  controller.updateFitrahPractice
);

/** @openapi
 * /v1/customization/fitrah-practices/{id}:
 *   delete:
 *     tags: [Customization - Fitrah Practices]
 *     summary: Delete a custom fitrah practice
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Cannot delete system defaults }
 *       409: { description: Item referenced in tracking logs }
 */
router.delete(
  '/fitrah-practices/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteFitrahPractice
);

// ─── Skills ────────────────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/skills:
 *   get:
 *     tags: [Customization - Skills]
 *     summary: List user's skills
 *     description: Returns all user-owned skills (no system defaults)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Skills retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/skills', authenticate, controller.listSkills);

/** @openapi
 * /v1/customization/skills:
 *   post:
 *     tags: [Customization - Skills]
 *     summary: Create a skill
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Arabic Language }
 *     responses:
 *       201: { description: Skill created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post('/skills', authenticate, validate(createSkillSchema), controller.createSkill);

/** @openapi
 * /v1/customization/skills/{id}:
 *   put:
 *     tags: [Customization - Skills]
 *     summary: Update a skill
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       404: { description: Skill not found }
 *       422: { description: Validation error }
 */
router.put('/skills/:id', authenticate, validate(updateSkillSchema), controller.updateSkill);

/** @openapi
 * /v1/customization/skills/{id}:
 *   delete:
 *     tags: [Customization - Skills]
 *     summary: Delete a skill
 *     description: Skills referenced in tracking logs cannot be deleted (409).
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Skill not found }
 *       409: { description: Skill referenced in tracking logs }
 */
router.delete('/skills/:id', authenticate, validate(idParamSchema), controller.deleteSkill);

// ─── Skill Topics (sub-resource) ───────────────────────────────────────────────

/** @openapi
 * /v1/customization/skills/{skillId}/topics:
 *   get:
 *     tags: [Customization - Skills]
 *     summary: List topics for a skill
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: string }
 *         description: Parent skill ID
 *     responses:
 *       200:
 *         description: Skill topics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string, example: Nahw (Grammar) }
 *                       isPending: { type: boolean, example: true }
 *       401: { description: Unauthorized }
 *       404: { description: Skill not found }
 */
router.get(
  '/skills/:skillId/topics',
  authenticate,
  validate(skillIdParamSchema),
  controller.listTopics
);

/** @openapi
 * /v1/customization/skills/{skillId}/topics:
 *   post:
 *     tags: [Customization - Skills]
 *     summary: Create a topic for a skill
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: Nahw (Grammar) }
 *     responses:
 *       201: { description: Topic created }
 *       401: { description: Unauthorized }
 *       404: { description: Skill not found }
 *       422: { description: Validation error }
 */
router.post(
  '/skills/:skillId/topics',
  authenticate,
  validate(createSkillTopicSchema),
  controller.createTopic
);

/** @openapi
 * /v1/customization/skills/{skillId}/topics/{topicId}:
 *   patch:
 *     tags: [Customization - Skills]
 *     summary: Update a skill topic
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               isPending: { type: boolean }
 *     responses:
 *       200: { description: Topic updated }
 *       401: { description: Unauthorized }
 *       404: { description: Topic not found }
 */
router.patch(
  '/skills/:skillId/topics/:topicId',
  authenticate,
  validate(updateSkillTopicSchema),
  controller.updateTopic
);

/** @openapi
 * /v1/customization/skills/{skillId}/topics/{topicId}:
 *   delete:
 *     tags: [Customization - Skills]
 *     summary: Delete a skill topic
 *     description: Topics referenced in tracking logs cannot be deleted (409).
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Topic deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Topic not found }
 *       409: { description: Topic referenced in tracking logs }
 */
router.delete(
  '/skills/:skillId/topics/:topicId',
  authenticate,
  validate(z.object({ params: z.object({ skillId: cuidSchema, topicId: cuidSchema }) })),
  controller.deleteTopic
);

// ─── Intentions ────────────────────────────────────────────────────────────────

/** @openapi
 * /v1/customization/intentions:
 *   get:
 *     tags: [Customization - Intentions]
 *     summary: List user's intentions
 *     description: Returns all user-owned intentions (no system defaults)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Intentions retrieved }
 *       401: { description: Unauthorized }
 */
router.get('/intentions', authenticate, controller.listIntentions);

/** @openapi
 * /v1/customization/intentions:
 *   post:
 *     tags: [Customization - Intentions]
 *     summary: Create an intention
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 200, example: Seek knowledge for the sake of Allah }
 *     responses:
 *       201: { description: Intention created }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/intentions',
  authenticate,
  validate(createIntentionSchema),
  controller.createIntention
);

/** @openapi
 * /v1/customization/intentions/{id}:
 *   put:
 *     tags: [Customization - Intentions]
 *     summary: Update an intention
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 200 }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       404: { description: Intention not found }
 *       422: { description: Validation error }
 */
router.put(
  '/intentions/:id',
  authenticate,
  validate(updateIntentionSchema),
  controller.updateIntention
);

/** @openapi
 * /v1/customization/intentions/{id}:
 *   delete:
 *     tags: [Customization - Intentions]
 *     summary: Delete an intention
 *     description: Intentions referenced in tracking logs or tasks cannot be deleted (409).
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Intention not found }
 *       409: { description: Intention referenced in tracking logs }
 */
router.delete('/intentions/:id', authenticate, validate(idParamSchema), controller.deleteIntention);

export default router;
