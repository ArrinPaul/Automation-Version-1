import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES, SOCIETY_OPS_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { getMembers, getMemberById, createMember, updateMember, deleteMember } from '../controllers/memberController';

const router = Router();

router.use(verifyToken);

router.get('/', getMembers);
router.get('/:id', getMemberById);

router.post('/', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), createMember);
router.put('/:id', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), updateMember);
router.delete('/:id', requireRole(SUPER_ADMIN_ROLES), requireSocietyAccess(), deleteMember);

export default router;
