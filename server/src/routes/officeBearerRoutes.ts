import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import {
  getOfficeBearers,
  getOfficeBearerById,
  createOfficeBearer,
  updateOfficeBearer,
  deleteOfficeBearer
} from '../controllers/officeBearerController';

const router = Router();

router.use(verifyToken);

router.get('/', getOfficeBearers);
router.get('/:id', getOfficeBearerById);

router.post(
  '/',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  createOfficeBearer
);

router.put(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  updateOfficeBearer
);

router.delete(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]),
  requireSocietyAccess(),
  deleteOfficeBearer
);

export default router;
