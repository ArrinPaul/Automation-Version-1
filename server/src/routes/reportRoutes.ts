import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { downloadFinancialCsv, downloadSystemSnapshot } from '../controllers/reportController';

const router = Router();

router.use(verifyToken);
router.get('/financial-csv', requireRole([Role.MANAGEMENT]), downloadFinancialCsv);
router.get('/snapshot', requireRole([Role.MANAGEMENT]), downloadSystemSnapshot);

export default router;
