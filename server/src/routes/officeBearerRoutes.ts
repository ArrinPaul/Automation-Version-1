import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES, SOCIETY_OPS_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { getOfficeBearers, getOfficeBearerById, createOfficeBearer, updateOfficeBearer, deleteOfficeBearer } from '../controllers/officeBearerController';

const router = Router();

router.use(verifyToken);

router.get('/', getOfficeBearers);
router.get('/:id', getOfficeBearerById);

router.post('/', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), createOfficeBearer);
router.put('/:id', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), updateOfficeBearer);
router.delete('/:id', requireRole(SUPER_ADMIN_ROLES), requireSocietyAccess(), deleteOfficeBearer);

export default router;
