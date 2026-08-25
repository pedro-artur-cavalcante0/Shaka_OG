import { Router } from 'express';
import authRoutes from './auth.routes.js';
import praiasRoutes from './praias.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/praias', praiasRoutes);

export default router;
