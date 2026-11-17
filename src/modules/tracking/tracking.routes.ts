import { Router } from 'express';
import { TrackingController } from './tracking.controller';
import { authenticate } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validator';
import { z } from 'zod';
import { cuidSchema } from '../../core/utils/common-schemas';
import {
  createDailyPrayerSchema,
  updateDailyPrayerSchema,
  listDailyPrayerSchema,
} from './dto/daily-prayer.dto';
import {
  createOtherPrayerSchema,
  updateOtherPrayerSchema,
  listOtherPrayerSchema,
} from './dto/other-prayer.dto';
import {
  createQuranLogSchema,
  updateQuranLogSchema,
  listQuranLogSchema,
} from './dto/quran-log.dto';
import {
  createDhikrLogSchema,
  updateDhikrLogSchema,
  listDhikrLogSchema,
} from './dto/dhikr-log.dto';
import {
  createFastingLogSchema,
  updateFastingLogSchema,
  listFastingLogSchema,
} from './dto/fasting-log.dto';
import {
  createCharityLogSchema,
  updateCharityLogSchema,
  listCharityLogSchema,
} from './dto/charity-log.dto';
import {
  createIslamicStudyLogSchema,
  updateIslamicStudyLogSchema,
  listIslamicStudyLogSchema,
} from './dto/islamic-study-log.dto';
import {
  createSkillProgressLogSchema,
  updateSkillProgressLogSchema,
  listSkillProgressLogSchema,
} from './dto/skill-progress-log.dto';
import {
  createFitnessLogSchema,
  updateFitnessLogSchema,
  listFitnessLogSchema,
} from './dto/fitness-log.dto';
import {
  createNutritionLogSchema,
  updateNutritionLogSchema,
  listNutritionLogSchema,
} from './dto/nutrition-log.dto';
import {
  createSleepLogSchema,
  updateSleepLogSchema,
  listSleepLogSchema,
} from './dto/sleep-log.dto';
import {
  createFitrahPracticeLogSchema,
  updateFitrahPracticeLogSchema,
  listFitrahPracticeLogSchema,
} from './dto/fitrah-practice-log.dto';
import { createTaskSchema, updateTaskSchema, listTaskSchema } from './dto/task.dto';
import {
  createIntentionLogSchema,
  updateIntentionLogSchema,
  listIntentionLogSchema,
} from './dto/intention-log.dto';

const router = Router();
const controller = new TrackingController();

const idParamSchema = z.object({ params: z.object({ id: cuidSchema }) });

// ─── Daily Prayers ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/prayers/daily:
 *   get:
 *     tags: [Tracking - Daily Prayers]
 *     summary: List daily prayer logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of daily prayer logs }
 *       401: { description: Unauthorized }
 */
router.get(
  '/prayers/daily',
  authenticate,
  validate(listDailyPrayerSchema),
  controller.listDailyPrayers
);

/**
 * @openapi
 * /v1/tracking/prayers/daily:
 *   post:
 *     tags: [Tracking - Daily Prayers]
 *     summary: Log a daily prayer
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prayerName, prayerStatusId, date]
 *             properties:
 *               prayerName:
 *                 type: string
 *                 enum: [FAJR, ZUHR, ASR, MAGHRIB, ISHA, JUMMAH]
 *               prayerStatusId: { type: string }
 *               prayerLocationId: { type: string }
 *               khushuRating: { type: integer, minimum: 1, maximum: 5 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/prayers/daily',
  authenticate,
  validate(createDailyPrayerSchema),
  controller.createDailyPrayer
);

/**
 * @openapi
 * /v1/tracking/prayers/daily/{id}:
 *   get:
 *     tags: [Tracking - Daily Prayers]
 *     summary: Get a daily prayer log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the daily prayer log
 *     responses:
 *       200: { description: Daily prayer log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/prayers/daily/:id', authenticate, validate(idParamSchema), controller.getDailyPrayer);

/**
 * @openapi
 * /v1/tracking/prayers/daily/{id}:
 *   put:
 *     tags: [Tracking - Daily Prayers]
 *     summary: Update a daily prayer log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the daily prayer log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               prayerName:
 *                 type: string
 *                 enum: [FAJR, ZUHR, ASR, MAGHRIB, ISHA, JUMMAH]
 *               prayerStatusId: { type: string }
 *               prayerLocationId: { type: string }
 *               khushuRating: { type: integer, minimum: 1, maximum: 5 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/prayers/daily/:id',
  authenticate,
  validate(updateDailyPrayerSchema),
  controller.updateDailyPrayer
);

/**
 * @openapi
 * /v1/tracking/prayers/daily/{id}:
 *   delete:
 *     tags: [Tracking - Daily Prayers]
 *     summary: Delete a daily prayer log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the daily prayer log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete(
  '/prayers/daily/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteDailyPrayer
);

// ─── Other Prayers ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/prayers/other:
 *   get:
 *     tags: [Tracking - Other Prayers]
 *     summary: List other prayer logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of other prayer logs }
 *       401: { description: Unauthorized }
 */
