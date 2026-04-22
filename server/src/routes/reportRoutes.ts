import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { downloadFinancialCsv } from '../controllers/reportController';

const router = Router();

router.use(verifyToken);
router.get('/financial-csv', requireRole([Role.MANAGEMENT]), downloadFinancialCsv);

export default router;
