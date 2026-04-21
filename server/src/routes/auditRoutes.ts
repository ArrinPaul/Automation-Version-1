import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { getAudit } from '../controllers/auditController';

const router = Router();

router.get('/', verifyToken, getAudit);

export default router;
