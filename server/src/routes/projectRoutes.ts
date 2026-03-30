import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { UserRole } from '../models';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projectController';

const router = Router();
router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), createProject);
router.put('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER, UserRole.SOCIETY_ADMIN]), updateProject);
router.delete('/:id', roleMiddleware([UserRole.SUPER_ADMIN, UserRole.SB_TREASURER]), deleteProject);

export default router;
