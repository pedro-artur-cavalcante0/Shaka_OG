import { Router } from 'express';
import { registrar, login } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/registrar', asyncHandler(registrar));
router.post('/login', asyncHandler(login));

export default router;