router.get(
  '/prayers/other',
  authenticate,
  validate(listOtherPrayerSchema),
  controller.listOtherPrayers
);

/**
 * @openapi
 * /v1/tracking/prayers/other:
 *   post:
 *     tags: [Tracking - Other Prayers]
 *     summary: Log an other prayer
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otherPrayerTypeId, date]
 *             properties:
 *               otherPrayerTypeId: { type: string }
 *               rakahs: { type: integer, minimum: 2, maximum: 12 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/prayers/other',
  authenticate,
  validate(createOtherPrayerSchema),
  controller.createOtherPrayer
);

/**
 * @openapi
 * /v1/tracking/prayers/other/{id}:
 *   get:
 *     tags: [Tracking - Other Prayers]
 *     summary: Get an other prayer log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the other prayer log
 *     responses:
 *       200: { description: Other prayer log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/prayers/other/:id', authenticate, validate(idParamSchema), controller.getOtherPrayer);

/**
 * @openapi
 * /v1/tracking/prayers/other/{id}:
 *   put:
 *     tags: [Tracking - Other Prayers]
 *     summary: Update an other prayer log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the other prayer log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               otherPrayerTypeId: { type: string }
 *               rakahs: { type: integer, minimum: 2, maximum: 12 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/prayers/other/:id',
  authenticate,
  validate(updateOtherPrayerSchema),
  controller.updateOtherPrayer
);

/**
 * @openapi
 * /v1/tracking/prayers/other/{id}:
 *   delete:
 *     tags: [Tracking - Other Prayers]
 *     summary: Delete an other prayer log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the other prayer log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete(
  '/prayers/other/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteOtherPrayer
);

// ─── Quran Logs ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/quran:
 *   get:
 *     tags: [Tracking - Quran]
 *     summary: List Quran logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of Quran logs }
 *       401: { description: Unauthorized }
 */
router.get('/quran', authenticate, validate(listQuranLogSchema), controller.listQuranLogs);

/**
 * @openapi
 * /v1/tracking/quran:
 *   post:
 *     tags: [Tracking - Quran]
 *     summary: Log a Quran activity
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [surahName, surahNumber, quranActivityTypeId, versesCount, date]
 *             properties:
 *               surahName: { type: string }
 *               surahNumber: { type: integer, minimum: 1, maximum: 114 }
 *               quranActivityTypeId: { type: string }
 *               versesCount: { type: integer, minimum: 1 }
 *               juzzNumber: { type: integer, minimum: 1, maximum: 30 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post('/quran', authenticate, validate(createQuranLogSchema), controller.createQuranLog);

/**
 * @openapi
 * /v1/tracking/quran/{id}:
 *   get:
 *     tags: [Tracking - Quran]
 *     summary: Get a Quran log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the Quran log
 *     responses:
 *       200: { description: Quran log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/quran/:id', authenticate, validate(idParamSchema), controller.getQuranLog);

/**
 * @openapi
 * /v1/tracking/quran/{id}:
 *   put:
 *     tags: [Tracking - Quran]
 *     summary: Update a Quran log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the Quran log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               surahName: { type: string }
 *               surahNumber: { type: integer, minimum: 1, maximum: 114 }
 *               quranActivityTypeId: { type: string }
 *               versesCount: { type: integer, minimum: 1 }
 *               juzzNumber: { type: integer, minimum: 1, maximum: 30 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put('/quran/:id', authenticate, validate(updateQuranLogSchema), controller.updateQuranLog);

/**
 * @openapi
 * /v1/tracking/quran/{id}:
 *   delete:
 *     tags: [Tracking - Quran]
 *     summary: Delete a Quran log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the Quran log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete('/quran/:id', authenticate, validate(idParamSchema), controller.deleteQuranLog);

// ─── Dhikr Logs ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/dhikr:
 *   get:
 *     tags: [Tracking - Dhikr]
 *     summary: List dhikr logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of dhikr logs }
 *       401: { description: Unauthorized }
 */
