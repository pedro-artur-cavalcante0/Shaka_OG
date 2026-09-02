import { Router } from 'express';
import authRoutes from './auth.routes.js';
import praiasRoutes from './praias.routes.js';
import servicosRoutes from './servicos.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/praias', praiasRoutes);
router.use('/servicos', servicosRoutes);

export default router;
