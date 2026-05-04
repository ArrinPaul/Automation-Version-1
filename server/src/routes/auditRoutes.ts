import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { getAudit, getAuditLogs } from '../controllers/auditController';

const router = Router();

router.get('/', verifyToken, getAudit);
router.get('/financial-insights', verifyToken, getAudit);
router.get('/logs', verifyToken, requireRole(SUPER_ADMIN_ROLES), getAuditLogs);

export default router;
