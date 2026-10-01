import { Router } from 'express';
import { eu } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { exigirAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', exigirAuth, asyncHandler(eu));

export default router;
