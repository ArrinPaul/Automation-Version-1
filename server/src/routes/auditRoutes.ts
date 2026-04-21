import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { getAudit, getAuditLogs } from '../controllers/auditController';

const router = Router();

router.get('/', verifyToken, getAudit);
router.get('/logs', verifyToken, requireRole([Role.MANAGEMENT]), getAuditLogs);

export default router;
