import { Router, Request, Response } from 'express';
import { verifyToken, USER_MGMT_ROLES, SUPER_ADMIN_ROLES } from '../middleware/verifyToken';
import { requireRole } from '../middleware/requireRole';
import { login, register, registerPublic, changeRole, getCurrentUser, setupFirstAdmin, checkInitialized, getUsers, deleteUser } from '../controllers/authController';
import { env } from '../config/env';

const router = Router();

router.get('/check-initialized', checkInitialized);

router.get('/setup/test', (req: Request, res: Response) => {
  res.json({ status: 'setup route reachable', setupKeyConfigured: !!env.SETUP_KEY, nodeEnv: env.NODE_ENV });
});

router.post('/login', login);
router.post('/setup', setupFirstAdmin);
router.post('/register-public', registerPublic);
router.get('/me', verifyToken, getCurrentUser);

// User management — SB_FACULTY only (can provision, delete, change roles)
router.get('/users', verifyToken, requireRole(USER_MGMT_ROLES), getUsers);
router.delete('/users/:userId', verifyToken, requireRole(USER_MGMT_ROLES), deleteUser);
router.post('/register', verifyToken, requireRole(USER_MGMT_ROLES), register);
router.patch('/change-role', verifyToken, requireRole(USER_MGMT_ROLES), changeRole);

export default router;