router.get('/dhikr', authenticate, validate(listDhikrLogSchema), controller.listDhikrLogs);

/**
 * @openapi
 * /v1/tracking/dhikr:
 *   post:
 *     tags: [Tracking - Dhikr]
 *     summary: Log a dhikr entry
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dhikrTypeId, count, date]
 *             properties:
 *               dhikrTypeId: { type: string }
 *               count: { type: integer, minimum: 1 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post('/dhikr', authenticate, validate(createDhikrLogSchema), controller.createDhikrLog);

/**
 * @openapi
 * /v1/tracking/dhikr/{id}:
 *   get:
 *     tags: [Tracking - Dhikr]
 *     summary: Get a dhikr log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the dhikr log
 *     responses:
 *       200: { description: Dhikr log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/dhikr/:id', authenticate, validate(idParamSchema), controller.getDhikrLog);

/**
 * @openapi
 * /v1/tracking/dhikr/{id}:
 *   put:
 *     tags: [Tracking - Dhikr]
 *     summary: Update a dhikr log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the dhikr log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               dhikrTypeId: { type: string }
 *               count: { type: integer, minimum: 1 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put('/dhikr/:id', authenticate, validate(updateDhikrLogSchema), controller.updateDhikrLog);

/**
 * @openapi
 * /v1/tracking/dhikr/{id}:
 *   delete:
 *     tags: [Tracking - Dhikr]
 *     summary: Delete a dhikr log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the dhikr log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete('/dhikr/:id', authenticate, validate(idParamSchema), controller.deleteDhikrLog);

// ─── Fasting Logs ──────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/fasting:
 *   get:
 *     tags: [Tracking - Fasting]
 *     summary: List fasting logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of fasting logs }
 *       401: { description: Unauthorized }
 */
router.get('/fasting', authenticate, validate(listFastingLogSchema), controller.listFastingLogs);

/**
 * @openapi
 * /v1/tracking/fasting:
 *   post:
 *     tags: [Tracking - Fasting]
 *     summary: Log a fasting entry
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fastingTypeId, date]
 *             properties:
 *               fastingTypeId: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/fasting',
  authenticate,
  validate(createFastingLogSchema),
  controller.createFastingLog
);

/**
 * @openapi
 * /v1/tracking/fasting/{id}:
 *   get:
 *     tags: [Tracking - Fasting]
 *     summary: Get a fasting log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fasting log
 *     responses:
 *       200: { description: Fasting log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/fasting/:id', authenticate, validate(idParamSchema), controller.getFastingLog);

/**
 * @openapi
 * /v1/tracking/fasting/{id}:
 *   put:
 *     tags: [Tracking - Fasting]
 *     summary: Update a fasting log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fasting log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               fastingTypeId: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/fasting/:id',
  authenticate,
  validate(updateFastingLogSchema),
  controller.updateFastingLog
);

/**
 * @openapi
 * /v1/tracking/fasting/{id}:
 *   delete:
 *     tags: [Tracking - Fasting]
 *     summary: Delete a fasting log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fasting log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete('/fasting/:id', authenticate, validate(idParamSchema), controller.deleteFastingLog);

// ─── Charity Logs ──────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/charity:
 *   get:
 *     tags: [Tracking - Charity]
 *     summary: List charity logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of charity logs }
 *       401: { description: Unauthorized }
 */
