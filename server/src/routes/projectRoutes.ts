import { Router } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController';

const router = Router();

router.use(verifyToken);

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post(
  '/',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  createProject
);

router.put(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR, Role.SOCIETY_OB]),
  requireSocietyAccess(),
  updateProject
);

router.delete(
  '/:id',
  requireRole([Role.MANAGEMENT, Role.FACULTY_ADVISOR]),
  requireSocietyAccess(),
  deleteProject
);

export default router;
