import { Router } from 'express';
import { verifyToken, SUPER_ADMIN_ROLES, SOCIETY_OPS_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { requireSocietyAccess } from '../middleware/requireSocietyAccess';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/projectController';

const router = Router();

router.use(verifyToken);

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post('/', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), createProject);
router.put('/:id', requireRole(SOCIETY_OPS_ROLES), requireSocietyAccess(), updateProject);
router.delete('/:id', requireRole(SUPER_ADMIN_ROLES), requireSocietyAccess(), deleteProject);

export default router;
