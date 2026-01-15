import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();
const controller = new HealthController();

/**
 * @openapi
 * /v1/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: API health check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', controller.healthCheck);

/**
 * @openapi
 * /v1/health/db:
 *   get:
 *     tags:
 *       - Health
 *     summary: Database health check
 *     description: Check if the database connection is working
 *     responses:
 *       200:
 *         description: Database is connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Database is disconnected
 */
router.get('/db', controller.databaseHealth);

export default router;
