import { Router } from 'express';
import { PrayerTimesController } from './prayer-times.controller';
import { validate } from '../../core/middleware/validator';
import { authenticate } from '../../core/middleware/auth.middleware';
import { updateConfigSchema } from './dto/update-config.dto';
import { updateAdjustmentsSchema } from './dto/update-adjustments.dto';

const router = Router();
const controller = new PrayerTimesController();

/**
 * @openapi
 * /v1/prayer-times/config:
 *   get:
 *     tags:
 *       - Prayer Times
 *     summary: Get prayer time configuration
 *     description: Retrieve user's current prayer time configuration including calculation method, API method, manual times, and adjustments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clx123abc"
 *                     userId:
 *                       type: string
 *                       example: "clx456def"
 *                     calculationMode:
 *                       type: string
 *                       enum: [AUTOMATIC, MANUAL]
 *                       example: "AUTOMATIC"
 *                     apiMethod:
 *                       type: string
 *                       enum: [MWL, ISNA, EGYPT, MAKKAH, KARACHI, TEHRAN]
 *                       nullable: true
 *                       example: "MWL"
 *                     manualFajr:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     manualZuhr:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     manualAsr:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     manualMaghrib:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     manualIsha:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     fajrAdjustment:
 *                       type: integer
 *                       example: 0
 *                     zuhrAdjustment:
 *                       type: integer
 *                       example: 0
 *                     asrAdjustment:
 *                       type: integer
 *                       example: 0
 *                     maghribAdjustment:
 *                       type: integer
 *                       example: 0
 *                     ishaAdjustment:
 *                       type: integer
 *                       example: 0
 *                     lastFetchedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2026-02-12T10:30:00.000Z"
 *       404:
 *         description: Prayer times not configured
 *       401:
 *         description: Unauthorized
 */
router.get('/config', authenticate, controller.getConfig);

/**
 * @openapi
 * /v1/prayer-times/config:
 *   put:
 *     tags:
 *       - Prayer Times
 *     summary: Update prayer time configuration
 *     description: Update prayer time calculation method (automatic vs manual), API method, or manual times. Clears cache when method changes.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calculationMode
 *             properties:
 *               calculationMode:
 *                 type: string
 *                 enum: [AUTOMATIC, MANUAL]
 *                 example: "AUTOMATIC"
 *               apiMethod:
 *                 type: string
 *                 enum: [MWL, ISNA, EGYPT, MAKKAH, KARACHI, TEHRAN]
 *                 example: "MWL"
 *                 description: Required for AUTOMATIC mode
 *               manualTimes:
 *                 type: object
 *                 description: Required for MANUAL mode
 *                 properties:
 *                   fajr:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                     example: "05:30"
 *                   zuhr:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                     example: "12:15"
 *                   asr:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                     example: "15:45"
 *                   maghrib:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                     example: "18:30"
 *                   isha:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                     example: "20:00"
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       400:
 *         description: Invalid request (missing location for automatic mode or invalid data)
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.put('/config', authenticate, validate(updateConfigSchema), controller.updateConfig);

/**
 * @openapi
 * /v1/prayer-times/adjustments:
 *   patch:
 *     tags:
 *       - Prayer Times
 *     summary: Update prayer time adjustments
 *     description: Fine-tune automatically calculated prayer times by adjusting each prayer time by -15 to +15 minutes. Only works in AUTOMATIC mode.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fajrAdjustment:
 *                 type: integer
 *                 minimum: -15
 *                 maximum: 15
 *                 example: 2
 *               zuhrAdjustment:
 *                 type: integer
 *                 minimum: -15
 *                 maximum: 15
 *                 example: 0
 *               asrAdjustment:
 *                 type: integer
 *                 minimum: -15
 *                 maximum: 15
 *                 example: -5
 *               maghribAdjustment:
 *                 type: integer
 *                 minimum: -15
 *                 maximum: 15
 *                 example: 3
 *               ishaAdjustment:
 *                 type: integer
 *                 minimum: -15
 *                 maximum: 15
 *                 example: 0
 *     responses:
 *       200:
 *         description: Adjustments updated successfully
 *       400:
 *         description: Cannot adjust manual prayer times
 *       404:
 *         description: Configuration not found
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error (adjustment out of range)
 */
router.patch(
  '/adjustments',
  authenticate,
  validate(updateAdjustmentsSchema),
  controller.updateAdjustments
);

/**
 * @openapi
 * /v1/prayer-times/today:
 *   get:
 *     tags:
 *       - Prayer Times
 *     summary: Get today's prayer times
 *     description: Retrieve today's prayer times based on user's configuration. Returns cached times if available and fresh (<24h), otherwise fetches from API.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Prayer times retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2026-02-12"
 *                     fajr:
 *                       type: string
 *                       example: "05:32"
 *                     zuhr:
 *                       type: string
 *                       example: "12:18"
 *                     asr:
 *                       type: string
 *                       example: "15:42"
 *                     maghrib:
 *                       type: string
 *                       example: "18:25"
 *                     isha:
 *                       type: string
 *                       example: "19:55"
 *                     source:
 *                       type: string
 *                       enum: [API, MANUAL]
 *                       example: "API"
 *       404:
 *         description: Prayer times not configured
 *       400:
 *         description: Location not set or manual times incomplete
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: External prayer time service unavailable
 */
router.get('/today', authenticate, controller.getTodaysPrayerTimes);

/**
 * @openapi
 * /v1/prayer-times/refresh:
 *   post:
 *     tags:
 *       - Prayer Times
 *     summary: Manually refresh prayer times
 *     description: Force refresh prayer times from API, bypassing cache. Only works in AUTOMATIC mode. Used for pull-to-refresh functionality.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Prayer times refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2026-02-12"
 *                     fajr:
 *                       type: string
 *                       example: "05:32"
 *                     zuhr:
 *                       type: string
 *                       example: "12:18"
 *                     asr:
 *                       type: string
 *                       example: "15:42"
 *                     maghrib:
 *                       type: string
 *                       example: "18:25"
 *                     isha:
 *                       type: string
 *                       example: "19:55"
 *                     source:
 *                       type: string
 *                       example: "API"
 *       400:
 *         description: Cannot refresh manual prayer times
 *       404:
 *         description: Configuration not found or user not found
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: External prayer time service unavailable
 */
router.post('/refresh', authenticate, controller.refreshPrayerTimes);

export default router;
