import { Router } from 'express';
import authRoutes from '../../modules/auth/auth.routes';
import usersRoutes from '../../modules/users/users.routes';
import healthRoutes from '../../modules/health/health.routes';

const router = Router();

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/health', healthRoutes);

export default router;
