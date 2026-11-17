import { Router } from 'express';
import { ReferenceController } from './reference.controller';
import { authenticate } from '../../core/middleware/auth.middleware';

const router = Router();
const controller = new ReferenceController();

/**
 * @openapi
 * /v1/reference/prayer-statuses:
 *   get:
 *     tags: [Reference]
 *     summary: Get prayer status options
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Prayer statuses retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/prayer-statuses', authenticate, controller.getPrayerStatuses);

/**
 * @openapi
 * /v1/reference/quran-activity-types:
 *   get:
 *     tags: [Reference]
 *     summary: Get Quran activity type options
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Quran activity types retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/quran-activity-types', authenticate, controller.getQuranActivityTypes);

/**
 * @openapi
 * /v1/reference/task-priorities:
 *   get:
 *     tags: [Reference]
 *     summary: Get task priority options
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Task priorities retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/task-priorities', authenticate, controller.getTaskPriorities);

/**
 * @openapi
 * /v1/reference/task-statuses:
 *   get:
 *     tags: [Reference]
 *     summary: Get task status options
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Task statuses retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/task-statuses', authenticate, controller.getTaskStatuses);

/**
 * @openapi
 * /v1/reference/fitness-intensities:
 *   get:
 *     tags: [Reference]
 *     summary: Get fitness intensity options
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Fitness intensities retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/fitness-intensities', authenticate, controller.getFitnessIntensities);

/**
 * @openapi
 * /v1/reference/surahs:
 *   get:
 *     tags: [Reference]
 *     summary: Get all 114 Quran surahs
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Surahs retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/surahs', authenticate, controller.getSurahs);

/**
 * @openapi
 * /v1/reference/juzz:
 *   get:
 *     tags: [Reference]
 *     summary: Get all 30 juzz of the Quran
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Juzz retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/juzz', authenticate, controller.getJuzz);

/**
 * @openapi
 * /v1/reference/countries:
 *   get:
 *     tags: [Reference]
 *     summary: Get list of countries
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Countries retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/countries', authenticate, controller.getCountries);

export default router;
