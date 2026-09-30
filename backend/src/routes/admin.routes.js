import { Router } from 'express';
import {
  listarSolicitacoes,
  aprovarSolicitacao,
  recusarSolicitacao,
} from '../controllers/admin.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { exigirAuth, exigirAdmin } from '../middleware/auth.js';

const router = Router();

router.use(exigirAuth, exigirAdmin);

router.get('/solicitacoes/:tipo', asyncHandler(listarSolicitacoes));
router.patch('/solicitacoes/:tipo/:id/aprovar', asyncHandler(aprovarSolicitacao));
router.patch('/solicitacoes/:tipo/:id/recusar', asyncHandler(recusarSolicitacao));

export default router;
