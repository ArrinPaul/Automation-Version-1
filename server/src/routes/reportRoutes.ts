import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { downloadFinancialCsv, downloadSystemSnapshot } from '../controllers/reportController';

const router = Router();

router.use(verifyToken);
router.get('/financial-csv', requireRole(SUPER_ADMIN_ROLES), downloadFinancialCsv);
router.get('/snapshot', requireRole(SUPER_ADMIN_ROLES), downloadSystemSnapshot);

export default router;