router.get('/charity', authenticate, validate(listCharityLogSchema), controller.listCharityLogs);

/**
 * @openapi
 * /v1/tracking/charity:
 *   post:
 *     tags: [Tracking - Charity]
 *     summary: Log a charity entry
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [charityTypeId, date]
 *             properties:
 *               charityTypeId: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/charity',
  authenticate,
  validate(createCharityLogSchema),
  controller.createCharityLog
);

/**
 * @openapi
 * /v1/tracking/charity/{id}:
 *   get:
 *     tags: [Tracking - Charity]
 *     summary: Get a charity log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the charity log
 *     responses:
 *       200: { description: Charity log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/charity/:id', authenticate, validate(idParamSchema), controller.getCharityLog);

/**
 * @openapi
 * /v1/tracking/charity/{id}:
 *   put:
 *     tags: [Tracking - Charity]
 *     summary: Update a charity log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the charity log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               charityTypeId: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/charity/:id',
  authenticate,
  validate(updateCharityLogSchema),
  controller.updateCharityLog
);

/**
 * @openapi
 * /v1/tracking/charity/{id}:
 *   delete:
 *     tags: [Tracking - Charity]
 *     summary: Delete a charity log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the charity log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete('/charity/:id', authenticate, validate(idParamSchema), controller.deleteCharityLog);

// ─── Islamic Study Logs ────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/islamic-study:
 *   get:
 *     tags: [Tracking - Islamic Study]
 *     summary: List Islamic study logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of Islamic study logs }
 *       401: { description: Unauthorized }
 */
router.get(
  '/islamic-study',
  authenticate,
  validate(listIslamicStudyLogSchema),
  controller.listIslamicStudyLogs
);

/**
 * @openapi
 * /v1/tracking/islamic-study:
 *   post:
 *     tags: [Tracking - Islamic Study]
 *     summary: Log an Islamic study session
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subjectId, studyModeId, durationMins, date]
 *             properties:
 *               subjectId: { type: string }
 *               studyModeId: { type: string }
 *               durationMins: { type: integer, minimum: 1 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/islamic-study',
  authenticate,
  validate(createIslamicStudyLogSchema),
  controller.createIslamicStudyLog
);

/**
 * @openapi
 * /v1/tracking/islamic-study/{id}:
 *   get:
 *     tags: [Tracking - Islamic Study]
 *     summary: Get an Islamic study log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the Islamic study log
 *     responses:
 *       200: { description: Islamic study log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get(
  '/islamic-study/:id',
  authenticate,
  validate(idParamSchema),
  controller.getIslamicStudyLog
);

/**
 * @openapi
 * /v1/tracking/islamic-study/{id}:
 *   put:
 *     tags: [Tracking - Islamic Study]
 *     summary: Update an Islamic study log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the Islamic study log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               subjectId: { type: string }
 *               studyModeId: { type: string }
 *               durationMins: { type: integer, minimum: 1 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/islamic-study/:id',
  authenticate,
  validate(updateIslamicStudyLogSchema),
  controller.updateIslamicStudyLog
);

/**
 * @openapi
 * /v1/tracking/islamic-study/{id}:
 *   delete:
 *     tags: [Tracking - Islamic Study]
 *     summary: Delete an Islamic study log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the Islamic study log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete(
  '/islamic-study/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteIslamicStudyLog
);

// ─── Skill Progress Logs ───────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/skills:
 *   get:
 *     tags: [Tracking - Skill Progress]
 *     summary: List skill progress logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of skill progress logs }
 *       401: { description: Unauthorized }
 */
router.get(
  '/skills',
  authenticate,
  validate(listSkillProgressLogSchema),
  controller.listSkillProgressLogs
);

