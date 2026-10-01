import { Router } from 'express';
import { listarPraias, buscarPraia, buscarAnalisePraia } from '../controllers/praias.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listarPraias));
router.get('/:id', asyncHandler(buscarPraia));
router.get('/:id/analise', asyncHandler(buscarAnalisePraia));

export default router;
