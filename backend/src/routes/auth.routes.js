import { Router } from 'express';
import { registrar, login, eu } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { exigirAuth } from '../middleware/auth.js';

const router = Router();

router.post('/registrar', asyncHandler(registrar));
router.post('/login', asyncHandler(login));
router.get('/me', exigirAuth, asyncHandler(eu));

export default router;