/**
 * @openapi
 * /v1/tracking/skills:
 *   post:
 *     tags: [Tracking - Skill Progress]
 *     summary: Log a skill progress entry
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [skillId, progress, date]
 *             properties:
 *               skillId: { type: string }
 *               skillTopicId: { type: string }
 *               progress: { type: integer, minimum: 0, maximum: 100 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/skills',
  authenticate,
  validate(createSkillProgressLogSchema),
  controller.createSkillProgressLog
);

/**
 * @openapi
 * /v1/tracking/skills/{id}:
 *   get:
 *     tags: [Tracking - Skill Progress]
 *     summary: Get a skill progress log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the skill progress log
 *     responses:
 *       200: { description: Skill progress log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/skills/:id', authenticate, validate(idParamSchema), controller.getSkillProgressLog);

/**
 * @openapi
 * /v1/tracking/skills/{id}:
 *   put:
 *     tags: [Tracking - Skill Progress]
 *     summary: Update a skill progress log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the skill progress log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               skillId: { type: string }
 *               skillTopicId: { type: string }
 *               progress: { type: integer, minimum: 0, maximum: 100 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/skills/:id',
  authenticate,
  validate(updateSkillProgressLogSchema),
  controller.updateSkillProgressLog
);

/**
 * @openapi
 * /v1/tracking/skills/{id}:
 *   delete:
 *     tags: [Tracking - Skill Progress]
 *     summary: Delete a skill progress log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the skill progress log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete(
  '/skills/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteSkillProgressLog
);

// ─── Fitness Logs ──────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/fitness:
 *   get:
 *     tags: [Tracking - Fitness]
 *     summary: List fitness logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of fitness logs }
 *       401: { description: Unauthorized }
 */
router.get('/fitness', authenticate, validate(listFitnessLogSchema), controller.listFitnessLogs);

/**
 * @openapi
 * /v1/tracking/fitness:
 *   post:
 *     tags: [Tracking - Fitness]
 *     summary: Log a fitness activity
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fitnessActivityId, quantity, date]
 *             properties:
 *               fitnessActivityId: { type: string }
 *               fitnessIntensityId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *               quantityUnit: { type: string, maxLength: 20 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/fitness',
  authenticate,
  validate(createFitnessLogSchema),
  controller.createFitnessLog
);

/**
 * @openapi
 * /v1/tracking/fitness/{id}:
 *   get:
 *     tags: [Tracking - Fitness]
 *     summary: Get a fitness log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fitness log
 *     responses:
 *       200: { description: Fitness log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/fitness/:id', authenticate, validate(idParamSchema), controller.getFitnessLog);

/**
 * @openapi
 * /v1/tracking/fitness/{id}:
 *   put:
 *     tags: [Tracking - Fitness]
 *     summary: Update a fitness log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fitness log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               fitnessActivityId: { type: string }
 *               fitnessIntensityId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *               quantityUnit: { type: string, maxLength: 20 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/fitness/:id',
  authenticate,
  validate(updateFitnessLogSchema),
  controller.updateFitnessLog
);

/**
 * @openapi
 * /v1/tracking/fitness/{id}:
 *   delete:
 *     tags: [Tracking - Fitness]
 *     summary: Delete a fitness log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fitness log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete('/fitness/:id', authenticate, validate(idParamSchema), controller.deleteFitnessLog);

// ─── Nutrition Logs ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/nutrition:
 *   get:
 *     tags: [Tracking - Nutrition]
 *     summary: List nutrition logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of nutrition logs }
 *       401: { description: Unauthorized }
 */
router.get(
  '/nutrition',
  authenticate,
  validate(listNutritionLogSchema),
  controller.listNutritionLogs
);

