import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes';
import usersRoutes from '../../modules/users/users.routes';
import healthRoutes from '../../modules/health/health.routes';
import prayerTimesRoutes from '../../modules/prayer-times/prayer-times.routes';
import referenceRoutes from '../../modules/reference/reference.routes';
import customizationRoutes from '../../modules/customization/customization.routes';
import trackingRoutes from '../../modules/tracking/tracking.routes';

const router = Router();

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/health', healthRoutes);
router.use('/prayer-times', prayerTimesRoutes);
router.use('/reference', referenceRoutes);
router.use('/customization', customizationRoutes);
router.use('/tracking', trackingRoutes);

export default router;
