import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
} from '../controllers/memberController';

const router = Router();

router.use(verifyToken);

router.get('/', getMembers);
router.get('/:id', getMemberById);

router.post(
  '/',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  createMember
);

router.put(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  updateMember
);

router.delete(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]),
  requireSocietyAccess(),
  deleteMember
);

export default router;