/**
 * @openapi
 * /v1/tracking/nutrition:
 *   post:
 *     tags: [Tracking - Nutrition]
 *     summary: Log a nutrition entry
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nutritionFoodId, date]
 *             properties:
 *               nutritionFoodId: { type: string }
 *               quantity: { type: string, maxLength: 50 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/nutrition',
  authenticate,
  validate(createNutritionLogSchema),
  controller.createNutritionLog
);

/**
 * @openapi
 * /v1/tracking/nutrition/{id}:
 *   get:
 *     tags: [Tracking - Nutrition]
 *     summary: Get a nutrition log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the nutrition log
 *     responses:
 *       200: { description: Nutrition log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/nutrition/:id', authenticate, validate(idParamSchema), controller.getNutritionLog);

/**
 * @openapi
 * /v1/tracking/nutrition/{id}:
 *   put:
 *     tags: [Tracking - Nutrition]
 *     summary: Update a nutrition log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the nutrition log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               nutritionFoodId: { type: string }
 *               quantity: { type: string, maxLength: 50 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/nutrition/:id',
  authenticate,
  validate(updateNutritionLogSchema),
  controller.updateNutritionLog
);

/**
 * @openapi
 * /v1/tracking/nutrition/{id}:
 *   delete:
 *     tags: [Tracking - Nutrition]
 *     summary: Delete a nutrition log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the nutrition log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete(
  '/nutrition/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteNutritionLog
);

// ─── Sleep Logs ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/sleep:
 *   get:
 *     tags: [Tracking - Sleep]
 *     summary: List sleep logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of sleep logs }
 *       401: { description: Unauthorized }
 */
router.get('/sleep', authenticate, validate(listSleepLogSchema), controller.listSleepLogs);

/**
 * @openapi
 * /v1/tracking/sleep:
 *   post:
 *     tags: [Tracking - Sleep]
 *     summary: Log a sleep entry
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bedtime, wakeupTime, date]
 *             properties:
 *               bedtime: { type: string, format: date-time }
 *               wakeupTime: { type: string, format: date-time }
 *               sleepQuality: { type: integer, minimum: 1, maximum: 5 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post('/sleep', authenticate, validate(createSleepLogSchema), controller.createSleepLog);

/**
 * @openapi
 * /v1/tracking/sleep/{id}:
 *   get:
 *     tags: [Tracking - Sleep]
 *     summary: Get a sleep log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the sleep log
 *     responses:
 *       200: { description: Sleep log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/sleep/:id', authenticate, validate(idParamSchema), controller.getSleepLog);

/**
 * @openapi
 * /v1/tracking/sleep/{id}:
 *   put:
 *     tags: [Tracking - Sleep]
 *     summary: Update a sleep log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the sleep log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               bedtime: { type: string, format: date-time }
 *               wakeupTime: { type: string, format: date-time }
 *               sleepQuality: { type: integer, minimum: 1, maximum: 5 }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put('/sleep/:id', authenticate, validate(updateSleepLogSchema), controller.updateSleepLog);

/**
 * @openapi
 * /v1/tracking/sleep/{id}:
 *   delete:
 *     tags: [Tracking - Sleep]
 *     summary: Delete a sleep log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the sleep log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete('/sleep/:id', authenticate, validate(idParamSchema), controller.deleteSleepLog);

// ─── Fitrah Practice Logs ──────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/fitrah-practices:
 *   get:
 *     tags: [Tracking - Fitrah Practices]
 *     summary: List fitrah practice logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of fitrah practice logs }
 *       401: { description: Unauthorized }
 */
router.get(
  '/fitrah-practices',
  authenticate,
  validate(listFitrahPracticeLogSchema),
  controller.listFitrahPracticeLogs
);

/**
 * @openapi
 * /v1/tracking/fitrah-practices:
 *   post:
 *     tags: [Tracking - Fitrah Practices]
 *     summary: Log fitrah practices
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [practices, date]
 *             properties:
 *               practices:
 *                 type: array
 *                 items: { type: string }
 *                 minItems: 1
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/fitrah-practices',
  authenticate,
  validate(createFitrahPracticeLogSchema),
  controller.createFitrahPracticeLog
);

/**
 * @openapi
 * /v1/tracking/fitrah-practices/{id}:
 *   get:
 *     tags: [Tracking - Fitrah Practices]
 *     summary: Get a fitrah practice log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fitrah practice log
 *     responses:
 *       200: { description: Fitrah practice log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get(
  '/fitrah-practices/:id',
  authenticate,
  validate(idParamSchema),
  controller.getFitrahPracticeLog
);

/**
 * @openapi
 * /v1/tracking/fitrah-practices/{id}:
 *   put:
 *     tags: [Tracking - Fitrah Practices]
 *     summary: Update a fitrah practice log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fitrah practice log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               practices:
 *                 type: array
 *                 items: { type: string }
 *                 minItems: 1
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/fitrah-practices/:id',
  authenticate,
  validate(updateFitrahPracticeLogSchema),
  controller.updateFitrahPracticeLog
);

/**
 * @openapi
 * /v1/tracking/fitrah-practices/{id}:
 *   delete:
 *     tags: [Tracking - Fitrah Practices]
 *     summary: Delete a fitrah practice log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the fitrah practice log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete(
  '/fitrah-practices/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteFitrahPracticeLog
);

// ─── Tasks ─────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/tasks:
 *   get:
 *     tags: [Tracking - Tasks]
 *     summary: List tasks
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of tasks }
 *       401: { description: Unauthorized }
 */
