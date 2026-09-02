import { Router } from 'express';
import { listarServicos, criarServico } from '../controllers/servicos.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listarServicos));
router.post('/', asyncHandler(criarServico));

export default router;
