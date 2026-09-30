import { Router } from 'express';
import { listarServicos, criarServico } from '../controllers/servicos.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { exigirAuth, exigirAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(listarServicos));
router.post('/', exigirAuth, exigirAdmin, asyncHandler(criarServico));

export default router;