router.get('/tasks', authenticate, validate(listTaskSchema), controller.listTasks);

/**
 * @openapi
 * /v1/tracking/tasks:
 *   post:
 *     tags: [Tracking - Tasks]
 *     summary: Create a task
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date]
 *             properties:
 *               title: { type: string, minLength: 1, maxLength: 200 }
 *               intentionId: { type: string }
 *               taskPriorityId: { type: string }
 *               taskStatusId: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post('/tasks', authenticate, validate(createTaskSchema), controller.createTask);

/**
 * @openapi
 * /v1/tracking/tasks/{id}:
 *   get:
 *     tags: [Tracking - Tasks]
 *     summary: Get a task by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the task
 *     responses:
 *       200: { description: Task details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/tasks/:id', authenticate, validate(idParamSchema), controller.getTask);

/**
 * @openapi
 * /v1/tracking/tasks/{id}:
 *   put:
 *     tags: [Tracking - Tasks]
 *     summary: Update a task
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               title: { type: string, minLength: 1, maxLength: 200 }
 *               intentionId: { type: string }
 *               taskPriorityId: { type: string }
 *               taskStatusId: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put('/tasks/:id', authenticate, validate(updateTaskSchema), controller.updateTask);

/**
 * @openapi
 * /v1/tracking/tasks/{id}:
 *   delete:
 *     tags: [Tracking - Tasks]
 *     summary: Delete a task
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the task
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete('/tasks/:id', authenticate, validate(idParamSchema), controller.deleteTask);

// ─── Intention Logs ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /v1/tracking/intentions:
 *   get:
 *     tags: [Tracking - Intentions]
 *     summary: List intention logs
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated list of intention logs }
 *       401: { description: Unauthorized }
 */
router.get(
  '/intentions',
  authenticate,
  validate(listIntentionLogSchema),
  controller.listIntentionLogs
);

/**
 * @openapi
 * /v1/tracking/intentions:
 *   post:
 *     tags: [Tracking - Intentions]
 *     summary: Log an intention
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [intentionId, date]
 *             properties:
 *               intentionId: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       422: { description: Validation error }
 */
router.post(
  '/intentions',
  authenticate,
  validate(createIntentionLogSchema),
  controller.createIntentionLog
);

/**
 * @openapi
 * /v1/tracking/intentions/{id}:
 *   get:
 *     tags: [Tracking - Intentions]
 *     summary: Get an intention log by ID
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the intention log
 *     responses:
 *       200: { description: Intention log details }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.get('/intentions/:id', authenticate, validate(idParamSchema), controller.getIntentionLog);

/**
 * @openapi
 * /v1/tracking/intentions/{id}:
 *   put:
 *     tags: [Tracking - Intentions]
 *     summary: Update an intention log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the intention log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: All fields optional
 *             properties:
 *               intentionId: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Invalid FK IDs }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 *       422: { description: Validation error }
 */
router.put(
  '/intentions/:id',
  authenticate,
  validate(updateIntentionLogSchema),
  controller.updateIntentionLog
);

/**
 * @openapi
 * /v1/tracking/intentions/{id}:
 *   delete:
 *     tags: [Tracking - Intentions]
 *     summary: Delete an intention log
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: CUID of the intention log
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
router.delete(
  '/intentions/:id',
  authenticate,
  validate(idParamSchema),
  controller.deleteIntentionLog
);

export default router;
